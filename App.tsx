
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import DemoModal from './components/DemoModal';
import ResetPasswordPage from './components/ResetPasswordPage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { migrateLocalData } from './utils/firestore';
import { WifiOff } from 'lucide-react';

// Types for user interface consistency
export interface User {
  email: string;
  name: string;
  passwordHash: string; // Kept for interface compat, unused in Firebase
  currency?: string;
  uid?: string;
}

function AppContent() {
  const { currentUser, login, signup, logout, authInitialized } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState<'home' | 'features' | 'reset-password'>('home');
  const { setCurrency } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- Network Status ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Migration Logic ---
  useEffect(() => {
    if (currentUser) {
      const hasMigrated = localStorage.getItem(`subscriptionhub.${currentUser.email}.migrated`);
      
      if (!hasMigrated) {
        // Attempt to find legacy data for this email
        const legacyKey = `subscriptionhub.${currentUser.email}.subscriptions`;
        const localData = localStorage.getItem(legacyKey);
        
        if (localData) {
          try {
            const parsedSubs = JSON.parse(localData);
            if (Array.isArray(parsedSubs) && parsedSubs.length > 0) {
              console.log("Migrating local data to Firestore...");
              migrateLocalData(currentUser.uid, parsedSubs).then(() => {
                localStorage.setItem(`subscriptionhub.${currentUser.email}.migrated`, 'true');
                // Optional: Clear legacy data
                localStorage.removeItem(legacyKey);
              });
            }
          } catch (e) {
            console.error("Migration failed", e);
          }
        } else {
           // Mark as migrated to skip check next time even if empty
           localStorage.setItem(`subscriptionhub.${currentUser.email}.migrated`, 'true');
        }
      }
    }
  }, [currentUser]);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsDemoOpen(false);
  };

  const openDemo = () => {
    setIsDemoOpen(true);
  };

  const closeDemo = () => {
    setIsDemoOpen(false);
  };

  // Wrapper for AuthContext login
  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setIsAuthOpen(false);
    setCurrentPage('home');
  };

  // Wrapper for AuthContext signup
  const handleSignup = async (name: string, email: string, password: string, currency: string, region: string) => {
    await signup(email, password, name, currency, region);
    // LanguageContext listens to profile changes via userProfile, but we can set local state too for instant feedback
    setCurrency(currency);
    setIsAuthOpen(false);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
  };

  const handleSimulateReset = () => {
    setIsAuthOpen(false);
    setCurrentPage('reset-password');
    window.scrollTo(0,0);
  };

  // 4. App-Level Gating: Show loader until auth state is confirmed
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Map Firebase user to App User interface
  const appUser: User | null = currentUser ? {
    email: currentUser.email || '',
    name: currentUser.displayName || 'User',
    passwordHash: '',
    uid: currentUser.uid
  } : null;

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold text-center py-1 z-[100] flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
          <WifiOff size={12} />
          You are offline. Showing cached data.
        </div>
      )}
      
      {appUser ? (
        <Dashboard user={appUser} onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-gray-100 selection:text-gray-900">
          {currentPage === 'reset-password' ? (
             <ResetPasswordPage onLoginClick={() => {
                setCurrentPage('home');
                openAuth('login');
             }} />
          ) : (
            <>
              <Navbar 
                onOpenAuth={openAuth} 
                onNavigate={(page) => setCurrentPage(page as any)} 
                currentPage={currentPage as 'home' | 'features'}
              />
              <main className="flex-grow flex flex-col">
                {currentPage === 'home' ? (
                  <Hero onOpenDemo={openDemo} onOpenAuth={openAuth} />
                ) : (
                  <Features onOpenAuth={openAuth} onOpenDemo={openDemo} />
                )}
              </main>
              <Footer />
            </>
          )}
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
            initialMode={authMode}
            onLoginSubmit={handleLogin}
            onSignupSubmit={handleSignup}
            onSimulateReset={handleSimulateReset}
          />
          <DemoModal 
            isOpen={isDemoOpen}
            onClose={closeDemo}
            onSignup={() => openAuth('signup')}
          />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
