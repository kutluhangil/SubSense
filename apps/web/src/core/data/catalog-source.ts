// Live price catalog source.
//
// There is NO provider API that returns Netflix/Spotify/etc. official prices, so
// "live" means: the app fetches a JSON file that YOU host and update. Point this at
// your hosted price-catalog.json (GitHub raw / CDN / Supabase Storage) to enable
// live, auto-updating catalog prices without an App Store release.
//
// Empty string = disabled → the app uses the bundled prices (safe default).
// Schema + a starter file: public/price-catalog.example.json
export const PRICE_CATALOG_URL = '';

// How long a fetched catalog is considered fresh before refetching.
export const CATALOG_TTL_MS = 12 * 60 * 60 * 1000; // 12h
