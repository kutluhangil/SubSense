import { describe, it, expect } from 'vitest';
import { convert, monthlyAmount, formatMoney, clampedISO, addCycle, isoInDays, todayISO } from './format';

const rates = { USD: 1, TRY: 40, EUR: 0.9, JPY: 150, SEK: 10 };

describe('convert', () => {
  it('returns same amount for same currency', () => {
    expect(convert(10, 'USD', 'USD', rates)).toBe(10);
  });
  it('converts USD to TRY', () => {
    expect(convert(10, 'USD', 'TRY', rates)).toBe(400);
  });
  it('converts cross-currency via USD base', () => {
    expect(convert(40, 'TRY', 'USD', rates)).toBe(1);
  });
  it('falls back to 1 for unknown currency', () => {
    expect(convert(5, 'XXX', 'USD', rates)).toBe(5);
  });

  // H-2: corrupt remote data must not produce Infinity / NaN.
  it('treats a zero fromRate as 1 (no divide-by-zero → Infinity)', () => {
    expect(convert(10, 'TRY', 'USD', { ...rates, TRY: 0 })).toBe(10);
  });
  it('treats a zero toRate as 1', () => {
    expect(convert(10, 'USD', 'TRY', { ...rates, TRY: 0 })).toBe(10);
  });
  it('ignores negative rates', () => {
    expect(convert(10, 'TRY', 'USD', { ...rates, TRY: -40 })).toBe(10);
  });
  it('ignores NaN / Infinity rates', () => {
    expect(convert(10, 'TRY', 'USD', { ...rates, TRY: NaN })).toBe(10);
    expect(convert(10, 'TRY', 'USD', { ...rates, TRY: Infinity })).toBe(10);
  });
});

describe('isoInDays (H-1: local-safe, no UTC off-by-one)', () => {
  it('returns todayISO() for 0 days, matching the local calendar date', () => {
    expect(isoInDays(0)).toBe(todayISO());
  });
  it('produces a valid YYYY-MM-DD string', () => {
    expect(isoInDays(7)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('+1 day is strictly after today (lexical = chronological for ISO)', () => {
    expect(isoInDays(1) > todayISO()).toBe(true);
  });
  it('-1 day is strictly before today', () => {
    expect(isoInDays(-1) < todayISO()).toBe(true);
  });
});

describe('monthlyAmount', () => {
  it('passes monthly through', () => {
    expect(monthlyAmount(9.99, 'Monthly')).toBeCloseTo(9.99);
  });
  it('divides yearly by 12', () => {
    expect(monthlyAmount(120, 'Yearly')).toBe(10);
  });
});

describe('clampedISO (H-3: month-end)', () => {
  it('clamps day 31 to the last day of a 30-day month', () => {
    expect(clampedISO(2026, 3, 31)).toBe('2026-04-30'); // April
  });
  it('clamps day 31 to February (non-leap)', () => {
    expect(clampedISO(2026, 1, 31)).toBe('2026-02-28');
  });
  it('clamps to Feb 29 in a leap year', () => {
    expect(clampedISO(2028, 1, 31)).toBe('2028-02-29');
  });
  it('keeps a valid day unchanged', () => {
    expect(clampedISO(2026, 0, 15)).toBe('2026-01-15');
  });
});

describe('addCycle (H-3: no rollover)', () => {
  it('Jan 31 + 1 month → Feb 28, not Mar 3', () => {
    expect(addCycle('2026-01-31', 'Monthly')).toBe('2026-02-28');
  });
  it('advances a normal monthly date', () => {
    expect(addCycle('2026-01-15', 'Monthly')).toBe('2026-02-15');
  });
  it('wraps year on December', () => {
    expect(addCycle('2026-12-10', 'Monthly')).toBe('2027-01-10');
  });
  it('yearly Feb 29 → Feb 28 next year', () => {
    expect(addCycle('2028-02-29', 'Yearly')).toBe('2029-02-28');
  });
});

describe('formatMoney', () => {
  it('prefixes USD symbol with 2 decimals', () => {
    expect(formatMoney(17.99, 'USD')).toBe('$17.99');
  });
  it('formats TRY', () => {
    expect(formatMoney(189.9, 'TRY')).toBe('₺189,90');
  });
  it('uses zero decimals for JPY', () => {
    expect(formatMoney(1520, 'JPY')).toBe('¥1,520');
  });
  it('suffixes SEK symbol', () => {
    expect(formatMoney(120, 'SEK')).toBe('120.00 kr');
  });
  it('renders negative sign', () => {
    expect(formatMoney(-5, 'USD')).toBe('-$5.00');
  });
});
