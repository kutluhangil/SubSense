
export const IS_BETA = true;
export const APP_VERSION = '1.0.0-beta';

export const FEATURES = {
  AI_ASSISTANT: true,
  SOCIAL_FRIENDS: false, // Disabled for Beta stability
  COMPARE_SAVINGS: true,
  REALTIME_FX: true, // Fetch live rates from Open ER API with 24h cache
};

export const FEATURE_FLAGS = {
  enableNewAnalyticsUI: false,
  enableExperimentalAI: true,
  enableNewCompareLogic: false,
};

export const FEEDBACK_CATEGORIES = [
  { id: 'bug', label: 'Report a Bug', icon: '🐛' },
  { id: 'idea', label: 'Feature Idea', icon: '💡' },
  { id: 'confusing', label: 'Confusing UI', icon: '🤔' },
  { id: 'praise', label: 'Praise', icon: '❤️' },
  { id: 'other', label: 'Other', icon: '📝' },
];
