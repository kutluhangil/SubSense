import { describe, expect, it } from 'vitest';
import { dueReminders } from './notifications';
import { isoInDays } from './format';
import type { Subscription } from '../types';

const sub = (id: string, days: number, extra: Partial<Subscription> = {}): Subscription => ({
  id, name: id, plan: '', price: 10, currency: 'USD', cycle: 'Monthly', nextDate: isoInDays(days),
  category: 'Tools', status: 'Active', ...extra,
});

describe('dueReminders', () => {
  it('picks renewals within 3 days, skips far, past, inactive and opted-out ones', () => {
    const subs = [sub('a', 0), sub('b', 3), sub('c', 4), sub('d', -1), sub('e', 1, { status: 'Inactive' }), sub('f', 1, { reminderEnabled: false })];
    expect(dueReminders(subs, {}).map((s) => s.id)).toEqual(['a', 'b']);
  });
  it('announces each billing date once', () => {
    const s = sub('a', 1);
    expect(dueReminders([s], { a: s.nextDate })).toEqual([]);
  });
});
