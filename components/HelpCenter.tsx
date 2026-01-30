
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, PlayCircle, CreditCard, Globe, Users, PieChart, Settings, Mail, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ContactSupportModal from './ContactSupportModal';

// ... (Keep existing static data CATEGORIES and FAQS exactly as they are) ...
const CATEGORIES = [
  { 
    id: 'start', 
    label: 'Getting Started', 
    icon: PlayCircle, 
    color: 'text-blue-600 dark:text-blue-400', 
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'Account setup & basics'
  },
  { 
    id: 'subs', 
    label: 'Subscription Management', 
    icon: CreditCard, 
    color: 'text-purple-600 dark:text-purple-400', 
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    description: 'Adding & editing services'
  },
  { 
    id: 'analytics', 
    label: 'Analytics & Insights', 
    icon: PieChart, 
    color: 'text-violet-600 dark:text-violet-400', 
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    description: 'Trends & spending habits'
  },
  { 
    id: 'compare', 
    label: 'Global Comparison', 
    icon: Globe, 
    color: 'text-green-600 dark:text-green-400', 
    bg: 'bg-green-50 dark:bg-green-900/20',
    description: 'Regional pricing & currency'
  },
  { 
    id: 'profile', 
    label: 'Profile & Friends', 
    icon: Users, 
    color: 'text-orange-600 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    description: 'Social & account details'
  },
  { 
    id: 'settings', 
    label: 'Settings & Preferences', 
    icon: Settings, 
    color: 'text-gray-600 dark:text-gray-400', 
    bg: 'bg-gray-50 dark:bg-gray-700/50',
    description: 'Notifications & privacy'
  },
];

