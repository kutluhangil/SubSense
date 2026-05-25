
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';
import { trackEvent } from './analytics';

const getAppUrl = () => window.location.origin;

export const createCheckoutSession = async (uid: string, interval: 'month' | 'year') => {
  try {
    const createSession = httpsCallable(functions, 'createCheckoutSession');
    const { data } = await createSession({
      interval,
      successUrl: `${getAppUrl()}?payment_success=true`,
      cancelUrl: `${getAppUrl()}?payment_canceled=true`
    }) as { data: { url: string } };

    trackEvent('checkout_started', { interval });

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
  return createCheckoutSession(uid, 'month');
};

export const createPortalSession = async () => {
  try {
    const createPortal = httpsCallable(functions, 'createPortalSession');
    const { data } = await createPortal({
      returnUrl: getAppUrl()
    }) as { data: { url: string } };

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
  return createPortalSession();
};
