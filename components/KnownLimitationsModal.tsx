
import React from 'react';
import { X, ServerOff, Database, Globe, Zap, ShieldAlert } from 'lucide-react';
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
      icon: ServerOff,
      title: "Local-First Architecture",
      desc: "Your data lives in your browser's Local Storage. If you clear your cache or switch devices, your data will not transfer automatically."
    },
    {
      icon: Globe,
      title: "Currency Rates",
      desc: "We use daily reference rates for conversions. They may not perfectly match real-time bank exchange rates."
    },
    {
      icon: Zap,
      title: "AI Suggestions",
      desc: "Gemini-powered insights are advisory only. Please verify pricing and terms with the actual service providers."
    },
    {
      icon: ShieldAlert,
      title: "Beta Stability",
      desc: "This is a Beta release (v1.0). You may encounter occasional bugs. Please report them via the Feedback button."
    }
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
             <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded uppercase tracking-wider">Beta</span>
             Known Limitations
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
           <p className="text-sm text-gray-600 dark:text-gray-300">
              SubSense is currently in <strong>Public Beta</strong>. We believe in transparency. Here is exactly what works and what doesn't yet.
           </p>

           <div className="space-y-4">
              {limitations.map((item, i) => (
                 <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                    <div className="shrink-0 mt-1">
                       <item.icon className="text-gray-500 dark:text-gray-400" size={20} />
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
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
             I Understand
           </button>
        </div>

      </div>
    </div>
  );
}
