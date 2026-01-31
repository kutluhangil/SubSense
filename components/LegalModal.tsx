
import React from 'react';
import { X, Shield, FileText, Lock, ServerOff, Database, AlertTriangle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Terms of Service",
      icon: FileText,
      updated: "MVP Release v1.0",
      intro: "SubscriptionHub is a personal, local-first subscription tracking tool. By using this application, you acknowledge that it is a Minimum Viable Product (MVP) operating entirely on your device.",
      sections: [
        {
          heading: "1. Local-First Usage",
          text: "This application operates locally in your browser. All data you enter (subscriptions, costs, preferences) is stored in your device's Local Storage. We do not have a backend database, and we do not sync your data to the cloud. If you clear your browser cache, your data will be lost."
        },
        {
          heading: "2. User Responsibility",
          text: "You are solely responsible for the accuracy of the data you enter. SubscriptionHub calculates totals based on your inputs. It does not connect to your bank accounts or verify payments with service providers."
        },
        {
          heading: "3. No Financial Advice",
          text: "The insights, savings potentials, and comparisons provided by this app are for informational purposes only. They do not constitute professional financial advice. Do not make financial decisions based solely on this app's data."
        },
        {
          heading: "4. Feature Availability",
          text: "As an MVP, some features (like 'Friends' or 'Global Comparison') may use simulated or static data for demonstration purposes. We make no guarantees regarding the real-time accuracy of currency exchange rates or third-party subscription pricing."
        },
        {
          heading: "5. Limitation of Liability",
          text: "SubscriptionHub is provided 'as is' without warranty of any kind. We are not liable for any data loss, financial discrepancies, or missed payments resulting from the use of this tool."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      icon: Shield,
      updated: "MVP Release v1.0",
      intro: "We believe in privacy by design. Because we don't have a server, we can't see your data even if we wanted to.",
      sections: [
        {
          heading: "1. Data Storage",
          text: "All user data is stored strictly on your local device (in the browser's Local Storage). We do not transmit your subscription details, financial data, or personal profile to any external server."
        },
        {
          heading: "2. No Data Collection",
          text: "We do not collect usage analytics, tracking pixels, or advertising data. We do not sell your data to third parties because we do not possess it."
        },
        {
          heading: "3. No Account Sync",
          text: "Since there is no cloud backend, your account exists only on the device where you created it. There is no password recovery via email because we do not store your email or password."
        },
        {
          heading: "4. External Services",
          text: "The application may request external assets (like logos from Clearbit) directly from your browser. These requests are standard web traffic and are not routed through our servers."
        },
        {
          heading: "5. Data Deletion",
          text: "You can delete all your data instantly by clearing your browser's 'Local Storage' or using the 'Logout' button, which clears the active session. For complete removal, clear your browser cache."
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
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
