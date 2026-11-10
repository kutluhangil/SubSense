import type { Subscription } from '../types';
/** Count of active subs renewing within `days` (drives the bell badge). */
export function notificationBadgeCount(subs: Subscription[], days = 7, now = new Date()): number {
  const todayISO = now.toISOString().slice(0, 10);
  const start = new Date(todayISO + 'T00:00:00');
  const horizon = new Date(start);
  horizon.setDate(horizon.getDate() + days);
  return subs.filter((s) => {
    if (s.status === 'Inactive') return false;
    const d = new Date(s.nextDate + 'T00:00:00');
    return d >= start && d <= horizon;
  }).length;
}
