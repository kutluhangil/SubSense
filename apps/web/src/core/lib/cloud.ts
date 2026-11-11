import { create } from 'zustand';
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { diffFields, fromDoc, strip, type Row } from './syncFields';
import { desktopGoogleIdToken, isDesktop, isNative, nativeGoogleIdToken, nativeSignOut } from './native';
import { useApp } from '../store/app';
import type { AppSettings, Subscription } from '../types';

/**
 * Cloud sync shared with the Android app (Firestore `users/{uid}/subscriptions`).
 *
 * Safety rules:
 *  - Rows are never hard-deleted by sync; a removal writes `deletedAt` (tombstone).
 *  - Only changed fields are written; cleared fields use deleteField().
 *  - A row missing locally is NOT deleted remotely on reconcile — the cloud wins.
 */

export type CloudStatus = 'idle' | 'working' | 'synced' | 'offline' | 'error';

interface CloudState {
  uid: string | null;
  name: string | null;
  email: string | null;
  verified: boolean;
  providers: string[];
  status: CloudStatus;
  error: string | null;
}

export const useCloud = create<CloudState>(() => ({
  uid: null,
  name: null,
  email: null,
  verified: false,
  providers: [],
  status: 'idle',
  error: null,
}));

const setCloud = (patch: Partial<CloudState>) => useCloud.setState(patch);

function errorCode(e: unknown): string {
  return (e as { code?: string })?.code ?? (e instanceof Error ? e.message : 'unknown');
}

async function run<T>(fn: () => Promise<T>): Promise<T> {
  setCloud({ error: null });
  try {
    return await fn();
  } catch (e) {
    setCloud({ error: errorCode(e) });
    throw e;
  }
}

// ── Sign in / up / out ──────────────────────────────────────────────────────
export const signInWithGoogle = () =>
  run(async () =>
    isNative || isDesktop
      ? signInWithCredential(auth, GoogleAuthProvider.credential(await (isDesktop ? desktopGoogleIdToken() : nativeGoogleIdToken())))
      : signInWithPopup(auth, new GoogleAuthProvider()),
  );

/** The Mac App Store build ships without Google sign-in: rule 4.8 would otherwise require Sign in with Apple too. */
export const googleSignInEnabled = !(isDesktop && import.meta.env.VITE_MAS === '1');

/** Sign in with Apple is web-only for now and off until the provider is enabled in Firebase (VITE_APPLE_SIGN_IN=1). */
export const appleSignInEnabled = import.meta.env.VITE_APPLE_SIGN_IN === '1' && !isNative && !isDesktop;
const appleProvider = () => {
  const p = new OAuthProvider('apple.com');
  p.addScope('email');
  p.addScope('name');
  return p;
};
export const signInWithApple = () => run(() => signInWithPopup(auth, appleProvider()));

export const signInWithEmail = (email: string, password: string) =>
  run(() => signInWithEmailAndPassword(auth, email.trim(), password));

export const signUpWithEmail = (name: string, email: string, password: string) =>
  run(async () => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
    await sendEmailVerification(cred.user).catch(() => {});
    setCloud({ name: name.trim() || null });
    return cred;
  });

export const resetPassword = (email: string) => run(() => sendPasswordResetEmail(auth, email.trim()));

export const resendVerification = () =>
  run(async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  });

export const linkGoogle = () =>
  run(async () => {
    if (!auth.currentUser) throw new Error('not-signed-in');
    await linkWithPopup(auth.currentUser, new GoogleAuthProvider());
    setCloud({ providers: auth.currentUser.providerData.map((p) => p.providerId) });
  });

/** Sign out and drop the local mirror (it lives in the cloud; shared computers stay clean). */
export async function signOutCloud(): Promise<void> {
  stopSync();
  await nativeSignOut();
  await signOut(auth);
  useApp.setState({ subscriptions: [], priceSnapshot: {}, priceAlerts: [] });
  useApp.getState().signOut();
}

/**
 * Permanently delete the account: every subscription doc, the profile doc, then the
 * auth user. Password accounts must pass `password` when Firebase asks for a fresh login.
 */
export async function deleteAccount(password?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('not-signed-in');
  await run(async () => {
    await reauthenticate(user, password);
    stopSync();
    const snap = await getDocs(collection(db, 'users', user.uid, 'subscriptions'));
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', user.uid));
    await batch.commit();
    await deleteUser(user);
  });
  useApp.setState({ subscriptions: [], priceSnapshot: {}, priceAlerts: [] });
  useApp.getState().signOut();
}

async function reauthenticate(user: User, password?: string) {
  const ids = user.providerData.map((p) => p.providerId);
  if (ids.includes('password')) {
    if (!password) throw Object.assign(new Error('password-required'), { code: 'password-required' });
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? '', password));
  } else if (ids.includes('apple.com') && !ids.includes('google.com')) {
    await reauthenticateWithPopup(user, appleProvider());
  } else if (isNative || isDesktop) {
    await reauthenticateWithCredential(user, GoogleAuthProvider.credential(await (isDesktop ? desktopGoogleIdToken() : nativeGoogleIdToken())));
  } else {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
  }
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
export function initCloud(): () => void {
  const offAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      stopSync();
      setCloud({ uid: null, name: null, email: null, verified: false, providers: [], status: 'idle' });
      return;
    }
    setCloud({
      uid: user.uid,
      name: user.displayName ?? useCloud.getState().name,
      email: user.email,
      verified: user.emailVerified,
      providers: user.providerData.map((p) => p.providerId),
      status: 'working',
    });
    const app = useApp.getState();
    app.signIn({ name: user.displayName || app.auth.user?.name || '', email: user.email ?? '' });
    void startSync(user.uid);
  });
  const onOnline = () => useCloud.getState().uid && setCloud({ status: 'synced' });
  const onOffline = () => useCloud.getState().uid && setCloud({ status: 'offline' });
  addEventListener('online', onOnline);
  addEventListener('offline', onOffline);
  return () => {
    offAuth();
    stopSync();
    removeEventListener('online', onOnline);
    removeEventListener('offline', onOffline);
  };
}

