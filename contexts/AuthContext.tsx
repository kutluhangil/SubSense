
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { auth } from '../firebase/firebase';
import { initializeUserDocument, getUserDocument, listenToUserSubscriptions, UserProfileData, updateUserActivity, updateUserPlan } from '../utils/firestore';
import { Subscription } from '../components/SubscriptionModal';
import { calculateDerivedStats, DerivedStats } from '../utils/aggregation';
import { trackEvent } from '../utils/analytics';

// Define User type from compat namespace
type User = firebase.User;

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  subscriptions: Subscription[];
  derivedStats: DerivedStats;
  loading: boolean;
  subscriptionsLoading: boolean;
  authInitialized: boolean;
  signup: (email: string, password: string, name: string, currency: string, region: string) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  welcomeBackMessage: string | null;
  isPro: boolean;
  upgradeToPro: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const DEFAULT_STATS: DerivedStats = {
  totalSubscriptions: 0,
  monthlySpend: 0,
  annualSpend: 0,
  lifetimeSpend: 0,
  categoryBreakdown: {},
  mostExpensiveSub: null,
  currency: 'USD'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [welcomeBackMessage, setWelcomeBackMessage] = useState<string | null>(null);

  // Determine Pro Status (Default false if no profile)
  const isPro = useMemo(() => {
    return userProfile?.plan?.type === 'pro' && userProfile?.plan?.status === 'active';
  }, [userProfile]);

  // Store the unsubscribe function to clean up on logout/unmount
  const unsubscribeSubsRef = useRef<(() => void) | null>(null);

  // Sign Up
  async function signup(email: string, password: string, name: string, currency: string, region: string) {
    try {
      // 1. Create Auth User
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user) {
        // 2. Update Profile
        await user.updateProfile({ displayName: name });

        // 3. Initialize Firestore Document for User
        const profile = await initializeUserDocument(
          { uid: user.uid, email: user.email, displayName: name },
          { currency, region }
        );
        
        // Update local state immediately
        setCurrentUser(user);
        setUserProfile(profile);
        
        // Analytics
        trackEvent('signup_success', { method: 'email', currency: currency });
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  // Log In
  async function login(email: string, password: string, rememberMe: boolean = false) {
    try {
      const persistence = rememberMe 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;
        
      await auth.setPersistence(persistence);
      await auth.signInWithEmailAndPassword(email, password);
      trackEvent('login_success', { method: 'email' });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Log Out - Enhanced Security
  async function logout() {
    trackEvent('logout');
    
    // 1. Unsubscribe from listeners immediately
    if (unsubscribeSubsRef.current) {
      unsubscribeSubsRef.current();
      unsubscribeSubsRef.current = null;
    }

    // 2. Clear Local Storage of user-specific data to prevent leaks
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('subscriptionhub.') || key.includes(currentUser?.email || 'unknown'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 3. Reset State
    setCurrentUser(null);
    setUserProfile(null);
    setSubscriptions([]);
    setSubscriptionsLoading(false);
    setWelcomeBackMessage(null);

    // 4. Sign out from Firebase
    await auth.signOut();
  }

  // Mock Upgrade Function (Simulates Payment Success)
  async function upgradeToPro() {
    if (!currentUser || !userProfile) return;
    
    try {
      // In a real app, you'd integrate Stripe/LemonSqueezy here
      const newPlan = {
        type: 'pro' as const,
        status: 'active' as const,
        since: new Date().toISOString()
      };
      
      await updateUserPlan(currentUser.uid, newPlan);
      
      // Optimistic update
      setUserProfile({ ...userProfile, plan: newPlan });
      trackEvent('subscription_upgrade', { plan: 'pro' });
    } catch (e) {
      console.error("Upgrade failed:", e);
      throw e;
    }
  }

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      // Always cleanup previous subscription listener if it exists when auth changes
      if (unsubscribeSubsRef.current) {
        unsubscribeSubsRef.current();
        unsubscribeSubsRef.current = null;
      }

      setCurrentUser(user);
      
      if (user) {
        try {
          // 1. Hydrate User Profile
          const profile = await getUserDocument(user.uid);
          setUserProfile(profile);

          // 2. Analytics: Check for Churn / Return
          if (profile?.analytics?.lastActiveAt) {
             const lastActive = profile.analytics.lastActiveAt.toDate ? profile.analytics.lastActiveAt.toDate() : new Date(profile.analytics.lastActiveAt);
             const now = new Date();
             const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
             
             if (daysDiff >= 30) {
                trackEvent('churn_recovery', { days_inactive: daysDiff });
                setWelcomeBackMessage("Welcome back! It's been a while.");
             } else if (daysDiff >= 21) {
                trackEvent('at_risk_recovery', { days_inactive: daysDiff });
                setWelcomeBackMessage("Good to see you again!");
             }
          }

          // 3. Analytics: Update Activity
          await updateUserActivity(user.uid);
          trackEvent('session_start');

          // 4. Start Realtime Subscription Listener
          setSubscriptionsLoading(true);
          const unsub = listenToUserSubscriptions(user.uid, (subs) => {
            setSubscriptions(subs);
            setSubscriptionsLoading(false);
          }, (error) => {
            console.error("Subscription Sync Error:", error);
            setSubscriptionsLoading(false);
          });
          
          unsubscribeSubsRef.current = unsub;

        } catch (err) {
          console.error("Auth hydration error:", err);
          setSubscriptionsLoading(false);
        }
      } else {
        // Clear state on logout / initial null
        setUserProfile(null);
        setSubscriptions([]);
        setSubscriptionsLoading(false);
      }
      
      setLoading(false);
      setAuthInitialized(true);
    }, (error) => {
      console.error("Auth state observer error:", error);
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSubsRef.current) {
        unsubscribeSubsRef.current();
      }
    };
  }, []);

  // Calculate Derived Stats whenever subscriptions or base currency changes
  const derivedStats = useMemo(() => {
    const baseCurrency = userProfile?.preferences?.baseCurrency || 'USD';
    return calculateDerivedStats(subscriptions, baseCurrency);
  }, [subscriptions, userProfile?.preferences?.baseCurrency]);

  const value = {
    currentUser,
    userProfile,
    subscriptions,
    derivedStats,
    loading,
    subscriptionsLoading,
    authInitialized,
    welcomeBackMessage,
    isPro,
    signup,
    login,
    logout,
    upgradeToPro
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
