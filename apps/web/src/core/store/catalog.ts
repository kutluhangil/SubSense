import { create } from 'zustand';
import type { ExploreRegions } from '../data/explore';
import type { Plan } from '../data/pricing';
import { PRICE_CATALOG_URL, CATALOG_TTL_MS } from '../data/catalog-source';

/** Per-service price override pulled from the live catalog. All fields optional —
 *  a partial entry merges over the bundled prices (so you only host what changed). */
export interface ServiceOverride {
  startingAt?: number;
  startingCurrency?: 'USD' | 'TRY';
  regions?: ExploreRegions;
  plans?: Plan[];
}

interface CatalogState {
  overrides: Record<string, ServiceOverride>;
  updatedAt: number | null;
  live: boolean;
  /** True when a configured catalog fetch failed (network/parse). */
  error: boolean;
  /** Bumped on every successful load so price-displaying components re-render. */
  version: number;
  load: () => Promise<void>;
}

const CACHE_KEY = 'subsense.catalog.v1';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isFiniteNonNeg = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;

type Region = NonNullable<ExploreRegions['US']>;

/** Validate one region `{ tiers: [...] }`, dropping malformed tiers. Returns
 *  null if the region has no usable tiers. */
function sanitizeRegion(raw: unknown): Region | null {
  if (!isPlainObject(raw) || !Array.isArray(raw.tiers)) return null;
  const tiers = raw.tiers.filter(
    (t): t is Region['tiers'][number] =>
      isPlainObject(t) && typeof t.name === 'string' && isFiniteNonNeg(t.price),
  );
  if (tiers.length === 0) return null;
  return { tiers };
}

/** Defensively normalize the remote catalog. The JSON is untrusted: a poisoned
 *  entry (string/NaN/negative price, non-object) would otherwise flow into
 *  money math and produce NaN/garbage. Keep only well-formed fields and drop
 *  entries that end up empty. */
export function sanitizeServices(raw: unknown): Record<string, ServiceOverride> {
  if (!isPlainObject(raw)) return {};

  const out: Record<string, ServiceOverride> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!isPlainObject(value)) continue;
    const entry: ServiceOverride = {};

    if (isFiniteNonNeg(value.startingAt)) entry.startingAt = value.startingAt;

    if (value.startingCurrency === 'USD' || value.startingCurrency === 'TRY') {
      entry.startingCurrency = value.startingCurrency;
    }

    if (isPlainObject(value.regions)) {
      const regions: ExploreRegions = {};
      const us = sanitizeRegion(value.regions.US);
      const tr = sanitizeRegion(value.regions.TR);
      if (us) regions.US = us;
      if (tr) regions.TR = tr;
      if (us || tr) entry.regions = regions;
    }

    if (Array.isArray(value.plans)) {
      const plans = value.plans.filter(
        (p): p is Plan =>
          isPlainObject(p) && isFiniteNonNeg(p.usd),
      );
      if (plans.length) entry.plans = plans;
    }

    if (Object.keys(entry).length > 0) out[key] = entry;
  }

  return out;
}

export const useCatalog = create<CatalogState>((set) => ({
  overrides: {},
  updatedAt: null,
  live: false,
  error: false,
  version: 0,
  load: async () => {
    // Hydrate from cache first (instant), then refresh if stale.
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { services?: unknown; updatedAt: number };
        const services = sanitizeServices(parsed.services);
        set((s) => ({ overrides: services, updatedAt: parsed.updatedAt, live: true, version: s.version + 1 }));
        if (Date.now() - parsed.updatedAt < CATALOG_TTL_MS) return; // fresh enough
      }
    } catch {
      /* ignore */
    }

    if (!PRICE_CATALOG_URL) return; // disabled → bundled prices used

    try {
      const res = await fetch(PRICE_CATALOG_URL, { cache: 'no-store' });
      if (!res.ok) {
        set({ error: true });
        return;
      }
      const data = (await res.json()) as { services?: unknown };
      const services = sanitizeServices(data && typeof data === 'object' ? data.services : undefined);
      const updatedAt = Date.now();
      set((s) => ({ overrides: services, updatedAt, live: true, error: false, version: s.version + 1 }));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ services, updatedAt }));
      } catch {
        /* storage full / unavailable */
      }
    } catch {
      // offline / blocked / bad JSON — keep bundled prices
      set({ error: true });
    }
  },
}));

/** Current overrides (for pure resolvers; components should subscribe to `version`). */
export const catalogOverrides = (): Record<string, ServiceOverride> => useCatalog.getState().overrides;
