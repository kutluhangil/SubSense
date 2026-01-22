import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, PlayCircle, CreditCard, Globe, Users, Shield, Monitor, Mail, ExternalLink, HelpCircle } from 'lucide-react';

// Static Data
const CATEGORIES = [
  { id: 'start', label: 'Getting Started', icon: PlayCircle },
  { id: 'subs', label: 'Subscription Management', icon: CreditCard },
  { id: 'compare', label: 'Global Comparison', icon: Globe },
  { id: 'social', label: 'Friends & Social', icon: Users },
  { id: 'security', label: 'Account & Security', icon: Shield },
  { id: 'custom', label: 'Customization', icon: Monitor },
];

const FAQS = [
  // Getting Started
  {
    id: 'create-account',
    category: 'start',
    question: 'How do I create an account?',
    answer: "Click the 'Sign up' button on the homepage or login screen. You can sign up using your email address or continue with Google/Apple for a faster experience."
  },
  {
    id: 'add-sub',
    category: 'start',
    question: 'How to add or remove a subscription?',
    answer: "To add a subscription, click the 'Add Subscription' button on your dashboard. Search for the service, select your plan, and save. To remove, find the subscription in your list, click the menu icon (three dots), and select 'Remove'."
  },
  {
    id: 'profile',
    category: 'start',
    question: 'How to update your profile and preferences?',
    answer: "Navigate to the Settings page from the sidebar. Under 'Profile Information', you can update your name, email, and photo. Don't forget to click 'Save Changes'."
  },
  // Sub Management
  {
    id: 'track',
    category: 'subs',
    question: 'Tracking your active subscriptions',
    answer: "Your Dashboard shows a summary of all active subscriptions. You can view them in a list or card view. The status indicator tells you if a subscription is active, expiring soon, or inactive."
  },
  {
    id: 'edit-price',
    category: 'subs',
    question: 'Editing prices or payment cycles',
    answer: "If a price changes, click on the specific subscription row. In the details view, you can manually update the price, currency, and billing cycle (monthly/yearly)."
  },
  {
    id: 'reminders',
    category: 'subs',
    question: 'How to receive payment reminders?',
    answer: "Go to Settings > Notifications. Enable 'Payment Due' notifications to receive alerts 3 days before a recurring payment is deducted."
  },
  // Comparison
  {
    id: 'compare-prices',
    category: 'compare',
    question: 'How to compare prices across countries?',
    answer: "Use the 'Compare' tab in the sidebar. Select a service (e.g., Netflix) and a base currency. The table will show how much that service costs in different regions, converted to your base currency."
  },
  {
    id: 'currency',
    category: 'compare',
    question: 'Understanding currency conversion',
    answer: "We use daily updated exchange rates to estimate prices in your selected currency. Please note that actual bank rates may vary slightly due to fees."
  },
  // Social
  {
    id: 'add-friends',
    category: 'social',
    question: 'Adding friends',
    answer: "Go to the Friends page and use the search bar to find users by username. Click 'Add Friend' to send a request."
  },
  {
    id: 'shared',
    category: 'social',
    question: 'Viewing shared subscriptions',
    answer: "On a friend's profile card, you'll see a 'Shared with you' section displaying icons of services you both subscribe to."
  },
  // Security
  {
    id: 'password',
    category: 'security',
    question: 'Changing your password',
    answer: "In Settings > Security, click on 'Change Password'. You will need to enter your current password to set a new one."
  },
  {
    id: '2fa',
    category: 'security',
    question: 'Enabling two-factor authentication',
    answer: "We recommend enabling 2FA for extra security. Go to Settings > Security and toggle 'Two-Factor Authentication'. Follow the prompts to link your authenticator app."
  },
  // Customization
  {
    id: 'theme',
    category: 'custom',
    question: 'Switching themes',
    answer: "In Settings > Appearance, you can choose between Light, Dark, or System default themes to match your preference."
  },
  {
    id: 'lang',
    category: 'custom',
    question: 'Changing language or currency',
    answer: "Global settings for Language and Currency can be found in the Footer of any page, or within the Settings > Preferences menu."
  },
];

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

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

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Help Center</h2>
          <p className="text-gray-500 text-sm mt-1">Guides, FAQs, and support for SubscriptionHub.</p>
        </div>
        
        <div className="relative w-full md:w-80">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search size={16} className="text-gray-400" />
           </div>
           <input
             type="text"
             placeholder="Search help topics..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white w-full transition-all shadow-sm"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-1 sticky top-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 text-sm">Topics</h3>
          </div>
          <div className="p-2 space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.id && !searchQuery
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <cat.icon size={18} className={activeCategory === cat.id && !searchQuery ? 'text-white' : 'text-gray-400'} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
           {/* FAQ Accordion */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                {searchQuery ? (
                  <Search size={20} className="text-gray-400" />
                ) : (
                   React.createElement(CATEGORIES.find(c => c.id === activeCategory)?.icon || HelpCircle, { size: 20, className: "text-gray-900" })
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  {searchQuery ? `Search Results for "${searchQuery}"` : CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h3>
             </div>
             
             <div className="divide-y divide-gray-50">
               {filteredFaqs.length > 0 ? (
                 filteredFaqs.map(faq => (
                   <div key={faq.id} className="group">
                     <button 
                       onClick={() => toggleItem(faq.id)}
                       className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors focus:outline-none"
                     >
                       <span className="font-medium text-gray-900">{faq.question}</span>
                       {openItems.includes(faq.id) ? (
                         <ChevronUp size={18} className="text-gray-400" />
                       ) : (
                         <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600" />
                       )}
                     </button>
                     {openItems.includes(faq.id) && (
                       <div className="px-6 pb-6 pt-0 text-sm text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                         {faq.answer}
                       </div>
                     )}
                   </div>
                 ))
               ) : (
                 <div className="p-12 text-center">
                   <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                     <Search size={24} className="text-gray-400" />
                   </div>
                   <h4 className="text-gray-900 font-medium">No results found</h4>
                   <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms or browse the categories.</p>
                 </div>
               )}
             </div>
           </div>

           {/* Contact Support CTA */}
           <div className="bg-gray-900 rounded-2xl p-8 text-white text-center sm:text-left sm:flex items-center justify-between shadow-lg">
              <div className="mb-6 sm:mb-0">
                <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                <p className="text-gray-400 text-sm max-w-md">Our support team is available 24/7 to assist you with any issues or questions about your subscription tracking.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                 <button className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
                    <Mail size={18} />
                    <span>Contact Support</span>
                 </button>
                 <button className="flex items-center justify-center space-x-2 bg-gray-800 text-gray-300 px-5 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors border border-gray-700">
                    <ExternalLink size={18} />
                    <span>Status Page</span>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}