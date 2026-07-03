
import React from 'react';
import { Sparkles } from 'lucide-react';
import HeroTextRotator from './HeroTextRotator';
import { useLanguage } from '../contexts/LanguageContext';
import FloatingLogoLayer from './FloatingLogoLayer';
import HeroDashboardMockup from './HeroDashboardMockup';
import FeatureGrid from './FeatureGrid';
import MicroDemoRow from './MicroDemoRow';
import PricingSection from './PricingSection';
import FinalCTA from './FinalCTA';

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export default function Hero({ onOpenDemo, onOpenAuth }: HeroProps) {
  const { t } = useLanguage();

  const handleAuth = (mode: 'login' | 'signup') => {
    if (onOpenAuth) onOpenAuth(mode);
  };

  const handleDemo = () => {
    if (onOpenDemo) {
      onOpenDemo();
    } else {
      // Fallback — open the public live demo in a new tab
      window.open('https://sub-sense-ashy.vercel.app', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      
      {/* 1. Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Dot-grid texture for depth */}
         <div className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35] [background-image:radial-gradient(circle,rgba(99,102,241,0.18)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,#000_30%,transparent_75%)]"></div>
         {/* Aurora glow */}
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200/40 dark:bg-blue-900/25 rounded-full blur-[120px] animate-blob"></div>
         <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] bg-purple-200/40 dark:bg-purple-900/25 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] bg-indigo-100/50 dark:bg-indigo-900/25 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
         {/* Drifting real subscription brand logos */}
         <FloatingLogoLayer />
      </div>

      {/* 2. Hero Content */}
      <div className="relative z-10 pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left Column: Text & CTA */}
              <div className="text-center lg:text-left">
                 <div className="inline-flex items-center rounded-full border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/30 px-3 py-1 text-sm leading-6 text-blue-700 dark:text-blue-300 mb-8 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-default backdrop-blur-sm">
                    <Sparkles size={14} className="mr-2 text-blue-500" />
                    <span>{t('hero.tagline')}</span>
                 </div>

                 <HeroTextRotator />

                 <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {t('hero.take_control_desc')}
                 </p>

                 <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-10">
                    <button 
                      onClick={() => handleAuth('signup')}
                      className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      {t('hero.start_tracking_free')}
                    </button>
                    <button 
                      onClick={handleDemo}
                      className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    >
                      {t('hero.view_live_demo')}
                    </button>
                 </div>
                 
                 <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
                       <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-500 border-2 border-white dark:border-gray-800"></div>
                       <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-400 border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <span>{t('hero.trusted')}</span>
                 </div>
              </div>

              {/* Right Column: Product Mockup */}
              <div className="relative flex items-center justify-center py-8 lg:py-0">
                 <HeroDashboardMockup />
              </div>

           </div>
        </div>
      </div>

      {/* 3. Feature Overview Grid */}
      <div className="relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-100/50 dark:border-gray-800/50">
         <FeatureGrid />
      </div>

      {/* 4. Micro Demo Strip */}
      <MicroDemoRow />

      {/* 5. Pricing Section */}
      <div className="relative z-10">
         <PricingSection onOpenAuth={handleAuth} />
      </div>

      {/* 6. Final CTA Section */}
      <div className="relative z-10">
         <FinalCTA onStart={() => handleAuth('signup')} onDemo={handleDemo} />
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
