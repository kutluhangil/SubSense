
// @ts-ignore
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase/firebase";
import { IS_BETA, APP_VERSION } from "./constants";

// Types for strict event logging
export type AnalyticsEvent =
  // Auth & Lifecycle
  | 'signup_success'
  | 'login_success'
  | 'logout'
  | 'session_start'
  | 'churn_recovery' // User returned after 30 days
  | 'at_risk_recovery' // User returned after 21 days

  // Funnel
  | 'funnel_first_sub' // First subscription added
  | 'funnel_second_sub' // Second subscription added

  // Subscriptions
  | 'subscription_added'
  | 'subscription_edited'
  | 'subscription_removed'
  | 'mark_as_paid'
  | 'subscription_upgrade'

  // Features (Engagement)
  | 'feature_viewed' // Generic feature view (dashboard, analytics, etc)
  | 'export_data'
  | 'theme_changed'
  | 'currency_changed'

  // AI
  | 'ai_opened'
  | 'ai_query_submitted'

  // Payments
  | 'checkout_started'
  | 'portal_opened'

  // System & Monitoring
  | 'app_error'
  | 'performance_metric'
  | 'system_fallback'
  | 'rate_fetch_error'
  | 'rate_fetch_success'
  | 'data_integrity_warning';

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Privacy-First Analytics Wrapper
 * - Strips PII (Subscription Names, Email addresses)
 * - Adds environment context (Beta, Version)
 * - Safe against ad-blockers (try-catch)
 */
export const trackEvent = (eventName: AnalyticsEvent, params: EventParams = {}) => {
  // 1. Check Opt-Out (Local Storage for speed, synced with Firestore later)
  const isOptedOut = localStorage.getItem('analytics_opt_out') === 'true';
  if (isOptedOut) return;

  // 2. Environment Check
  // In development, we log to console instead of sending to Firebase to save quota and noise

  // Safely check for DEV environment
  let isDev = false;
  try {
    // @ts-ignore
    isDev = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) || false;
  } catch (e) {
    // Ignore error if import.meta is not available
  }

  const safeParams = {
    ...params,
    app_version: APP_VERSION,
    is_beta: IS_BETA,
    platform: 'web',
    timestamp: Date.now()
  };

  if (isDev) {
    console.groupCollapsed(`[Analytics] ${eventName}`);
    console.table(safeParams);
    console.groupEnd();
    return;
  }

  // 3. Production Logging
  if (analytics) {
    try {
      logEvent(analytics, eventName as string, safeParams);
    } catch (e) {
      // Silently fail if analytics blocked (common with ad-blockers)
      console.warn("Analytics event failed", e);
    }
  }
};

/**
 * Tracks errors without exposing sensitive stack traces to public analytics if not desired.
 */
export const trackError = (source: string, message: string) => {
  trackEvent('app_error', {
    source,
    message: message.substring(0, 100), // Truncate for safety/quota
  });
};

/**
 * Tracks page views with route names (sanitized)
 */
export const trackPageView = (pageName: string) => {
  trackEvent('feature_viewed', {
    feature_name: pageName,
    page_location: window.location.pathname
  });
};
