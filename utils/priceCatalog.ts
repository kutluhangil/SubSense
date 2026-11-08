import { collection, getDocs } from 'firebase/firestore';
import { db, functions, httpsCallable } from '../firebase/firebase';
import { SUBSCRIPTION_CATALOG, SubscriptionDetail, PlanTier } from './data';
import type { Subscription } from '../components/SubscriptionModal';

/**
 * Reads the weekly Gemini-synced price catalog from Firestore (`priceCatalog`),
 * written by functions/src/priceSync.ts, and live-hydrates `SUBSCRIPTION_CATALOG`.
 * Also detects when a user's saved subscription prices differ from the latest
 * official 2026 / AI-synced prices so the user can update them with one click.
 */

export interface CatalogTierItem {
  name: string;
  price: number;
  cycle: 'Monthly' | 'Yearly';
}

export interface CatalogRegionPrice {
  price: number | null;
  currency: string;
  plan?: string;
  tiers?: CatalogTierItem[];
}

export interface CatalogEntry {
  name: string;
  tr?: CatalogRegionPrice | null;
  us?: CatalogRegionPrice | null;
  confidence?: 'high' | 'medium' | 'low';
  changed?: boolean;
  source?: string;
}

export interface PriceUpdateSuggestion {
  sub: Subscription;
  oldPrice: number;
  newPrice: number;
  currency: string;
  matchedPlan: string;
  diff: number;
  percentChange: number;
  source: 'live-ai' | 'catalog-2026';
}

const LS_KEY = 'aboneyim_price_catalog_v2';
const LEGACY_LS_KEY = 'subsense_price_catalog_v1';
const META_LS_KEY = 'aboneyim_price_sync_meta_v1';
const DISMISSED_LS_KEY = 'aboneyim_dismissed_price_updates_v1';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

let cache: Record<string, CatalogEntry> = {};
let loaded = false;

/** Apply cached or fetched entries directly into SUBSCRIPTION_CATALOG in memory */
function hydrateSubscriptionCatalog(entries: Record<string, CatalogEntry>) {
  Object.values(entries).forEach((entry) => {
    if (!entry || !entry.name) return;
    const key = norm(entry.name);
    const catalogItem =
      SUBSCRIPTION_CATALOG[key] ||
      Object.values(SUBSCRIPTION_CATALOG).find((c) => norm(c.name) === key);

    if (!catalogItem) return;

    if (entry.us?.price != null && entry.us.price > 0) {
      catalogItem.price = entry.us.price.toFixed(2);
    }

    if (entry.tr && catalogItem.regions?.TR) {
      if (Array.isArray(entry.tr.tiers) && entry.tr.tiers.length > 0) {
        catalogItem.regions.TR.tiers = entry.tr.tiers.map((t) => ({
          name: t.name,
          nameLocalized: t.name,
          price: Number(t.price),
          cycle: t.cycle === 'Yearly' ? 'Yearly' : 'Monthly',
        }));
      } else if (entry.tr.price != null && entry.tr.price > 0 && catalogItem.regions.TR.tiers.length > 0) {
        const targetIdx = catalogItem.regions.TR.tiers.findIndex(
          (t) => entry.tr?.plan && norm(t.name).includes(norm(entry.tr.plan))
        );
        const idx = targetIdx >= 0 ? targetIdx : Math.min(1, catalogItem.regions.TR.tiers.length - 1);
        catalogItem.regions.TR.tiers[idx].price = Number(entry.tr.price);
      }
    }

    if (entry.us && catalogItem.regions?.US) {
      if (Array.isArray(entry.us.tiers) && entry.us.tiers.length > 0) {
        catalogItem.regions.US.tiers = entry.us.tiers.map((t) => ({
          name: t.name,
          price: Number(t.price),
          cycle: t.cycle === 'Yearly' ? 'Yearly' : 'Monthly',
        }));
      } else if (entry.us.price != null && entry.us.price > 0 && catalogItem.regions.US.tiers.length > 0) {
        const targetIdx = catalogItem.regions.US.tiers.findIndex(
          (t) => entry.us?.plan && norm(t.name).includes(norm(entry.us.plan))
        );
        const idx = targetIdx >= 0 ? targetIdx : Math.min(1, catalogItem.regions.US.tiers.length - 1);
        catalogItem.regions.US.tiers[idx].price = Number(entry.us.price);
      }
    }
  });
}

