import { describe, it, expect } from 'vitest';
import { computeTotals, budgetAlerts, musicOverlap, monthlyProjection } from './derive';
import type { Subscription } from '../types';

const rates = { USD: 1, TRY: 40 };

function sub(p: Partial<Subscription>): Subscription {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'X', plan: 'Std', price: 10, currency: 'USD', cycle: 'Monthly',
    nextDate: '2030-01-01', category: 'Tools', status: 'Active',
    ...p,
  };
}

describe('computeTotals', () => {
  it('sums monthly active subs', () => {
    const t = computeTotals([sub({ price: 10 }), sub({ price: 5 })], 'USD', rates);
    expect(t.monthly).toBeCloseTo(15);
    expect(t.activeCount).toBe(2);
    expect(t.annual).toBeCloseTo(180);
  });
  it('normalizes yearly to monthly', () => {
    const t = computeTotals([sub({ price: 120, cycle: 'Yearly' })], 'USD', rates);
    expect(t.monthly).toBeCloseTo(10);
  });
  it('excludes inactive subs', () => {
    const t = computeTotals([sub({ price: 10 }), sub({ price: 99, status: 'Inactive' })], 'USD', rates);
    expect(t.monthly).toBeCloseTo(10);
    expect(t.activeCount).toBe(1);
  });
  it('counts trial as its trial price (0)', () => {
    const t = computeTotals([sub({ price: 25, status: 'Trial', trialPrice: 0 })], 'USD', rates);
    expect(t.monthly).toBe(0);
    expect(t.activeCount).toBe(1);
  });
});

describe('budgetAlerts', () => {
  it('flags a category over its limit', () => {
    const subs = [sub({ category: 'Entertainment', price: 50 })];
    const alerts = budgetAlerts(subs, { Entertainment: 35 }, 'USD', rates);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].category).toBe('Entertainment');
    expect(alerts[0].over).toBeCloseTo(15);
  });
  it('no alert when under limit', () => {
    const alerts = budgetAlerts([sub({ category: 'Entertainment', price: 10 })], { Entertainment: 35 }, 'USD', rates);
    expect(alerts).toHaveLength(0);
  });
});

describe('monthlyProjection', () => {
  it('spreads a monthly sub evenly across all 12 months', () => {
    const p = monthlyProjection([sub({ price: 10, cycle: 'Monthly' })], 'USD', rates, 12);
    expect(p).toHaveLength(12);
    expect(p.every((m) => Math.abs(m.amount - 10) < 1e-9)).toBe(true);
    expect(p.reduce((a, b) => a + b.amount, 0)).toBeCloseTo(120);
  });
  it('lands a yearly charge exactly once within the window', () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    const nextDate = d.toISOString().slice(0, 10);
    const p = monthlyProjection([sub({ price: 120, cycle: 'Yearly', nextDate })], 'USD', rates, 12);
    const nonzero = p.filter((m) => m.amount > 0);
    expect(nonzero).toHaveLength(1);
    expect(nonzero[0].amount).toBeCloseTo(120);
  });
  it('excludes inactive subs', () => {
    const p = monthlyProjection([sub({ price: 10, status: 'Inactive' })], 'USD', rates, 12);
    expect(p.reduce((a, b) => a + b.amount, 0)).toBe(0);
  });
});

describe('musicOverlap', () => {
  it('returns null with fewer than 2 music subs', () => {
    expect(musicOverlap([sub({ category: 'Music', price: 10 })], 'USD', rates)).toBeNull();
  });
  it('computes savings = total minus cheapest', () => {
    const r = musicOverlap(
      [sub({ category: 'Music', price: 11.99 }), sub({ category: 'Music', price: 9.99 })],
      'USD', rates,
    );
    expect(r).not.toBeNull();
    expect(r!.count).toBe(2);
    expect(r!.savings).toBeCloseTo(11.99);
  });
});

describe('categoryOverlap + trialsEndingSoon', () => {
  it('finds the category where dropping all but the cheapest saves most', async () => {
    const { categoryOverlap } = await import('./derive');
    const mk = (id: string, price: number, category: Subscription['category']): Subscription => ({ id, name: id, plan: '', price, currency: 'USD', cycle: 'Monthly', nextDate: '2026-12-01', category, status: 'Active' });
    const r = categoryOverlap([mk('a', 10, 'Music'), mk('b', 4, 'Music'), mk('c', 9, 'Tools')], 'USD', { USD: 1 });
    expect(r?.category).toBe('Music');
    expect(r?.savings).toBe(10);
  });
  it('lists trials ending inside the window only', async () => {
    const { trialsEndingSoon } = await import('./derive');
    const now = new Date(2026, 10, 10);
    const t = (id: string, end: string): Subscription => ({ id, name: id, plan: '', price: 5, currency: 'USD', cycle: 'Monthly', nextDate: end, trialEndDate: end, category: 'Tools', status: 'Trial' });
    expect(trialsEndingSoon([t('in', '2026-11-15'), t('out', '2026-11-30'), t('past', '2026-11-01')], 7, now).map((s) => s.id)).toEqual(['in']);
  });
});
