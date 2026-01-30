
import React, { useState } from 'react';
import { 
  X, LayoutGrid, Users, User, CreditCard, PieChart, 
  ArrowRightLeft, Settings, HelpCircle, LogOut, Bell, Plus, 
  Calendar, TrendingUp, TrendingDown, Check, Zap, Globe, ArrowRight
} from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import StatsCards from './StatsCards';
import SubscriptionTable from './SubscriptionTable';
import Profile from './Profile';
import Friends from './Friends';
import Analytics from './Analytics';
import SettingsPage from './Settings';
import Comparison from './Comparison';
import HelpCenter from './HelpCenter';
import SubscriptionSearchPanel from './SubscriptionSearchPanel';
import { Subscription } from './SubscriptionModal';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
}

// --- Dashboard Widgets (Replicated for Demo to match Dashboard.tsx exactly) ---

const UpcomingTimeline = () => {
  // Static demo data for visual accuracy
  const subscriptions = [
      { id: 1, name: 'Netflix', price: 19.99, nextDate: 'Oct 24, 2023', status: 'Active', type: 'netflix', plan: 'Premium 4K', cycle: 'Monthly' },
      { id: 2, name: 'Spotify', price: 14.99, nextDate: 'Oct 28, 2023', status: 'Active', type: 'spotify', plan: 'Duo Plan', cycle: 'Monthly' },
      { id: 3, name: 'Adobe Creative Cloud', price: 54.99, nextDate: 'Nov 01, 2023', status: 'Expiring', type: 'adobe', plan: 'All Apps', cycle: 'Monthly' },
      { id: 4, name: 'Amazon Prime', price: 139.00, nextDate: 'Feb 12, 2024', status: 'Active', type: 'amazon', plan: 'Annual', cycle: 'Yearly' },
  ];

  return (
     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" /> Upcoming Payments
           </h3>
           <button className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
              View Calendar
           </button>
        </div>
        <div className="space-y-4">
           {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 group cursor-pointer">
                 <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BrandIcon type={sub.type} className="w-6 h-6" noBackground />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                       <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">{sub.name}</h4>
                       <span className="text-xs font-bold text-gray-900">${sub.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-gray-500">{sub.nextDate}</span>
                       <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${sub.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                          {sub.status}
                       </span>
                    </div>
                 </div>
              </div>
           ))}
        </div>
     </div>
  );
};

const ExpenseBreakdown = ({ onViewAnalytics }: { onViewAnalytics: () => void }) => (
     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
           <PieChart size={16} className="text-gray-400" /> Expense Breakdown
        </h3>
        <div className="flex items-center gap-6">
           <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="20" />
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="20" strokeDasharray="60 251" className="opacity-90" />
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="40 251" strokeDashoffset="-60" className="opacity-90" />
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="30 251" strokeDashoffset="-100" className="opacity-90" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[10px] font-bold text-gray-500">Oct</span>
              </div>
           </div>
           <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Entertainment</div>
                 <span className="font-bold">45%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Productivity</div>
                 <span className="font-bold">30%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>Shopping</div>
                 <span className="font-bold">25%</span>
              </div>
           </div>
        </div>
        <button onClick={onViewAnalytics} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
           View detailed analytics <ArrowRight size={10} />
        </button>
     </div>
);

const RegionalSavings = ({ onViewCompare }: { onViewCompare: () => void }) => (
     <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
           <TrendingDown size={18} />
        </div>
        <div>
           <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Regional Savings</h4>
           <p className="text-xs text-gray-600 leading-snug">
              Netflix costs <span className="font-bold text-gray-900">$7.85</span> in India 🇮🇳 — you’re paying <span className="font-bold text-red-500">49% more</span>.
           </p>
           <button onClick={onViewCompare} className="mt-2 text-[10px] font-bold text-gray-500 hover:text-gray-900 underline decoration-gray-300 underline-offset-2">
              Compare Pricing
           </button>
        </div>
     </div>
);

const AchievementsPreview = ({ onViewProfile }: { onViewProfile: () => void }) => (
     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between group cursor-pointer" onClick={onViewProfile}>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
              <Check size={18} />
           </div>
           <div>
              <h4 className="text-sm font-bold text-gray-900">6 Badges Unlocked</h4>
              <p className="text-[10px] text-gray-500">Keep it up!</p>
           </div>
        </div>
        <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
     </div>
);

const DemoDashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  // Realistic demo data for the table
  const demoSubscriptions: Subscription[] = [
    { id: 1, name: 'Netflix', plan: 'Premium 4K', price: 19.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 24, 2023', type: 'netflix', status: 'Active', billingDay: 24, category: 'Entertainment', history: [15.99, 15.99, 17.49, 19.99, 19.99] },
    { id: 2, name: 'Spotify', plan: 'Duo Plan', price: 14.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 28, 2023', type: 'spotify', status: 'Active', billingDay: 28, category: 'Entertainment', history: [12.99, 12.99, 13.99, 14.99, 14.99] },
    { id: 3, name: 'Adobe Creative Cloud', plan: 'All Apps', price: 54.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Nov 01, 2023', type: 'adobe', status: 'Expiring', billingDay: 1, category: 'Productivity', history: [52.99, 52.99, 52.99, 54.99, 54.99] },
    { id: 4, name: 'Amazon Prime', plan: 'Annual', price: 139.00, currency: 'USD', cycle: 'Yearly', nextDate: 'Feb 12, 2024', type: 'amazon', status: 'Active', billingDay: 12, category: 'Shopping', history: [119.00, 119.00, 139.00, 139.00, 139.00] },
    { id: 5, name: 'YouTube Premium', plan: 'Individual', price: 13.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 15, 2023', type: 'youtube', status: 'Active', billingDay: 15, category: 'Entertainment', history: [11.99, 11.99, 11.99, 13.99, 13.99] },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in duration-300">
        {/* Dashboard Header */}
        <div className="mb-8 flex items-center justify-between relative">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back, Alex. You have 2 payments due this week.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative">
                    <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors relative shadow-sm">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>

                <button className="hidden sm:flex items-center justify-center space-x-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-95">
                    <Plus size={18} />
                    <span>Add Subscription</span>
                </button>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
            <StatsCards />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Subscriptions */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Active Subscriptions</h2>
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-800">View All</button>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                        <SubscriptionTable subscriptions={demoSubscriptions} />
                    </div>
                </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="space-y-6">
                <UpcomingTimeline />
                <ExpenseBreakdown onViewAnalytics={() => onNavigate('analytics')} />
                <RegionalSavings onViewCompare={() => onNavigate('compare')} />
                <AchievementsPreview onViewProfile={() => onNavigate('profile')} />
            </div>
        </div>
    </div>
  );
};

// --- Main Modal Component ---

export default function DemoModal({ isOpen, onClose, onSignup }: DemoModalProps) {
  const { t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeFeaturePopup, setActiveFeaturePopup] = useState<number | null>(null);

  if (!isOpen) return null;

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutGrid, label: t('sidebar.dashboard') },
    { id: 'profile', icon: User, label: t('sidebar.profile') },
    { id: 'friends', icon: Users, label: t('sidebar.friends') },
    { id: 'subscriptions', icon: CreditCard, label: t('sidebar.subscriptions') },
    { id: 'analytics', icon: PieChart, label: t('sidebar.analytics') },
    { id: 'compare', icon: ArrowRightLeft, label: t('sidebar.compare') },
    { id: 'settings', icon: Settings, label: t('sidebar.settings') },
    { id: 'help', icon: HelpCircle, label: t('sidebar.help') },
  ];

  const features = [
    { 
        id: 1, 
        label: 'Smart Tracking', 
        icon: CreditCard, 
        desc: "Automatically organize all subscriptions in one place.",
        detail: "Never lose track of a payment. We automatically categorize your subscriptions and notify you before renewal.",
        visual: "list"
    },
    { 
        id: 2, 
        label: 'Global Currency', 
        icon: Globe, 
        desc: "Real-time conversion for international services.",
        detail: "See exact costs in your local currency. We handle exchange rates automatically for accurate budgeting.",
        visual: "globe"
    },
    { 
        id: 3, 
        label: 'Analytics', 
        icon: PieChart, 
        desc: "Visualize spending habits and forecast costs.",
        detail: "Get a clear breakdown of where your money goes. Track monthly trends and identify potential savings.",
        visual: "chart"
    },
    { 
        id: 4, 
        label: 'Social Sharing', 
        icon: Users, 
        desc: "Manage shared plans with friends and family.",
        detail: "Split costs easily. See what your friends are subscribing to and manage family plans together.",
        visual: "users"
    },
  ];

  const handleFeatureClick = (id: number) => {
    setActiveFeaturePopup(activeFeaturePopup === id ? null : id);
  };

  const closeFeaturePopup = () => {
    setActiveFeaturePopup(null);
  };

  const dummyHandler = () => {}; // Used for readonly components

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard': return <DemoDashboard onNavigate={setActiveMenu} />;
      case 'profile': return (
        <div className="p-8">
            <Profile />
        </div>
      );
      case 'friends': return (
        <div className="p-8">
            <Friends />
        </div>
      );
      case 'subscriptions': return (
        <SubscriptionSearchPanel onAddSubscription={dummyHandler} />
      );
      case 'analytics': return (
        <div className="p-8">
            <Analytics />
        </div>
      );
      case 'compare': return (
        <div className="p-8">
            <Comparison />
        </div>
      );
      case 'settings': return (
        <div className="p-8">
            <SettingsPage />
        </div>
      );
      case 'help': return (
        <div className="p-8">
            <HelpCenter />
        </div>
      );
      default: return <DemoDashboard onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 ring-1 ring-black/5">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                SubscriptionHub 
                <span className="text-gray-400 font-normal mx-2">/</span> 
                <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">Interactive Demo</span>
            </h2>
            <p className="text-sm text-gray-500 hidden md:block border-l border-gray-200 pl-3">Explore with real data.</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:block mr-2">Demo Mode</span>
             <button 
               onClick={onClose}
               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
             >
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Main Interface Wrapper */}
        <div className="flex-1 overflow-hidden flex bg-gray-50">
           
           {/* Sidebar - Realistic */}
           <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-full flex-shrink-0">
              <div className="p-6">
                 <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                    <span className="font-bold text-gray-900">Workspace</span>
                 </div>
                 
                 <div className="space-y-1">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Menu</p>
                    {sidebarItems.slice(0, 6).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                            activeMenu === item.id
                                ? 'bg-gray-100 text-gray-900' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon size={18} className={activeMenu === item.id ? 'text-gray-900' : 'text-gray-400'} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                 </div>

                 <div className="space-y-1 mt-8">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account</p>
                    {sidebarItems.slice(6).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                            activeMenu === item.id
                                ? 'bg-gray-100 text-gray-900' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon size={18} className={activeMenu === item.id ? 'text-gray-900' : 'text-gray-400'} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                 </div>
              </div>
              
              <div className="mt-auto p-4 border-t border-gray-50">
                 <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium group">
                    <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
                    <span>Log out</span>
                 </button>
              </div>
           </div>

           {/* Content Area */}
           <div className="flex-1 overflow-y-auto relative flex flex-col">
              
              <div className="flex-1">
                 {renderContent()}
              </div>

              {/* Bottom Feature Highlights */}
              <div className="mt-auto bg-white border-t border-gray-100 p-6 sticky bottom-0 z-30">
                 <div className="max-w-5xl mx-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Zap size={12} className="text-yellow-500" /> Interactive Features
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                       {features.map((feature) => (
                          <div key={feature.id} className="relative">
                             <button 
                               onClick={() => handleFeatureClick(feature.id)}
                               className={`w-full p-3 rounded-xl border text-left transition-all duration-200 relative group overflow-hidden ${
                                   activeFeaturePopup === feature.id 
                                   ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105 z-40' 
                                   : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                               }`}
                             >
                                <div className="flex items-center gap-2 mb-1 relative z-10">
                                   <feature.icon size={16} className={activeFeaturePopup === feature.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-600'} />
                                   <span className="font-bold text-sm">{feature.label}</span>
                                </div>
                                <p className={`text-[10px] leading-tight relative z-10 ${activeFeaturePopup === feature.id ? 'text-gray-300' : 'text-gray-400'}`}>
                                   Click to learn more
                                </p>
                             </button>

                             {activeFeaturePopup === feature.id && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-white text-gray-900 p-5 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200 z-50 cursor-default ring-1 ring-black/5">
                                   <div className="flex justify-between items-start mb-3">
                                      <div className={`p-2.5 rounded-xl bg-blue-50 text-blue-600`}>
                                         <feature.icon size={20} />
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); closeFeaturePopup(); }} 
                                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                                      >
                                        <X size={16} />
                                      </button>
                                   </div>
                                   <h4 className="font-bold text-base mb-2 text-gray-900">{feature.label}</h4>
                                   <p className="text-xs text-gray-600 leading-relaxed mb-4">{feature.detail}</p>
                                   
                                   <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 h-24 flex items-center justify-center overflow-hidden relative group-hover:border-gray-200 transition-colors">
                                      {feature.visual === 'chart' && (
                                         <div className="w-full h-full flex items-end gap-1 px-2 pb-1">
                                            {[40, 70, 50, 90, 60].map((h, i) => (
                                               <div key={i} className="flex-1 bg-blue-500 rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                                            ))}
                                         </div>
                                      )}
                                      {feature.visual === 'globe' && (
                                         <div className="flex gap-3 text-xs font-bold text-gray-600 items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                                            <span className="text-green-600">$12</span>
                                            <ArrowRightLeft size={12} className="text-gray-400" />
                                            <span className="text-blue-600">€11</span>
                                         </div>
                                      )}
                                      {feature.visual === 'list' && (
                                         <div className="space-y-2 w-full px-2">
                                            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-2 bg-blue-200 rounded w-full"></div>
                                         </div>
                                      )}
                                      {feature.visual === 'users' && (
                                         <div className="flex -space-x-3 items-center">
                                            {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>)}
                                            <div className="w-8 h-8 rounded-full bg-gray-900 text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">+2</div>
                                         </div>
                                      )}
                                   </div>
                                   
                                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {activeFeaturePopup !== null && (
           <div className="absolute inset-0 z-20 bg-black/5 backdrop-blur-[1px]" onClick={closeFeaturePopup}></div>
        )}

      </div>
    </div>
  );
}
