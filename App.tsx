
import React, { useState, useEffect, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { migrateLocalData } from './utils/firestore';
import { WifiOff, Loader2 } from 'lucide-react';
import { trackPageView } from './utils/analytics';

import FooterCredit from './components/FooterCredit';

// Lazy Load Pages & Heavy Components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Features = React.lazy(() => import('./components/Features'));
const DemoModal = React.lazy(() => import('./components/DemoModal'));
const ResetPasswordPage = React.lazy(() => import('./components/ResetPasswordPage'));

// Types for user interface consistency
export interface User {
  email: string;
  name: string;
  passwordHash: string; // Kept for interface compat, unused in Firebase
  currency?: string;
  uid?: string;
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
    <Loader2 className="animate-spin text-indigo-600" size={32} />
  </div>
);

function AppContent() {
  const { currentUser, login, signup, logout, authInitialized, resetPassword } = useAuth();
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

  // --- Analytics: Track Route Changes ---
  useEffect(() => {
    if (currentUser) {
      // Dashboard internal navigation handles its own tracking
    } else {
      trackPageView(currentPage);
    }
  }, [currentPage, currentUser]);

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
  const handleLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    await login(email, password, rememberMe);
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

  const handleResetPassword = async (email: string) => {
    await resetPassword(email);
    // Success handling is done inside AuthModal (e.g. showing "email sent" mode)
  };

  // 4. App-Level Gating: Show loader until auth state is confirmed
  if (!authInitialized) {
    return <PageLoader />;
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

      <Suspense fallback={<PageLoader />}>
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
                <FooterCredit />
              </>
            )}
            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              initialMode={authMode}
              onLoginSubmit={handleLogin}
              onSignupSubmit={handleSignup}
              onResetPassword={handleResetPassword}
            />
            <DemoModal
              isOpen={isDemoOpen}
              onClose={closeDemo}
              onSignup={() => openAuth('signup')}
            />
          </div>
        )}
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <FeedbackProvider>
          <AppContent />
        </FeedbackProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
