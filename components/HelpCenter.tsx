
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, PlayCircle, CreditCard, Globe, Users, PieChart, Settings, Mail, HelpCircle, ThumbsUp, ThumbsDown, AlertTriangle, Database, Info, ServerOff, WifiOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ContactSupportModal from './ContactSupportModal';

const CATEGORIES = [
  { 
    id: 'start', 
    label: 'Getting Started', 
    icon: PlayCircle, 
    color: 'text-blue-600 dark:text-blue-400', 
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'Local-first architecture & basics'
  },
  { 
    id: 'subs', 
    label: 'Subscriptions', 
    icon: CreditCard, 
    color: 'text-purple-600 dark:text-purple-400', 
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    description: 'Management & persistence'
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: PieChart, 
    color: 'text-violet-600 dark:text-violet-400', 
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    description: 'Trends & generated history'
  },
  { 
    id: 'limitations', 
    label: 'Known Limitations', 
    icon: AlertTriangle, 
    color: 'text-amber-600 dark:text-amber-400', 
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    description: 'MVP boundaries & transparency'
  },
  { 
    id: 'compare', 
    label: 'Compare (Beta)', 
    icon: Globe, 
    color: 'text-green-600 dark:text-green-400', 
    bg: 'bg-green-50 dark:bg-green-900/20',
    description: 'Reference data & disclaimers'
  },
  { 
    id: 'social', 
    label: 'Friends (Demo)', 
    icon: Users, 
    color: 'text-orange-600 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    description: 'Concept features'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    color: 'text-gray-600 dark:text-gray-400', 
    bg: 'bg-gray-50 dark:bg-gray-700/50',
    description: 'Preferences & export'
  },
];

