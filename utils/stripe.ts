
import { functions } from '../firebase/firebase';
import { trackEvent } from './analytics';

/**
 * STRIPE PRODUCTION SERVICE
 * 
 * Interacts with Firebase Cloud Functions to handle Stripe logic securely.
 * No sensitive keys are stored on the client.
 */

// Helper to get current window URL for redirects
const getAppUrl = () => window.location.origin;

export const createCheckoutSession = async (uid: string, interval: 'month' | 'year') => {
  console.log(`[Stripe] Initializing Checkout for ${uid} (${interval})...`);
  
  try {
    const createSession = functions.httpsCallable('createCheckoutSession');
    const { data } = await createSession({
      interval,
      successUrl: `${getAppUrl()}?payment_success=true`,
      cancelUrl: `${getAppUrl()}?payment_canceled=true`
    });

    trackEvent('checkout_started', { interval });
    
    // Redirect to Stripe
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL returned");
    }
  } catch (error) {
    console.error("Checkout creation failed:", error);
    trackEvent('app_error', { source: 'stripe_checkout', message: String(error) });
    throw error;
  }
};

export const startFreeTrial = async (uid: string) => {
  // For MVP: Trial flow simply redirects to Monthly checkout.
  // Real trial logic can be handled by passing a specific priceId configured with a trial in Stripe Dashboard.
  console.log(`[Stripe] Starting Trial flow for ${uid}...`);
  return createCheckoutSession(uid, 'month'); 
};

export const createPortalSession = async () => {
  console.log(`[Stripe] Creating Customer Portal Session...`);
  
  try {
    const createPortal = functions.httpsCallable('createPortalSession');
    const { data } = await createPortal({
      returnUrl: getAppUrl()
    });

    trackEvent('portal_opened');

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Portal creation failed:", error);
    alert("Could not open billing portal. You may not have an active subscription yet.");
  }
};

export const cancelSubscription = async (uid: string) => {
  // With Stripe integration, cancellation must happen via the Portal
  return createPortalSession();
};
