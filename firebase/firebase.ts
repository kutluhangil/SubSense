
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Robustly get env vars (support both Vite import.meta.env and standard process.env)
const getEnv = () => {
  const meta = import.meta as any;
  // Check if import.meta.env exists
  if (meta && meta.env) {
    return meta.env;
  }
  // Fallback to process.env if available
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  // Fallback to empty object to prevent crashes on property access
  return {};
};

const env = getEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
