
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Subscription } from '../components/SubscriptionModal';

// --- Types ---

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: any;
  preferences: {
    language: string;
    theme: string;
    baseCurrency: string;
    region: string;
  };
  stats: {
    totalSubscriptions: number;
    monthlySpend: number;
    annualSpend: number;
  };
}

// --- User Management ---

export const initializeUserDocument = async (
  user: { uid: string; email: string | null; displayName: string | null }, 
  additionalData?: { currency?: string; region?: string }
): Promise<UserProfileData> => {
  try {
    if (!user.email) throw new Error("User email is required");

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile with strict schema
      const newProfile: UserProfileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        preferences: {
          baseCurrency: additionalData?.currency || 'USD',
          language: 'en', // Default to English, can be detected
          theme: 'system',
          region: additionalData?.region || 'US'
        },
        stats: {
          totalSubscriptions: 0,
          monthlySpend: 0,
          annualSpend: 0
        }
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    }
    
    // Return existing profile
    return userSnap.data() as UserProfileData;
  } catch (error) {
    console.error("Error initializing user document:", error);
    throw error;
  }
};

export const getUserDocument = async (uid: string): Promise<UserProfileData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user document:", error);
    return null;
  }
};

export const updateUserSettings = async (uid: string, settings: any) => {
  const userRef = doc(db, 'users', uid);
  // Merge into preferences field
  await setDoc(userRef, { preferences: settings }, { merge: true });
};

// --- Subscriptions ---

export const addSubscription = async (uid: string, subscription: Omit<Subscription, 'id'>) => {
  const subsRef = collection(db, 'users', uid, 'subscriptions');
  await addDoc(subsRef, {
    ...subscription,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateSubscription = async (uid: string, subId: number | string, data: Partial<Subscription>) => {
  const subRef = doc(db, 'users', uid, 'subscriptions', String(subId));
  
  // Remove id from data to avoid overwriting document ID field if it exists in the object
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...updateData } = data as any;
  
  await updateDoc(subRef, {
    ...updateData,
    updatedAt: serverTimestamp()
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = sub;
    return addSubscription(uid, rest);
  });

  await Promise.all(batchPromises);
};
