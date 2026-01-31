
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  onSnapshot, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Subscription } from '../components/SubscriptionModal';

// --- User Management ---

export const initializeUserDocument = async (uid: string, email: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        uid,
        email,
        createdAt: Timestamp.now(),
        settings: {
          baseCurrency: 'USD',
          language: 'en',
          theme: 'system'
        },
        profile: {
          bio: '',
          location: '',
          website: '',
          phone: '',
          joinedDate: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error("Error initializing user document:", error);
    throw error;
  }
};

export const updateUserSettings = async (uid: string, settings: any) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { settings }, { merge: true });
};

export const getUserSettings = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data().settings;
  }
  return null;
};

// --- Subscriptions ---

export const addSubscription = async (uid: string, subscription: Omit<Subscription, 'id'>) => {
  const subsRef = collection(db, 'users', uid, 'subscriptions');
  await addDoc(subsRef, {
    ...subscription,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

export const updateSubscription = async (uid: string, subId: number | string, data: Partial<Subscription>) => {
  const subRef = doc(db, 'users', uid, 'subscriptions', String(subId));
  
  // Remove id from data to avoid overwriting document ID field if it exists in the object
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...updateData } = data as any;
  
  await updateDoc(subRef, {
    ...updateData,
    updatedAt: Timestamp.now()
  });
};

export const deleteSubscription = async (uid: string, subId: number | string) => {
  const subRef = doc(db, 'users', uid, 'subscriptions', String(subId));
  await deleteDoc(subRef);
};

export const subscribeToSubscriptions = (uid: string, callback: (subs: Subscription[]) => void) => {
  const q = query(collection(db, 'users', uid, 'subscriptions'));
  return onSnapshot(q, (snapshot) => {
    const subs: Subscription[] = [];
    snapshot.forEach((doc) => {
      // We map the Firestore document ID to the 'id' field used by the frontend
      subs.push({ id: doc.id, ...doc.data() } as unknown as Subscription);
    });
    callback(subs);
  });
};

// --- Migration Tool ---
export const migrateLocalData = async (uid: string, localSubs: Subscription[]) => {
  if (!localSubs || localSubs.length === 0) return;
  
  const batchPromises = localSubs.map(sub => {
    // Remove the numeric ID used locally, let Firestore generate one
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = sub;
    return addSubscription(uid, rest);
  });

  await Promise.all(batchPromises);
};
