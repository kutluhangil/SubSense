
import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import HeroTextRotator from './HeroTextRotator';
import { useLanguage } from '../contexts/LanguageContext';
import ProfileCarousel from './ProfileCarousel';
import FeatureGrid from './FeatureGrid';
import MicroDemoRow from './MicroDemoRow';
import ProfileCardModal, { UserProfile } from './ProfileCardModal';
import PricingSection from './PricingSection';

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export default function Hero({ onOpenDemo, onOpenAuth }: HeroProps) {
  const { t } = useLanguage();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

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
    <div className="relative min-h-screen bg-white overflow-hidden">
      
      {/* 1. Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-blob"></div>
         <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] bg-purple-100/40 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* 2. Hero Content */}
      <div className="relative z-10 pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left Column: Text & CTA */}
              <div className="text-center lg:text-left">
                 <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-sm leading-6 text-blue-700 mb-8 hover:bg-blue-100 transition-colors cursor-default backdrop-blur-sm">
                    <Sparkles size={14} className="mr-2 text-blue-500" />
                    <span>{t('hero.tagline')}</span>
                 </div>

                 <HeroTextRotator />

                 <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
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
                      className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    >
                      {t('hero.view_live_demo')}
                    </button>
                 </div>
                 
                 <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                       <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                       <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                    </div>
                    <span>{t('hero.trusted')}</span>
                 </div>
              </div>

              {/* Right Column: Profile Carousel */}
              <div className="relative h-[400px] lg:h-[500px] flex items-center">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white/80 z-20 pointer-events-none lg:hidden"></div> {/* Fade for mobile */}
                 <ProfileCarousel onProfileClick={setSelectedProfile} />
              </div>

           </div>
        </div>
      </div>

      {/* 3. Feature Overview Grid */}
      <div className="relative z-10 bg-white/50 backdrop-blur-sm border-t border-gray-100/50">
         <FeatureGrid />
      </div>

      {/* 4. Micro Demo Strip */}
      <MicroDemoRow />

      {/* 5. Pricing Section */}
      <div className="relative z-10">
         <PricingSection onOpenAuth={handleAuth} />
      </div>

      {/* 6. Final CTA Section */}
      <div className="relative py-24 px-4 overflow-hidden">
         <div className="absolute inset-0 bg-gray-900 z-0">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         </div>
         <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">{t('hero.join_community')}</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
               {t('hero.take_control_desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button 
                 onClick={() => handleAuth('signup')}
                 className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-xl"
               >
                 {t('hero.start_tracking_free')}
               </button>
               <button 
                 onClick={handleDemo}
                 className="w-full sm:w-auto px-8 py-4 bg-transparent border border-gray-600 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
               >
                 {t('hero.view_live_demo')}
               </button>
            </div>
         </div>
      </div>

      {/* Modal Integration */}
      <ProfileCardModal 
        isOpen={!!selectedProfile} 
        onClose={() => setSelectedProfile(null)} 
        user={selectedProfile} 
      />

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
