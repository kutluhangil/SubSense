import { currencyMeta } from '../data/currencies';

/** Format a numeric amount in a given currency code, e.g. $22.99, ₺199, ¥1,520. */
export function formatMoney(amount: number, code: string, opts?: { decimals?: number }): string {
  const meta = currencyMeta(code);
  const zeroDecimal = ['JPY', 'KRW'].includes(code);
  const decimals = opts?.decimals ?? (zeroDecimal ? 0 : 2);
  // Lira reads the Turkish way (₺1.234,50); other currencies keep US grouping.
  const n = Math.abs(amount).toLocaleString(code === 'TRY' ? 'tr-TR' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = amount < 0 ? '-' : '';
  // Symbol placement: most are prefix; a few suffix (kr, zł).
  const suffix = ['SEK', 'NOK', 'DKK', 'PLN'].includes(code);
  return suffix ? `${sign}${n} ${meta.symbol}` : `${sign}${meta.symbol}${n}`;
}

/** Convert an amount from one currency to another using USD-base rates. */
export function convert(amount: number, from: string, to: string, rates: Record<string, number>): number {
  const rawFrom = rates[from];
  const rawTo = rates[to];
  // Guard against corrupt rates (0, negative, NaN, Infinity) → divide-by-zero / Infinity.
  const fromRate = Number.isFinite(rawFrom) && rawFrom > 0 ? rawFrom : 1;
  const toRate = Number.isFinite(rawTo) && rawTo > 0 ? rawTo : 1;
  return (amount / fromRate) * toRate;
}

/** Normalize a sub price to a monthly figure (yearly /12). */
export function monthlyAmount(price: number, cycle: string): number {
  return cycle === 'Yearly' ? price / 12 : price;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Oct 12" short date. Accepts ISO (YYYY-MM-DD) or already-formatted display strings. */
export function shortDate(iso: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Nov 15, 2024" long date. */
export function longDate(iso: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function parseDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** Days until a date from today (negative = past). */
export function daysUntil(iso: string): number {
  const d = parseDate(iso);
  if (!d) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

/** Human relative: "Tomorrow", "Today", or short date. */
export function relativeDate(iso: string): string {
  const n = daysUntil(iso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return shortDate(iso);
}

/** Local-safe ISO (YYYY-MM-DD) — avoids the UTC off-by-one of toISOString(). */
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Build an ISO date clamping the day to the target month's length (no rollover). */
export function clampedISO(year: number, month: number, day: number): string {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return toISO(new Date(year, month, Math.min(Math.max(day, 1), lastDay)));
}

/** Advance an ISO date by one billing cycle, clamping month-end (Jan 31 +1mo → Feb 28/29). */
export function addCycle(iso: string, cycle: 'Monthly' | 'Yearly'): string {
  const d = parseDate(iso) ?? new Date();
  const day = d.getDate();
  return cycle === 'Yearly'
    ? clampedISO(d.getFullYear() + 1, d.getMonth(), day)
    : clampedISO(d.getFullYear(), d.getMonth() + 1, day);
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Add days to today, ISO. */
export function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
}
