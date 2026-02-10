
import { Subscription } from '../components/SubscriptionModal';
import { convertAmount } from './currency';
import { validateSubscription } from './validateSubscription';

export interface DerivedStats {
  totalSubscriptions: number;
  monthlySpend: number;
  annualSpend: number;
  lifetimeSpend: number;
  categoryBreakdown: Record<string, number>;
  mostExpensiveSub: Subscription | null;
  currency: string;
}

export const calculateDerivedStats = (
  subscriptions: Subscription[],
  baseCurrency: string
): DerivedStats => {
  const stats: DerivedStats = {
    totalSubscriptions: 0,
    monthlySpend: 0,
    annualSpend: 0,
    lifetimeSpend: 0,
    categoryBreakdown: {},
    mostExpensiveSub: null,
    currency: baseCurrency
  };

  if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
    return stats;
  }

  let maxMonthlyCost = 0;

  // 1. Guardrail: Filter Invalid Subscriptions BEFORE Math
  const validSubscriptions = subscriptions.filter(validateSubscription);

  validSubscriptions.forEach(sub => {
    // Only skip explicitly inactive subscriptions — treat missing status as active
    const status = sub.status || 'Active';
    if (status !== 'Active') return;

    stats.totalSubscriptions++;

    // Normalize price to base currency
    const priceInBase = convertAmount(sub.price, sub.currency, baseCurrency);

    // Monthly Spend Calculation
    let monthlyCost = 0;
    if (sub.cycle === 'Monthly') {
      monthlyCost = priceInBase;
      stats.monthlySpend += priceInBase;
      stats.annualSpend += priceInBase * 12;
    } else {
      monthlyCost = priceInBase / 12;
      stats.monthlySpend += monthlyCost;
      stats.annualSpend += priceInBase;
    }

    // Track most expensive
    if (monthlyCost > maxMonthlyCost) {
      maxMonthlyCost = monthlyCost;
      stats.mostExpensiveSub = sub;
    }

    // Category Breakdown (Monthly Normalized)
    const cat = sub.category || 'Other';
    stats.categoryBreakdown[cat] = (stats.categoryBreakdown[cat] || 0) + monthlyCost;

    // Lifetime Spend (Include History)
    if (sub.history && sub.history.length > 0) {
      // history is stored in original currency
      const historyTotal = sub.history.reduce((a, b) => a + b, 0);
      stats.lifetimeSpend += convertAmount(historyTotal, sub.currency, baseCurrency);
    } else {
      // Fallback: assume at least one payment made if active
      stats.lifetimeSpend += priceInBase;
    }
  });

  return stats;
};
