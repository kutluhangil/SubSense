import type { Cycle } from '../types';

export interface Plan {
  name: string;
  usd: number; // price per `cycle` in USD (canonical)
  cycle?: Cycle; // default Monthly
  blurb?: string;
  /** Real local prices per ISO currency (same cycle). Missing → FX-converted from usd. */
  regional?: Partial<Record<string, number>>;
}

/**
 * Curated real-world current prices (2025) per service, ordered cheapest→priciest.
 * `regional` holds actual local list prices for major markets; other currencies
 * fall back to FX conversion of `usd`.
 */
export const PRICING: Record<string, Plan[]> = {
  Netflix: [
    { name: 'Standard with ads', usd: 6.99, blurb: '1080p · 2 devices', regional: { EUR: 5.99, GBP: 5.99, TRY: 189.99, INR: 149, BRL: 20.9, CAD: 5.99, AUD: 7.99 } },
    { name: 'Standard', usd: 15.49, blurb: '1080p · 2 devices · downloads', regional: { EUR: 13.49, GBP: 12.99, TRY: 289.99, INR: 499, BRL: 44.9, CAD: 16.49, AUD: 18.99 } },
    { name: 'Premium', usd: 22.99, blurb: '4K Ultra HD · 4 devices', regional: { EUR: 19.99, GBP: 18.99, TRY: 379.99, INR: 649, BRL: 59.9, CAD: 22.99, AUD: 25.99 } },
  ],
  Spotify: [
    { name: 'Student', usd: 5.99, blurb: 'Discounted, ad-free', regional: { EUR: 5.99, GBP: 5.99, TRY: 55.99, INR: 59, BRL: 11.5 } },
    { name: 'Individual', usd: 11.99, blurb: '1 account', regional: { EUR: 10.99, GBP: 11.99, TRY: 99.99, INR: 119, BRL: 21.9 } },
    { name: 'Duo', usd: 16.99, blurb: '2 accounts', regional: { EUR: 14.99, GBP: 16.99, TRY: 135.99, INR: 149, BRL: 27.9 } },
    { name: 'Family', usd: 19.99, blurb: 'Up to 6 accounts', regional: { EUR: 17.99, GBP: 19.99, TRY: 169.99, INR: 179, BRL: 34.9 } },
  ],
  'YouTube Premium': [
    { name: 'Student', usd: 7.99, regional: { EUR: 7.99, GBP: 6.99, TRY: 79.99, INR: 89, BRL: 14.9 } },
    { name: 'Individual', usd: 13.99, regional: { EUR: 12.99, GBP: 12.99, TRY: 119.99, INR: 149, BRL: 24.9 } },
    { name: 'Family', usd: 22.99, blurb: 'Up to 5 members', regional: { EUR: 23.99, GBP: 19.99, TRY: 239.99, INR: 189, BRL: 41.9 } },
  ],
  'Disney+': [
    { name: 'Standard with Ads', usd: 9.99, regional: { EUR: 5.99, GBP: 4.99, TRY: 249.9 } },
    { name: 'Standard', usd: 11.99, regional: { EUR: 8.99, GBP: 8.99, TRY: 349.9 } },
    { name: 'Premium', usd: 15.99, blurb: '4K · no ads', regional: { EUR: 13.99, GBP: 12.99, TRY: 449.9 } },
  ],
  'HBO Max': [
    { name: 'With Ads', usd: 9.99, regional: { EUR: 5.99 } },
    { name: 'Ad-Free', usd: 16.99, regional: { EUR: 9.99 } },
    { name: 'Ultimate', usd: 20.99, blurb: '4K Ultra HD', regional: { EUR: 12.99 } },
  ],
  Hulu: [
    { name: 'With Ads', usd: 9.99 },
    { name: 'No Ads', usd: 18.99 },
  ],
  Crunchyroll: [
    { name: 'Fan', usd: 7.99, regional: { TRY: 29.99, EUR: 6.49 } },
    { name: 'Mega Fan', usd: 9.99, regional: { TRY: 39.99, EUR: 7.99 } },
  ],
  'Paramount+': [
    { name: 'Essential', usd: 7.99, regional: { EUR: 5.99 } },
    { name: 'Premium', usd: 12.99, regional: { EUR: 9.99 } },
  ],
  'Apple TV+': [{ name: 'Monthly', usd: 9.99, regional: { EUR: 9.99, GBP: 8.99, TRY: 229.99 } }],
  Audible: [{ name: 'Premium Plus', usd: 14.95, regional: { EUR: 9.95, GBP: 7.99, TRY: 99.99 } }],
  'Apple Music': [
    { name: 'Student', usd: 5.99, regional: { EUR: 5.99, GBP: 5.99, TRY: 32.99 } },
    { name: 'Individual', usd: 10.99, regional: { EUR: 10.99, GBP: 10.99, TRY: 59.99, INR: 99, BRL: 21.9 } },
    { name: 'Family', usd: 16.99, blurb: 'Up to 6', regional: { EUR: 16.99, GBP: 16.99, TRY: 99.99, INR: 149, BRL: 34.9 } },
  ],
  Tidal: [{ name: 'Individual', usd: 10.99, regional: { EUR: 10.99, GBP: 10.99 } }],
  Deezer: [
    { name: 'Premium', usd: 11.99, regional: { EUR: 11.99, GBP: 11.99, TRY: 59.99 } },
    { name: 'Family', usd: 17.99, regional: { EUR: 17.99 } },
  ],
  SoundCloud: [
    { name: 'Go', usd: 5.99 },
    { name: 'Go+', usd: 12.99 },
  ],
  'ChatGPT Plus': [
    { name: 'Plus', usd: 20, blurb: 'GPT-5, more limits', regional: { EUR: 22, GBP: 19, INR: 1999, BRL: 97, TRY: 800 } },
    { name: 'Pro', usd: 200, blurb: 'Unlimited, research', regional: { EUR: 229, GBP: 200 } },
  ],
  Claude: [
    { name: 'Pro', usd: 20, blurb: 'More usage, projects', regional: { EUR: 18, GBP: 18 } },
    { name: 'Max', usd: 100, blurb: '5–20× more usage' },
  ],
  Gemini: [{ name: 'AI Pro', usd: 19.99, regional: { EUR: 21.99, GBP: 18.99, INR: 1950, TRY: 650 } }],
  Perplexity: [{ name: 'Pro', usd: 20, regional: { EUR: 20, GBP: 18 } }],
  Midjourney: [
    { name: 'Basic', usd: 10 },
    { name: 'Standard', usd: 30 },
    { name: 'Pro', usd: 60 },
  ],
  'GitHub Copilot': [
    { name: 'Pro', usd: 10, blurb: 'For individuals' },
    { name: 'Pro+', usd: 39, blurb: 'Premium models' },
  ],
  Figma: [
    { name: 'Professional', usd: 16, blurb: 'Per editor', regional: { EUR: 15, GBP: 12 } },
    { name: 'Organization', usd: 45 },
  ],
  Canva: [
    { name: 'Pro', usd: 12.99, blurb: '1 person', regional: { EUR: 11.99, GBP: 10.99, TRY: 199.99 } },
    { name: 'Teams', usd: 10, blurb: 'Per person' },
  ],
  Notion: [
    { name: 'Plus', usd: 10, regional: { EUR: 9.5 } },
    { name: 'Business', usd: 18 },
  ],
  Slack: [
    { name: 'Pro', usd: 8.75, regional: { EUR: 7.25, GBP: 6.25 } },
    { name: 'Business+', usd: 15 },
  ],
  Zoom: [
    { name: 'Pro', usd: 13.33, regional: { EUR: 13.99, GBP: 11.99 } },
    { name: 'Business', usd: 18.32 },
  ],
  Dropbox: [
    { name: 'Plus', usd: 11.99, blurb: '2 TB' },
    { name: 'Essentials', usd: 19.99, blurb: '3 TB' },
  ],
  Trello: [
    { name: 'Standard', usd: 5 },
    { name: 'Premium', usd: 10 },
  ],
  'Microsoft 365': [
    { name: 'Personal', usd: 6.99, regional: { EUR: 7, GBP: 5.99, TRY: 119.99 } },
    { name: 'Family', usd: 9.99, regional: { EUR: 10, GBP: 7.99, TRY: 169.99 } },
  ],
  Grammarly: [{ name: 'Pro', usd: 12, regional: { EUR: 11 } }],
  'Xbox Game Pass': [
    { name: 'Core', usd: 9.99, regional: { EUR: 6.99, GBP: 6.99, TRY: 269.0 } },
    { name: 'PC Game Pass', usd: 11.99, regional: { EUR: 11.99, GBP: 9.99, TRY: 419.0 } },
    { name: 'Ultimate', usd: 19.99, blurb: 'Console + PC + cloud', regional: { EUR: 17.99, GBP: 14.99, TRY: 529.0 } },
  ],
  'PlayStation Plus': [
    { name: 'Essential', usd: 9.99, regional: { EUR: 8.99, GBP: 6.99, TRY: 400.0 } },
    { name: 'Extra', usd: 14.99, regional: { EUR: 13.99, GBP: 10.99, TRY: 600.0 } },
    { name: 'Premium', usd: 17.99, regional: { EUR: 16.99, GBP: 13.49, TRY: 710.0 } },
  ],
  'Nintendo Switch Online': [
    { name: 'Individual', usd: 3.99 },
    { name: 'Family', usd: 7.99 },
    { name: 'Expansion Pack', usd: 4.99 },
  ],
  'Discord Nitro': [
    { name: 'Nitro Basic', usd: 2.99 },
    { name: 'Nitro', usd: 9.99, regional: { EUR: 9.99, GBP: 8.99 } },
  ],
  Twitch: [{ name: 'Turbo', usd: 8.99 }],
  'EA Play': [
    { name: 'Standard', usd: 4.99, regional: { EUR: 3.99, GBP: 3.99 } },
    { name: 'Pro', usd: 14.99 },
  ],
  'GeForce Now': [
    { name: 'Performance', usd: 9.99, regional: { EUR: 9.99, GBP: 8.99 } },
    { name: 'Ultimate', usd: 19.99, regional: { EUR: 19.99 } },
  ],
  Duolingo: [
    { name: 'Super', usd: 6.99, regional: { EUR: 6.99, GBP: 5.99, TRY: 99.99 } },
    { name: 'Max', usd: 14, regional: { EUR: 14 } },
  ],
  Masterclass: [
    { name: 'Individual', usd: 10, cycle: 'Yearly', regional: { EUR: 10 } },
    { name: 'Duo', usd: 15, cycle: 'Yearly' },
  ],
  'Amazon Prime': [
    { name: 'Monthly', usd: 14.99, regional: { EUR: 8.99, GBP: 8.99, TRY: 69.9, INR: 299, BRL: 19.9 } },
    { name: 'Annual', usd: 139, cycle: 'Yearly', blurb: 'Best value', regional: { EUR: 89.9, GBP: 95.0, TRY: 838.8, INR: 1499, BRL: 179.0 } },
  ],
};
