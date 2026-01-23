
import React from 'react';
import { Globe, DollarSign, Sparkles } from 'lucide-react';
import { LANGUAGES, CURRENCIES } from '../utils/data';
import Logo from './Logo';
import HintCardCarousel from './HintCardCarousel';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageCode } from '../utils/translations';

export default function Footer() {
  const { currentLanguage, setLanguage, currentCurrency, setCurrency, t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-12 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#1B3A6D]/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-24 w-96 h-96 bg-[#3ABEFF]/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 items-center">
          
          {/* Left Side - Animated Branding & Hints */}
          <div className="col-span-1 group cursor-default">
             <div className="flex items-center space-x-3 mb-6 transition-transform duration-500 hover:scale-105 origin-left rtl:origin-right">
                <Logo className="h-12" />
             </div>
             
             {/* New Interactive Hint Card Carousel */}
             <HintCardCarousel />
          </div>

          {/* Right Side - Settings */}
          <div className="flex flex-col md:items-end">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full w-fit">
              <Globe size={12} /> {t('footer.region')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Language Selector */}
              <div className="relative group w-full md:w-auto">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-[2px]"></div>
                 <div className="relative flex items-center bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm hover:border-gray-200 transition-colors w-full">
                   <Globe className="w-5 h-5 text-gray-400 mr-3 rtl:mr-0 rtl:ml-3 group-hover:text-gray-900 transition-colors" />
                   <div className="flex flex-col flex-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t('footer.language')}</label>
                      <select 
                        className="bg-transparent text-sm font-semibold text-gray-900 border-none focus:ring-0 cursor-pointer p-0 pr-8 rtl:pr-0 rtl:pl-8 outline-none appearance-none min-w-[140px]"
                        value={currentLanguage}
                        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                   </div>
                 </div>
                 
                 {/* AI Tooltip */}
                 <div className="absolute top-full left-0 mt-2 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 hidden md:block">
                    <div className="bg-gray-900 text-white text-[10px] p-2 rounded-lg shadow-lg flex items-start gap-2">
                       <Sparkles size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                       {t('footer.ai_tooltip')}
                    </div>
                 </div>
              </div>

              {/* Currency Selector */}
              <div className="relative group w-full md:w-auto">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-[2px]"></div>
                 <div className="relative flex items-center bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm hover:border-gray-200 transition-colors w-full">
                   <DollarSign className="w-5 h-5 text-gray-400 mr-3 rtl:mr-0 rtl:ml-3 group-hover:text-gray-900 transition-colors" />
                   <div className="flex flex-col flex-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t('footer.currency')}</label>
                      <select 
                        className="bg-transparent text-sm font-semibold text-gray-900 border-none focus:ring-0 cursor-pointer p-0 pr-8 rtl:pr-0 rtl:pl-8 outline-none appearance-none min-w-[140px]"
                        value={currentCurrency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        {CURRENCIES.map(curr => (
                          <option key={curr.code} value={curr.code}>{curr.code} ({curr.symbol})</option>
                        ))}
                      </select>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center relative z-10">
          <p className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-300">
            &copy; {new Date().getFullYear()} {t('footer.rights')}
          </p>
          <div className="flex space-x-8 rtl:space-x-reverse mt-6 md:mt-0">
             <a href="#" className="text-gray-400 hover:text-blue-500 transform hover:scale-110 transition-all duration-300">
               <span className="sr-only">Twitter</span>
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
             </a>
             <a href="#" className="text-gray-400 hover:text-gray-900 transform hover:scale-110 transition-all duration-300">
               <span className="sr-only">GitHub</span>
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
             </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </footer>
  );
}