const FAQS = [
  // 1. Getting Started
  {
    id: 'create-account',
    category: 'start',
    question: 'How do I create an account?',
    answer: "Click the 'Sign up' button on the homepage or login screen. You can sign up using your email address or continue with Google/Apple for a faster experience."
  },
  {
    id: 'login-logout',
    category: 'start',
    question: 'Logging in and out',
    answer: "To log in, use your email/password or social provider. To log out, click the 'Log out' button at the bottom of the sidebar menu."
  },
  {
    id: 'dashboard-overview',
    category: 'start',
    question: 'Dashboard overview',
    answer: "Your Dashboard is the central hub. It shows your active subscriptions, monthly spending summary, upcoming payments timeline, and quick access to analytics widgets."
  },
  {
    id: 'first-sub',
    category: 'start',
    question: 'Adding your first subscription',
    answer: "Click the 'Add Subscription' button on the dashboard. Search for a service (e.g., Netflix), select it, and enter your plan details to start tracking."
  },

  // 2. Subscription Management
  {
    id: 'manual-add',
    category: 'subs',
    question: 'Adding subscriptions manually',
    answer: "If you can't find a service in our database, you can still track it. Use the 'Add Subscription' button and fill in the custom details for name, price, and billing cycle."
  },
  {
    id: 'edit-sub',
    category: 'subs',
    question: 'Editing price and billing cycle',
    answer: "Click on any subscription in your list to open its details. From there, you can update the price, currency, billing cycle (Monthly/Yearly), and next payment date."
  },
  {
    id: 'reminders',
    category: 'subs',
    question: 'How do payment reminders work?',
    answer: "We automatically send a notification 3 days before a subscription renewal date. You can enable or disable these reminders in the subscription details modal."
  },
  {
    id: 'active-expiring',
    category: 'subs',
    question: 'Active vs Expiring subscriptions',
    answer: "Active subscriptions are ongoing. 'Expiring' status appears if you've marked a subscription to cancel or if the billing date is approaching without renewal confirmation."
  },
  {
    id: 'delete-sub',
    category: 'subs',
    question: 'Deleting a subscription',
    answer: "To remove a subscription, open its details card and click the 'Delete' button (trash icon). This removes it from your dashboard and calculations."
  },

  // 3. Analytics & Insights
  {
    id: 'monthly-yearly',
    category: 'analytics',
    question: 'Viewing monthly vs yearly spend',
    answer: "Go to the Analytics page to see your 'Lifetime Spend' and monthly breakdown. The Dashboard also provides a quick snapshot of your monthly total."
  },
  {
    id: 'spending-trends',
    category: 'analytics',
    question: 'Understanding spending trends',
    answer: "The Spending Trend chart on the Analytics page visualizes your expenses over the last 6 months, helping you identify spikes or reductions in your budget."
  },
  {
    id: 'cost-distribution',
    category: 'analytics',
    question: 'Cost distribution by category',
    answer: "We categorize your subscriptions (Entertainment, Productivity, etc.) and show a breakdown chart so you know exactly which areas consume most of your budget."
  },
  {
    id: 'ai-insights',
    category: 'analytics',
    question: 'What are AI Savings Insights?',
    answer: "Our AI analyzes your subscriptions to find optimization opportunities, such as identifying duplicate services (e.g., Spotify + Apple Music) or suggesting annual plans."
  },

  // 4. Global Comparison
  {
    id: 'regional-pricing',
    category: 'compare',
    question: 'Comparing regional pricing',
    answer: "Use the 'Compare' page to select a service (e.g., Netflix) and see how its price varies across different countries like the US, UK, India, and Turkey."
  },
  {
    id: 'currency-diff',
    category: 'compare',
    question: 'Currency differences',
    answer: "All prices in the comparison tool are converted to your selected base currency (default USD) using real-time exchange rates for accurate comparison."
  },
  {
    id: 'price-history',
    category: 'compare',
    question: 'Price history charts',
    answer: "We track historical price changes for major services. The charts on the Compare page show how prices have fluctuated over the last 6 months in different regions."
  },

  // 5. Profile & Friends
  {
    id: 'edit-profile',
    category: 'profile',
    question: 'Editing profile details',
    answer: "Navigate to the Profile page to update your avatar, bio, location, and website. Changes are reflected immediately on your public profile card."
  },
  {
    id: 'profile-visibility',
    category: 'profile',
    question: 'Profile visibility settings',
    answer: "You can control who sees your profile in Settings. Options include Public (visible to everyone), Friends Only, or Private."
  },
  {
    id: 'friends-list',
    category: 'profile',
    question: 'Managing your friends list',
    answer: "Go to the Friends page to see your connections. You can add new friends by username or remove existing connections."
  },
  {
    id: 'shared-subs',
    category: 'profile',
    question: 'Viewing shared subscriptions',
    answer: "When viewing a friend's profile, you'll see a 'Shared with You' section highlighting services you both subscribe to."
  },
  {
    id: 'badges',
    category: 'profile',
    question: 'How to earn badges',
    answer: "Badges are awarded for milestones like 'Top Saver', 'Active Tracker', or 'Global Explorer'. They appear on your profile automatically when earned."
  },

  // 6. Settings & Preferences
  {
    id: 'notifications',
    category: 'settings',
    question: 'Managing notifications',
    answer: "In Settings, you can toggle alerts for 'Payment Due', 'Price Alerts', and 'Weekly Digest' emails."
  },
  {
    id: 'privacy-settings',
    category: 'settings',
    question: 'Privacy controls',
    answer: "Use the 'Privacy & Visibility' section in Settings to hide your spending stats or subscriptions from your public profile."
  },
  {
    id: 'ai-settings',
    category: 'settings',
    question: 'AI personalization',
    answer: "You can enable or disable 'Smart Suggestions' and 'Focus Area' in Settings to tailor the AI insights to your specific goals (e.g., Budget Saving vs Social Trends)."
  },
  {
    id: 'appearance',
    category: 'settings',
    question: 'Changing appearance (Dark Mode)',
    answer: "In your Profile or Settings page, select your preferred theme: Light, Dark, or System (auto-matches your device)."
  }
];

