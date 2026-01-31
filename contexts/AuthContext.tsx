
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import { auth } from '../firebase/firebase';
import { initializeUserDocument, getUserDocument, getUserSubscriptions, UserProfileData } from '../utils/firestore';
import { Subscription } from '../components/SubscriptionModal';

// Define User type from compat namespace
type User = firebase.User;

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  subscriptions: Subscription[];
  loading: boolean;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

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
  function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(email, password).then(() => {
      // Profile fetch is handled by onAuthStateChanged
    });
  }

  // Log Out
  function logout() {
    return auth.signOut().then(() => {
      setUserProfile(null);
      setCurrentUser(null);
      setSubscriptions([]);
    });
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Hydrate global app state (User Profile & Subscriptions) from Firestore
          const profile = await getUserDocument(user.uid);
          setUserProfile(profile);

          const subs = await getUserSubscriptions(user.uid);
          setSubscriptions(subs);
        } catch (err) {
          console.error("Auth hydration error:", err);
        }
      } else {
        setUserProfile(null);
        setSubscriptions([]);
      }
      
      setLoading(false);
      setAuthInitialized(true);
    }, (error) => {
      console.error("Auth state observer error:", error);
      setLoading(false);
      setAuthInitialized(true);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    subscriptions,
    loading,
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
