import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LanguageCode } from '../utils/translations';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or default to 'en'
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userLanguagePreference');
      return (saved as LanguageCode) || 'en';
    }
    return 'en';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direction logic: Arabic is RTL, others LTR for now
  const dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

  // Persist language and update document direction
  useEffect(() => {
    localStorage.setItem('userLanguagePreference', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = dir;
    
    // Show toast for 2 seconds when language changes (skipping initial load)
    const langName = new Intl.DisplayNames([currentLanguage], { type: 'language' }).of(currentLanguage);
    setToastMessage(`Language changed to ${langName}`);
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [currentLanguage, dir]);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string): string => {
    const langDict = translations[currentLanguage];
    if (!langDict) return key; // Fallback if language is missing
    return langDict[key] || translations['en'][key] || key; // Fallback to EN or key
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, dir }}>
      {children}
      {/* Simple Toast Notification */}
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