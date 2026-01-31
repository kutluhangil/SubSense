
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
  getDocs,
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

// --- Local Fallback Logic ---

const FALLBACK_KEY_PREFIX = 'subscriptionhub_fallback_';
const fallbackEvents = new EventTarget();

const getLocalData = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const setLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    fallbackEvents.dispatchEvent(new CustomEvent('local-update', { detail: { key, data } }));
  } catch (e) {
    console.warn("Local storage save failed", e);
  }
};

// --- User Management ---

export const initializeUserDocument = async (
  user: { uid: string; email: string | null; displayName: string | null }, 
  additionalData?: { currency?: string; region?: string }
): Promise<UserProfileData> => {
  const localKey = `${FALLBACK_KEY_PREFIX}profile_${user.uid}`;
  
  // Default Profile Structure
  const newProfile: UserProfileData = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName,
    createdAt: new Date().toISOString(), // Fallback timestamp
    preferences: {
      baseCurrency: additionalData?.currency || 'USD',
      language: 'en',
      theme: 'system',
      region: additionalData?.region || 'US'
    },
    stats: {
      totalSubscriptions: 0,
      monthlySpend: 0,
      annualSpend: 0
    }
  };

  try {
    if (!user.email) throw new Error("User email is required");

    const userRef = doc(db, 'users', user.uid);
    let userSnap;
    
    try {
      userSnap = await getDoc(userRef);
    } catch (e: any) {
      if (e.code === 'permission-denied' || e.code === 'unavailable') {
        console.warn("Firestore read denied. Using local fallback for profile.");
        const localProfile = getLocalData<UserProfileData>(localKey);
        return localProfile || newProfile;
      }
      throw e;
    }

    if (userSnap && userSnap.exists()) {
      return userSnap.data() as UserProfileData;
    }

    // Attempt to create in Firestore
    try {
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp()
      });
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        console.warn("Firestore write denied. Saving profile locally.");
        setLocalData(localKey, newProfile);
        return newProfile;
      }
      throw e;
    }
    
    return newProfile;
  } catch (error) {
    console.error("Error initializing user document:", error);
    // Ultimate fallback to ensure app doesn't crash
    setLocalData(localKey, newProfile);
    return newProfile;
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
  } catch (error: any) {
    console.error("Error fetching user document:", error);
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
       return getLocalData<UserProfileData>(`${FALLBACK_KEY_PREFIX}profile_${uid}`);
    }
    return null;
  }
};

export const updateUserSettings = async (uid: string, settings: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { preferences: settings }, { merge: true });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
        const localKey = `${FALLBACK_KEY_PREFIX}profile_${uid}`;
        const current = getLocalData<UserProfileData>(localKey);
        if (current) {
            current.preferences = { ...current.preferences, ...settings };
            setLocalData(localKey, current);
        }
    } else {
        console.error("Error updating user settings:", error);
    }
  }
};

// --- Subscriptions ---

// New: Fetch once for hydration
export const getUserSubscriptions = async (uid: string): Promise<Subscription[]> => {
  try {
    const subsRef = collection(db, 'users', uid, 'subscriptions');
    const snapshot = await getDocs(subsRef);
    const subs: Subscription[] = [];
    snapshot.forEach((doc) => {
      subs.push({ id: doc.id, ...doc.data() } as unknown as Subscription);
    });
    return subs;
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
      return getLocalData<Subscription[]>(localKey) || [];
    }
    return [];
  }
};

export const addSubscription = async (uid: string, subscription: Omit<Subscription, 'id'>) => {
  try {
    const subsRef = collection(db, 'users', uid, 'subscriptions');
    await addDoc(subsRef, {
      ...subscription,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      console.warn("Firestore write denied. Adding subscription locally.");
      const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
      const currentSubs = getLocalData<Subscription[]>(localKey) || [];
      // Generate a numeric ID for local item to match interface
      const newSub = { ...subscription, id: Date.now() } as Subscription;
      setLocalData(localKey, [...currentSubs, newSub]);
    } else {
      console.error("Error adding subscription:", error);
      throw error;
    }
  }
};

export const updateSubscription = async (uid: string, subId: number | string, data: Partial<Subscription>) => {
  try {
    // If ID is numeric (local), don't even try Firestore, just update local
    if (typeof subId === 'number') {
        throw { code: 'permission-denied' }; // Trigger catch block to handle local update
    }

    const subRef = doc(db, 'users', uid, 'subscriptions', String(subId));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateData } = data as any;
    
    await updateDoc(subRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
        const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
        const currentSubs = getLocalData<Subscription[]>(localKey) || [];
        const updatedSubs = currentSubs.map(s => s.id == subId ? { ...s, ...data } : s);
        setLocalData(localKey, updatedSubs);
    } else {
        console.error("Error updating subscription:", error);
        throw error;
    }
  }
};

export const deleteSubscription = async (uid: string, subId: number | string) => {
  try {
    if (typeof subId === 'number') {
        throw { code: 'permission-denied' };
    }
    const subRef = doc(db, 'users', uid, 'subscriptions', String(subId));
    await deleteDoc(subRef);
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
        const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
        const currentSubs = getLocalData<Subscription[]>(localKey) || [];
        const filteredSubs = currentSubs.filter(s => s.id != subId);
        setLocalData(localKey, filteredSubs);
    } else {
        console.error("Error deleting subscription:", error);
        throw error;
    }
  }
};

export const subscribeToSubscriptions = (uid: string, callback: (subs: Subscription[]) => void) => {
  let unsubscribeFirestore = () => {};
  
  // Local fallback listener function
  const handleLocalUpdate = (e: any) => {
    if (e.detail && e.detail.key === `${FALLBACK_KEY_PREFIX}subs_${uid}`) {
      callback(e.detail.data || []);
    }
  };

  try {
    const q = query(collection(db, 'users', uid, 'subscriptions'));
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const subs: Subscription[] = [];
      snapshot.forEach((doc) => {
        // Cast doc.id (string) to id (number | string)
        subs.push({ id: doc.id, ...doc.data() } as unknown as Subscription);
      });
      callback(subs);
    }, (error) => {
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.warn("Permission denied or offline. Switching to local storage subscription feed.");
        
        // 1. Initial Load
        const localData = getLocalData<Subscription[]>(`${FALLBACK_KEY_PREFIX}subs_${uid}`) || [];
        callback(localData);

        // 2. Attach Listener for future local updates
        fallbackEvents.addEventListener('local-update', handleLocalUpdate);
      } else {
        console.error("Firestore snapshot error:", error);
        callback([]); 
      }
    });
  } catch (error) {
    console.error("Error setting up subscription listener:", error);
    // Fallback immediately
    const localData = getLocalData<Subscription[]>(`${FALLBACK_KEY_PREFIX}subs_${uid}`) || [];
    callback(localData);
    fallbackEvents.addEventListener('local-update', handleLocalUpdate);
  }

  // Return unsubscribe function that cleans up both Firestore and Local listeners
  return () => {
    unsubscribeFirestore();
    fallbackEvents.removeEventListener('local-update', handleLocalUpdate);
  };
};

// --- Migration Tool ---
export const migrateLocalData = async (uid: string, localSubs: Subscription[]) => {
  if (!localSubs || localSubs.length === 0) return;
  
  const promises = localSubs.map(sub => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = sub;
      return addSubscription(uid, rest);
  });
  
  await Promise.all(promises);
};