// Hydrate synchronously from localStorage so the first render already has data.
try {
  const raw = localStorage.getItem(LS_KEY) || localStorage.getItem(LEGACY_LS_KEY);
  if (raw) {
    cache = JSON.parse(raw);
    hydrateSubscriptionCatalog(cache);
  }
} catch {
  /* ignore */
}

/** Fetch the latest catalog from Firestore. Safe to call on startup or after manual sync. */
export const loadPriceCatalog = async (force = false): Promise<void> => {
  if (loaded && !force) return;
  try {
    const snap = await getDocs(collection(db, 'priceCatalog'));
    if (snap.empty) return;
    const next: Record<string, CatalogEntry> = { ...cache };
    snap.forEach((doc) => {
      next[norm(doc.id)] = doc.data() as CatalogEntry;
    });
    cache = next;
    loaded = true;
    hydrateSubscriptionCatalog(cache);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(cache));
    } catch {
      /* quota / private mode */
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aboneyim:prices-updated'));
    }
  } catch (e) {
    console.debug('Price catalog unavailable, using local 2026 catalog', e);
  }
};

/** Trigger an on-demand price & FX sync on the server and refresh local catalog cache. */
export const syncLivePricesFromServer = async (options?: {
  brands?: string[];
  force?: boolean;
}): Promise<{
  updated: number;
  changed: number;
  fxUpdated: boolean;
  geminiAvailable: boolean;
  syncedAt: string;
}> => {
  let resultData: any = {
    updated: 0,
    changed: 0,
    fxUpdated: false,
    geminiAvailable: false,
  };

  try {
    const fn = httpsCallable<any, any>(functions, 'triggerPriceSync');
    const res = await fn({
      brands: options?.brands,
      force: options?.force,
    });
    if (res?.data) {
      resultData = res.data;
      if (res.data.items && typeof res.data.items === 'object') {
        cache = { ...cache, ...res.data.items };
        hydrateSubscriptionCatalog(cache);
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(cache));
        } catch {
          /* ignore */
        }
      }
    }
  } catch (e) {
    console.debug('Server triggerPriceSync fallback to Firestore catalog', e);
  }

  await loadPriceCatalog(true);

  const syncedAt = new Date().toISOString();
  try {
    localStorage.setItem(META_LS_KEY, JSON.stringify({ syncedAt }));
  } catch {
    /* ignore */
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aboneyim:prices-updated'));
  }

  return {
    updated: resultData.updated || 0,
    changed: resultData.changed || 0,
    fxUpdated: Boolean(resultData.fxUpdated),
    geminiAvailable: Boolean(resultData.geminiAvailable),
    syncedAt,
  };
};

