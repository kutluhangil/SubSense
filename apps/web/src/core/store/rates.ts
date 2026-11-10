import { create } from 'zustand';
import { CURRENCIES } from '../data/currencies';

const DEFAULT_RATES: Record<string, number> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.rate]),
);

const CACHE_KEY = 'subsense.rates.v1';
const DAY_MS = 24 * 60 * 60 * 1000;

interface RatesState {
  rates: Record<string, number>;
  updatedAt: number | null;
  live: boolean;
  error: boolean;
  load: () => Promise<void>;
}

export const useRates = create<RatesState>((set) => ({
  rates: DEFAULT_RATES,
  updatedAt: null,
  live: false,
  error: false,
  load: async () => {
    // hydrate from cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { rates: Record<string, number>; updatedAt: number };
        set({ rates: { ...DEFAULT_RATES, ...parsed.rates }, updatedAt: parsed.updatedAt, live: true });
        if (Date.now() - parsed.updatedAt < DAY_MS) return; // fresh enough
      }
    } catch {
      /* ignore */
    }
    // fetch live (best-effort). Hard timeout so first paint is never blocked by a
    // hanging request — the app gates its initial render on this completing, and a
    // stalled network (captive portal, DNS blackhole) must not leave it on the
    // skeleton forever. On timeout we fall through to `error` → render with defaults.
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      let res: Response;
      try {
        res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: ctrl.signal });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        set({ error: true });
        return;
      }
      const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
      if (data.result === 'success' && data.rates) {
        const next: Record<string, number> = { ...DEFAULT_RATES };
        for (const c of CURRENCIES) {
          if (typeof data.rates[c.code] === 'number') next[c.code] = data.rates[c.code];
        }
        const updatedAt = Date.now();
        set({ rates: next, updatedAt, live: true, error: false });
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: next, updatedAt }));
      }
    } catch {
      // offline / blocked — keep defaults, which is fine
      set({ error: true });
    }
  },
}));
