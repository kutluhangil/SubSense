
import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PricingSectionProps {
  onOpenAuth: (mode: 'signup') => void;
}

export default function PricingSection({ onOpenAuth }: PricingSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('pricing.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
          {/* Free Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pricing.free.title')}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{t('pricing.free.price')}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                {t('pricing.free.desc')}
              </p>
            </div>
            
            <ul className="space-y-4 mb-8">
              {[
                t('pricing.feature.manual'),
                t('pricing.feature.basic_stats'),
                t('pricing.feature.local'),
                t('pricing.feature.currency')
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onOpenAuth('signup')}
              className="w-full py-3 px-6 rounded-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t('pricing.cta.free')}
            </button>
          </div>

          {/* Pro Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 border-2 border-indigo-100 dark:border-indigo-900/50 shadow-2xl shadow-indigo-900/5 dark:shadow-indigo-900/20 transform md:scale-105 z-10 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-3 mr-6">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {t('pricing.pro.badge')}
                </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pricing.pro.title')}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{t('pricing.pro.price')}</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium">{t('pricing.pro.period')}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                {t('pricing.pro.desc')}
              </p>
            </div>
            
            <ul className="space-y-4 mb-8">
              {[
                t('pricing.feature.ai'),
                t('pricing.feature.optimize'),
                t('pricing.feature.global'),
                t('pricing.feature.support'),
                `+ ${t('dashboard.filter.all')} Free features`
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onOpenAuth('signup')}
              className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              {t('pricing.cta.pro')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
