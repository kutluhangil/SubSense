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

export const subscriptionTemplates: SubscriptionTemplate[] = [
  { name: 'Netflix', type: 'Entertainment', price: 229.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'netflix' },
  { name: 'Spotify', type: 'Music', price: 59.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'spotify' },
  { name: 'YouTube Premium', type: 'Entertainment', price: 57.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'youtube' },
  { name: 'Amazon Prime', type: 'Shopping', price: 39.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Shopping', logo: 'amazon' },
  { name: 'Disney+', type: 'Entertainment', price: 134.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'disney' },
  { name: 'ChatGPT Plus', type: 'Software', price: 20.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'openai' },
  { name: 'Adobe Creative Cloud', type: 'Software', price: 925.20, currency: 'TRY', billingCycle: 'Monthly', category: 'Productivity', logo: 'adobe' },
  { name: 'Apple Music', type: 'Music', price: 39.99, currency: 'TRY', billingCycle: 'Monthly', category: 'Entertainment', logo: 'apple' },
  { name: 'Xbox Game Pass', type: 'Gaming', price: 309.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'xbox' },
  { name: 'PlayStation Plus', type: 'Gaming', price: 305.00, currency: 'TRY', billingCycle: 'Monthly', category: 'Gaming', logo: 'playstation' },
  { name: 'GitHub Copilot', type: 'Software', price: 10.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'github' },
  { name: 'Hulu', type: 'Entertainment', price: 7.99, currency: 'USD', billingCycle: 'Monthly', category: 'Entertainment', logo: 'hulu' },
  { name: 'HBO Max', type: 'Entertainment', price: 15.99, currency: 'USD', billingCycle: 'Monthly', category: 'Entertainment', logo: 'hbo' },
  { name: 'Notion', type: 'Software', price: 10.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'notion' },
  { name: 'Figma', type: 'Software', price: 15.00, currency: 'USD', billingCycle: 'Monthly', category: 'Productivity', logo: 'figma' },
];

export function getSuggestions(query: string): SubscriptionTemplate[] {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return subscriptionTemplates.filter(t => t.name.toLowerCase().includes(lowerQuery));
}
