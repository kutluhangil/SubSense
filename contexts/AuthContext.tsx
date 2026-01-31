import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import firebase from 'firebase/app';
import { auth } from '../firebase/firebase';
import { initializeUserDocument, getUserDocument, UserProfileData } from '../utils/firestore';

interface AuthContextType {
  currentUser: firebase.User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
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
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign Up
  async function signup(email: string, password: string, name: string, currency: string, region: string) {
    // 1. Create Auth User
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (user) {
      // 2. Update Profile (Display Name)
      await user.updateProfile({ displayName: name });

      // 3. Initialize Firestore Document for User
      // We pass the auth user object and the extra data needed for preferences
      const profile = await initializeUserDocument(
        { uid: user.uid, email: user.email, displayName: name },
        { currency, region }
      );
      
      // Update local state immediately
      setCurrentUser(user);
      setUserProfile(profile);
    }
  }

  // Log In
  function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(email, password).then(async (cred) => {
      // Profile fetch is handled by onAuthStateChanged
    });
  }

  // Log Out
  function logout() {
    return auth.signOut().then(() => {
      setUserProfile(null);
      setCurrentUser(null);
    });
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Hydrate global app state (User Profile) from Firestore
        const profile = await getUserDocument(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Auth state observer error:", error);
      setLoading(false); // Ensure app loads even if auth fails
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