// ── Sync ────────────────────────────────────────────────────────────────────

let unsubSnapshot: (() => void) | null = null;
let unsubStore: (() => void) | null = null;
let applyingRemote = false;
let prev = new Map<string, Row>();
let settingsTimer: ReturnType<typeof setTimeout> | null = null;

const SETTINGS_KEYS = ['baseCurrency', 'language', 'appearance', 'budgetLimits', 'notificationsEnabled', 'renewalAlerts'] as const;

function stopSync() {
  unsubSnapshot?.();
  unsubStore?.();
  unsubSnapshot = unsubStore = null;
  if (settingsTimer) clearTimeout(settingsTimer);
  prev = new Map();
}

const subRef = (uid: string, id: string) => doc(db, 'users', uid, 'subscriptions', id);

async function startSync(uid: string) {
  stopSync();
  const subsCol = collection(db, 'users', uid, 'subscriptions');
  const app = useApp.getState();

  try {
    // Settings: cloud copy wins when present, otherwise seed it from this device.
    const profile = await getDoc(doc(db, 'users', uid));
    const cloudSettings = profile.data()?.settings as Partial<AppSettings> | undefined;
    if (cloudSettings) {
      for (const k of SETTINGS_KEYS) {
        if (cloudSettings[k] !== undefined) app.setSetting(k, cloudSettings[k] as never);
      }
    }
    await writeProfile(uid);

    // Reconcile: cloud wins for shared ids; tombstones remove local copies;
    // rows that only exist here (made while signed out) are uploaded.
    const snap = await getDocs(subsCol);
    const cloud = new Map<string, Subscription>();
    snap.forEach((d) => cloud.set(d.id, fromDoc(d.id, d.data())));
    const local = useApp.getState().subscriptions;
    const merged = new Map<string, Subscription>();
    for (const [id, s] of cloud) if (!s.deletedAt) merged.set(id, s);
    const uploads: Subscription[] = [];
    for (const s of local) {
      const remote = cloud.get(s.id);
      if (!remote) uploads.push(s);
      else if (!remote.deletedAt && (s.updatedAt ?? 0) > (remote.updatedAt ?? 0)) {
        merged.set(s.id, s);
        uploads.push(s);
      }
    }
    for (const s of uploads) merged.set(s.id, s);
    applyLocal([...merged.values()].map((s) => ({ ...s, deletedAt: null })));
    if (uploads.length) {
      for (let i = 0; i < uploads.length; i += 400) {
        const batch = writeBatch(db);
        uploads.slice(i, i + 400).forEach((s) =>
          batch.set(subRef(uid, s.id), { ...diffFields(undefined, strip(s)), deletedAt: deleteField(), updatedAt: serverTimestamp() }, { merge: true }),
        );
        await batch.commit();
      }
    }
  } catch {
    setCloud({ status: navigator.onLine ? 'error' : 'offline' });
  }

  // Cloud → local.
  unsubSnapshot = onSnapshot(
    subsCol,
    (snap) => {
      const next: Subscription[] = [];
      snap.forEach((d) => {
        const s = fromDoc(d.id, d.data());
        if (!s.deletedAt) next.push(s);
      });
      applyLocal(next);
      setCloud({ status: snap.metadata.fromCache && !navigator.onLine ? 'offline' : 'synced' });
    },
    () => setCloud({ status: 'error' }),
  );

  // Local → cloud.
  unsubStore = useApp.subscribe((state, before) => {
    if (applyingRemote) return;
    if (state.subscriptions !== before.subscriptions) void pushDiff(uid, state.subscriptions);
    if (state.settings !== before.settings) {
      if (settingsTimer) clearTimeout(settingsTimer);
      settingsTimer = setTimeout(() => void writeProfile(uid), 800);
    }
  });
}

async function writeProfile(uid: string) {
  const { settings, auth: a } = useApp.getState();
  const picked = Object.fromEntries(SETTINGS_KEYS.map((k) => [k, settings[k]]));
  await setDoc(
    doc(db, 'users', uid),
    {
      displayName: useCloud.getState().name ?? a.user?.name ?? '',
      email: useCloud.getState().email ?? '',
      baseCurrency: settings.baseCurrency, // read by the Android app at the root
      settings: picked,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  ).catch(() => {});
}

function applyLocal(subs: Subscription[]) {
  applyingRemote = true;
  useApp.getState().setSubscriptions(subs);
  prev = new Map(subs.map((s) => [s.id, strip(s)]));
  applyingRemote = false;
}

async function pushDiff(uid: string, subs: Subscription[]) {
  const ops: Promise<unknown>[] = [];
  const nextIds = new Set<string>();
  for (const s of subs) {
    nextIds.add(s.id);
    const row = strip(s);
    const before = prev.get(s.id);
    const fields = diffFields(before, row);
    if (Object.keys(fields).length) {
      ops.push(setDoc(subRef(uid, s.id), { ...fields, updatedAt: serverTimestamp() }, { merge: true }));
    }
    prev.set(s.id, row);
  }
  for (const id of [...prev.keys()]) {
    if (!nextIds.has(id)) {
      ops.push(setDoc(subRef(uid, id), { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true }));
      prev.delete(id);
    }
  }
  const results = await Promise.allSettled(ops);
  if (results.some((r) => r.status === 'rejected')) setCloud({ status: navigator.onLine ? 'error' : 'offline' });
}
