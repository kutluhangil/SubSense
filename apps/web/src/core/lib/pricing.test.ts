import { describe, it, expect } from 'vitest';
import { planPriceIn, subCyclePrice } from './pricing';
import type { Plan } from '../data/pricing';
import type { Subscription } from '../types';

const rates = { USD: 1, TRY: 40 };

function sub(p: Partial<Subscription>): Subscription {
  return {
    id: 'x', name: 'Netflix', plan: 'Premium 4K', price: 99, currency: 'USD',
    cycle: 'Monthly', nextDate: '2030-01-01', category: 'Entertainment', status: 'Active',
    ...p,
  };
}

describe('subCyclePrice (H-2: stored price wins)', () => {
  it('returns the user price even when the name matches a catalog service', () => {
    expect(subCyclePrice(sub({ name: 'Netflix', price: 99 }), 'USD', rates)).toBe(99);
  });
  it('FX-converts the stored price to the target currency', () => {
    expect(subCyclePrice(sub({ price: 10, currency: 'USD' }), 'TRY', rates)).toBe(400);
  });
  it('keeps a non-catalog custom service price', () => {
    expect(subCyclePrice(sub({ name: 'My Gym', price: 45 }), 'USD', rates)).toBe(45);
  });
});

describe('planPriceIn', () => {
  it('uses the regional override when present', () => {
    const plan: Plan = { name: 'Std', usd: 10, regional: { TRY: 289.99 } };
    expect(planPriceIn(plan, 'TRY', rates)).toBe(289.99);
  });
  it('falls back to FX from USD when no regional override', () => {
    const plan: Plan = { name: 'Std', usd: 10 };
    expect(planPriceIn(plan, 'TRY', rates)).toBe(400);
  });
  it('returns USD price for USD base', () => {
    const plan: Plan = { name: 'Std', usd: 12.5 };
    expect(planPriceIn(plan, 'USD', rates)).toBe(12.5);
  });
});

describe('subCyclePrice with a shared plan', () => {
  it('counts only my share', () => {
    const sub = { id: 'x', name: 'Spotify', plan: 'Family', price: 199, currency: 'TRY', cycle: 'Monthly' as const, nextDate: '2026-12-01', category: 'Music' as const, status: 'Active' as const, isShared: true, myShare: 50 };
    expect(subCyclePrice(sub, 'TRY', { TRY: 1, USD: 1 })).toBe(50);
  });
});
