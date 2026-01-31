
// CENTRAL DEBUG CONFIGURATION
export const DEBUG_MODE = true;

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