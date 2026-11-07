import { getCatalogPrice } from './priceCatalog';

export interface SubscriptionTemplate {
  name: string;
  type: string;
  price: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly';
  category: string;
  logo?: string;
  color?: string;
}

// Prices reflect current 2026 standard monthly tiers. TR services use TRY;
// global SaaS billed in USD stay in USD. Kept 100% consistent with SUBSCRIPTION_CATALOG (data.ts).
export const subscriptionTemplates: SubscriptionTemplate[] = [
  // --- Streaming (TR) ---
  { name: 'Netflix', type: 'Entertainment', price: 389.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'netflix' },
  { name: 'Disney+', type: 'Entertainment', price: 249.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'disney' },
  { name: 'Amazon Prime', type: 'Shopping', price: 69.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Shopping', logo: 'amazonprime' },
  { name: 'Amazon Prime Video', type: 'Entertainment', price: 69.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'amazonprime' },
  { name: 'Exxen', type: 'Entertainment', price: 309.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'exxen' },
  { name: 'BluTV', type: 'Entertainment', price: 229.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'blutv' },
  { name: 'HBO Max', type: 'Entertainment', price: 229.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'hbomax' },
  { name: 'Gain', type: 'Entertainment', price: 249.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'gain' },
  { name: 'Tabii', type: 'Entertainment', price: 99.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'tabii' },
  { name: 'Apple TV+', type: 'Entertainment', price: 89.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'appletv+' },
  { name: 'Crunchyroll', type: 'Entertainment', price: 49.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'crunchyroll' },
  // --- Music (TR) ---
  { name: 'Spotify', type: 'Music', price: 115.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'spotify' },
  { name: 'YouTube Premium', type: 'Entertainment', price: 119.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'youtube' },
  { name: 'Apple Music', type: 'Music', price: 89.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'applemusic' },
  { name: 'Deezer', type: 'Music', price: 89.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'deezer' },
  // --- Gaming (TR) ---
  { name: 'Xbox Game Pass', type: 'Gaming', price: 529.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'xboxgamepass' },
  { name: 'PlayStation Plus', type: 'Gaming', price: 600.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'playstationplus' },
  { name: 'GeForce Now', type: 'Gaming', price: 599.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'geforcenow' },
  { name: 'EA Play', type: 'Gaming', price: 219.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'eaplay' },
  { name: 'Ubisoft+', type: 'Gaming', price: 299.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'ubisoft+' },
  { name: 'Nintendo Switch Online', type: 'Gaming', price: 109.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'nintendo' },
  { name: 'Discord Nitro', type: 'Gaming', price: 269.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'discord' },
  { name: 'Twitch Turbo', type: 'Gaming', price: 399.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'twitch' },
  // --- Productivity / AI / SaaS ---
  { name: 'Microsoft 365', type: 'Software', price: 329.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'microsoft365' },
  { name: 'Adobe Creative Cloud', type: 'Software', price: 956.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'adobe' },
  { name: 'Canva Pro', type: 'Software', price: 239.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'canva' },
  { name: 'Duolingo Super', type: 'Software', price: 169.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'duolingo' },
  { name: 'ChatGPT Plus', type: 'Software', price: 20.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'chatgpt' },
  { name: 'Claude Pro', type: 'Software', price: 20.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'claude' },
  { name: 'Gemini Advanced', type: 'Software', price: 19.99, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'google' },
  { name: 'Perplexity', type: 'Software', price: 20.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'perplexity' },
  { name: 'GitHub Copilot', type: 'Software', price: 10.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'githubcopilot' },
  { name: 'Midjourney', type: 'Software', price: 10.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'midjourney' },
  { name: 'Figma', type: 'Software', price: 15.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'figma' },
  { name: 'Notion', type: 'Software', price: 10.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'notion' },
  // --- Shopping (TR) ---
  { name: 'Trendyol Elite', type: 'Shopping', price: 75.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Shopping', logo: 'trendyol' },
  { name: 'Hepsiburada Premium', type: 'Shopping', price: 69.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Shopping', logo: 'hepsiburada' },
  // --- Global streaming (USD) ---
  { name: 'Hulu', type: 'Entertainment', price: 9.99, currency: 'USD', billingCycle: 'Monthly', category: 'Entertainment', logo: 'hulu' },
];

export function getSuggestions(query: string): SubscriptionTemplate[] {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  const matches = subscriptionTemplates.filter(t => t.name.toLowerCase().includes(lowerQuery));
  // Override the local default with the weekly Gemini-synced price when available.
  return matches.map(t => {
    const region: 'tr' | 'us' = t.currency === 'TRY' ? 'tr' : 'us';
    const synced = getCatalogPrice(t.name, region);
    return synced ? { ...t, price: synced.price as number, currency: synced.currency } : t;
  });
}
