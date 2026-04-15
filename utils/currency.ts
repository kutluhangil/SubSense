
// CURRENCY SERVICE LAYER
// Handles rate fetching, caching, and conversion logic.

import { trackEvent } from './analytics';

export interface CurrencyMetadata {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCY_DATA: Record<string, CurrencyMetadata> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  CNY: { code: 'CNY', symbol: '元', name: 'Chinese Yuan', flag: '🇨🇳' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', flag: '🇲🇽' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', flag: '🇵🇱' },
};

// Rates relative to USD (Base) — fallback defaults (~Apr 2026).
// Live rates are fetched at runtime from https://open.er-api.com/v6/latest/USD
// and cached for 24 hours via localStorage.
const DEFAULT_RATES: Record<string, number> = {
  "USD": 1,
  "EUR": 0.93,
  "GBP": 0.79,
  "TRY": 38.50,
  "JPY": 152.00,
  "CNY": 7.25,
  "AUD": 1.52,
  "CAD": 1.36,
  "INR": 83.50,
  "BRL": 5.05,
  "RUB": 92.50,
  "KRW": 1350.00,
  "MXN": 17.20,
  "SAR": 3.75,
  "AED": 3.67,
  "CHF": 0.89,
  "SEK": 10.50,
  "NOK": 10.80,
  "DKK": 6.90,
  "PLN": 3.95,
};

export const EXCHANGE_RATES = DEFAULT_RATES;

const CACHE_KEY = 'subscriptionhub_fx_rates';
const CACHE_VERSION = 'v3_2026'; // Bump this to invalidate old caches
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedRates {
  version: string;
  base: string;
  rates: Record<string, number>;
  updatedAt: number;
}

export const getRates = (): Record<string, number> => {
  // 1. Try to get cached rates (live or static)
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedRates = JSON.parse(cached);
      const age = Date.now() - data.updatedAt;
      if (data.version === CACHE_VERSION && age < CACHE_DURATION) {
        return data.rates;
      }
    }
  } catch (e) {
    console.warn("Failed to load cached FX rates", e);
  }

  // 2. Return defaults immediately (non-blocking fetch will update cache)
  return DEFAULT_RATES;
};

/**
 * Fetches live exchange rates from Open ER API (free, no key required).
 * Returns the rates object or null if fetch fails.
 */
const fetchLiveRates = async (): Promise<Record<string, number> | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const json = await response.json();
    if (json.result !== 'success' || !json.rates) return null;

    // Merge with our supported currencies — keep only codes we support
    const supportedCodes = Object.keys(DEFAULT_RATES);
    const liveRates: Record<string, number> = {};
    supportedCodes.forEach(code => {
      liveRates[code] = json.rates[code] ?? DEFAULT_RATES[code] ?? 1;
    });

    return liveRates;
  } catch (e) {
    // Network error, timeout, or abort — silent fallback
    console.debug("Live FX fetch failed, using cached/default rates", e);
    return null;
  }
};

/**
 * Non-blocking initialization: fetches live rates and caches them.
 * Safe to call multiple times — skips if cache is fresh.
 * Call this once on app startup.
 */
export const initializeRates = async (): Promise<void> => {
  // Skip if cache is still fresh
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedRates = JSON.parse(cached);
      const age = Date.now() - data.updatedAt;
      if (data.version === CACHE_VERSION && age < CACHE_DURATION) {
        return; // Cache is fresh, no need to fetch
      }
    }
  } catch (e) {
    // Proceed to fetch
  }

  const liveRates = await fetchLiveRates();

  if (liveRates) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        version: CACHE_VERSION,
        base: 'USD',
        rates: liveRates,
        updatedAt: Date.now(),
        source: 'live'
      }));
      trackEvent('rate_fetch_success', { base: 'USD', source: 'open.er-api.com' });
    } catch (e) {
      // Storage error — rates still usable in memory this session
    }
  } else {
    // Cache the defaults so we don't re-fetch on every call
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        version: CACHE_VERSION,
        base: 'USD',
        rates: DEFAULT_RATES,
        updatedAt: Date.now(),
        source: 'default'
      }));
    } catch (e) {
      // Ignore
    }
    trackEvent('rate_fetch_error', { reason: 'api_unavailable', base: 'USD' });
  }
};

/**
 * Converts an amount from one currency to another using the cached rates.
 * @param amount The value to convert
 * @param fromCurrency ISO code of source currency
 * @param toCurrency ISO code of target currency
 * @returns Converted amount
 */
export const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const rates = getRates();
  // Ensure we have a valid rate, fallback to 1 if missing or 0
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  if (!amount) return 0;

  // Convert to USD (Base) then to Target
  // Amount / FromRate = USD Value
  // USD Value * ToRate = Target Value
  return (amount / fromRate) * toRate;
};

export const CURRENCY_LOCALES: Record<string, string> = {
  "en": "en-US",
  "tr": "tr-TR",
  "es": "es-ES",
  "fr": "fr-FR",
  "de": "de-DE",
  "it": "it-IT",
  "pt": "pt-BR",
  "ru": "ru-RU",
  "ja": "ja-JP",
  "zh": "zh-CN",
  "ar": "ar-SA"
};
