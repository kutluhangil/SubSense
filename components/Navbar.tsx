
import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { IS_BETA } from '../utils/constants';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigate?: (page: 'home' | 'features') => void;
  currentPage?: 'home' | 'features';
}

const Navbar = ({ onOpenAuth, onNavigate, currentPage = 'home' }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, currentLanguage, setLanguage, currentTheme, setTheme } = useLanguage();

  const isDark = currentTheme === 'dark';

  const handleNav = (page: 'home' | 'features') => {
    if (onNavigate) onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(currentLanguage === 'en' ? 'tr' : 'en');

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
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNav('features')}
              className={`text-sm font-medium transition-colors ${currentPage === 'features' ? 'text-primary font-semibold' : 'text-secondary hover:text-primary'}`}
            >
              {t('nav.features')}
            </button>

            {/* Controls group */}
            <div className="flex items-center gap-2">

              {/* Language toggle pill */}
              <button
                onClick={toggleLanguage}
                title={currentLanguage === 'en' ? 'Türkçeye geç' : 'Switch to English'}
                className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 ${
                    currentLanguage === 'en'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  EN
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 ${
                    currentLanguage === 'tr'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  TR
                </span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {isDark
                  ? <Sun size={14} className="text-amber-400" />
                  : <Moon size={14} className="text-gray-600" />
                }
              </button>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
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

          {/* Mobile right side: controls + hamburger */}
          <div className="flex items-center gap-2 md:hidden">

            {/* Language toggle — mobile */}
            <button
              onClick={toggleLanguage}
              className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-700"
            >
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200 ${currentLanguage === 'en' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-400'}`}>EN</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200 ${currentLanguage === 'tr' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-400'}`}>TR</span>
            </button>

            {/* Theme toggle — mobile */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            >
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-gray-600" />}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
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
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('nav.features')}
            </button>
            <button
              onClick={() => { onOpenAuth('login'); setIsOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('nav.login')}
            </button>
            <button
              onClick={() => { onOpenAuth('signup'); setIsOpen(false); }}
              className="block w-full px-3 py-3 mt-4 text-center rounded-md text-base font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
            >
              {t('nav.signup')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);