const FAQS = [
  // A. Getting Started
  {
    id: 'local-first',
    category: 'start',
    question: 'How is my data stored?',
    answer: "SubscriptionHub is a 'local-first' application. All your data (subscriptions, settings, profile) is stored securely in your browser's Local Storage. We do not have a backend database, and your data never leaves your device unless you manually export it."
  },
  {
    id: 'currency-region',
    category: 'start',
    question: 'How does currency work?',
    answer: "The application uses a 'Regional Preference' setting (found in the footer or Settings page) to determine the display currency. Changing this setting converts all values using a fixed exchange rate for display purposes. It does not change the original billing currency of your subscriptions."
  },
  {
    id: 'account-recovery',
    category: 'start',
    question: 'Can I log in from another device?',
    answer: "No. Since data is stored locally in your browser, your account does not sync across devices. To move data, use the 'Export CSV' feature in Settings and manually re-enter it on a new device."
  },

  // B. Subscriptions Management
  {
    id: 'add-edit',
    category: 'subs',
    question: 'Adding and editing subscriptions',
    answer: "You can add subscriptions via the Dashboard. When editing, you can change the price, billing cycle (Monthly/Yearly), and currency. These changes are saved immediately to your local storage."
  },
  {
    id: 'persistence',
    category: 'subs',
    question: 'What happens if I clear my cache?',
    answer: "WARNING: Clearing your browser's cache or 'Local Storage' will permanently delete all your subscription data. We recommend using the Export feature regularly to keep a backup."
  },
  {
    id: 'mark-paid',
    category: 'subs',
    question: 'How does "Mark as Paid" work?',
    answer: "Clicking the checkmark on a subscription advances the 'Next Payment' date by one billing cycle (1 month or 1 year) and logs a payment record in your local history for analytics."
  },

  // C. Analytics & Insights
  {
    id: 'data-generation',
    category: 'analytics',
    question: 'Where does historical data come from?',
    answer: "The analytics engine generates historical data based on your current active subscriptions and their billing cycles. It projects past payments to create a trend line. It does not connect to your bank account."
  },
  {
    id: 'date-filters',
    category: 'analytics',
    question: 'Date filters',
    answer: "The date selector (Last 30 Days, 6 Months, etc.) dynamically recalculates the charts. Selecting a different range filters the generated payment events to show only those falling within that window."
  },
  {
    id: 'savings-goals',
    category: 'analytics',
    question: 'Savings Goals',
    answer: "The Savings Goal widget compares your 'Total Saved' value (accumulated from deleted subscriptions) against a manual target you set. It is a motivational tool, not a financial ledger."
  },

  // D. Limitations (New Section)
  {
    id: 'limit-storage',
    category: 'limitations',
    question: 'Data & Persistence',
    answer: "SubscriptionHub operates entirely in your browser. There is no cloud sync. If you use the app in Incognito mode or clear your browser data, your subscriptions will be lost. There is no 'password recovery' because we do not store your password."
  },
  {
    id: 'limit-currency',
    category: 'limitations',
    question: 'Currency & Pricing',
    answer: "Exchange rates are based on periodic snapshots and are not live market rates. Comparisons are for informational purposes only and may vary from actual bank charges."
  },
  {
    id: 'limit-analytics',
    category: 'limitations',
    question: 'Analytics Accuracy',
    answer: "Historical charts are simulated projections based on your current active subscriptions. The app does not know about payments you made before you added a subscription."
  },
  {
    id: 'limit-friends',
    category: 'limitations',
    question: 'Friends & Social Features',
    answer: "The 'Friends' section is currently a conceptual demo. The profiles shown are simulated. You cannot currently send messages, add real users, or sync data with others."
  },
  {
    id: 'limit-support',
    category: 'limitations',
    question: 'Support Availability',
    answer: "The 'Contact Support' form is currently simulated. While we value feedback, there is no guaranteed response time for this MVP release."
  },

  // E. Compare Page
  {
    id: 'compare-data',
    category: 'compare',
    question: 'Is the pricing data real-time?',
    answer: "No. The Regional Price Comparison uses a curated dataset of reference prices for major services (e.g., Netflix, Spotify) across different countries. These are for informational purposes only and may not reflect the absolute latest price changes."
  },
  {
    id: 'savings-disabled',
    category: 'compare',
    question: 'Why is "Potential Savings" disabled?',
    answer: "The 'Potential Annual Savings' calculator is currently disabled while we improve our multi-currency normalization logic to ensure accuracy. It will be re-enabled in a future update."
  },

  // F. Friends & Social
  {
    id: 'demo-status',
    category: 'social',
    question: 'Is the Friends feature real?',
    answer: "The Friends & Social section is currently a Concept Demo. The profiles you see are simulated examples to demonstrate how social sharing might look. You cannot currently send real messages or sync with other users."
  },
  {
    id: 'privacy',
    category: 'social',
    question: 'Privacy of shared data',
    answer: "Since the social feature is a demo, no actual data is shared over the internet. Your subscription details remain private on your device."
  },

  // G. Settings
  {
    id: 'csv-export',
    category: 'settings',
    question: 'Exporting data',
    answer: "You can download a .CSV file containing your subscription names, prices, and billing dates from the Settings page. This file can be opened in Excel or Google Sheets."
  },
  {
    id: 'theme',
    category: 'settings',
    question: 'Dark Mode',
    answer: "You can toggle between Light, Dark, or System theme preferences. This setting is saved in your browser's local storage."
  }
];

