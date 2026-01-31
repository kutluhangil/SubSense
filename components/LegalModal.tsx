
import React from 'react';
import { X, Shield, FileText, Lock, ServerOff, Database, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const content = {
    terms: {
      title: t('legal.terms.title'),
      icon: FileText,
      updated: "Release v1.0",
      intro: t('legal.intro'),
      sections: [
        {
          heading: t('legal.section.local'),
          text: t('legal.section.local_text')
        },
        {
          heading: t('legal.section.resp'),
          text: t('legal.section.resp_text')
        },
        {
          heading: t('legal.section.financial'),
          text: t('legal.section.financial_text')
        },
        {
          heading: "4. AI & Currency Limitations",
          text: "Currency conversions are estimates based on periodic rates. AI-generated insights are for informational purposes only and should not be considered financial advice. Please verify prices with service providers."
        },
        {
          heading: "5. Limitation of Liability", 
          text: "SubscriptionHub is provided 'as is' without warranty of any kind. We are not liable for any data loss, financial discrepancies, or issues arising from the use of this tool."
        }
      ]
    },
    privacy: {
      title: t('legal.privacy.title'),
      icon: Shield,
      updated: "Release v1.0",
      intro: "We believe in privacy by design. Your data belongs to you.",
      sections: [
        {
          heading: t('legal.section.privacy_data'),
          text: t('legal.section.privacy_data_text')
        },
        {
          heading: "2. No Data Collection",
          text: "We do not collect usage analytics, tracking pixels, or advertising data. All subscription data is stored locally on your device."
        },
        {
          heading: "3. AI Processing",
          text: "When using AI features, a sanitized, anonymous snapshot of your subscription data (names, prices) is sent to Google Gemini for analysis. No personal identifiers (email, name) are shared with the AI."
        }
      ]
    }
  };

  const currentContent = content[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
              <currentContent.icon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{currentContent.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Version: {currentContent.updated}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gray-50/50 dark:bg-gray-900/50">
           
           <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                 {currentContent.intro}
              </p>
           </div>

           <div className="space-y-8">
             {currentContent.sections.map((section, idx) => (
               <div key={idx}>
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide flex items-center gap-2">
                    {section.heading}
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{section.text}</p>
               </div>
             ))}
           </div>
           
           <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ServerOff size={14} />
                <span>Local-First Architecture • No Cloud Sync • No Data Mining</span>
             </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
          >
            {t('legal.close')}
          </button>
        </div>

      </div>
    </div>
  );
}
