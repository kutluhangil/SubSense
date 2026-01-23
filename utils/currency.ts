
// Mock Exchange Rates (Base: USD)
// In a real app, these would be fetched from an API like exchangerate.host
export const EXCHANGE_RATES: Record<string, number> = {
  "USD": 1,
  "EUR": 0.92,
  "GBP": 0.79,
  "TRY": 34.20,
  "JPY": 150.50,
  "CNY": 7.23,
  "AUD": 1.52,
  "CAD": 1.36
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
