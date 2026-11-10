import type { Subscription } from '../types';
import { convert, monthlyAmount } from './format';
import { subEffectivePrice } from './pricing';

export interface Totals {
  monthly: number;
  annual: number;
  activeCount: number;
  weekly: number;
}

/** All amounts converted into `base` currency. */
export function computeTotals(subs: Subscription[], base: string, rates: Record<string, number>): Totals {
  let monthly = 0;
  let activeCount = 0;
  for (const s of subs) {
    if (s.status === 'Inactive') continue;
    activeCount++;
    const inBase = subEffectivePrice(s, base, rates);
    monthly += monthlyAmount(inBase, s.cycle);
  }
  return {
    monthly,
    annual: monthly * 12,
    weekly: monthly / 4.345,
    activeCount,
  };
}

export interface CategoryTotal {
  category: string;
  amount: number;
  pct: number;
}

export function categoryTotals(subs: Subscription[], base: string, rates: Record<string, number>): CategoryTotal[] {
  const map = new Map<string, number>();
  for (const s of subs) {
    if (s.status === 'Inactive') continue;
    const inBase = monthlyAmount(subEffectivePrice(s, base, rates), s.cycle);
    map.set(s.category, (map.get(s.category) ?? 0) + inBase);
  }
  const entries = [...map.entries()].map(([category, amount]) => ({ category, amount }));
  const total = entries.reduce((a, b) => a + b.amount, 0) || 1;
  return entries
    .sort((a, b) => b.amount - a.amount)
    .map((e) => ({ ...e, pct: (e.amount / total) * 100 }));
}

/** Monthly spend in base for a single sub (Trial counts as its real price for budgeting context). */
export function subMonthly(s: Subscription, base: string, rates: Record<string, number>): number {
  return monthlyAmount(convert(s.price, s.currency, base, rates), s.cycle);
}

/** Category over-budget detection. */
export function budgetAlerts(
  subs: Subscription[],
  budgetLimits: Record<string, number>,
  base: string,
  rates: Record<string, number>,
): { category: string; over: number }[] {
  const cats = categoryTotals(subs, base, rates);
  const out: { category: string; over: number }[] = [];
  for (const c of cats) {
    const limit = budgetLimits[c.category];
    if (limit && c.amount > limit) out.push({ category: c.category, over: c.amount - limit });
  }
  return out;
}

export interface OverlapInsight {
  count: number;
  names: string[];
  /** Monthly saving (in `base`) if consolidated to all-but-the-cheapest. */
  savings: number;
  category?: string;
}

/**
 * Real, data-driven insight: detects ≥2 active Music subscriptions and computes the
 * monthly saving from dropping all but the cheapest. Returns null when there's nothing
 * genuine to surface (so the UI can hide the card instead of showing a fake tip).
 */
export function musicOverlap(subs: Subscription[], base: string, rates: Record<string, number>): OverlapInsight | null {
  const music = subs.filter((s) => s.category === 'Music' && s.status !== 'Inactive');
  if (music.length < 2) return null;
  const priced = music.map((s) => monthlyAmount(subEffectivePrice(s, base, rates), s.cycle));
  const cheapest = Math.min(...priced);
  const total = priced.reduce((a, b) => a + b, 0);
  return { count: music.length, names: music.map((s) => s.name), savings: total - cheapest };
}

export interface MonthSpend {
  month: number; // 0-11
  year: number;
  amount: number; // in base currency
}

/**
 * Projected spend (in `base`) for each of the next `months` calendar months.
 * Monthly subs contribute every month; yearly subs land their full charge only in
 * their renewal month. Derived purely from current data — no fake history.
 */
export function monthlyProjection(
  subs: Subscription[],
  base: string,
  rates: Record<string, number>,
  months = 12,
): MonthSpend[] {
  const now = new Date();
  const startY = now.getFullYear();
  const startM = now.getMonth();
  const key = (y: number, m: number) => y * 12 + m;
  const startKey = key(startY, startM);

  const out: MonthSpend[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(startY, startM + i, 1);
    out.push({ month: d.getMonth(), year: d.getFullYear(), amount: 0 });
  }

  for (const s of subs) {
    if (s.status === 'Inactive') continue;
    const price = subEffectivePrice(s, base, rates); // per-cycle, in base
    if (s.cycle === 'Yearly') {
      const nd = new Date(s.nextDate.includes('T') ? s.nextDate : s.nextDate + 'T00:00:00');
      let y = nd.getFullYear();
      const m = nd.getMonth();
      while (key(y, m) < startKey) y += 1; // catch up a stale date
      while (key(y, m) < startKey + months) {
        out[key(y, m) - startKey].amount += price;
        y += 1; // annual cadence
      }
    } else {
      for (let i = 0; i < months; i++) out[i].amount += price;
    }
  }
  return out;
}

export function upcoming(subs: Subscription[], days = 7): Subscription[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return subs
    .filter((s) => s.status !== 'Inactive')
    .map((s) => ({ s, d: new Date(s.nextDate.includes('T') ? s.nextDate : s.nextDate + 'T00:00:00') }))
    .filter(({ d }) => {
      const diff = (d.getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= days;
    })
    .sort((a, b) => a.d.getTime() - b.d.getTime())
    .map(({ s }) => s);
}

/** Trials ending within `days` (local dates), soonest first. */
export function trialsEndingSoon(subs: Subscription[], days = 7, now = new Date()): Subscription[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const horizon = new Date(start);
  horizon.setDate(horizon.getDate() + days);
  return subs
    .filter((s) => s.status === 'Trial' && s.trialEndDate)
    .filter((s) => {
      const d = new Date(`${s.trialEndDate}T00:00:00`);
      return d >= start && d <= horizon;
    })
    .sort((a, b) => (a.trialEndDate as string).localeCompare(b.trialEndDate as string));
}

/** The category with ≥2 active services where keeping only the cheapest saves the most. */
export function categoryOverlap(subs: Subscription[], base: string, rates: Record<string, number>): OverlapInsight | null {
  const byCat = new Map<string, Subscription[]>();
  for (const s of subs) {
    if (s.status === 'Inactive') continue;
    byCat.set(s.category, [...(byCat.get(s.category) ?? []), s]);
  }
  let best: OverlapInsight | null = null;
  for (const [category, list] of byCat) {
    if (list.length < 2) continue;
    const priced = list.map((s) => monthlyAmount(subEffectivePrice(s, base, rates), s.cycle));
    const savings = priced.reduce((a, b) => a + b, 0) - Math.min(...priced);
    if (!best || savings > best.savings) best = { count: list.length, names: list.map((s) => s.name), savings, category };
  }
  return best;
}
