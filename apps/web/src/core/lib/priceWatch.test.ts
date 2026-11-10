import { describe, it, expect } from 'vitest';
import { detectPriceChanges, referenceUsd } from './priceWatch';
import type { Subscription } from '../types';

function sub(p: Partial<Subscription>): Subscription {
  return {
    id: 'n1', name: 'Netflix', plan: 'Premium 4K', price: 20, currency: 'USD',
    cycle: 'Monthly', nextDate: '2030-01-01', category: 'Entertainment', status: 'Active',
    ...p,
  };
}

describe('detectPriceChanges', () => {
  const s = sub({});
  const ref = referenceUsd(s);

  it('resolves a catalog reference (USD) for a known service', () => {
    expect(ref).not.toBeNull();
    expect(typeof ref).toBe('number');
  });

  it('seeds silently on first sight — no prior snapshot, no alert', () => {
    const r = detectPriceChanges([s], {});
    expect(r.changes).toHaveLength(0);
    expect(r.snapshot[s.id]).toBeCloseTo(ref!);
  });

  it('reports an increase when the reference rose above the snapshot', () => {
    const r = detectPriceChanges([s], { [s.id]: ref! - 5 });
    expect(r.changes).toHaveLength(1);
    expect(r.changes[0].fromUsd).toBeCloseTo(ref! - 5);
    expect(r.changes[0].toUsd).toBeCloseTo(ref!);
  });

  it('ignores an unchanged or lower reference (increases only)', () => {
    expect(detectPriceChanges([s], { [s.id]: ref! }).changes).toHaveLength(0);
    expect(detectPriceChanges([s], { [s.id]: ref! + 5 }).changes).toHaveLength(0);
  });

  it('skips inactive subs and custom services with no catalog plan', () => {
    expect(Object.keys(detectPriceChanges([sub({ status: 'Inactive' })], {}).snapshot)).toHaveLength(0);
    const unknown = detectPriceChanges([sub({ id: 'g1', name: 'My Local Gym' })], {});
    expect(unknown.snapshot['g1']).toBeUndefined();
  });
});
