
import React from 'react';
import { CreditCard, Globe, Bell, PieChart, Users, Shield, ArrowRight, Zap, Smartphone, Layers, CheckCircle2 } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface FeaturesProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenDemo?: () => void;
}

export default function Features({ onOpenAuth, onOpenDemo }: FeaturesProps) {
  const { t } = useLanguage();

  const features = [
    {
      icon: Layers,
      title: t('features.main.smart_tracking.title'),
      description: t('features.main.smart_tracking.desc')
    },
    {
      icon: Globe,
      title: t('features.main.global_price.title'),
      description: t('features.main.global_price.desc')
    },
    {
      icon: Bell,
      title: t('features.main.payment_reminders.title'),
      description: t('features.main.payment_reminders.desc')
    },
    {
      icon: PieChart,
      title: t('features.main.expense_analytics.title'),
      description: t('features.main.expense_analytics.desc')
    },
    {
      icon: Users,
      title: t('features.main.social_tracking.title'),
      description: t('features.main.social_tracking.desc')
    },
    {
      icon: CreditCard,
      title: t('features.main.multi_currency.title'),
      description: t('features.main.multi_currency.desc')
    }
  ];

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <div className="relative pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
          
          {/* Floating Background Icons */}
          <div className="absolute top-10 left-10 opacity-20 animate-float hidden lg:block">
             <BrandIcon type="netflix" className="w-16 h-16 rounded-2xl shadow-xl" />
          </div>
          <div className="absolute bottom-20 right-20 opacity-20 animate-float-delayed hidden lg:block">
             <BrandIcon type="spotify" className="w-14 h-14 rounded-2xl shadow-xl" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl">
            {t('features.main.hero_title')}
          </h1>
          
          <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('features.main.hero_sub')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button 
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-200"
            >
              {t('hero.start_tracking_free')}
            </button>
            <button 
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              {t('hero.view_live_demo')}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Feature Highlights Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-colors duration-300">
                  <feature.icon size={24} className="text-gray-900 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Interactive Preview / Screenshot Section */}
      <div className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
            Minimal design, powerful insights
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Designed for clarity. Built for control.</h2>
          
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full w-full pointer-events-none"></div>
            
            {/* Mockup Browser Window */}
            <div className="bg-gray-900 rounded-xl p-2 shadow-2xl ring-1 ring-gray-900/10 cursor-pointer" onClick={onOpenDemo}>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] relative flex flex-col group">
                 {/* Fake Browser Header */}
                 <div className="h-8 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 {/* Fake UI Content */}
                 <div className="flex-1 p-8 grid grid-cols-12 gap-6 bg-gray-50 transition-transform duration-500 group-hover:scale-[1.02]">
                    {/* Sidebar */}
                    <div className="col-span-2 bg-white rounded-lg border border-gray-100 hidden md:block"></div>
                    {/* Main */}
                    <div className="col-span-12 md:col-span-10 space-y-6">
                       <div className="h-32 grid grid-cols-3 gap-6">
                          <div className="bg-white rounded-lg border border-gray-100"></div>
                          <div className="bg-white rounded-lg border border-gray-100"></div>
                          <div className="bg-white rounded-lg border border-gray-100"></div>
                       </div>
                       <div className="h-64 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                          <div className="space-y-4 w-3/4">
                             <div className="h-4 bg-gray-100 rounded w-full"></div>
                             <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                             <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Overlay Text */}
                 <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl border border-white/50 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <p className="font-bold text-gray-900 text-lg">Click to Interact</p>
                        <p className="text-gray-500 text-sm">Launch the live demo</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Automation Section */}
      <div className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-8 animate-pulse">
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Let AI handle the boring part.</h2>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            SubSense automatically updates subscription prices, tracks payment dates, and alerts you about global price changes — so you can focus on what matters.
          </p>
        </div>
      </div>

      {/* 5. Social & Collaboration */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-3xl font-bold text-gray-900 mb-6">Stay connected with your friends.</h2>
               <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                 Add friends, share subscriptions, and compare spending habits globally. Discover new services your network loves and split costs easily.
               </p>
               <ul className="space-y-4 mb-8">
                 <li className="flex items-center text-gray-700">
                   <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                     <CheckCircle2 size={14} className="text-green-600" />
                   </div>
                   Share family plans securely
                 </li>
                 <li className="flex items-center text-gray-700">
                   <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                     <CheckCircle2 size={14} className="text-green-600" />
                   </div>
                   See what's trending in your circle
                 </li>
                 <li className="flex items-center text-gray-700">
                   <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                     <CheckCircle2 size={14} className="text-green-600" />
                   </div>
                   Compare global pricing together
                 </li>
               </ul>
            </div>
            
            {/* Visual Representation of Social Card */}
            <div className="relative">
              <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                       <div className="h-4 w-32 bg-gray-900 rounded mb-2"></div>
                       <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                 </div>
                 <div className="flex space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100">NF</div>
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100">SP</div>
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100">YT</div>
                 </div>
                 <div className="w-full bg-gray-900 text-white py-2 rounded-lg text-center text-sm font-medium">{t('friends.add_btn')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Data & Security */}
      <div className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-12 h-12 text-gray-900 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your data stays yours.</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            All information is encrypted and stored securely within the platform. You are always in control of what you share and who sees it. We never sell your personal data.
          </p>
        </div>
      </div>

      {/* 7. Final CTA */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Ready to take control of your subscriptions?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              {t('hero.start_tracking_free')}
            </button>
            <button 
               onClick={() => onOpenAuth('signup')}
               className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all"
            >
              {t('nav.signup')} Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
