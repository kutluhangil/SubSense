import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Safe access to environment variables
const getEnvVar = (key: string) => {
  try {
    // Check import.meta.env (Vite)
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
    // Check process.env (Standard/Webpack/Node)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors in restricted environments
  }
  return undefined;
};

const apiKey = getEnvVar('VITE_FIREBASE_API_KEY');
const authDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN');

// Enhanced validation to catch placeholders like "....." or "xxxxx"
const isPlaceholder = (val: string | undefined) => {
    if (!val) return true;
    return val.includes('.....') || val.includes('xxxxx') || val.startsWith('my-app');
}

// Check if we have a valid configuration
const isConfigValid = apiKey && authDomain && !isPlaceholder(apiKey) && !isPlaceholder(authDomain);

if (!isConfigValid) {
  console.warn("Firebase configuration is missing or invalid (detected placeholders). Using dummy config to prevent crash. Please update your .env file with real credentials.");
}

// Use real config or a placeholder to prevent immediate crash
const firebaseConfig = isConfigValid ? {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID')
} : {
  // Placeholder config so app loads (auth will fail on use if keys are missing)
  apiKey: "AIzaSyDummyKeyForDevelopmentEnvironmentOnly",
  authDomain: "dummy.firebaseapp.com",
  projectId: "dummy-project",
  storageBucket: "dummy.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase (check if already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
