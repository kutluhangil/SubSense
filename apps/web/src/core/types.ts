export type Cycle = 'Monthly' | 'Yearly';
export type SubStatus = 'Active' | 'Trial' | 'Expiring' | 'Inactive';

export type Category =
  | 'Entertainment'
  | 'Productivity'
  | 'Tools'
  | 'Music'
  | 'Gaming'
  | 'Health & Fitness'
  | 'Shopping';

export interface Subscription {
  id: string;
  name: string;
  plan: string;
  price: number;
  currency: string; // ISO code
  cycle: Cycle;
  nextDate: string; // ISO date (YYYY-MM-DD)
  startDate?: string;
  category: Category;
  status: SubStatus;
  trialEndDate?: string;
  trialPrice?: number; // shown as $0.00 during trial; price is the post-trial amount
  billingDay?: number;
  paymentMethod?: string;
  notes?: string;
  nickname?: string;
  history?: number[];
  reminderEnabled?: boolean;
  brandColor?: string;
  logo?: string;
  /** Shared plan: what the user personally pays (price stays the full plan price). */
  isShared?: boolean;
  myShare?: number;
  /** Soft delete marker written by sync; deleted rows are hidden, never hard-deleted. */
  deletedAt?: number | null;
  /** Last local edit (epoch ms); newer wins when two devices edit the same row. */
  updatedAt?: number;
}

export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  flag: string; // emoji flag
  rate: number; // units per 1 USD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // material symbol name
  unlocked: boolean;
}

export type Appearance = 'light' | 'dark' | 'system';

export interface AppSettings {
  baseCurrency: string;
  language: string;
  appearance: Appearance;
  budgetLimits: Record<string, number>;
  isPro: boolean;
  notificationsEnabled: boolean;
  renewalAlerts: boolean;
  /** Require biometric unlock on launch/resume (native only; no-op on web). */
  appLockEnabled: boolean;
}

export interface AuthUser {
  name: string;
  email: string;
}

/** A detected increase in a service's catalog reference price (USD, FX-independent). */
export interface PriceChange {
  id: string; // subscription id
  name: string;
  fromUsd: number;
  toUsd: number;
}

export interface CatalogService {
  name: string;
  category: Category;
  defaultPlan: string;
  fromPrice: number; // USD
  brandColor: string;
  letter?: string; // fallback letter glyph
  icon?: string; // material symbol fallback
  tagline?: string;
  popular?: boolean;
}
