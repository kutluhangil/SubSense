
import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import SubscriptionTable from './SubscriptionTable';
import Friends from './Friends';
import Analytics from './Analytics';
import Settings from './Settings';
import Comparison from './Comparison';
import HelpCenter from './HelpCenter';
import Profile from './Profile';
import SubscriptionModal, { Subscription } from './SubscriptionModal';
import SubscriptionSearchPanel from './SubscriptionSearchPanel';
import BrandIcon from './BrandIcon';
import { Plus, Bell, Calendar, ChevronRight, PieChart, TrendingDown, ArrowRight, Check, X, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionDetail } from '../utils/data';

interface DashboardProps {
  onLogout: () => void;
}

// Initial Data with Category
const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 1, name: 'Netflix', plan: 'Premium 4K', price: 19.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 24, 2023', type: 'netflix', status: 'Active', billingDay: 24, category: 'Entertainment', history: [15.99, 15.99, 17.49, 19.99, 19.99] },
  { id: 2, name: 'Spotify', plan: 'Duo Plan', price: 14.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 28, 2023', type: 'spotify', status: 'Active', billingDay: 28, category: 'Entertainment', history: [12.99, 12.99, 13.99, 14.99, 14.99] },
  { id: 3, name: 'Adobe Creative Cloud', plan: 'All Apps', price: 54.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Nov 01, 2023', type: 'adobe', status: 'Expiring', billingDay: 1, category: 'Productivity', history: [52.99, 52.99, 52.99, 54.99, 54.99] },
  { id: 4, name: 'Amazon Prime', plan: 'Annual', price: 139.00, currency: 'USD', cycle: 'Yearly', nextDate: 'Feb 12, 2024', type: 'amazon', status: 'Active', billingDay: 12, category: 'Shopping', history: [119.00, 119.00, 139.00, 139.00, 139.00] },
  { id: 5, name: 'YouTube Premium', plan: 'Individual', price: 13.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 15, 2023', type: 'youtube', status: 'Active', billingDay: 15, category: 'Entertainment', history: [11.99, 11.99, 11.99, 13.99, 13.99] },
];

// Mock Notifications
const NOTIFICATIONS = [
  { id: 1, text: "Adobe Creative Cloud renews in 2 days.", time: "2h ago", read: false },
  { id: 2, text: "Spotify Duo plan price will increase next month.", time: "5h ago", read: false },
  { id: 3, text: "1 subscription is expiring soon.", time: "1d ago", read: true },
];

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const { t, formatPrice } = useLanguage();

  const filteredSubscriptions = useMemo(() => {
    if (activeCategory === 'All') return subscriptions;
    return subscriptions.filter(sub => sub.category === activeCategory);
  }, [subscriptions, activeCategory]);

  const handleSubUpdate = (updatedSub: Subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  const handleSubDelete = (id: number) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSubscription = (service: SubscriptionDetail) => {
    const priceVal = parseFloat(service.price);
    
    // Determine category loosely based on type for demo
    let cat = 'Tools';
    if (['netflix', 'spotify', 'youtube', 'disney+'].includes(service.type)) cat = 'Entertainment';
    if (['adobe', 'canva', 'office'].includes(service.type)) cat = 'Productivity';
    if (['amazon', 'trendyol'].includes(service.type)) cat = 'Shopping';

    const newSub: Subscription = {
        id: Math.max(...subscriptions.map(s => s.id), 0) + 1,
        name: service.name,
        plan: 'Standard',
        price: priceVal,
        currency: 'USD',
        cycle: 'Monthly',
        nextDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: service.type,
        status: 'Active',
        billingDay: new Date().getDate(),
        category: cat,
        history: [priceVal]
    };
    setSubscriptions(prev => [newSub, ...prev]);
  };

  // --- Sub-components for Dashboard Widgets ---

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
       <div className="p-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm">{t('dashboard.notifications')}</h3>
          <button className="text-[10px] text-blue-600 font-medium hover:underline">{t('dashboard.mark_read')}</button>
       </div>
       <div className="max-h-64 overflow-y-auto">
          {NOTIFICATIONS.map(n => (
             <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                <p className={`text-xs text-gray-800 mb-1 ${!n.read ? 'font-semibold' : ''}`}>{n.text}</p>
                <p className="text-[10px] text-gray-400">{n.time}</p>
             </div>
          ))}
       </div>
    </div>
  );

  const CategoryFilters = () => (
     <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Entertainment', 'Productivity', 'Tools', 'Shopping'].map(cat => (
           <button
             key={cat}
             onClick={() => setActiveCategory(cat)}
             className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeCategory === cat 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
             }`}
           >
              {cat === 'All' ? t('dashboard.filter.all') : t(`dashboard.filter.${cat.toLowerCase()}`)}
           </button>
        ))}
     </div>
  );

  const UpcomingTimeline = () => (
     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" /> {t('dashboard.upcoming')}
           </h3>
           <button className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
              {t('dashboard.view_calendar')}
           </button>
        </div>
        <div className="space-y-4">
           {subscriptions.slice(0, 4).map((sub, i) => (
              <div key={sub.id} className="flex items-center gap-3 group cursor-pointer">
                 <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BrandIcon type={sub.type} className="w-6 h-6" noBackground />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                       <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">{sub.name}</h4>
                       <span className="text-xs font-bold text-gray-900">{formatPrice(sub.price)}</span>
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

  const ExpenseBreakdown = () => (
     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
           <PieChart size={16} className="text-gray-400" /> {t('dashboard.expense_breakdown')}
        </h3>
        <div className="flex items-center gap-6">
           <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="20" />
                 {/* Mock Segments */}
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
        <button onClick={() => setCurrentView('analytics')} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
           {t('dashboard.view_analytics')} <ArrowRight size={10} />
        </button>
     </div>
  );

  const RegionalSavings = () => (
     <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
           <TrendingDown size={18} />
        </div>
        <div>
           <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">{t('dashboard.regional_savings')}</h4>
           <p className="text-xs text-gray-600 leading-snug">
              Netflix costs <span className="font-bold text-gray-900">$7.85</span> in India 🇮🇳 — you’re paying <span className="font-bold text-red-500">49% more</span>.
           </p>
           <button onClick={() => setCurrentView('compare')} className="mt-2 text-[10px] font-bold text-gray-500 hover:text-gray-900 underline decoration-gray-300 underline-offset-2">
              Compare Pricing
           </button>
        </div>
     </div>
  );

  const AchievementsPreview = () => (
     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between group cursor-pointer" onClick={() => setCurrentView('profile')}>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
              <Check size={18} />
           </div>
           <div>
              <h4 className="text-sm font-bold text-gray-900">6 Badges Unlocked</h4>
              <p className="text-[10px] text-gray-500">Keep it up!</p>
           </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
     </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        onLogout={onLogout} 
        currentView={currentView} 
        onNavigate={setCurrentView} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        {currentView === 'subscriptions' ? (
            <SubscriptionSearchPanel onAddSubscription={handleAddSubscription} />
        ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            
            {currentView === 'dashboard' && (
                <>
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between relative">
                       <div>
                          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
                          <p className="text-gray-500 text-sm mt-1">{t('dashboard.welcome')}</p>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className="relative">
                             <button 
                               onClick={() => setNotificationsOpen(!notificationsOpen)}
                               className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors relative shadow-sm"
                             >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                             </button>
                             {notificationsOpen && <NotificationDropdown />}
                             {notificationsOpen && (
                               <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                             )}
                          </div>

                          <button 
                              onClick={() => setCurrentView('subscriptions')}
                              className="hidden sm:flex items-center justify-center space-x-2 rtl:space-x-reverse bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-95"
                          >
                              <Plus size={18} />
                              <span>{t('dashboard.add_sub')}</span>
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
                                <h2 className="text-lg font-bold text-gray-900">{t('dashboard.active_subs')}</h2>
                                <CategoryFilters />
                             </div>
                             
                             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                                <SubscriptionTable 
                                    subscriptions={filteredSubscriptions}
                                    onSelectSubscription={setSelectedSub}
                                />
                             </div>
                          </div>

                       </div>

                       {/* Right Column: Widgets */}
                       <div className="space-y-6">
                          <UpcomingTimeline />
                          <ExpenseBreakdown />
                          <RegionalSavings />
                          <AchievementsPreview />
                       </div>

                    </div>
                </>
            )}

            {currentView === 'profile' && <Profile />}
            {currentView === 'friends' && <Friends />}
            {currentView === 'analytics' && <Analytics />}
            {currentView === 'compare' && <Comparison />}
            {currentView === 'settings' && <Settings />}
            {currentView === 'help' && <HelpCenter />}
            
            {(currentView !== 'dashboard' && currentView !== 'friends' && currentView !== 'analytics' && currentView !== 'settings' && currentView !== 'compare' && currentView !== 'help' && currentView !== 'subscriptions' && currentView !== 'profile') && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Work in Progress</h2>
                    <p className="text-gray-500 mt-2 max-w-sm">The {currentView} page is currently under construction. Please check back later.</p>
                    <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="mt-6 text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                    >
                    Return to Dashboard
                    </button>
                </div>
            )}

            </div>
        )}
      </main>

      <SubscriptionModal 
        isOpen={!!selectedSub} 
        subscription={selectedSub} 
        onClose={() => setSelectedSub(null)}
        onSave={handleSubUpdate}
        onDelete={handleSubDelete}
      />

      {currentView === 'dashboard' && (
        <button 
            onClick={() => setCurrentView('subscriptions')}
            className="fixed bottom-6 right-6 sm:hidden bg-gray-900 text-white p-4 rounded-full shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-transform active:scale-95 z-50"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
