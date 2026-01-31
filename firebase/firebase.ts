
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";

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
export const db = getFirestore(app);
