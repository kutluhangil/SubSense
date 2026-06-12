
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

import { applyActionCode } from 'firebase/auth';
import { auth } from './firebase/firebase';
import FooterCredit from './components/FooterCredit';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Features = React.lazy(() => import('./components/Features'));
const DemoModal = React.lazy(() => import('./components/DemoModal'));
const ResetPasswordPage = React.lazy(() => import('./components/ResetPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('./components/VerifyEmailPage'));

export interface User {
  email: string;
  name: string;
  currency?: string;
  uid?: string;
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
    <Loader2 className="animate-spin text-indigo-600" size={32} />
  </div>
);

function AppContent() {
  const { currentUser, login, signup, logout, authInitialized, resetPassword, needsEmailVerification, pendingVerificationEmail, clearVerificationState } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState<'home' | 'features' | 'reset-password'>('home');
  const { setCurrency, t } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'SubSense — Track Your Subscriptions',
      features: 'Features — SubSense',
      'reset-password': 'Reset Password — SubSense',
    };
    if (!currentUser) {
      document.title = titles[currentPage] || 'SubSense';
    }
  }, [currentPage, currentUser]);

  useEffect(() => {
    const handleEmailActions = async () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const actionCode = params.get('oobCode');

      if (!mode || !actionCode) return;

      if (mode === 'resetPassword') {
        setCurrentPage('reset-password');
      } else if (mode === 'verifyEmail') {
        try {
          await applyActionCode(auth, actionCode);
          if (auth.currentUser) {
            await auth.currentUser.reload();
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error("Email verification failed:", error);
        }
      }
    };

    handleEmailActions();
  }, []);

  useEffect(() => {
    if (!currentUser) {
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
              migrateLocalData(currentUser.uid, parsedSubs).then(() => {
                localStorage.setItem(`subscriptionhub.${currentUser.email}.migrated`, 'true');
                localStorage.removeItem(legacyKey);
              });
            }
          } catch (e) {
            console.error("Migration failed", e);
          }
        } else {
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

  const handleLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      await login(email, password, rememberMe);
      setIsAuthOpen(false);
      setCurrentPage('home');
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setIsAuthOpen(false);
        return;
      }
      throw err;
    }
  };

  const handleSignup = async (name: string, email: string, password: string, currency: string, region: string) => {
    await signup(email, password, name, currency, region);
    setCurrency(currency);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
  };

  const handleResetPassword = async (email: string) => {
    await resetPassword(email);
  };

  if (!authInitialized) {
    return <PageLoader />;
  }

  const pathname = window.location.pathname;
  if (pathname !== '/' && pathname !== '') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-8xl font-black text-gray-900 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">The page you're looking for doesn't exist or has been moved.</p>
        <a
          href="/"
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
        >
          Go to SubSense
        </a>
      </div>
    );
  }

  const appUser: User | null = currentUser ? {
    email: currentUser.email || '',
    name: currentUser.displayName || 'User',
    uid: currentUser.uid
  } : null;

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold text-center py-1 z-[100] flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
          <WifiOff size={12} />
          {t('app.offline')}
        </div>
      )}

      <Suspense fallback={<PageLoader />}>
        {/* Email Verification Gate */}
        {needsEmailVerification && pendingVerificationEmail ? (
          <VerifyEmailPage
            email={pendingVerificationEmail}
            onBackToLogin={() => {
              clearVerificationState();
              openAuth('login');
            }}
            onResendAttempt={() => {
              // Verification email is automatically re-sent when user tries to log in
              // with an unverified account. We show a helpful message on the VerifyEmailPage.
            }}
          />
        ) : appUser ? (
          <Dashboard user={appUser} onLogout={handleLogout} />
        ) : (
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col selection:bg-gray-100 selection:text-gray-900 dark:selection:bg-gray-800 dark:selection:text-gray-100">
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
