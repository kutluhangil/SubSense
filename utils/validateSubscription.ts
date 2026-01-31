
import { Subscription } from '../components/SubscriptionModal';
import { CURRENCIES } from './data';

const DEBUG = true; // Enable warnings in console

/**
 * Validates a subscription object against strict business rules.
 * Used before Firestore writes and during Aggregation.
 */
export const validateSubscription = (sub: Partial<Subscription> | null | undefined): boolean => {
  if (!sub) return false;

  try {
    // 1. Name Validation
    if (!sub.name || typeof sub.name !== 'string' || sub.name.trim().length === 0) {
      throw new Error(`Invalid name: "${sub.name}"`);
    }

    // 2. Price Validation
    // Must be a number, not NaN, and non-negative. 0 is allowed (free tier).
    if (typeof sub.price !== 'number' || isNaN(sub.price) || sub.price < 0) {
      throw new Error(`Invalid price: ${sub.price}`);
    }

    // 3. Currency Validation
    // Must match one of the supported codes in CURRENCIES
    const validCodes = CURRENCIES.map(c => c.code);
    if (!sub.currency || !validCodes.includes(sub.currency)) {
      throw new Error(`Invalid currency: ${sub.currency}`);
    }

    // 4. Billing Cycle Validation
    if (sub.cycle !== 'Monthly' && sub.cycle !== 'Yearly') {
      throw new Error(`Invalid billing cycle: ${sub.cycle}`);
    }

    // 5. Date Validation
    // nextDate must be a parseable date string
    const date = new Date(sub.nextDate || '');
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid nextDate: ${sub.nextDate}`);
    }

    return true;
  } catch (e: any) {
    if (DEBUG) {
      console.warn(`[Validation Failed] ${e.message}`, sub);
    }
    return false;
  }
};

/**
 * Strips a subscription object down to essential fields for AI processing.
 * Removes sensitive or unnecessary UI state.
 */
export const sanitizeForAI = (sub: Subscription) => {
  return {
    id: sub.id,
    name: sub.name,
    price: sub.price,
    currency: sub.currency,
    cycle: sub.cycle,
    category: sub.category || 'Other'
  };
};
