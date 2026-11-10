import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Public web config of the shared Firebase project (same project as the Android app).
// Not a secret: access is enforced by Firestore security rules.
const config = {
  apiKey: 'AIzaSyCp5rlQN13rToIFxsWWy2J1hvjWFB8ykxA',
  authDomain: 'subsense-andorid-app.firebaseapp.com',
  projectId: 'subsense-andorid-app',
  storageBucket: 'subsense-andorid-app.firebasestorage.app',
  messagingSenderId: '648156139284',
  appId: '1:648156139284:web:4cbd9ef214d7abfa0e3c01',
};

export const app = getApps()[0] ?? initializeApp(config);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
