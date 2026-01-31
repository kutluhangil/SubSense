
// CURRENCY SERVICE LAYER
// Handles rate fetching, caching, and conversion logic.

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
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
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

// Rates relative to USD (Base)
// In production, fetch this from an API like https://open.er-api.com/v6/latest/USD
const DEFAULT_RATES: Record<string, number> = {
  "USD": 1,
  "EUR": 0.92,
  "GBP": 0.79,
  "TRY": 34.20,
  "JPY": 150.50,
  "CNY": 7.23,
  "AUD": 1.52,
  "CAD": 1.36,
  "INR": 83.12,
  "BRL": 5.05,
  "RUB": 92.50,
  "KRW": 1335.00,
  "MXN": 16.70,
  "SAR": 3.75,
  "AED": 3.67,
  "CHF": 0.90,
  "SEK": 10.50,
  "NOK": 10.60,
  "DKK": 6.90,
  "PLN": 3.95,
};

export const EXCHANGE_RATES = DEFAULT_RATES;

const CACHE_KEY = 'subscriptionhub_fx_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: number;
}

export const getRates = (): Record<string, number> => {
  // 1. Try to get cached rates
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedRates = JSON.parse(cached);
      const age = Date.now() - data.updatedAt;
      if (age < CACHE_DURATION) {
        return data.rates;
      }
    }
  } catch (e) {
    console.warn("Failed to load cached FX rates", e);
  }

  // 2. Fallback to default rates (Simulation of fresh fetch)
  // In a real app, this would be: await fetch('https://api...').json()
  const freshRates = DEFAULT_RATES;
  
  // 3. Cache the "new" rates
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      base: 'USD',
      rates: freshRates,
      updatedAt: Date.now()
    }));
  } catch (e) {
    // Ignore storage errors
  }

  return freshRates;
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
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
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
