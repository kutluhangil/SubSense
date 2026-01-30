
import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import SubscriptionTable from './SubscriptionTable';
import Friends from './Friends';
import Analytics from './Analytics';
import SettingsPage from './Settings';
import Comparison from './Comparison';
import HelpCenter from './HelpCenter';
import Profile from './Profile';
import SubscriptionModal, { Subscription } from './SubscriptionModal';
import SubscriptionSearchPanel from './SubscriptionSearchPanel';
import CalendarModal from './CalendarModal';
import BrandIcon from './BrandIcon';
import { Plus, Bell, Calendar, PieChart, ArrowRight, Menu, X, Check } from 'lucide-react';
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

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Adobe Creative Cloud renews in 2 days.", time: "2h ago", read: false, type: 'alert' },
    { id: 2, text: "Spotify Duo plan price will increase next month.", time: "5h ago", read: false, type: 'info' },
    { id: 3, text: "1 subscription is expiring soon.", time: "1d ago", read: true, type: 'warning' },
  ]);
  
  // Budget & Savings State
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({
    'Entertainment': 50,
    'Productivity': 100,
    'Shopping': 200,
    'Tools': 50
  });
  const [savingsGoal, setSavingsGoal] = useState(20); // Monthly savings goal
  const [totalSaved, setTotalSaved] = useState(0); // Tracked savings from deletions

  const { t, formatPrice } = useLanguage();

  const filteredSubscriptions = useMemo(() => {
    if (activeCategory === 'All') return subscriptions;
    return subscriptions.filter(sub => sub.category === activeCategory);
  }, [subscriptions, activeCategory]);

  const handleSubUpdate = (updatedSub: Subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  const handleSubDelete = (id: number) => {
    const subToDelete = subscriptions.find(s => s.id === id);
    if (subToDelete) {
        // Add monthly price to saved amount (simple heuristic: if yearly, divide by 12)
        const monthlyValue = subToDelete.cycle === 'Yearly' ? subToDelete.price / 12 : subToDelete.price;
        setTotalSaved(prev => prev + monthlyValue);
    }
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
    setIsAddModalOpen(false);
    setCurrentView('dashboard'); // Return to dashboard to see new item
  };

  // Notification Handlers
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Could navigate to specific views here
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // --- Sub-components ---

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
       <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm">{t('dashboard.notifications')}</h3>
          <button 
            onClick={handleMarkAllRead}
            className="text-[10px] text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            <Check size={12} /> {t('dashboard.mark_read')}
          </button>
       </div>
       <div className="max-h-64 overflow-y-auto">
          {notifications.map(n => (
             <div 
               key={n.id} 
               onClick={() => handleNotificationClick(n.id)}
               className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}
             >
                <div className="flex justify-between items-start">
                   <p className={`text-xs text-gray-800 mb-1 ${!n.read ? 'font-semibold' : ''}`}>{n.text}</p>
                   {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>}
                </div>
                <p className="text-[10px] text-gray-400">{n.time}</p>
             </div>
          ))}
          {notifications.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-xs">No notifications</div>
          )}
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
           <button 
             onClick={() => setIsCalendarOpen(true)}
             className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
           >
              {t('dashboard.view_calendar')}
           </button>
        </div>
        <div className="space-y-4">
           {subscriptions.slice(0, 4).map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => setSelectedSub(sub)}>
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

  // --- Main View Rendering Logic ---

  const renderContent = () => {
    if (isAddModalOpen) {
      return (
        <div className="h-full flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowRight size={16} className="rotate-180" /> Back to Dashboard
              </button>
           </div>
           <SubscriptionSearchPanel onAddSubscription={handleAddSubscription} />
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8 flex items-center justify-between relative">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
                   <p className="text-gray-500 text-sm mt-1">{t('dashboard.welcome')}</p>
                </div>
                
                <div className="flex items-center gap-3">
                   {/* Notifications */}
                   <div className="relative">
                      <button 
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors relative shadow-sm"
                      >
                         <Bell size={20} />
                         {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                         )}
                      </button>
                      {notificationsOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                          <NotificationDropdown />
                        </>
                      )}
                   </div>

                   <button 
                     onClick={() => setIsAddModalOpen(true)}
                     className="hidden sm:flex items-center justify-center space-x-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-95"
                   >
                      <Plus size={18} />
                      <span>{t('dashboard.add_sub')}</span>
                   </button>
                </div>
             </div>

             <StatsCards />

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 space-y-6">
                   <div>
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-lg font-bold text-gray-900">{t('dashboard.active_subs')}</h2>
                         <button onClick={() => setCurrentView('subscriptions')} className="text-xs font-medium text-blue-600 hover:text-blue-800">{t('dashboard.view_all')}</button>
                      </div>
                      
                      <CategoryFilters />

                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                         <SubscriptionTable 
                           subscriptions={filteredSubscriptions} 
                           onSelectSubscription={setSelectedSub}
                           onDeleteSubscription={handleSubDelete}
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <UpcomingTimeline />
                   <ExpenseBreakdown />
                </div>
             </div>
          </div>
        );
      case 'friends': return <Friends />;
      case 'analytics': return (
        <Analytics 
          subscriptions={subscriptions} 
          budgetLimits={budgetLimits} 
          setBudgetLimits={setBudgetLimits}
          savingsGoal={savingsGoal}
          setSavingsGoal={setSavingsGoal}
          totalSaved={totalSaved}
        />
      );
      case 'compare': return <Comparison />;
      case 'settings': return <SettingsPage subscriptions={subscriptions} />;
      case 'help': return <HelpCenter />;
      case 'profile': return <Profile />;
      case 'subscriptions': return (
        <div className="space-y-6">
           <h2 className="text-2xl font-bold text-gray-900">{t('features.subscriptions.title')}</h2>
           <SubscriptionTable 
             subscriptions={subscriptions} 
             onSelectSubscription={setSelectedSub} 
             onDeleteSubscription={handleSubDelete}
           />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
       
       {/* Sidebar - Hidden on mobile, controlled via state */}
       <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 md:z-0`}>
          <Sidebar onLogout={onLogout} currentView={currentView} onNavigate={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} />
       </div>

       {/* Mobile Overlay */}
       {isMobileMenuOpen && (
         <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
       )}

       <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
                <Menu size={24} />
             </button>
             <span className="font-bold text-gray-900">SubscriptionHub</span>
             <button onClick={() => setIsAddModalOpen(true)} className="text-gray-900">
                <Plus size={24} />
             </button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8 relative">
             {renderContent()}
          </main>
       </div>

       {/* Global Modals */}
       <SubscriptionModal 
         isOpen={!!selectedSub} 
         onClose={() => setSelectedSub(null)} 
         subscription={selectedSub}
         onSave={handleSubUpdate}
         onDelete={handleSubDelete}
       />

       <CalendarModal 
         isOpen={isCalendarOpen} 
         onClose={() => setIsCalendarOpen(false)} 
         subscriptions={subscriptions} 
       />
    </div>
  );
}
