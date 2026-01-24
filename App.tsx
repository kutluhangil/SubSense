
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import DemoModal from './components/DemoModal';
import ResetPasswordPage from './components/ResetPasswordPage';
import { LanguageProvider } from './contexts/LanguageContext';

function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'features' | 'reset-password'>('home');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    // Ensure demo is closed if auth is opened from within demo
    setIsDemoOpen(false);
  };

  const openDemo = () => {
    setIsDemoOpen(true);
  };

  const closeDemo = () => {
    setIsDemoOpen(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAuthOpen(false);
    setCurrentPage('home'); // Reset page context on login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const handleSimulateReset = () => {
    setIsAuthOpen(false); // Close modal
    setCurrentPage('reset-password'); // Switch to standalone page
    window.scrollTo(0,0);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  // Standalone Reset Password Page View
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
        onLogin={handleLogin}
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
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
