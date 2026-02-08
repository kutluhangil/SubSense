
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFunctions, Functions } from "firebase/functions";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  CACHE_SIZE_UNLIMITED, 
  getFirestore,
  Firestore 
} from "firebase/firestore";
// @ts-ignore -- Firebase Analytics types might be missing in this environment
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
// @ts-ignore -- Firebase Performance types might be missing in this environment
import { getPerformance, FirebasePerformance } from "firebase/performance";

// --- Configuration ---
// Safe fallback mechanism for environment variables
const getEnv = (key: string, fallback: string): string => {
  // Cast to any to avoid TS errors
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env) {
      return (meta.env[key] as string) || fallback;
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyArupQpxKTcA1PUoqmUFLf2K31CT4KG_R4"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "subscriptionhub-85b02.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "subscriptionhub-85b02"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "subscriptionhub-85b02.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "86302718224"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:86302718224:web:f9f646d77fa9fb92050d95")
};

// --- Initialization ---

// 1. Initialize App (Singleton pattern)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// 2. Initialize Auth
const auth: Auth = getAuth(app);

// 3. Initialize Functions
const functions: Functions = getFunctions(app);

// 4. Initialize Firestore (Crash-proof for HMR/Vercel)
let db: Firestore;
try {
  // Try modern cache first
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
  });
} catch (e) {
  // Fallback to existing instance if HMR re-initializes
  // or if persistent cache fails
  db = getFirestore(app);
}

// 5. Initialize Analytics & Performance (Browser Only)
let analytics: Analytics | null = null;
let perf: FirebasePerformance | null = null;

if (typeof window !== 'undefined') {
  // Async initialization to not block main thread
  // @ts-ignore
  if (typeof isAnalyticsSupported === 'function') {
    // @ts-ignore
    isAnalyticsSupported().then((supported) => {
      // @ts-ignore
      if (supported) analytics = getAnalytics(app);
    }).catch(e => console.warn("Analytics not supported:", e));
  }
  
  try {
    // Firebase Performance does not export isSupported, it handles environments internally or throws
    perf = getPerformance(app);
  } catch (e) {
    console.debug("Firebase Performance not initialized (unsupported environment)");
  }
}

// Export instances
export { app, auth, db, functions, analytics, perf };