const BackgroundVisual = ({ categoryId }: { categoryId: string }) => {
  const commonClasses = "absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.05] pointer-events-none transition-all duration-700 ease-in-out";
  switch(categoryId) {
    case 'limitations':
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
           <path d="M200 50 L350 350 L50 350 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
           <circle cx="200" cy="200" r="50" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case 'start':
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
           <path d="M50 200 L150 200 L150 300 L50 300 Z" fill="none" stroke="currentColor" strokeWidth="2" />
           <path d="M200 100 L300 100 L300 200 L200 200 Z" fill="none" stroke="currentColor" strokeWidth="2" />
           <circle cx="200" cy="200" r="10" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
           <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 10" />
        </svg>
      );
  }
};

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { t } = useLanguage();

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === faq.category;
    return searchQuery ? matchesSearch : matchesCategory;
  });

  const activeCategoryData = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="relative min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12 animate-in fade-in duration-500">
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className={activeCategory === 'limitations' ? 'text-amber-500' : 'text-gray-900 dark:text-white'}>
            <BackgroundVisual categoryId={activeCategory} />
         </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Help Center</h1>
           <p className="text-gray-500 dark:text-gray-400">Documentation and support for SubscriptionHub MVP.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Navigation */}
           <div className="lg:col-span-4 space-y-6 sticky top-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-1">
                 <div className="relative">
                    <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input 
                       type="text" 
                       placeholder="Search docs..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none placeholder-gray-400 text-gray-900 dark:text-white"
                    />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                 <div className="p-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Topics</h3>
                 </div>
                 <div className="p-2 space-y-1">
                    {CATEGORIES.map(cat => (
                       <button
                          key={cat.id}
                          onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                          className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group text-left ${
                             activeCategory === cat.id && !searchQuery
                             ? `${cat.bg} shadow-sm ring-1 ring-black/5 dark:ring-white/10` 
                             : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                       >
                          <div className={`p-2 rounded-lg ${activeCategory === cat.id ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600'} transition-colors mr-3`}>
                             <cat.icon size={18} className={activeCategory === cat.id ? cat.color : 'text-gray-500 dark:text-gray-400'} />
                          </div>
                          <div>
                             <span className={`block text-sm font-bold ${activeCategory === cat.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                {cat.label}
                             </span>
                             <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                {cat.description}
                             </span>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Content */}
           <div className="lg:col-span-8 space-y-6">
              
              {!searchQuery && (
                 <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                       <div className={`inline-flex p-3 rounded-xl mb-4 ${activeCategoryData?.bg}`}>
                          {activeCategoryData && React.createElement(activeCategoryData.icon, { size: 24, className: activeCategoryData.color })}
                       </div>
                       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeCategoryData?.label}</h2>
                       <p className="text-gray-500 dark:text-gray-400 max-w-md">
                          {activeCategoryData?.description}
                       </p>
                    </div>
                 </div>
              )}

              {/* Special Warning Banner for Limitations */}
              {activeCategory === 'limitations' && !searchQuery && (
                 <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg shrink-0">
                       <ServerOff size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">MVP Notice</h3>
                       <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                          SubscriptionHub is currently in MVP (Minimum Viable Product) stage. 
                          Features listed below have intentional boundaries to ensure a stable, reliable local experience without backend complexity.
                       </p>
                    </div>
                 </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                 {filteredFaqs.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                       {filteredFaqs.map((faq) => (
                          <div key={faq.id} className="group">
                             <button 
                                onClick={() => toggleItem(faq.id)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
                             >
                                <div className="flex items-center gap-3">
                                   {faq.category === 'limitations' ? (
                                      <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />
                                   ) : (
                                      <HelpCircle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                                   )}
                                   <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
                                </div>
                                {openItems.includes(faq.id) ? (
                                   <ChevronUp size={18} className="text-blue-500" />
                                ) : (
                                   <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                )}
                             </button>
                             {openItems.includes(faq.id) && (
                                <div className="px-6 pb-6 pt-0 ml-7">
                                   <div className={`text-sm leading-relaxed p-4 rounded-xl border animate-in fade-in slide-in-from-top-1 duration-200 ${
                                      faq.category === 'limitations' 
                                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-100'
                                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                   }`}>
                                      {faq.answer}
                                   </div>
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-12 text-center">
                       <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700 mb-4">
                          <Search size={28} className="text-gray-400" />
                       </div>
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white">No results found</h3>
                       <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search terms or browse the categories.</p>
                    </div>
                 )}
              </div>

              {/* Support Footer Block */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                 
                 <div className="relative z-10 sm:flex items-center justify-between">
                    <div className="mb-6 sm:mb-0">
                       <div className="flex items-center gap-2 mb-3 text-gray-300">
                          <Info size={16} />
                          <span className="text-sm font-medium">MVP Support</span>
                       </div>
                       <h3 className="text-xl font-bold mb-2">Report an Issue</h3>
                       <p className="text-gray-400 text-sm max-w-sm">Found a bug? Let us know. Note that response times may vary for this preview release.</p>
                    </div>
                    <div>
                       <button 
                         onClick={() => setIsContactModalOpen(true)}
                         className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-md active:scale-95 w-full sm:w-auto"
                       >
                          <Mail size={18} />
                          <span>Contact Support</span>
                       </button>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>

      <ContactSupportModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
}
