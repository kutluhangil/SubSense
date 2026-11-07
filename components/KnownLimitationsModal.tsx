import React from 'react';
import { X, Cloud, ShieldCheck, Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface KnownLimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KnownLimitationsModal({ isOpen, onClose }: KnownLimitationsModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const limitations = [
    {
      icon: Cloud,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      title: t('limitations.item1.title'),
      desc: t('limitations.item1.desc'),
    },
    {
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
      title: t('limitations.item2.title'),
      desc: t('limitations.item2.desc'),
    },
    {
      icon: Globe,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
      title: t('limitations.item3.title'),
      desc: t('limitations.item3.desc'),
    },
    {
      icon: Sparkles,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
      title: t('limitations.item4.title'),
      desc: t('limitations.item4.desc'),
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded uppercase tracking-wider">
              {t('limitations.badge')}
            </span>
            {t('limitations.title')}
          </h3>
          <button
            onClick={onClose}
            aria-label={t('limitations.close')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('limitations.intro')}
          </p>

          <div className="space-y-4">
            {limitations.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
              >
                <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {t('limitations.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
