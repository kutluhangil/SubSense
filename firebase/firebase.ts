
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/functions"; // Import Functions
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, CACHE_SIZE_UNLIMITED, getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

// Helper to safely read env vars without crashing if import.meta.env is undefined
const getEnv = (key: string, fallback: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
       // @ts-ignore
       return import.meta.env[key] || fallback;
    }
  } catch (e) {
    console.warn("Environment variable access failed, using fallback.");
  }
  return fallback;
};

// Use environment variables with hardcoded fallbacks for safety
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyArupQpxKTcA1PUoqmUFLf2K31CT4KG_R4"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "subscriptionhub-85b02.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "subscriptionhub-85b02"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "subscriptionhub-85b02.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "86302718224"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:86302718224:web:f9f646d77fa9fb92050d95")
};

// Initialize using compat for auth support in mixed environments
// Check if app is already initialized to prevent errors during hot reload
export const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

export const auth = app.auth();
export const functions = app.functions(); // Export functions instance

// Connect to emulators if in localhost (Optional, useful for dev)
if (window.location.hostname === "localhost") {
  // functions.useEmulator("localhost", 5001);
}

// Initialize Firestore
let dbInstance;

try {
  // Use modern persistentLocalCache configuration
  // This throws if Firestore is already initialized (e.g. HMR)
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
  });
} catch (e) {
  // If already initialized, retrieve the existing modular instance
  // We avoid firebase.firestore(app) here to prevent triggering the compat-layer deprecation warning
  dbInstance = getFirestore(app);
}

export const db = dbInstance;

// Initialize Analytics & Performance (Client-Side Only)
export let analytics: any = null;
export let perf: any = null;

if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    perf = getPerformance(app);
    console.debug("[Firebase] Analytics & Performance initialized");
  } catch (e) {
    console.warn("[Firebase] Failed to initialize Analytics/Performance (likely ad-blocker or offline)", e);
  }
}
