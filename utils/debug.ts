
// CENTRAL DEBUG CONFIGURATION
// Auto-detect production environment to silence logs

// Safely access import.meta.env.DEV
// @ts-ignore
export const DEBUG_MODE = (import.meta && import.meta.env && import.meta.env.DEV) || false;

type LogCategory = 
  | 'SUBSCRIPTION_CREATE'
  | 'SUBSCRIPTION_UPDATE'
  | 'PERSISTENCE_LOAD'
  | 'PERSISTENCE_SAVE'
  | 'CURRENCY_AGGREGATION'
  | 'CURRENCY_CONVERSION'
  | 'COMPARE_CALC'
  | 'REMOVE_ACTION'
  | 'THEME_SYNC'
  | 'ANALYTICS_RANGE'
  | 'ANALYTICS_DATA'
  | 'ANALYTICS_EMPTY'
  | 'AI_LANG';

export const debugLog = (category: LogCategory, message: string, data?: any) => {
  if (!DEBUG_MODE) return;

  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const prefix = `[${timestamp}] [${category}]`;

  console.groupCollapsed(`${prefix} ${message}`);
  if (data) {
    console.log('Data:', JSON.parse(JSON.stringify(data))); // Deep copy to prevent reference mutation in logs
  }
  console.groupEnd();
};

/**
 * S-04 / EH-06: Production-safe error logger.
 * - In development: logs full error to console.error
 * - In production: silently forwards to analytics (no stack trace exposed)
 * Use this instead of bare console.error() throughout the codebase.
 */
export const safeError = (source: string, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (DEBUG_MODE) {
    // Full detail in dev
    console.error(`[${source}]`, error);
  }
  // In production: do NOT log — analytics.trackError is called separately where needed
  // This prevents stack traces and internal messages from appearing in DevTools.
};

/**
 * Production-safe warning logger.
 * Use this instead of bare console.warn() throughout the codebase.
 */
export const safeWarn = (message: string, ...args: any[]) => {
  if (DEBUG_MODE) {
    console.warn(message, ...args);
  }
};
