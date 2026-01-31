
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { IS_BETA } from '../utils/constants';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigate?: (page: 'home' | 'features') => void;
  currentPage?: 'home' | 'features';
}

export default function Navbar({ onOpenAuth, onNavigate, currentPage = 'home' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const handleNav = (page: 'home' | 'features') => {
    if (onNavigate) {
      onNavigate(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-subtle transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer gap-3" 
            onClick={() => handleNav('home')}
          >
            <Logo className="h-9" />
            {IS_BETA && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800">
                    Beta
                </span>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <button 
              onClick={() => handleNav('features')} 
              className={`text-sm font-medium transition-colors ${currentPage === 'features' ? 'text-primary font-semibold' : 'text-secondary hover:text-primary'}`}
            >
              {t('nav.features')}
            </button>
            <div className="flex items-center space-x-4 ml-4 rtl:space-x-reverse rtl:ml-0 rtl:mr-4">
              <button 
                onClick={() => onOpenAuth('login')}
                className="text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                {t('nav.login')}
              </button>
              <button 
                onClick={() => onOpenAuth('signup')}
                className="text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full hover:opacity-90 transition-all shadow-sm hover:shadow-md"
              >
                {t('nav.signup')}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-subtle">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => handleNav('features')} 
              className="block w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('nav.features')}
            </button>
            <button 
              onClick={() => {
                onOpenAuth('login');
                setIsOpen(false);
              }}
              className="block w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('nav.login')}
            </button>
            <button 
              onClick={() => {
                onOpenAuth('signup');
                setIsOpen(false);
              }}
              className="block w-full px-3 py-3 mt-4 text-center rounded-md text-base font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
            >
              {t('nav.signup')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
