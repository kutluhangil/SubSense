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

// Prices reflect current standard monthly tiers. TR services use TRY (the
// region most users are in); global SaaS billed in USD stay in USD.
// Kept consistent with the regional pricing in SUBSCRIPTION_CATALOG (data.ts).
export const subscriptionTemplates: SubscriptionTemplate[] = [
  // --- Streaming (TR) ---
  { name: 'Netflix', type: 'Entertainment', price: 289.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'netflix' },
  { name: 'Disney+', type: 'Entertainment', price: 449.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'disney' },
  { name: 'Amazon Prime', type: 'Shopping', price: 69.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Shopping', logo: 'amazonprime' },
  { name: 'Exxen', type: 'Entertainment', price: 309.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'exxen' },
  { name: 'BluTV', type: 'Entertainment', price: 199.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'blutv' },
  { name: 'Crunchyroll', type: 'Entertainment', price: 49.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'crunchyroll' },
  // --- Music (TR) ---
  { name: 'Spotify', type: 'Music', price: 99.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'spotify' },
  { name: 'YouTube Premium', type: 'Entertainment', price: 119.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'youtube' },
  { name: 'Apple Music', type: 'Music', price: 59.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'applemusic' },
  // --- Gaming (TR) ---
  { name: 'Xbox Game Pass', type: 'Gaming', price: 529.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'xboxgamepass' },
  { name: 'PlayStation Plus', type: 'Gaming', price: 600.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'playstationplus' },
  { name: 'Discord Nitro', type: 'Gaming', price: 104.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'discord' },
  { name: 'Twitch Turbo', type: 'Gaming', price: 164.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'twitch' },
  // --- Productivity / SaaS ---
  { name: 'Microsoft 365', type: 'Software', price: 179.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'microsoft365' },
  { name: 'Adobe Creative Cloud', type: 'Software', price: 925.20, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'adobe' },
  { name: 'Duolingo Super', type: 'Software', price: 52.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'duolingo' },
  { name: 'ChatGPT Plus', type: 'Software', price: 20.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'chatgpt' },
  { name: 'Claude Pro', type: 'Software', price: 20.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'claude' },
  { name: 'GitHub Copilot', type: 'Software', price: 10.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'githubcopilot' },
  { name: 'Figma', type: 'Software', price: 15.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'figma' },
  { name: 'Notion', type: 'Software', price: 10.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'notion' },
  // --- Shopping (TR) ---
  { name: 'Trendyol Elite', type: 'Shopping', price: 49.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Shopping', logo: 'trendyol' },
  { name: 'Hepsiburada Premium', type: 'Shopping', price: 69.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Shopping', logo: 'hepsiburada' },
  // --- Global streaming (USD) ---
  { name: 'HBO Max', type: 'Entertainment', price: 229.90, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'hbomax' },
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
