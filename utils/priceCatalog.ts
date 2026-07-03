import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Reads the weekly Gemini-synced price catalog from Firestore (`priceCatalog`),
 * written by functions/src/priceSync.ts. Prices are AI-sourced suggestions, so
 * each entry carries a `confidence` and `changed` flag — the UI can surface
 * "price may have changed, confirm?" rather than blindly trusting them.
 *
 * Always degrades gracefully: if Firestore is unreachable or the collection is
 * empty, callers fall back to the local subscriptionTemplates / catalog data.
 */

export interface CatalogRegionPrice {
  price: number | null;
  currency: string;
  plan?: string;
}

export interface CatalogEntry {
  name: string;
  tr?: CatalogRegionPrice | null;
  us?: CatalogRegionPrice | null;
  confidence?: 'high' | 'medium' | 'low';
  changed?: boolean;
  source?: string;
}

const LS_KEY = 'subsense_price_catalog_v1';
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

let cache: Record<string, CatalogEntry> = {};
let loaded = false;

// Hydrate synchronously from localStorage so the first render already has data.
try {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) cache = JSON.parse(raw);
} catch {
  /* ignore */
}

/** Fetch the latest catalog from Firestore. Safe to call once on app startup. */
export const loadPriceCatalog = async (): Promise<void> => {
  if (loaded) return;
  try {
    const snap = await getDocs(collection(db, 'priceCatalog'));
    if (snap.empty) return;
    const next: Record<string, CatalogEntry> = {};
    snap.forEach(doc => {
      next[norm(doc.id)] = doc.data() as CatalogEntry;
    });
    cache = next;
    loaded = true;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      /* quota / private mode — in-memory cache still works */
    }
  } catch (e) {
    // Offline, rules not deployed, or collection missing — keep local fallback.
    console.debug('Price catalog unavailable, using local templates', e);
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
  Object.values(cache).filter(e => e.changed);