export const getLastPriceSyncTime = (): string | null => {
  try {
    const raw = localStorage.getItem(META_LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.syncedAt || null;
  } catch {
    return null;
  }
};

/** Returns the synced price for a brand in a region, or null to use local data. */
export const getCatalogPrice = (
  name: string,
  region: 'tr' | 'us' = 'tr'
): CatalogRegionPrice | null => {
  const entry = cache[norm(name)];
  if (!entry) return null;
  const rp = region === 'tr' ? entry.tr : entry.us;
  return rp && rp.price != null ? rp : null;
};

/** Brands whose price changed in the last sync (for the "price hike" detector). */
export const getChangedBrands = (): CatalogEntry[] =>
  Object.values(cache).filter((e) => e.changed);

/** Dismiss a specific price update suggestion so the user isn't nagged if they have a custom grandfathered price. */
export const dismissPriceUpdateSuggestion = (subId: number | string, targetPrice: number) => {
  try {
    const raw = localStorage.getItem(DISMISSED_LS_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[String(subId)] = targetPrice;
    localStorage.setItem(DISMISSED_LS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
};

function getDismissedPriceMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DISMISSED_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function findCatalogServiceForSub(name: string): SubscriptionDetail | undefined {
  const k = norm(name);
  if (SUBSCRIPTION_CATALOG[k]) return SUBSCRIPTION_CATALOG[k];
  return Object.values(SUBSCRIPTION_CATALOG).find((item) => {
    const itemNorm = norm(item.name);
    return itemNorm === k || k.includes(itemNorm) || itemNorm.includes(k);
  });
}

function matchBestTier(tiers: PlanTier[], planName: string, cycle: 'Monthly' | 'Yearly'): PlanTier | null {
  const validTiers = tiers.filter((t) => t.price > 0 && t.cycle === cycle);
  const pool = validTiers.length > 0 ? validTiers : tiers.filter((t) => t.price > 0);
  if (pool.length === 0) return null;

  const pNorm = norm(planName || '');
  if (!pNorm) {
    return pool[Math.min(1, pool.length - 1)] || pool[0];
  }

  // Exact or substring match on tier name / localized name
  for (const tier of pool) {
    const tNorm = norm(tier.name);
    const tlNorm = norm(tier.nameLocalized || '');
    if (
      tNorm === pNorm ||
      (tlNorm && tlNorm === pNorm) ||
      (tNorm && pNorm.includes(tNorm)) ||
      (tNorm && tNorm.includes(pNorm)) ||
      (tlNorm && pNorm.includes(tlNorm)) ||
      (tlNorm && tlNorm.includes(pNorm))
    ) {
      return tier;
    }
  }

  // Semantic keyword matching between TR and EN plan names
  const keywordGroups = [
    ['premium', 'ozel', '4k', 'ultra', 'deluxe', 'ultimate', 'allapps', 'tumuygulamalar'],
    ['standard', 'standart', 'extra', 'reklamsiz', 'adfree', 'plus', 'pro'],
    ['basic', 'temel', 'essential', 'withads', 'reklamli', 'starter', 'bireysel', 'individual', 'personal'],
    ['duo', '2kisi'],
    ['family', 'aile'],
    ['student', 'ogrenci'],
  ];

  for (const group of keywordGroups) {
    if (group.some((kw) => pNorm.includes(kw))) {
      const matched = pool.find((t) => {
        const combined = norm(`${t.name} ${t.nameLocalized || ''}`);
        return group.some((kw) => combined.includes(kw));
      });
      if (matched) return matched;
    }
  }

  return pool[Math.min(1, pool.length - 1)] || pool[0];
}

/**
 * Compares the user's active subscriptions against the latest 2026 official catalog & AI-synced prices.
 * Returns a list of subscriptions whose official price has changed so the user can auto-update them.
 */
export const detectSubscriptionPriceUpdates = (
  subscriptions: Subscription[],
  ignoreDismissed = false
): PriceUpdateSuggestion[] => {
  const dismissed = ignoreDismissed ? {} : getDismissedPriceMap();
  const suggestions: PriceUpdateSuggestion[] = [];

  for (const sub of subscriptions) {
    if (!sub || sub.status === 'Inactive' || sub.status === 'Trial') continue;
    if (sub.price <= 0) continue;

    const currency = (sub.currency || 'USD').toUpperCase();
    if (currency !== 'TRY' && currency !== 'USD') continue;

    const svc = findCatalogServiceForSub(sub.name);
    if (!svc) continue;

    const regionKey = currency === 'TRY' ? 'TR' : 'US';
    const regionData = svc.regions?.[regionKey];
    if (!regionData || !regionData.tiers || regionData.tiers.length === 0) continue;

    const cycle: 'Monthly' | 'Yearly' = sub.cycle === 'Yearly' ? 'Yearly' : 'Monthly';
    const matchedTier = matchBestTier(regionData.tiers, sub.plan || '', cycle);
    if (!matchedTier || matchedTier.price <= 0) continue;

    // Only compare if cycles match
    if (matchedTier.cycle !== cycle) continue;

    const newPrice = Number(matchedTier.price);
    const oldPrice = Number(sub.price);
    const diff = Number((newPrice - oldPrice).toFixed(2));

    if (Math.abs(diff) < 0.5) continue;

    if (!ignoreDismissed && dismissed[String(sub.id)] === newPrice) {
      continue;
    }

    const liveEntry = cache[norm(svc.name)];
    const isLiveAi = Boolean(liveEntry && (currency === 'TRY' ? liveEntry.tr?.price : liveEntry.us?.price));

    suggestions.push({
      sub,
      oldPrice,
      newPrice,
      currency,
      matchedPlan: matchedTier.nameLocalized || matchedTier.name,
      diff,
      percentChange: oldPrice > 0 ? Number((((newPrice - oldPrice) / oldPrice) * 100).toFixed(1)) : 0,
      source: isLiveAi ? 'live-ai' : 'catalog-2026',
    });
  }

  return suggestions;
};

