
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { initializeFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArupQpxKTcA1PUoqmUFLf2K31CT4KG_R4",
  authDomain: "subscriptionhub-85b02.firebaseapp.com",
  projectId: "subscriptionhub-85b02",
  storageBucket: "subscriptionhub-85b02.firebasestorage.app",
  messagingSenderId: "86302718224",
  appId: "1:86302718224:web:f9f646d77fa9fb92050d95"
};

// Initialize using compat for auth support in mixed environments
// Check if app is already initialized to prevent errors during hot reload
const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

export const auth = app.auth();

// Initialize Firestore
// We use a try-catch block or check for existing instances to handle hot-reloading safely
let dbInstance;

try {
  // Try to initialize with specific settings (works on first load)
  dbInstance = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  });
} catch (e) {
  // If it fails (e.g. "Firestore has already been started"), get the existing instance
  // This typically happens during development hot-reloads
  console.warn("Firestore already initialized, using existing instance.");
  dbInstance = firebase.firestore(app); 
}

export const db = dbInstance;

// Enable offline persistence
// Wrapped in a check to ensure we are in a browser environment
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.warn("Firestore persistence enabled in another tab.");
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn("Firestore persistence not supported by this browser.");
    }
  });
}
