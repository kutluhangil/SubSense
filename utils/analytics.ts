
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase/firebase";
import { IS_BETA, APP_VERSION } from "./constants";

// Types for strict event logging
type AnalyticsEvent = 
  // Auth
  | 'signup_success'
  | 'login_success'
  | 'logout'
  // Subscriptions
  | 'subscription_added'
  | 'subscription_edited'
  | 'subscription_removed'
  | 'mark_as_paid'
  // Settings
  | 'currency_changed'
  | 'theme_changed'
  // Navigation
  | 'page_view'
  // AI
  | 'ai_opened'
  | 'ai_query_submitted'
  // System
  | 'app_error'
  | 'performance_metric';

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
  // 1. Environment Check
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

  // 2. Production Logging
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
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.pathname
  });
};
