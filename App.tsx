import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'features'>('home');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-gray-100 selection:text-gray-900">
      <Navbar 
        onOpenAuth={openAuth} 
        onNavigate={setCurrentPage} 
        currentPage={currentPage}
      />
      <main className="flex-grow flex flex-col justify-center">
        {currentPage === 'home' ? (
          <Hero />
        ) : (
          <Features onOpenAuth={openAuth} />
        )}
      </main>
      <Footer />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode}
        onLogin={handleLogin}
      />
    </div>
  );
}