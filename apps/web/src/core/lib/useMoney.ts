import { useApp } from '../store/app';
import { useRates } from '../store/rates';
import { convert, formatMoney } from './format';
import { subCyclePrice } from './pricing';
import type { Subscription } from '../types';

/** Returns helpers to convert + format any amount into the user's base currency. */
export function useMoney() {
  const base = useApp((s) => s.settings.baseCurrency);
  const rates = useRates((s) => s.rates);

  const toBase = (amount: number, from: string) => convert(amount, from, base, rates);
  const fmt = (amount: number, from = base) => formatMoney(toBase(amount, from), base);
  const fmtRaw = (amount: number, code: string) => formatMoney(amount, code);

  // Subscription-aware: resolves the real regional price for the chosen base currency.
  const priceOf = (sub: Subscription) => subCyclePrice(sub, base, rates);
  const fmtOf = (sub: Subscription) => formatMoney(subCyclePrice(sub, base, rates), base);

  return { base, rates, toBase, fmt, fmtRaw, priceOf, fmtOf };
}
