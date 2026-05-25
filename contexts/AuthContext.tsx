
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useMemo, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase/firebase';
import { initializeUserDocument, getUserDocument, listenToUserSubscriptions, UserProfileData, updateUserActivity, updateUserPlan } from '../utils/firestore';
import { Subscription } from '../components/SubscriptionModal';
import { calculateDerivedStats, DerivedStats } from '../utils/aggregation';
import { trackEvent } from '../utils/analytics';

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
  resetPassword: (email: string) => Promise<void>;
  // Email verification
  needsEmailVerification: boolean;
  pendingVerificationEmail: string | null;
  resendVerificationEmail: () => Promise<void>;
  clearVerificationState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [welcomeBackMessage, setWelcomeBackMessage] = useState<string | null>(null);

  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const isPro = useMemo(() => {
    return userProfile?.plan?.type === 'pro' && userProfile?.plan?.status === 'active';
  }, [userProfile]);

  const unsubscribeSubsRef = useRef<(() => void) | null>(null);

  async function signup(email: string, password: string, name: string, currency: string, region: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: name });

        await initializeUserDocument(
          { uid: user.uid, email: user.email, displayName: name },
          { currency, region }
        );

        try {
          const sendCustomVerification = httpsCallable(functions, 'sendCustomVerificationEmail');
          await sendCustomVerification({
            email: user.email,
            redirectUrl: window.location.origin ? `${window.location.origin}/?mode=verifyEmail` : undefined
          });

          trackEvent('email_verification_sent');
        } catch {
          try {
            await sendEmailVerification(user);
          } catch (fallbackError) {
            console.error("Verification email delivery failed", fallbackError);
          }
        }

        setPendingVerificationEmail(email);
        setNeedsEmailVerification(true);

        trackEvent('signup_success', { method: 'email', currency: currency });
      }
    } catch (error) {
      throw error;
    }
  }

  async function login(email: string, password: string, rememberMe: boolean = false) {
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        // Attempt to re-send verification email for convenience (with error logging)
        try {
          const sendCustomVerification = httpsCallable(functions, 'sendCustomVerificationEmail');
          await sendCustomVerification({
            email: user.email,
            redirectUrl: window.location.origin ? `${window.location.origin}/?mode=verifyEmail` : undefined
          });
        } catch {
          // Best-effort resend; ignore failures silently
        }

        setPendingVerificationEmail(email);
        setNeedsEmailVerification(true);

        throw new Error('EMAIL_NOT_VERIFIED');
      }

      setNeedsEmailVerification(false);
      setPendingVerificationEmail(null);
      trackEvent('login_success', { method: 'email' });
    } catch (error: any) {
      throw error;
    }
  }

  async function logout() {
    trackEvent('logout');

    if (unsubscribeSubsRef.current) {
      unsubscribeSubsRef.current();
      unsubscribeSubsRef.current = null;
    }

    const keysToRemove = [];
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('subscriptionhub.') || key.includes(currentUser?.email || 'unknown'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    setCurrentUser(null);
    setUserProfile(null);
    setSubscriptions([]);
    setSubscriptionsLoading(false);
    setWelcomeBackMessage(null);
    setNeedsEmailVerification(false);
    setPendingVerificationEmail(null);

    await signOut(auth);
  }

  async function upgradeToPro() {
    if (!currentUser || !userProfile) return;

    try {
      const newPlan = {
        type: 'pro' as const,
        status: 'active' as const,
        since: new Date().toISOString()
      };

      await updateUserPlan(currentUser.uid, newPlan);

      setUserProfile({ ...userProfile, plan: newPlan });
      trackEvent('subscription_upgrade', { plan: 'pro' });
    } catch (e) {
      console.error("Upgrade failed:", e);
      throw e;
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      trackEvent('password_reset_request');
    } catch {
      trackEvent('password_reset_request');
    }
  }

  const resendVerificationEmail = useCallback(async () => {
    if (!currentUser) return;

    try {
      const sendCustomVerification = httpsCallable(functions, 'sendCustomVerificationEmail');
      await sendCustomVerification({
        email: currentUser.email,
        redirectUrl: window.location.origin ? `${window.location.origin}/?mode=verifyEmail` : undefined
      });

      trackEvent('email_verification_resent');
    } catch (error: any) {
      throw error;
    }
  }, [currentUser]);

  const clearVerificationState = useCallback(() => {
    setNeedsEmailVerification(false);
    setPendingVerificationEmail(null);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeSubsRef.current) {
        unsubscribeSubsRef.current();
        unsubscribeSubsRef.current = null;
      }

      setCurrentUser(user);

      if (user) {
        if (!user.emailVerified) {
          setPendingVerificationEmail(user.email);
          setNeedsEmailVerification(true);
        } else {
          setNeedsEmailVerification(false);
          setPendingVerificationEmail(null);
        }

        try {
          const profile = await getUserDocument(user.uid);
          setUserProfile(profile);

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

          await updateUserActivity(user.uid);
          trackEvent('session_start');

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
    upgradeToPro,
    resetPassword,
    // Email verification
    needsEmailVerification,
    pendingVerificationEmail,
    resendVerificationEmail,
    clearVerificationState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
