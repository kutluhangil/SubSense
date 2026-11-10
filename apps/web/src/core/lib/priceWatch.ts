// Detects when a subscribed service's catalog reference price goes up. The
// reference is the plan's USD price, which is FX-independent — so currency-rate
// moves never masquerade as a price change. A change fires when the bundled
// price table (or a remote catalog) ships a higher price than last seen.
import type { Subscription, PriceChange } from '../types';
import { lookupPlan } from './pricing';

/** Current catalog reference price (USD) for a subscription's service + plan. */
export function referenceUsd(sub: Subscription): number | null {
  const plan = lookupPlan(sub.name, sub.plan);
  return plan ? plan.usd : null;
}

export interface PriceCheck {
  changes: PriceChange[];
  snapshot: Record<string, number>;
}

/**
 * Compare each active sub's reference price to the previous snapshot. Reports
 * increases only; seeds the snapshot silently the first time a sub is seen (so a
 * fresh install never fires a spurious alert).
 */
export function detectPriceChanges(subs: Subscription[], prev: Record<string, number>): PriceCheck {
  const snapshot: Record<string, number> = {};
  const changes: PriceChange[] = [];
  for (const s of subs) {
    if (s.status === 'Inactive') continue;
    const ref = referenceUsd(s);
    if (ref == null) continue;
    snapshot[s.id] = ref;
    const before = prev[s.id];
    if (typeof before === 'number' && ref > before + 0.01) {
      changes.push({ id: s.id, name: s.name, fromUsd: before, toUsd: ref });
    }
  }
  return { changes, snapshot };
}