// ... (Keep BackgroundVisual and SmartHelpAssistant as they are) ...
const BackgroundVisual = ({ categoryId }: { categoryId: string }) => {
  // Returns a subtle SVG pattern based on category
  const commonClasses = "absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.05] pointer-events-none transition-all duration-700 ease-in-out";
  
  switch(categoryId) {
    case 'start': // Dashboard-like charts
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="100" fill="#3B82F6" className="animate-pulse" />
          <rect x="200" y="200" width="150" height="150" rx="20" fill="#60A5FA" />
          <path d="M300 50 L350 150 L250 150 Z" fill="#93C5FD" />
        </svg>
      );
    // ... (Use same logic for other cases, colors generally work fine in dark mode as accents)
    default: 
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="350" r="80" fill="#9CA3AF" />
          <circle cx="350" cy="50" r="60" fill="#D1D5DB" />
          <rect x="150" y="150" width="100" height="100" rx="20" fill="#E5E7EB" transform="rotate(45 200 200)" />
        </svg>
      );
  }
};

// --- Main Component ---

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down' | null>>({});
  const { t } = useLanguage();

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackState(prev => ({ ...prev, [id]: type }));
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
      
      {/* Background Visual Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <BackgroundVisual categoryId={activeCategory} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Help Center</h1>
           <p className="text-gray-500 dark:text-gray-400">Find answers, guides, and support for your journey.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* LEFT COLUMN: Navigation & Search */}
           <div className="lg:col-span-4 space-y-6 sticky top-6">
              
              {/* Search Box */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-1">
                 <div className="relative">
                    <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input 
                       type="text" 
                       placeholder="Search help topics..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none placeholder-gray-400 text-gray-900 dark:text-white"
                    />
                 </div>
              </div>

              {/* Categories Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                 <div className="p-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Browse Topics</h3>
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

           {/* RIGHT COLUMN: Content */}
           <div className="lg:col-span-8 space-y-6">
              
              {/* Category Header */}
              {!searchQuery && (
                 <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                       <div className={`inline-flex p-3 rounded-xl mb-4 ${activeCategoryData?.bg}`}>
                          {activeCategoryData && React.createElement(activeCategoryData.icon, { size: 24, className: activeCategoryData.color })}
                       </div>
                       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeCategoryData?.label}</h2>
                       <p className="text-gray-500 dark:text-gray-400 max-w-md">Frequently asked questions and guides about {activeCategoryData?.label.toLowerCase()}.</p>
                    </div>
                 </div>
              )}

              {/* FAQ Accordion */}
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
                                   <HelpCircle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
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
                                   <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-1 duration-200">
                                      {faq.answer}
                                      <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700 flex items-center gap-4">
                                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Was this helpful?</span>
                                         <button 
                                            onClick={() => handleFeedback(faq.id, 'up')}
                                            className={`transition-colors ${feedbackState[faq.id] === 'up' ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                                         >
                                            <ThumbsUp size={14} className={feedbackState[faq.id] === 'up' ? 'fill-current' : ''} />
                                         </button>
                                         <button 
                                            onClick={() => handleFeedback(faq.id, 'down')}
                                            className={`transition-colors ${feedbackState[faq.id] === 'down' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                         >
                                            <ThumbsDown size={14} className={feedbackState[faq.id] === 'down' ? 'fill-current' : ''} />
                                         </button>
                                         {feedbackState[faq.id] && (
                                            <span className="text-[10px] text-gray-400 animate-in fade-in">Thanks for your feedback!</span>
                                         )}
                                      </div>
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
                 {/* Decorative background shapes */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                 
                 <div className="relative z-10 sm:flex items-center justify-between">
                    <div className="mb-6 sm:mb-0">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="flex -space-x-2">
                             <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">JD</div>
                             <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">AS</div>
                             <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-400 flex items-center justify-center text-gray-600 text-xs font-bold">MK</div>
                          </div>
                          <span className="text-sm font-medium text-gray-300">Support Team</span>
                       </div>
                       <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                       <p className="text-gray-400 text-sm max-w-sm">Our team is available 24/7. We usually respond within 2 hours.</p>
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

      {/* Contact Support Modal */}
      <ContactSupportModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
}
