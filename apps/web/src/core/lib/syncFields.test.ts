import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { diffFields, fromDoc, strip } from './syncFields';
import type { Subscription } from '../types';

const base: Subscription = {
  id: 'sub-1', name: 'Netflix', plan: 'Standard', price: 389.99, currency: 'TRY', cycle: 'Monthly',
  nextDate: '2026-12-01', category: 'Entertainment', status: 'Active', updatedAt: 5,
};

describe('diffFields', () => {
  it('writes every field for a new row, never the id', () => {
    const out = diffFields(undefined, strip(base));
    expect(out.id).toBeUndefined();
    expect(out.price).toBe(389.99);
    expect(out.updatedAt).toBeUndefined();
  });

  it('writes only changed fields', () => {
    const out = diffFields(strip(base), strip({ ...base, price: 429.99 }));
    expect(Object.keys(out)).toEqual(['price']);
  });

  it('removes a cleared field instead of leaving the stale value', () => {
    const before = strip({ ...base, trialEndDate: '2026-11-20' });
    const out = diffFields(before, strip(base));
    expect(Object.keys(out)).toEqual(['trialEndDate']);
    expect(out.trialEndDate).not.toBe(undefined);
  });

  it('returns nothing when the row is unchanged', () => {
    expect(diffFields(strip(base), strip({ ...base, updatedAt: 99 }))).toEqual({});
  });
});

describe('fromDoc', () => {
  it('turns Firestore timestamps into epoch ms and keeps tombstones', () => {
    const s = fromDoc('x', { name: 'A', updatedAt: Timestamp.fromMillis(1000), deletedAt: Timestamp.fromMillis(2000) });
    expect(s.id).toBe('x');
    expect(s.updatedAt).toBe(1000);
    expect(s.deletedAt).toBe(2000);
  });

  it('reads Android rows (no deletedAt) as live', () => {
    expect(fromDoc('y', { name: 'B' }).deletedAt).toBeNull();
  });
});
