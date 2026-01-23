
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LanguageCode } from '../utils/translations';
import { EXCHANGE_RATES, CURRENCY_LOCALES } from '../utils/currency';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentCurrency: string;
  setCurrency: (currency: string) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  formatDate: (dateString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or default
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userLanguagePreference');
      return (saved as LanguageCode) || 'en';
    }
    return 'en';
  });

  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCurrencyPreference');
      return saved || 'USD';
    }
    return 'USD';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direction logic
  const dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('userLanguagePreference', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = dir;
  }, [currentLanguage, dir]);

  useEffect(() => {
    localStorage.setItem('userCurrencyPreference', currentCurrency);
  }, [currentCurrency]);

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
      // Fallback if locale/currency combo is invalid
      return `${currentCurrency} ${convertedAmount.toFixed(2)}`;
    }
  };

  // Date Logic
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
      t, 
      dir,
      formatPrice,
      convertPrice,
      formatDate
    }}>
      {children}
      {/* Toast Notification */}
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
