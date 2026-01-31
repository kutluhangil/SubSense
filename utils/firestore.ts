
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot, 
  getDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Subscription } from '../components/SubscriptionModal';
import { validateSubscription } from './validateSubscription';
import { trackEvent } from './analytics';

// --- Types ---

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: any;
  termsAcceptedAt?: string; // Compliance timestamp
  preferences: {
    language: string;
    theme: string;
    baseCurrency: string;
    region: string;
  };
  stats: {
    totalSubscriptions: number;
    monthlySpend: number;
    annualSpend: number;
  };
}

// --- Local Fallback Logic ---

const FALLBACK_KEY_PREFIX = 'subscriptionhub_fallback_';
const fallbackEvents = new EventTarget();

const getLocalData = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const setLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    fallbackEvents.dispatchEvent(new CustomEvent('local-update', { detail: { key, data } }));
  } catch (e) {
    console.warn("Local storage save failed", e);
  }
};

// --- User Management ---

export const initializeUserDocument = async (
  user: { uid: string; email: string | null; displayName: string | null }, 
  additionalData?: { currency?: string; region?: string }
): Promise<UserProfileData> => {
  const localKey = `${FALLBACK_KEY_PREFIX}profile_${user.uid}`;
  const now = new Date().toISOString();
  
  // Default Profile Structure
  const newProfile: UserProfileData = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName,
    createdAt: now,
    termsAcceptedAt: now, // Capture consent time
    preferences: {
      baseCurrency: additionalData?.currency || 'USD',
      language: 'en',
      theme: 'system',
      region: additionalData?.region || 'US'
    },
    stats: {
      totalSubscriptions: 0,
      monthlySpend: 0,
      annualSpend: 0
    }
  };

  try {
    if (!user.email) throw new Error("User email is required");

    const userRef = doc(db, 'users', user.uid);
    let userSnap;
    
    try {
      userSnap = await getDoc(userRef);
    } catch (e: any) {
      if (e.code === 'permission-denied' || e.code === 'unavailable') {
        console.warn("Firestore read denied. Using local fallback for profile.");
        trackEvent('system_fallback', { type: 'profile_read', reason: e.code });
        const localProfile = getLocalData<UserProfileData>(localKey);
        return localProfile || newProfile;
      }
      throw e;
    }

    if (userSnap && userSnap.exists()) {
      return userSnap.data() as UserProfileData;
    }

    // Attempt to create in Firestore
    try {
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp() // Use server timestamp for DB consistency
      });
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        console.warn("Firestore write denied. Saving profile locally.");
        trackEvent('system_fallback', { type: 'profile_write', reason: e.code });
        setLocalData(localKey, newProfile);
        return newProfile;
      }
      throw e;
    }
    
    return newProfile;
  } catch (error) {
    console.error("Error initializing user document:", error);
    // Ultimate fallback to ensure app doesn't crash
    setLocalData(localKey, newProfile);
    return newProfile;
  }
};

export const getUserDocument = async (uid: string): Promise<UserProfileData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user document:", error);
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
       trackEvent('system_fallback', { type: 'profile_fetch', reason: error.code });
       return getLocalData<UserProfileData>(`${FALLBACK_KEY_PREFIX}profile_${uid}`);
    }
    return null;
  }
};

export const updateUserSettings = async (uid: string, settings: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { preferences: settings }, { merge: true });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
        const localKey = `${FALLBACK_KEY_PREFIX}profile_${uid}`;
        const current = getLocalData<UserProfileData>(localKey);
        if (current) {
            current.preferences = { ...current.preferences, ...settings };
            setLocalData(localKey, current);
        }
    } else {
        console.error("Error updating user settings:", error);
    }
  }
};

// --- Subscriptions ---

export const getUserSubscriptions = async (uid: string): Promise<Subscription[]> => {
  try {
    const subsRef = collection(db, 'users', uid, 'subscriptions');
    const snapshot = await getDocs(subsRef);
    const subs: Subscription[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only include if valid
      if (validateSubscription(data as Partial<Subscription>)) {
        subs.push({ id: doc.id, ...data } as unknown as Subscription);
      }
    });
    return subs;
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      trackEvent('system_fallback', { type: 'subs_fetch', reason: error.code });
      const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
      const localSubs = getLocalData<Subscription[]>(localKey) || [];
      return localSubs.filter(validateSubscription);
    }
    return [];
  }
};

