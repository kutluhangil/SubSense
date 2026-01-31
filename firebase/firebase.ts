
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Safe access to environment variables
const getEnvVar = (key: string) => {
  try {
    // Check import.meta.env (Vite)
    // Cast to any to avoid TS errors if Vite types aren't fully loaded in all contexts
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

// Check if we have a valid configuration
const apiKey = getEnvVar('VITE_FIREBASE_API_KEY');
const authDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN');

const isConfigValid = apiKey && authDomain;

if (!isConfigValid) {
  console.warn("Firebase configuration is missing or incomplete. Check your .env file. Using mock config to prevent crash.");
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
