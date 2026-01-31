
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { initializeFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArupQpxKTcA1PUoqmUFLf2K31CT4KG_R4",
  authDomain: "subscriptionhub-85b02.firebaseapp.com",
  projectId: "subscriptionhub-85b02",
  storageBucket: "subscriptionhub-85b02.appspot.com",
  messagingSenderId: "86302718224",
  appId: "1:86302718224:web:f9f646d77fa9fb92050d95"
};

// Initialize using compat for auth support in mixed environments
const app = firebase.initializeApp(firebaseConfig);

export const auth = app.auth();

// Initialize Firestore with persistence settings
// Using initializeFirestore ensures we can configure cache settings before usage
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a a time.
      console.warn("Firestore persistence enabled in another tab.");
  } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn("Firestore persistence not supported by this browser.");
  }
});
