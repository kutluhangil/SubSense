import type { Subscription } from '../types';
import { PRICING, type Plan } from '../data/pricing';
import { CATALOG } from '../data/catalog';
import { catalogOverrides } from '../store/catalog';
import { convert } from './format';

const norm = (s: string) => s.trim().toLowerCase();

/** Ordered plans for a service: live catalog override → curated table → catalog default → none. */
export function plansFor(service: string): Plan[] {
  const overridePlans = catalogOverrides()[service]?.plans;
  if (overridePlans && overridePlans.length) return overridePlans;
  const exact = PRICING[service];
  if (exact) return exact;
  const key = norm(service);
  const byKey = Object.entries(PRICING).find(([k]) => norm(k) === key);
  if (byKey) return byKey[1];
  const c = CATALOG.find((x) => norm(x.name) === key);
  if (c) return [{ name: c.defaultPlan, usd: c.fromPrice }];
  return [];
}

/** Find the plan matching a (possibly fuzzy) plan name. */
export function lookupPlan(service: string, planName?: string): Plan | undefined {
  const plans = plansFor(service);
  if (plans.length === 0) return undefined;
  if (!planName) return plans[0];
  const p = norm(planName);
  return (
    plans.find((x) => norm(x.name) === p) ??
    plans.find((x) => norm(x.name).includes(p) || p.includes(norm(x.name))) ??
    plans[0]
  );
}

/** Local price of a plan in a currency: real regional list price, else FX from USD. */
export function planPriceIn(plan: Plan, currency: string, rates: Record<string, number>): number {
  const regional = plan.regional?.[currency];
  if (typeof regional === 'number') return regional;
  return convert(plan.usd, 'USD', currency, rates);
}

/**
 * One-cycle price of an OWNED subscription in `currency`.
 * The user's stored price always wins (audit H-2) — we only FX-convert it.
 * Catalog/regional pricing is used at *add* time (PlanPicker / Explore), never to
 * silently override what the user saved.
 */
export function subCyclePrice(sub: Subscription, currency: string, rates: Record<string, number>): number {
  const own = sub.isShared && typeof sub.myShare === 'number' ? sub.myShare : sub.price;
  return convert(own, sub.currency, currency, rates);
}

/** Effective price for budgeting: trials count as their trial price (usually 0). */
export function subEffectivePrice(sub: Subscription, currency: string, rates: Record<string, number>): number {
  if (sub.status === 'Trial') return sub.trialPrice ?? 0;
  return subCyclePrice(sub, currency, rates);
}

/** Cheapest plan price of a service in a currency (for "from" labels). */
export function serviceFromPrice(service: string, currency: string, rates: Record<string, number>): number {
  const plans = plansFor(service);
  if (plans.length === 0) return 0;
  return Math.min(...plans.map((p) => planPriceIn(p, currency, rates)));
}

/** Billing cycle of the resolved plan (so catalog adds set the right cycle). */
export function planCycle(service: string, planName?: string): 'Monthly' | 'Yearly' {
  return lookupPlan(service, planName)?.cycle ?? 'Monthly';
}
