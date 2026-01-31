
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { auth } from '../firebase/firebase';
import { initializeUserDocument, getUserDocument, listenToUserSubscriptions, UserProfileData } from '../utils/firestore';
import { Subscription } from '../components/SubscriptionModal';
import { calculateDerivedStats, DerivedStats } from '../utils/aggregation';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  // Log In
  async function login(email: string, password: string) {
    await auth.signInWithEmailAndPassword(email, password);
  }

  // Log Out
  function logout() {
    return auth.signOut();
  }

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      // Always cleanup previous subscription listener if it exists
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

          // 2. Start Realtime Subscription Listener
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
        // Clear state on logout
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
    derivedStats, // Expose derived stats
    loading,
    subscriptionsLoading,
    authInitialized,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
