
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
  serverTimestamp,
  increment,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Subscription } from '../components/SubscriptionModal';
import { validateSubscription } from './validateSubscription';
import { trackEvent } from './analytics';
import { api } from './api';

// --- Types ---

export interface SubscriptionPlan {
  type: 'free' | 'pro';
  status: 'active' | 'trial' | 'past_due' | 'canceled' | 'expired';
  interval?: 'month' | 'year';
  currentPeriodEnd?: any; // Firestore Timestamp or ISO string
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: any;
  termsAcceptedAt?: string;
  preferences: {
    language: string;
    theme: string;
    baseCurrency: string;
    region: string;
    analyticsOptOut?: boolean;
  };
  stats: {
    totalSubscriptions: number;
    monthlySpend: number;
    annualSpend: number;
  };
  analytics?: {
    lastActiveAt: any;
    sessionCount: number;
    signupDate: string;
    churnRisk?: boolean;
    featureUsage?: Record<string, number>;
  };
  achievements?: string[];
  plan: SubscriptionPlan;
}

// --- Local Fallback Logic ---

const FALLBACK_KEY_PREFIX = 'subscriptionhub_fallback_';
const fallbackEvents = new EventTarget();

const getLocalData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const setLocalData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
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
  const now = new Date().toISOString();

  const newProfile: UserProfileData = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName,
    createdAt: now,
    termsAcceptedAt: now,
    preferences: {
      baseCurrency: additionalData?.currency || 'USD',
      language: 'en',
      theme: 'system',
      region: additionalData?.region || 'US',
      analyticsOptOut: false
    },
    stats: {
      totalSubscriptions: 0,
      monthlySpend: 0,
      annualSpend: 0
    },
    analytics: {
      lastActiveAt: now,
      sessionCount: 1,
      signupDate: now,
      featureUsage: {}
    },
    plan: {
      type: 'free',
      status: 'active'
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
        console.debug("Firestore read denied/unavailable. Using local fallback for profile.");
        trackEvent('system_fallback', { type: 'profile_read', reason: e.code });
        const localProfile = getLocalData<UserProfileData>(localKey);
        return localProfile || newProfile;
      }
      throw e;
    }

    if (userSnap && userSnap.exists()) {
      return userSnap.data() as UserProfileData;
    }

    try {
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
        'analytics.lastActiveAt': serverTimestamp()
      });
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        console.info("Firestore write denied. Saving profile locally.");
        trackEvent('system_fallback', { type: 'profile_write', reason: e.code });
        setLocalData(localKey, newProfile);
        return newProfile;
      }
      throw e;
    }

    return newProfile;
  } catch (error) {
    console.error("Error initializing user document:", error);
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
    if (error.code === 'permission-denied' || error.code === 'unavailable') {
      // Silent fallback for guest/unauthed
      trackEvent('system_fallback', { type: 'profile_fetch', reason: error.code });
      return getLocalData<UserProfileData>(`${FALLBACK_KEY_PREFIX}profile_${uid}`);
    }
    console.error("Error fetching user document:", error);
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

export const updateUserPlan = async (uid: string, planData: Partial<UserProfileData['plan']>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { plan: planData });
  } catch (error) {
    console.error("Error updating plan:", error);
    // Fallback for demo/local environment without write permissions to 'plan' specifically
    const localKey = `${FALLBACK_KEY_PREFIX}profile_${uid}`;
    const current = getLocalData<UserProfileData>(localKey);
    if (current) {
      current.plan = { ...current.plan, ...planData };
      setLocalData(localKey, current);
    }
    throw error;
  }
};

export const updateUserActivity = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'analytics.lastActiveAt': serverTimestamp(),
      'analytics.sessionCount': increment(1)
    });
  } catch (error) {
    // Fail silently
  }
};

export const updateFeatureUsage = async (uid: string, feature: string) => {
  if (typeof window !== 'undefined' && localStorage.getItem('analytics_opt_out') === 'true') return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`analytics.featureUsage.${feature}`]: increment(1)
    });
  } catch (error) {
    // Fail silently
  }
};

export const updateAchievements = async (uid: string, achievements: string[]) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { achievements });
  } catch (error) {
    console.error("Error updating achievements:", error);
  }
};

// --- Subscriptions ---

export const getUserSubscriptions = async (uid: string): Promise<Subscription[]> => {
  try {
    // Standardized API call
    const subs = await api.get<Subscription[]>('/subscriptions');
    return subs;
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.code === 'unavailable' || error.message.includes('auth')) {
      trackEvent('system_fallback', { type: 'subs_fetch', reason: error.code || 'auth_error' });
      const localKey = `${FALLBACK_KEY_PREFIX}subs_${uid}`;
      const localSubs = getLocalData<Subscription[]>(localKey) || [];
      return localSubs.filter(validateSubscription);
    }
    console.error("Error fetching subscriptions via API:", error);
    return [];
  }
};

export const addSubscription = async (uid: string, subscription: Omit<Subscription, 'id'>) => {
  if (!validateSubscription(subscription as Partial<Subscription>)) {
    console.error("Attempted to add invalid subscription. Operation blocked.");
    throw new Error("Invalid subscription data. Please check fields.");
  }

  try {
    // API Call
    const createdSub = await api.post<Subscription>('/subscriptions', subscription);
    updateFeatureUsage(uid, 'subscription_added');
    return createdSub;
  } catch (error: any) {
    console.error("Error adding subscription:", error);
    // If API returns 409, propagate it
    if (error.response && error.response.status === 409) {
      throw {
        status: 409,
        message: "This subscription is already in your Dashboard",
        code: "duplicate_subscription"
      };
    }
    throw error;
  }
};

