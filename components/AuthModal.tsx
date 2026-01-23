import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  onLogin?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialMode, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const { t } = useLanguage();
  
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin();
    }
  };

  return (
     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>
        
        {/* Modal Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100 animate-float-in">
           {/* Close Button */}
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors z-10"
           >
             <X size={20} />
           </button>

           <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mode === 'login' ? t('auth.welcome') : t('auth.create')}
                </h2>
                <p className="text-gray-500 text-sm">
                  {mode === 'login' 
                    ? t('auth.login_desc') 
                    : t('auth.signup_desc')}
                </p>
              </div>

              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button onClick={onLogin} className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-sm group bg-white">
                  <BrandIcon type="google" className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" noBackground />
                  <span>{t('auth.google')}</span>
                </button>
                <button onClick={onLogin} className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-sm group bg-white">
                  <BrandIcon type="apple" className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 text-black" noBackground />
                  <span>{t('auth.apple')}</span>
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Email Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1 rtl:mr-1">{t('auth.email')}</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
                       <Mail size={16} className="text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                     </div>
                     <input 
                       type="email" 
                       className="block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                       placeholder="name@example.com"
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1 rtl:mr-1">{t('auth.password')}</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
                       <Lock size={16} className="text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                     </div>
                     <input 
                       type="password" 
                       className="block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm bg-gray-50/50 focus:bg-white"
                       placeholder="••••••••"
                     />
                   </div>
                </div>

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <a href="#" className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">Forgot password?</a>
                  </div>
                )}

                <button type="submit" className="w-full bg-gray-900 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center justify-center">
                  {mode === 'login' ? t('auth.submit_login') : t('auth.submit_signup')}
                  <ArrowRight size={16} className="ml-2 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
                </button>
              </form>
           </div>

           <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
             <p className="text-sm text-gray-500">
               {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
               <button 
                 onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                 className="font-semibold text-gray-900 hover:underline focus:outline-none"
               >
                 {mode === 'login' ? t('nav.signup') : t('nav.login')}
               </button>
             </p>
           </div>
        </div>
     </div>
  );
}