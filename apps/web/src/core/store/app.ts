import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppSettings, AuthUser, Subscription, Achievement, PriceChange } from '../types';
import { buildSeed } from '../data/seed';
import { baseAchievements } from '../data/catalog';
import { addCycle, todayISO } from '../lib/format';
import { appStorage } from '../lib/native';

export type NewSub = Omit<Subscription, 'id'>;

interface AppState {
  subscriptions: Subscription[];
  settings: AppSettings;
  auth: { user: AuthUser | null; onboarded: boolean };
  achievements: Achievement[];
  dismissedAlerts: boolean;

  // price watch
  priceSnapshot: Record<string, number>; // subId → last-seen reference price (USD)
  priceAlerts: PriceChange[]; // undismissed increases

  // subscription CRUD
  addSubscription: (sub: NewSub) => string;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  markPaid: (id: string) => void;
  /** Replace the whole list (used by cloud sync to apply a remote snapshot). */
  setSubscriptions: (subs: Subscription[]) => void;

  // settings
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setBudget: (category: string, limit: number) => void;

  // auth
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  completeOnboarding: () => void;

  dismissAlerts: () => void;
  loadSampleData: () => void;
  clearAll: () => void;

  // backup
  importData: (data: { subscriptions: Subscription[]; settings?: Partial<AppSettings> }) => void;

  // price watch
  recordPriceCheck: (changes: PriceChange[], snapshot: Record<string, number>) => void;
  dismissPriceAlerts: () => void;
}

/** Device language on first run (kept inline to avoid an import cycle with i18n). */
function initialLang(): string {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language || navigator.languages?.[0] : '';
    return nav && nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  } catch {
    return 'en';
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  baseCurrency: 'USD',
  language: initialLang(),
  appearance: 'system',
  budgetLimits: {},
  isPro: true,
  notificationsEnabled: true,
  renewalAlerts: true,
  appLockEnabled: false,
};

function uid(): string {
  return 'sub-' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

/**
 * Next billing date after current nextDate (month-end safe — audit H-3).
 * Loops until strictly after today so an overdue sub catches up past the present
 * instead of landing one cycle in the past (audit L-1). ISO strings (YYYY-MM-DD)
 * compare chronologically, so lexical comparison is correct and timezone-safe.
 */
function advance(sub: Subscription): string {
  const today = todayISO();
  let next = addCycle(sub.nextDate, sub.cycle);
  for (let i = 0; i < 600 && next <= today; i++) {
    next = addCycle(next, sub.cycle);
  }
  return next;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      // Real users start with a clean slate; sample data is opt-in via Settings.
      subscriptions: [],
      settings: DEFAULT_SETTINGS,
      auth: { user: null, onboarded: false },
      achievements: baseAchievements(),
      dismissedAlerts: false,
      priceSnapshot: {},
      priceAlerts: [],

      addSubscription: (sub) => {
        const id = uid();
        set((s) => ({ subscriptions: [{ ...sub, id, updatedAt: Date.now() }, ...s.subscriptions] }));
        return id;
      },
      updateSubscription: (id, patch) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x)),
        })),
      removeSubscription: (id) =>
        set((s) => ({ subscriptions: s.subscriptions.filter((x) => x.id !== id) })),
      setSubscriptions: (subs) => set({ subscriptions: subs }),
      markPaid: (id) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((x) =>
            x.id === id
              ? { ...x, nextDate: advance(x), status: x.status === 'Expiring' ? 'Active' : x.status, updatedAt: Date.now() }
              : x,
          ),
        })),

      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      setBudget: (category, limit) =>
        set((s) => ({ settings: { ...s.settings, budgetLimits: { ...s.settings.budgetLimits, [category]: limit } } })),

      signIn: (user) => set((s) => ({ auth: { ...s.auth, user } })),
      signOut: () => set(() => ({ auth: { user: null, onboarded: false } })),
      completeOnboarding: () => set((s) => ({ auth: { ...s.auth, onboarded: true } })),

      dismissAlerts: () => set({ dismissedAlerts: true }),
      loadSampleData: () => set({ subscriptions: buildSeed(), dismissedAlerts: false }),
      clearAll: () => set({ subscriptions: [], dismissedAlerts: false, achievements: baseAchievements() }),

      importData: (data) =>
        set((s) => ({
          subscriptions: data.subscriptions,
          // Merge restored settings over current so a backup from an older schema
          // (missing keys) can't drop required fields.
          settings: data.settings ? { ...s.settings, ...data.settings } : s.settings,
          dismissedAlerts: false,
        })),

      recordPriceCheck: (changes, snapshot) =>
        set((s) => {
          // Keep alerts only for subs still tracked; newest change wins per sub.
          const byId = new Map<string, PriceChange>();
          for (const a of s.priceAlerts) if (snapshot[a.id] !== undefined) byId.set(a.id, a);
          for (const c of changes) byId.set(c.id, c);
          return { priceSnapshot: snapshot, priceAlerts: [...byId.values()] };
        }),
      dismissPriceAlerts: () => set({ priceAlerts: [] }),
    }),
    {
      name: 'subsense.web.v1',
      version: 1,
      storage: createJSONStorage(() => appStorage),
    },
  ),
);

// Achievement sync as a separate subscription to avoid TS optional-call noise
useApp.subscribe((state) => {
  const active = state.subscriptions.filter((s) => s.status !== 'Inactive');
  const videoCats = state.subscriptions.filter((s) => s.category === 'Entertainment').length;
  const updated = state.achievements.map((a) => {
    switch (a.id) {
      case 'first-step':
        return { ...a, unlocked: state.subscriptions.length > 0 };
      case 'power-user':
        return { ...a, unlocked: active.length >= 10 };
      case 'savvy-saver':
        // No real savings tracking yet — keep locked rather than fake an unlock.
        return { ...a, unlocked: false };
      case 'streamer':
        return { ...a, unlocked: videoCats >= 5 };
      default:
        return a;
    }
  });
  const changed = updated.some((a, i) => a.unlocked !== state.achievements[i].unlocked);
  if (changed) useApp.setState({ achievements: updated });
});
