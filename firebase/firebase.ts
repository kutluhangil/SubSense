
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
// Use direct static import.meta.env accesses with fallbacks so Vite can statically replace them
// at build time while ensuring local dev doesn't crash if .env is missing.
const firebaseConfig = {
  apiKey:            (import.meta.env.VITE_FIREBASE_API_KEY as string) || "AIzaSyArupQpxKTcA1PUoqmUFLf2K31CT4KG_R4",
  authDomain:        (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || "subscriptionhub-85b02.firebaseapp.com",
  projectId:         (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || "subscriptionhub-85b02",
  storageBucket:     (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || "subscriptionhub-85b02.firebasestorage.app",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "86302718224",
  appId:             (import.meta.env.VITE_FIREBASE_APP_ID as string) || "1:86302718224:web:f9f646d77fa9fb92050d95",
};

// Guard: if critical Firebase config is missing, surface a clear error instead of
// crashing the module silently and producing a blank white screen.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const msg =
    "Aboneyim: Firebase environment variables are missing.\n" +
    "Make sure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are set in your " +
    "environment variables and redeploy.";
  console.error(msg);
  // Show a visible error overlay so users/developers see the issue immediately.
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      const root = document.getElementById("root");
      if (root && !root.children.length) {
        root.innerHTML = `<div style="font-family:monospace;padding:32px;background:#1a1a1a;color:#ff6b6b;min-height:100vh">
          <h2 style="color:#ff4444">⚙️ Configuration Error</h2>
          <p style="color:#ffa">Firebase environment variables are not set.</p>
          <p style="font-size:13px;color:#ccc">Add these environment variables and rebuild:</p>
          <ul style="font-size:12px;color:#7df">
            <li>VITE_FIREBASE_API_KEY</li><li>VITE_FIREBASE_AUTH_DOMAIN</li>
            <li>VITE_FIREBASE_PROJECT_ID</li><li>VITE_FIREBASE_STORAGE_BUCKET</li>
            <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li><li>VITE_FIREBASE_APP_ID</li>
          </ul>
        </div>`;
      }
    });
  }
}

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

// 3. Initialize Functions + Self-Hosted API Callable Helper
const functions: Functions = getFunctions(app);

/**
 * Self-hosted callable dispatcher that talks directly to `/api/fn/:name` on
 * the `aboneyim_api` backend container (no Firebase Blaze / Cloud Functions required).
 */
export function httpsCallable<Req = any, Res = any>(
  _functionsInstance: unknown,
  name: string
): (data?: Req) => Promise<{ data: Res }> {
  return async (data?: Req) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`/api/fn/${encodeURIComponent(name)}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ data: data ?? {} }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.error) {
      const err: any = new Error(
        json?.error?.message || `Backend call '${name}' failed (${res.status})`
      );
      err.code = json?.error?.status || `functions/${res.status}`;
      throw err;
    }

    return { data: json.result as Res };
  };
}

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
  // or if persistent cache fails (e.g. missing projectId, IndexedDB unavailable)
  try {
    db = getFirestore(app);
  } catch (e2) {
    // Last resort: if both fail (e.g. completely invalid config), assign a dummy
    // so the module exports don't blow up. Auth will surface a proper error.
    console.error("Firestore initialization failed completely:", e2);
    db = {} as Firestore;
  }
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