export const updateSubscription = async (uid: string, subId: number | string, data: Partial<Subscription>) => {
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) throw new Error("Invalid price update");
  if (data.currency && typeof data.currency !== 'string') throw new Error("Invalid currency update");

  const id = String(subId);

  try {
    // API Call
    await api.put(`/subscriptions/${id}`, data);
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

export const deleteSubscription = async (uid: string, subId: number | string) => {
  const id = String(subId);

  try {
    // API Call
    await api.delete(`/subscriptions/${id}`);
  } catch (error: any) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
};

export const listenToUserSubscriptions = (
  uid: string,
  onChange: (subs: Subscription[]) => void,
  onError?: (error: any) => void
) => {
  let unsubscribeFirestore = () => { };

  const handleLocalUpdate = (e: any) => {
    if (e.detail && e.detail.key === `${FALLBACK_KEY_PREFIX}subs_${uid}`) {
      const validSubs = (e.detail.data || []).filter(validateSubscription);
      onChange(validSubs);
    }
  };

  try {
    const q = query(
      collection(db, 'users', uid, 'subscriptions'),
      orderBy('createdAt', 'desc')
    );

    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const subs: Subscription[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (validateSubscription(data as Partial<Subscription>)) {
          subs.push({ id: doc.id, ...data } as unknown as Subscription);
        }
      });
      onChange(subs);
    }, (error) => {
      if (error.code === 'permission-denied' || error.code === 'unavailable' || error.code === 'failed-precondition') {
        console.debug("Firestore realtime connection denied/failed. Switching to local storage mode.");
        trackEvent('system_fallback', { type: 'sub_listen', reason: error.code });
        const localData = getLocalData<Subscription[]>(`${FALLBACK_KEY_PREFIX}subs_${uid}`) || [];
        onChange(localData.filter(validateSubscription));
        fallbackEvents.addEventListener('local-update', handleLocalUpdate);
      } else {
        console.error("Firestore snapshot error:", error);
        if (onError) onError(error);
      }
    });
  } catch (error) {
    console.error("Error setting up subscription listener:", error);
    const localData = getLocalData<Subscription[]>(`${FALLBACK_KEY_PREFIX}subs_${uid}`) || [];
    onChange(localData.filter(validateSubscription));
    fallbackEvents.addEventListener('local-update', handleLocalUpdate);
  }

  return () => {
    unsubscribeFirestore();
    fallbackEvents.removeEventListener('local-update', handleLocalUpdate);
  };
};

export const migrateLocalData = async (uid: string, localSubs: Subscription[]) => {
  if (!localSubs || localSubs.length === 0) return;

  const promises = localSubs.map(sub => {
    if (validateSubscription(sub)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = sub;
      return addSubscription(uid, rest);
    }
    return Promise.resolve();
  });

  await Promise.all(promises);
};

// --- Friends System ---

export const searchUsers = async (searchTerm: string, currentUserId: string): Promise<UserProfileData[]> => {
  try {
    const usersRef = collection(db, 'users');
    const qEmail = query(usersRef, where('email', '==', searchTerm));
    const snap = await getDocs(qEmail);

    const results: UserProfileData[] = [];
    snap.forEach(d => {
      if (d.id !== currentUserId) results.push(d.data() as UserProfileData);
    });

    return results;
  } catch (e) {
    console.error("Error searching users:", e);
    return [];
  }
};

export const sendFriendRequest = async (fromUid: string, toUid: string) => {
  try {
    await setDoc(doc(db, 'users', toUid, 'friendRequests', fromUid), {
      fromUid,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    await setDoc(doc(db, 'users', fromUid, 'sentRequests', toUid), {
      toUid,
      status: 'pending',
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Error sending friend request:", e);
  }
};

export const acceptFriendRequest = async (currentUid: string, senderUid: string) => {
  try {
    await setDoc(doc(db, 'users', currentUid, 'friends', senderUid), {
      uid: senderUid,
      since: serverTimestamp()
    });
    await setDoc(doc(db, 'users', senderUid, 'friends', currentUid), {
      uid: currentUid,
      since: serverTimestamp()
    });

    await deleteDoc(doc(db, 'users', currentUid, 'friendRequests', senderUid));
    await deleteDoc(doc(db, 'users', senderUid, 'sentRequests', currentUid));
  } catch (e) {
    console.error("Friend acceptance failed:", e);
    throw e;
  }
};

export const getFriendsList = async (uid: string): Promise<string[]> => {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'friends'));
    return snap.docs.map(d => d.id);
  } catch (e) {
    return [];
  }
};

export const getIncomingRequests = async (uid: string) => {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'friendRequests'));
    return snap.docs.map(d => d.id);
  } catch (e) {
    return [];
  }
};

// --- System ---

export const submitFeedback = async (uid: string, feedback: { type: string; message: string; email?: string }) => {
  try {
    await addDoc(collection(db, 'feedback'), {
      uid,
      ...feedback,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent
    });
  } catch (e: any) {
    console.error("Error submitting feedback:", e);
    // Fallback: Log to console if Firestore write fails (likely permission issue or offline)
    console.log("Feedback Fallback:", feedback);
    if (e.code === 'permission-denied') {
      // Maybe store in localStorage to sync later? For now, we just pretend it worked to the user.
      return;
    }
    throw e;
  }
};