export const addSubscription = async (uid: string, subscription: Omit<Subscription, 'id'>) => {
  // 1. Guardrail: Validate Data before Write
  if (!validateSubscription(subscription as Partial<Subscription>)) {
    console.error("Attempted to add invalid subscription. Operation blocked.");
    throw new Error("Invalid subscription data. Please check fields.");
  }

  try {
    const subsRef = collection(db, 'users', uid, 'subscriptions');
    await addDoc(subsRef, {
      ...subscription,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      console.warn("Firestore write denied. Adding subscription locally.");
      trackEvent('system_fallback', { type: 'sub_add', reason: error.code });
      const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
      const currentSubs = getLocalData<Subscription[]>(localKey) || [];
      const newSub = { ...subscription, id: Date.now() } as Subscription;
      setLocalData(localKey, [...currentSubs, newSub]);
    } else {
      console.error("Error adding subscription:", error);
      throw error;
    }
  }
};

export const updateSubscription = async (uid: string, subId: number | string, data: Partial<Subscription>) => {
  // 1. Guardrail: Validate Data before Write (if update contains vital fields)
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) throw new Error("Invalid price update");
  if (data.currency && typeof data.currency !== 'string') throw new Error("Invalid currency update");

  try {
    if (typeof subId === 'number') {
        throw { code: 'permission-denied' }; 
    }

    const subRef = doc(db, 'users', uid, 'subscriptions', String(subId));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateData } = data as any;
    
    await updateDoc(subRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
        trackEvent('system_fallback', { type: 'sub_update', reason: error.code });
        const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
        const currentSubs = getLocalData<Subscription[]>(localKey) || [];
        const updatedSubs = currentSubs.map(s => s.id == subId ? { ...s, ...data } : s);
        setLocalData(localKey, updatedSubs);
    } else {
        console.error("Error updating subscription:", error);
        throw error;
    }
  }
};

export const deleteSubscription = async (uid: string, subId: number | string) => {
  try {
    if (typeof subId === 'number') {
        throw { code: 'permission-denied' };
    }
    const subRef = doc(db, 'users', uid, 'subscriptions', String(subId));
    await deleteDoc(subRef);
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
        trackEvent('system_fallback', { type: 'sub_delete', reason: error.code });
        const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
        const currentSubs = getLocalData<Subscription[]>(localKey) || [];
        const filteredSubs = currentSubs.filter(s => s.id != subId);
        setLocalData(localKey, filteredSubs);
    } else {
        console.error("Error deleting subscription:", error);
        throw error;
    }
  }
};

// Realtime Listener
export const listenToUserSubscriptions = (
  uid: string, 
  onChange: (subs: Subscription[]) => void,
  onError?: (error: any) => void
) => {
  let unsubscribeFirestore = () => {};
  
  const handleLocalUpdate = (e: any) => {
    if (e.detail && e.detail.key === `${FALLBACK_KEY_PREFIX}subs_${uid}`) {
      const validSubs = (e.detail.data || []).filter(validateSubscription);
      onChange(validSubs);
    }
  };

  try {
    const q = query(
      collection(db, 'users', uid, 'subscriptions'),
      orderBy('createdAt', 'desc')
    );

    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const subs: Subscription[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Guardrail: Filter invalid docs from stream
        if (validateSubscription(data as Partial<Subscription>)) {
            subs.push({ id: doc.id, ...data } as unknown as Subscription);
        } else {
            console.warn("Skipping invalid subscription document:", doc.id);
        }
      });
      onChange(subs);
    }, (error) => {
      if (error.code === 'permission-denied' || error.code === 'unavailable' || error.code === 'failed-precondition') {
        console.warn("Firestore realtime denied/failed. Switching to local storage.");
        trackEvent('system_fallback', { type: 'sub_listen', reason: error.code });
        const localData = getLocalData<Subscription[]>(`${FALLBACK_KEY_PREFIX}subs_${uid}`) || [];
        onChange(localData.filter(validateSubscription));
        fallbackEvents.addEventListener('local-update', handleLocalUpdate);
        if (onError) onError(error);
      } else {
        console.error("Firestore snapshot error:", error);
        if (onError) onError(error);
      }
    });
  } catch (error) {
    console.error("Error setting up subscription listener:", error);
    const localData = getLocalData<Subscription[]>(`${FALLBACK_KEY_PREFIX}subs_${uid}`) || [];
    onChange(localData.filter(validateSubscription));
    fallbackEvents.addEventListener('local-update', handleLocalUpdate);
  }

  return () => {
    unsubscribeFirestore();
    fallbackEvents.removeEventListener('local-update', handleLocalUpdate);
  };
};

// --- Migration Tool ---
export const migrateLocalData = async (uid: string, localSubs: Subscription[]) => {
  if (!localSubs || localSubs.length === 0) return;
  
  const promises = localSubs.map(sub => {
      // Validate before migration
      if (validateSubscription(sub)) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = sub;
          return addSubscription(uid, rest);
      }
      return Promise.resolve();
  });
  
  await Promise.all(promises);
};
