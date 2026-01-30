
import React, { useState, useMemo, useEffect } from 'react';
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
import OnboardingTour from './OnboardingTour';
import { Plus, Bell, Calendar, PieChart, ArrowRight, Menu, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from '../App';
import { EXCHANGE_RATES } from '../utils/currency';

interface DashboardProps {
  onLogout: () => void;
  user: User;
}

const DEFAULT_BUDGET_LIMITS = {
  'Entertainment': 50,
  'Productivity': 100,
  'Shopping': 200,
  'Tools': 50
};

export default function Dashboard({ onLogout, user }: DashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const userKey = user?.email || 'guest';
  
  // Persisted State: Subscriptions (Scoped to User)
  // Initializes empty for new users
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.subscriptions`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persisted State: Budget Limits
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.budgetLimits`);
      return saved ? JSON.parse(saved) : DEFAULT_BUDGET_LIMITS;
    } catch (e) {
      return DEFAULT_BUDGET_LIMITS;
    }
  });

  // Persisted State: Savings Goal
  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.savingsGoal`);
      return saved ? parseFloat(saved) : 0; // Default to 0 for new users
    } catch (e) {
      return 0;
    }
  });

  // Persisted State: Total Saved
  const [totalSaved, setTotalSaved] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.totalSaved`);
      return saved ? parseFloat(saved) : 0; // Default to 0 for new users
    } catch (e) {
      return 0;
    }
  });

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(() => {
     const hasSeen = localStorage.getItem(`subscriptionhub.${userKey}.hasSeenOnboarding`);
     return !hasSeen;
  });

  const handleOnboardingComplete = () => {
     setShowOnboarding(false);
     localStorage.setItem(`subscriptionhub.${userKey}.hasSeenOnboarding`, 'true');
  };

  // Persistence Effects (Write)
  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.subscriptions`, JSON.stringify(subscriptions));
  }, [subscriptions, userKey]);

  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.budgetLimits`, JSON.stringify(budgetLimits));
  }, [budgetLimits, userKey]);

  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.savingsGoal`, savingsGoal.toString());
  }, [savingsGoal, userKey]);

  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.totalSaved`, totalSaved.toString());
  }, [totalSaved, userKey]);

  // Derived Metrics (Real-time) - UPDATED to handle multi-currency
  const metrics = useMemo(() => {
    let monthlyTotalUSD = 0;
    let yearlyTotalForecastUSD = 0;
    let lifetimeSpendUSD = 0;
    
    // Filter active subscriptions only for cost calc
    const activeSubs = subscriptions.filter(s => s.status === 'Active');
    
    activeSubs.forEach(sub => {
      // Get Exchange Rate for this subscription's currency (Default to 1 if USD or unknown)
      const rate = EXCHANGE_RATES[sub.currency] || 1;
      
      // Convert Price to Base USD
      const priceInUSD = sub.price / rate;

      // Normalize to monthly cost
      if (sub.cycle === 'Monthly') {
        monthlyTotalUSD += priceInUSD;
        yearlyTotalForecastUSD += priceInUSD * 12;
      } else {
        monthlyTotalUSD += priceInUSD / 12;
        yearlyTotalForecastUSD += priceInUSD;
      }

      // Calculate lifetime spend based on history
      if (sub.history && sub.history.length > 0) {
          const historyTotal = sub.history.reduce((a, b) => a + b, 0);
          lifetimeSpendUSD += historyTotal / rate; // Convert history total to USD
      } else {
          lifetimeSpendUSD += priceInUSD; // At least first payment
      }
    });

    return {
      monthlySpend: monthlyTotalUSD,
      activeCount: activeSubs.length,
      yearlyForecast: yearlyTotalForecastUSD,
      lifetimeSpend: lifetimeSpendUSD
    };
  }, [subscriptions]);

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState([
    { id: 1, text: `Welcome to SubscriptionHub, ${user.name}!`, time: "Just now", read: false, type: 'info' },
  ]);

  const { t, formatPrice } = useLanguage();

  const filteredSubscriptions = useMemo(() => {
    if (activeCategory === 'All') return subscriptions;
    return subscriptions.filter(sub => sub.category === activeCategory);
  }, [subscriptions, activeCategory]);

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSubUpdate = (updatedSub: Subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  const handleSubDelete = (id: number) => {
    const subToDelete = subscriptions.find(s => s.id === id);
    if (subToDelete) {
        // Calculate savings (convert to USD for consistent saving tracking, though simple addition is fine for MVP)
        const rate = EXCHANGE_RATES[subToDelete.currency] || 1;
        const priceInUSD = subToDelete.price / rate;
        const monthlyValueUSD = subToDelete.cycle === 'Yearly' ? priceInUSD / 12 : priceInUSD;
        
        setTotalSaved(prev => prev + monthlyValueUSD);
        showToast(`Subscription deleted. Savings updated!`);
    }
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSubscription = (newSub: Subscription) => {
    // Generate new ID based on timestamp to avoid collision
    const finalSub = { ...newSub, id: Date.now() };
    
    setSubscriptions(prev => [finalSub, ...prev]);
    setIsAddModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleMarkAsPaid = (id: number) => {
      setSubscriptions(prev => prev.map(sub => {
          if (sub.id === id) {
              const current = new Date(sub.nextDate);
              // Simple advance logic: Add 1 month or 1 year
              if (sub.cycle === 'Monthly') {
                  current.setMonth(current.getMonth() + 1);
              } else {
                  current.setFullYear(current.getFullYear() + 1);
              }
              // Also add to history for lifetime tracking
              const newHistory = [...(sub.history || []), sub.price];
              
              showToast(`${sub.name} marked as paid. Next date updated.`);
              return { 
                  ...sub, 
                  nextDate: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  history: newHistory
              };
          }
          return sub;
      }));
  };

  // Notification Handlers
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
            {t('dashboard.mark_read')}
          </button>
       </div>
       <div className="max-h-64 overflow-y-auto">
          {notifications.map(n => (
             <div 
               key={n.id} 
               className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
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

  const UpcomingTimeline = () => {
     // Sort by soonest
     const upcoming = [...subscriptions].sort((a,b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()).slice(0, 4);

     if (upcoming.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{t('dashboard.upcoming')}</h3>
                <p className="text-xs text-gray-400">No upcoming payments.</p>
            </div>
        );
     }

     return (
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
            {upcoming.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform cursor-pointer" onClick={() => setSelectedSub(sub)}>
                        <BrandIcon type={sub.type} className="w-6 h-6" noBackground />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedSub(sub)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">{sub.name}</h4>
                        <span className="text-xs font-bold text-gray-900">
                            {/* Display price in original currency for the list item */}
                            {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : sub.currency === 'GBP' ? '£' : sub.currency + ' '}
                            {sub.price.toFixed(2)}
                        </span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500">{sub.nextDate}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${sub.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {sub.status}
                        </span>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(sub.id); }}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as paid"
                    >
                        <CheckCircle2 size={16} />
                    </button>
                </div>
            ))}
            </div>
        </div>
     );
  };

  const ExpenseBreakdown = () => {
     // Dynamic calculation of categories
     const breakdown = useMemo(() => {
        const cats: Record<string, number> = {};
        let total = 0;
        subscriptions.forEach(sub => {
            const cat = sub.category || 'Other';
            const rate = EXCHANGE_RATES[sub.currency] || 1;
            const priceInUSD = sub.price / rate; // Normalize to USD for percentage calc
            const cost = sub.cycle === 'Monthly' ? priceInUSD : priceInUSD / 12;
            
            cats[cat] = (cats[cat] || 0) + cost;
            total += cost;
        });
        
        // Sort and top 3
        return Object.entries(cats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([name, value]) => ({ 
                name, 
                percentage: total > 0 ? (value / total) * 100 : 0 
            }));
     }, [subscriptions]);

     return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-gray-400" /> {t('dashboard.expense_breakdown')}
            </h3>
            
            {breakdown.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">Add subscriptions to see stats.</div>
            ) : (
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="20" />
                            {breakdown.map((item, i) => {
                                // Simple dasharray hack for MVP visualization
                                const dash = item.percentage; 
                                const color = ['#3B82F6', '#8B5CF6', '#10B981'][i] || '#9CA3AF';
                                return (
                                    <circle 
                                        key={i} cx="50" cy="50" r="40" fill="none" 
                                        stroke={color} strokeWidth="20" 
                                        strokeDasharray={`${dash} 1000`} 
                                        strokeDashoffset={-20 * i} // Mock offset for visual separation
                                        className="opacity-90" 
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-500">Oct</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {breakdown.map((item, i) => {
                            const color = ['bg-blue-500', 'bg-purple-500', 'bg-green-500'][i] || 'bg-gray-400';
                            return (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${color}`}></div>{item.name}</div>
                                    <span className="font-bold">{item.percentage.toFixed(0)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <button onClick={() => setCurrentView('analytics')} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            {t('dashboard.view_analytics')} <ArrowRight size={10} />
            </button>
        </div>
     );
  };

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
                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('dashboard.title')}</h1>
                   <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, {user.name}.</p>
                </div>
                
                <div className="flex items-center gap-3">
                   {/* Notifications */}
                   <div className="relative">
                      <button 
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative shadow-sm"
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
                     data-tour="add-btn"
                     onClick={() => setIsAddModalOpen(true)}
                     className="hidden sm:flex items-center justify-center space-x-2 bg-gray-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                   >
                      <Plus size={18} />
                      <span>{t('dashboard.add_sub')}</span>
                   </button>
                </div>
             </div>

             <div data-tour="stats-cards">
                {/* StatsCards now receive normalized USD values, and will convert them to user preference internally */}
                <StatsCards 
                    monthly={metrics.monthlySpend} 
                    active={metrics.activeCount} 
                    forecast={metrics.yearlyForecast} 
                />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 space-y-6">
                   <div>
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard.active_subs')}</h2>
                         <button onClick={() => setCurrentView('subscriptions')} className="text-xs font-medium text-blue-600 hover:text-blue-800">{t('dashboard.view_all')}</button>
                      </div>
                      
                      <CategoryFilters />

                      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden min-h-[400px]">
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
          lifetimeSpend={metrics.lifetimeSpend}
        />
      );
      case 'compare': return <Comparison />;
      case 'settings': return <SettingsPage subscriptions={subscriptions} />;
      case 'help': return <HelpCenter />;
      case 'profile': return (
        <Profile 
            user={user} 
            subscriptions={subscriptions}
            userKey={userKey}
        />
      );
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
       
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
          <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 dark:text-gray-300">
                <Menu size={24} />
             </button>
             <span className="font-bold text-gray-900 dark:text-white">SubscriptionHub</span>
             <button onClick={() => setIsAddModalOpen(true)} className="text-gray-900 dark:text-white">
                <Plus size={24} />
             </button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 relative transition-colors duration-300">
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

       {/* Onboarding Tour */}
       {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

       {/* Global Toast */}
       {toastMsg && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[100] animate-in slide-in-from-bottom-2 fade-in">
               <span className="font-medium text-sm">{toastMsg}</span>
           </div>
       )}
    </div>
  );
}
