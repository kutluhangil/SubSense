
import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

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
      updated: "October 24, 2023",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          text: "By creating an account on SubscriptionHub, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
        },
        {
          heading: "2. Description of Service",
          text: "SubscriptionHub provides a platform for tracking and managing personal subscription services. We are not a financial institution and do not process payments directly for third-party services."
        },
        {
          heading: "3. User Responsibilities",
          text: "You are responsible for maintaining the confidentiality of your account information, including your password. You agree to provide accurate and current information about your subscriptions."
        },
        {
          heading: "4. Data Accuracy",
          text: "While we strive to provide accurate currency conversion and pricing data, SubscriptionHub cannot guarantee 100% accuracy of third-party pricing or exchange rates. Users should verify charges with their actual service providers."
        },
        {
          heading: "5. Termination",
          text: "We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
        },
        {
          heading: "6. Limitation of Liability",
          text: "In no event shall SubscriptionHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      icon: Shield,
      updated: "October 24, 2023",
      sections: [
        {
          heading: "1. Information We Collect",
          text: "We collect information you provide directly to us, such as your name, email address, and details about the subscriptions you track (service names, costs, billing dates)."
        },
        {
          heading: "2. How We Use Your Data",
          text: "We use your data to provide, maintain, and improve our services, including generating spending analytics, sending payment reminders, and personalizing your dashboard experience."
        },
        {
          heading: "3. Data Security",
          text: "We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest. We do not sell your personal data to third parties."
        },
        {
          heading: "4. Subscription Data",
          text: "Subscription data is aggregated and anonymized to provide global pricing insights and trends. This aggregated data cannot be used to identify you personally."
        },
        {
          heading: "5. Your Rights",
          text: "You have the right to access, correct, or delete your personal information at any time. You can delete your account and all associated data directly from the Settings page."
        },
        {
          heading: "6. Third-Party Links",
          text: "Our service may contain links to third-party web sites or services that are not owned or controlled by SubscriptionHub. We assume no responsibility for the content, privacy policies, or practices of any third party web sites."
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
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-900">
              <currentContent.icon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{currentContent.title}</h2>
              <p className="text-xs text-gray-500">Last updated: {currentContent.updated}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gray-50/50">
           {currentContent.sections.map((section, idx) => (
             <div key={idx}>
               <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">{section.heading}</h3>
               <p className="text-sm text-gray-600 leading-relaxed">{section.text}</p>
             </div>
           ))}
           
           <div className="pt-8 border-t border-gray-200">
             <p className="text-xs text-gray-500">
               If you have any questions about these terms, please contact us at <a href="#" className="text-blue-600 hover:underline">legal@subscriptionhub.com</a>.
             </p>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
