
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LanguageCode } from '../utils/translations';
import { EXCHANGE_RATES, CURRENCY_LOCALES } from '../utils/currency';

export type ThemeOption = 'light' | 'dark' | 'system';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentCurrency: string;
  setCurrency: (currency: string) => void;
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  formatDate: (dateString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // --- Language State ---
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userLanguagePreference');
      if (saved === 'en' || saved === 'tr') {
        return saved;
      }
    }
    return 'en';
  });

  // --- Currency State ---
  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCurrencyPreference');
      return saved || 'USD';
    }
    return 'USD';
  });

  // --- Theme State ---
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userThemePreference');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
    return 'system';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dir = (currentLanguage as string) === 'ar' ? 'rtl' : 'ltr';

  // --- Effects ---

  // Persist Language & Direction
  useEffect(() => {
    localStorage.setItem('userLanguagePreference', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = dir;
  }, [currentLanguage, dir]);

  // Persist Currency
  useEffect(() => {
    localStorage.setItem('userCurrencyPreference', currentCurrency);
  }, [currentCurrency]);

  // Persist & Apply Theme
  useEffect(() => {
    localStorage.setItem('userThemePreference', currentTheme);
    
    const applyTheme = () => {
      const isDark = 
        currentTheme === 'dark' || 
        (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      const root = document.documentElement;
      
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    applyTheme();

    // Listener for system changes if in 'system' mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (currentTheme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  };

  const handleSetLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    const langName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);
    showToast(`Language changed to ${langName}`);
  };

  const handleSetCurrency = (curr: string) => {
    setCurrentCurrency(curr);
    showToast(`Currency changed to ${curr}`);
  };

  const handleSetTheme = (theme: ThemeOption) => {
    setCurrentTheme(theme);
    // showToast(`Theme changed to ${theme}`);
  };

  const t = (key: string): string => {
    const langDict = translations[currentLanguage];
    if (!langDict) return key; 
    return langDict[key] || translations['en'][key] || key;
  };

  // Currency Logic
  const convertPrice = (amountInUSD: number): number => {
    const rate = EXCHANGE_RATES[currentCurrency] || 1;
    return amountInUSD * rate;
  };

  const formatPrice = (amountInUSD: number): string => {
    const convertedAmount = convertPrice(amountInUSD);
    const locale = CURRENCY_LOCALES[currentLanguage] || 'en-US';
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currentCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedAmount);
    } catch (e) {
      return `${currentCurrency} ${convertedAmount.toFixed(2)}`;
    }
  };

  const formatDate = (dateString: string): string => {
    const locale = CURRENCY_LOCALES[currentLanguage] || 'en-US';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage: handleSetLanguage, 
      currentCurrency,
      setCurrency: handleSetCurrency,
      currentTheme,
      setTheme: handleSetTheme,
      t, 
      dir,
      formatPrice,
      convertPrice,
      formatDate
    }}>
      {children}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none z-[100] ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {toastMessage}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
