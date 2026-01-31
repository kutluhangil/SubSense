
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LanguageCode } from '../utils/translations';
import { CURRENCY_LOCALES, convertAmount } from '../utils/currency';
import { debugLog } from '../utils/debug';
import { useAuth } from './AuthContext';
import { updateUserSettings } from '../utils/firestore';

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
  formatPrice: (amount: number, currencyCode?: string) => string;
  convert: (amount: number, fromCurrency: string) => number;
  formatDate: (dateString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  // --- Local States (Initialized from LocalStorage fallback) ---
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('userLanguagePreference');
    return (saved === 'en' || saved === 'tr') ? saved : 'en';
  });

  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    const saved = localStorage.getItem('userCurrencyPreference');
    return saved || 'USD';
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
    const saved = localStorage.getItem('userThemePreference');
    return (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'system';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dir = (currentLanguage as string) === 'ar' ? 'rtl' : 'ltr';

  // --- Sync with Firestore Profile (Hydration) ---
  useEffect(() => {
    if (userProfile && userProfile.preferences) {
      const { language, theme, baseCurrency } = userProfile.preferences;
      if (language) setCurrentLanguage(language as LanguageCode);
      if (baseCurrency) setCurrentCurrency(baseCurrency);
      if (theme) setCurrentTheme(theme as ThemeOption);
    }
  }, [userProfile]);

  // --- Persist Changes ---
  
  const persistSettings = (updates: any) => {
    // Local persistence for fallback/guest
    if (updates.language) localStorage.setItem('userLanguagePreference', updates.language);
    if (updates.baseCurrency) localStorage.setItem('userCurrencyPreference', updates.baseCurrency);
    if (updates.theme) localStorage.setItem('userThemePreference', updates.theme);

    // Remote persistence if logged in
    if (currentUser) {
      updateUserSettings(currentUser.uid, {
        ...(updates.language && { language: updates.language }),
        ...(updates.baseCurrency && { baseCurrency: updates.baseCurrency }),
        ...(updates.theme && { theme: updates.theme }),
      });
    }
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = dir;
  }, [currentLanguage, dir]);

  useEffect(() => {
    debugLog('CURRENCY_CONVERSION', `Base currency set to ${currentCurrency}`);
  }, [currentCurrency]);

  // Apply Theme
  useEffect(() => {
    const applyTheme = () => {
      const isDark = 
        currentTheme === 'dark' || 
        (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      const root = document.documentElement;
      debugLog('THEME_SYNC', `Applying Theme: ${currentTheme}`, { isDarkResolved: isDark });

      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    applyTheme();
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
    persistSettings({ language: lang });
    const langName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);
    showToast(`Language changed to ${langName}`);
  };

  const handleSetCurrency = (curr: string) => {
    setCurrentCurrency(curr);
    persistSettings({ baseCurrency: curr });
    showToast(`Base Currency changed to ${curr}`);
  };

  const handleSetTheme = (theme: ThemeOption) => {
    setCurrentTheme(theme);
    persistSettings({ theme: theme });
  };

  const t = (key: string): string => {
    const langDict = translations[currentLanguage];
    if (!langDict) return key; 
    return langDict[key] || translations['en'][key] || key;
  };

  const convert = (amount: number, fromCurrency: string): number => {
    return convertAmount(amount, fromCurrency, currentCurrency);
  };

  const formatPrice = (amount: number, currencyCode: string = currentCurrency): string => {
    const locale = CURRENCY_LOCALES[currentLanguage] || 'en-US';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return `${currencyCode} ${amount.toFixed(2)}`;
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
      convert,
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
