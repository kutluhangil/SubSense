import { describe, it, expect } from 'vitest';
import { notificationBadgeCount } from './badge';
import type { Subscription } from '../types';
const sub = (over: Partial<Subscription>): Subscription => ({
  id: 'x', name: 'N', plan: 'P', price: 1, currency: 'USD', cycle: 'Monthly',
  nextDate: '2026-06-20', category: 'Entertainment', status: 'Active', ...over,
});
describe('notificationBadgeCount', () => {
  const today = new Date('2026-06-17T00:00:00Z');
  it('counts renewals within the window', () => {
    expect(notificationBadgeCount([sub({ nextDate: '2026-06-20' })], 7, today)).toBe(1);
  });
  it('ignores renewals outside the window', () => {
    expect(notificationBadgeCount([sub({ nextDate: '2026-07-30' })], 7, today)).toBe(0);
  });
  it('ignores inactive subs', () => {
    expect(notificationBadgeCount([sub({ nextDate: '2026-06-18', status: 'Inactive' })], 7, today)).toBe(0);
  });
});
