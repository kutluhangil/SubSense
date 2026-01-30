
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import DemoModal from './components/DemoModal';
import ResetPasswordPage from './components/ResetPasswordPage';
import { LanguageProvider } from './contexts/LanguageContext';

// Types for our local auth system
export interface User {
  email: string;
  name: string;
  // In a real app, never store passwords plain text. 
  // For this local MVP, we store a simple hash or the string itself if strictly local.
  passwordHash: string; 
}

function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'features' | 'reset-password'>('home');

  // Load session on mount
  useEffect(() => {
    const sessionEmail = localStorage.getItem('subscriptionhub.session');
    if (sessionEmail) {
      const users = JSON.parse(localStorage.getItem('subscriptionhub.users') || '[]');
      const user = users.find((u: User) => u.email === sessionEmail);
      if (user) {
        setCurrentUser(user);
        setCurrentPage('home');
      }
    }
  }, []);

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

  const handleLogin = (email: string, passwordHash: string) => {
    const users = JSON.parse(localStorage.getItem('subscriptionhub.users') || '[]');
    const user = users.find((u: User) => u.email === email && u.passwordHash === passwordHash);
    
    if (user) {
      localStorage.setItem('subscriptionhub.session', email);
      setCurrentUser(user);
      setIsAuthOpen(false);
      setCurrentPage('home');
      return true;
    }
    return false;
  };

  const handleSignup = (name: string, email: string, passwordHash: string) => {
    const users = JSON.parse(localStorage.getItem('subscriptionhub.users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return false; // User exists
    }

    const newUser = { name, email, passwordHash };
    users.push(newUser);
    localStorage.setItem('subscriptionhub.users', JSON.stringify(users));
    
    // Initialize empty data for new user
    localStorage.setItem(`subscriptionhub.${email}.subscriptions`, JSON.stringify([]));
    localStorage.setItem(`subscriptionhub.${email}.budgetLimits`, JSON.stringify({
      'Entertainment': 50, 'Productivity': 100, 'Shopping': 200, 'Tools': 50
    }));
    
    // Auto login
    localStorage.setItem('subscriptionhub.session', email);
    setCurrentUser(newUser);
    setIsAuthOpen(false);
    setCurrentPage('home');
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('subscriptionhub.session');
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleSimulateReset = () => {
    setIsAuthOpen(false);
    setCurrentPage('reset-password');
    window.scrollTo(0,0);
  };

  if (currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentPage === 'reset-password') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <ResetPasswordPage onLoginClick={() => {
          setCurrentPage('home');
          openAuth('login');
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-gray-100 selection:text-gray-900">
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
  );
}

export default function App() {
  return (
    <LanguageProvider children={<AppContent />} />
  );
}
