import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigate?: (page: 'home' | 'features') => void;
  currentPage?: 'home' | 'features';
}

export default function Navbar({ onOpenAuth, onNavigate, currentPage = 'home' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (page: 'home' | 'features') => {
    if (onNavigate) {
      onNavigate(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={() => handleNav('home')}
          >
            <Logo className="h-9" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNav('features')} 
              className={`text-sm font-medium transition-colors ${currentPage === 'features' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Features
            </button>
            <div className="flex items-center space-x-4 ml-4">
              <button 
                onClick={() => onOpenAuth('login')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => onOpenAuth('signup')}
                className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => handleNav('features')} 
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Features
            </button>
            <button 
              onClick={() => {
                onOpenAuth('login');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Log in
            </button>
            <button 
              onClick={() => {
                onOpenAuth('signup');
                setIsOpen(false);
              }}
              className="block w-full px-3 py-2 mt-4 text-center rounded-md text-base font-medium bg-gray-900 text-white hover:bg-gray-800"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}