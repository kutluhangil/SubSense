
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
import Discover from './Discover';
import SubscriptionModal, { Subscription } from './SubscriptionModal';
import SubscriptionSearchPanel from './SubscriptionSearchPanel';
import CalendarModal from './CalendarModal';
import BrandIcon from './BrandIcon';
import OnboardingTour from './OnboardingTour';
import AIAssistant from './AIAssistant';
import AIInsightsCard from './AIInsightsCard';
import CurrencySelector from './CurrencySelector';
import { Plus, Bell, Calendar, PieChart, ArrowRight, Menu, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from '../App';
import { debugLog } from '../utils/debug';
import { convertAmount, CURRENCY_DATA } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';
import { 
  addSubscription, 
  updateSubscription, 
  deleteSubscription 
} from '../utils/firestore';

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
  const { currentUser, subscriptions, subscriptionsLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Local state only for simpler preferences not critically synced yet
  const userKey = user?.email || 'guest';
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.budgetLimits`);
      return saved ? JSON.parse(saved) : DEFAULT_BUDGET_LIMITS;
    } catch (e) {
      return DEFAULT_BUDGET_LIMITS;
    }
  });

  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.savingsGoal`);
      return saved ? parseFloat(saved) : 0; 
    } catch (e) {
      return 0;
    }
  });

  const [totalSaved, setTotalSaved] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.totalSaved`);
      return saved ? parseFloat(saved) : 0; 
    } catch (e) {
      return 0;
    }
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
     const hasSeen = localStorage.getItem(`subscriptionhub.${userKey}.hasSeenOnboarding`);
     return !hasSeen;
  });

  const { t, formatPrice, currentCurrency, setCurrency } = useLanguage();

  // --- Preview State ---
  const [previewCurrency, setPreviewCurrency] = useState<string | null>(null);

  const handleOnboardingComplete = () => {
     setShowOnboarding(false);
     localStorage.setItem(`subscriptionhub.${userKey}.hasSeenOnboarding`, 'true');
  };

  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.budgetLimits`, JSON.stringify(budgetLimits));
  }, [budgetLimits, userKey]);

  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.savingsGoal`, savingsGoal.toString());
  }, [savingsGoal, userKey]);

  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.totalSaved`, totalSaved.toString());
  }, [totalSaved, userKey]);

  // Recalculate metrics considering optional Preview Currency
  const metrics = useMemo(() => {
    let monthlyTotal = 0;
    let yearlyTotalForecast = 0;
    let lifetimeSpend = 0;
    
    const activeSubs = subscriptions.filter(s => s.status === 'Active');
    
    const targetCurrency = previewCurrency || currentCurrency;

    debugLog('CURRENCY_AGGREGATION', 'Starting metrics calculation', { 
        targetCurrency,
        isPreview: !!previewCurrency,
        activeSubCount: activeSubs.length 
    });

    activeSubs.forEach(sub => {
      const rawPrice = typeof sub.price === 'string' ? parseFloat(sub.price) : sub.price;
      const validPrice = isNaN(rawPrice) ? 0 : rawPrice;

      const priceInTarget = convertAmount(validPrice, sub.currency || 'USD', targetCurrency);

      if (sub.cycle === 'Monthly') {
        monthlyTotal += priceInTarget;
        yearlyTotalForecast += priceInTarget * 12;
      } else {
        monthlyTotal += priceInTarget / 12;
        yearlyTotalForecast += priceInTarget;
      }

      if (sub.history && sub.history.length > 0) {
          const historyTotal = sub.history.reduce((a, b) => a + b, 0);
          lifetimeSpend += convertAmount(historyTotal, sub.currency || 'USD', targetCurrency);
      } else {
          lifetimeSpend += priceInTarget; 
      }
    });

    return {
      monthlySpend: monthlyTotal,
      activeCount: activeSubs.length,
      yearlyForecast: yearlyTotalForecast,
      lifetimeSpend: lifetimeSpend
    };
  }, [subscriptions, currentCurrency, previewCurrency]); 

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isPreviewSelectorOpen, setIsPreviewSelectorOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: `Welcome to SubscriptionHub, ${user.name}!`, time: "Just now", read: false, type: 'info' },
  ]);

  const filteredSubscriptions = useMemo(() => {
    if (activeCategory === 'All') return subscriptions;
    return subscriptions.filter(sub => sub.category === activeCategory);
  }, [subscriptions, activeCategory]);

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  // --- CRUD Handlers utilizing Firestore ---

  const handleSubUpdate = async (updatedSub: Subscription) => {
    if (currentUser) {
      debugLog('SUBSCRIPTION_UPDATE', 'Updating subscription in Firestore', updatedSub);
      await updateSubscription(currentUser.uid, updatedSub.id, updatedSub);
      // Local state is updated via listener in AuthContext
    }
  };

  const handleSubDelete = async (id: number) => {
    if (currentUser) {
        debugLog('REMOVE_ACTION', `Attempting to delete subscription ID: ${id}`);
        // Optimistic Calc
        const subToDelete = subscriptions.find(s => s.id === id);
        if (subToDelete) {
            const monthlyValueBase = subToDelete.cycle === 'Yearly' 
                ? convertAmount(subToDelete.price / 12, subToDelete.currency, currentCurrency) 
                : convertAmount(subToDelete.price, subToDelete.currency, currentCurrency);
            setTotalSaved(prev => prev + monthlyValueBase);
        }
        await deleteSubscription(currentUser.uid, id);
        showToast(`Subscription removed.`);
        setSelectedSub(null);
    }
  };

  const handleAddSubscription = async (newSub: Subscription) => {
    if (currentUser) {
        debugLog('SUBSCRIPTION_CREATE', 'Adding new subscription to Firestore', newSub);
        await addSubscription(currentUser.uid, newSub);
        setIsAddModalOpen(false);
        setCurrentView('dashboard');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
      const sub = subscriptions.find(s => s.id === id);
      if (sub && currentUser) {
          const current = new Date(sub.nextDate);
          if (sub.cycle === 'Monthly') {
              current.setMonth(current.getMonth() + 1);
          } else {
              current.setFullYear(current.getFullYear() + 1);
          }
          const newHistory = [...(sub.history || []), sub.price];
          const nextDate = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          
          await updateSubscription(currentUser.uid, id, { nextDate, history: newHistory });
          showToast(`${sub.name} marked as paid.`);
      }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-12 w-80 bg-card rounded-2xl shadow-xl border border-subtle z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
       <div className="p-4 border-b border-subtle flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-primary text-sm">{t('dashboard.notifications')}</h3>
          <button 
            onClick={handleMarkAllRead}
            className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
          >
            {t('dashboard.mark_read')}
          </button>
       </div>
       <div className="max-h-64 overflow-y-auto">
          {notifications.map(n => (
             <div 
               key={n.id} 
               className={`p-4 border-b border-subtle hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
             >
                <div className="flex justify-between items-start">
                   <p className={`text-xs text-primary mb-1 ${!n.read ? 'font-semibold' : ''}`}>{n.text}</p>
                   {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>}
                </div>
                <p className="text-[10px] text-muted">{n.time}</p>
             </div>
          ))}
          {notifications.length === 0 && (
             <div className="p-8 text-center text-muted text-xs">No notifications</div>
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
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' 
                : 'bg-card text-secondary border border-subtle hover:bg-gray-50 dark:hover:bg-gray-800'
             }`}
           >
              {cat === 'All' ? t('dashboard.filter.all') : t(`dashboard.filter.${cat.toLowerCase()}`)}
           </button>
        ))}
     </div>
  );

  const UpcomingTimeline = () => {
     const upcoming = [...subscriptions].sort((a,b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()).slice(0, 4);

     if (upcoming.length === 0 && !subscriptionsLoading) {
        return (
            <div className="bg-card rounded-2xl border border-subtle shadow-sm p-6 text-center">
                <h3 className="font-bold text-primary text-sm mb-2">{t('dashboard.upcoming')}</h3>
                <p className="text-xs text-muted">No upcoming payments.</p>
            </div>
        );
     }

     return (
        <div className="bg-card rounded-2xl border border-subtle shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                <Calendar size={16} className="text-muted" /> {t('dashboard.upcoming')}
            </h3>
            <button 
                onClick={() => setIsCalendarOpen(true)}
                className="text-[10px] font-bold text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                {t('dashboard.view_calendar')}
            </button>
            </div>
            {subscriptionsLoading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-4">
                {upcoming.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-subtle flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform cursor-pointer" onClick={() => setSelectedSub(sub)}>
                            <BrandIcon type={sub.type} className="w-6 h-6" noBackground />
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedSub(sub)}>
                            <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className="text-sm font-semibold text-primary truncate pr-2">{sub.name}</h4>
                            <span className="text-xs font-bold text-primary">
                                {formatPrice(sub.price, sub.currency)}
                            </span>
                            </div>
                            <div className="flex justify-between items-center">
                            <span className="text-[10px] text-secondary">{sub.nextDate}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${sub.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                                {sub.status}
                            </span>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(sub.id); }}
                            className="p-1.5 text-muted hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark as paid"
                        >
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                ))}
                </div>
            )}
        </div>
     );
  };

  const ExpenseBreakdown = () => {
     const breakdown = useMemo(() => {
        const cats: Record<string, number> = {};
        let total = 0;
        subscriptions.forEach(sub => {
            const cat = sub.category || 'Other';
            const priceInBase = convertAmount(sub.price, sub.currency, previewCurrency || currentCurrency);
            const cost = sub.cycle === 'Monthly' ? priceInBase : priceInBase / 12;
            
            cats[cat] = (cats[cat] || 0) + cost;
            total += cost;
        });
        
        return Object.entries(cats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([name, value]) => ({ 
                name, 
                percentage: total > 0 ? (value / total) * 100 : 0 
            }));
     }, [subscriptions, currentCurrency, previewCurrency]);

     return (
        <div className="bg-card rounded-2xl border border-subtle shadow-sm p-6 relative overflow-hidden">
            <h3 className="font-bold text-primary text-sm mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-muted" /> {t('dashboard.expense_breakdown')}
            </h3>
            
            {subscriptionsLoading ? (
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 animate-pulse"></div>
                    </div>
                </div>
            ) : breakdown.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted">Add subscriptions to see stats.</div>
            ) : (
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="20" />
                            {breakdown.map((item, i) => {
                                const dash = item.percentage; 
                                const color = ['#3B82F6', '#8B5CF6', '#10B981'][i] || '#9CA3AF';
                                return (
                                    <circle 
                                        key={i} cx="50" cy="50" r="40" fill="none" 
                                        stroke={color} strokeWidth="20" 
                                        strokeDasharray={`${dash} 1000`} 
                                        strokeDashoffset={-20 * i} 
                                        className="opacity-90" 
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-muted">Oct</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {breakdown.map((item, i) => {
                            const color = ['bg-blue-500', 'bg-purple-500', 'bg-green-500'][i] || 'bg-gray-400';
                            return (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-primary"><div className={`w-2 h-2 rounded-full ${color}`}></div>{item.name}</div>
                                    <span className="font-bold text-primary">{item.percentage.toFixed(0)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <button onClick={() => setCurrentView('analytics')} className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {t('dashboard.view_analytics')} <ArrowRight size={10} />
            </button>
        </div>
     );
  };

  const renderContent = () => {
    if (isAddModalOpen) {
      return (
        <div className="h-full flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-sm font-medium text-secondary hover:text-primary flex items-center gap-2"
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
             
             {/* AI Insights Card */}
             <AIInsightsCard subscriptions={subscriptions} />

             <div className="mb-8 flex items-center justify-between relative">
                <div>
                   <h1 className="text-2xl font-bold text-primary tracking-tight">{t('dashboard.title')}</h1>
                   <p className="text-secondary text-sm mt-1">
                      {subscriptionsLoading ? <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Syncing...</span> : `Welcome back, ${user.name}.`}
                   </p>
                </div>
                
                <div className="flex items-center gap-3">
                   {/* Notifications */}
                   <div className="relative">
                      <button 
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="w-10 h-10 bg-card border border-subtle rounded-xl flex items-center justify-center text-muted hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative shadow-sm"
                      >
                         <Bell size={20} />
                         {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
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
                     className="hidden sm:flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-95"
                   >
                      <Plus size={18} />
                      <span>{t('dashboard.add_sub')}</span>
                   </button>
                </div>
             </div>

             <div data-tour="stats-cards">
                <StatsCards 
                    monthly={metrics.monthlySpend} 
                    active={metrics.activeCount} 
                    forecast={metrics.yearlyForecast}
                    currencyCode={previewCurrency || currentCurrency} 
                />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 space-y-6">
                   <div>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-primary">{t('dashboard.active_subs')}</h2>
                            
                            {/* Global Currency Preview Toggle */}
                            <div className="relative">
                               <button 
                                 onClick={() => setIsPreviewSelectorOpen(!isPreviewSelectorOpen)}
                                 className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                    previewCurrency 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                                 }`}
                               >
                                  {previewCurrency ? (
                                     <>
                                        <Eye size={12} /> Preview: {previewCurrency}
                                     </>
                                  ) : (
                                     <>
                                        <EyeOff size={12} /> Preview Currency
                                     </>
                                  )}
                               </button>

                               {/* Tooltip */}
                               <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                  This is a display-only preview. Your subscriptions remain saved in their original currencies. No data is modified.
                                  <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
                               </div>

                               {/* Dropdown */}
                               {isPreviewSelectorOpen && (
                                  <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsPreviewSelectorOpen(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                       <button 
                                          onClick={() => { setPreviewCurrency(null); setIsPreviewSelectorOpen(false); }}
                                          className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${!previewCurrency ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}
                                       >
                                          Off (Original)
                                          {!previewCurrency && <CheckCircle2 size={12} />}
                                       </button>
                                       <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                                       {Object.values(CURRENCY_DATA).map(curr => (
                                          <button
                                             key={curr.code}
                                             onClick={() => { setPreviewCurrency(curr.code); setIsPreviewSelectorOpen(false); }}
                                             className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${previewCurrency === curr.code ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-600 dark:text-gray-300'}`}
                                          >
                                             {curr.code} ({curr.symbol})
                                             {previewCurrency === curr.code && <CheckCircle2 size={12} />}
                                          </button>
                                       ))}
                                    </div>
                                  </>
                               )}
                            </div>
                         </div>

                         <button onClick={() => setCurrentView('subscriptions')} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">{t('dashboard.view_all')}</button>
                      </div>
                      
                      <CategoryFilters />

                      <div className="bg-card rounded-2xl border border-subtle shadow-sm overflow-hidden min-h-[400px]">
                         {subscriptionsLoading && filteredSubscriptions.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <Loader2 size={32} className="animate-spin mb-2 text-indigo-500" />
                                <p>Loading subscriptions...</p>
                            </div>
                         ) : (
                            <SubscriptionTable 
                                subscriptions={filteredSubscriptions} 
                                onSelectSubscription={setSelectedSub}
                                onDeleteSubscription={handleSubDelete}
                                previewCurrency={previewCurrency}
                            />
                         )}
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
      case 'discover': return <Discover />;
      case 'settings': return (
        <SettingsPage 
          subscriptions={subscriptions} 
          onUpdateSubscriptions={undefined /* Settings no longer directly updates subs state via prop in this arch, listeners do it */}
          user={user}
        />
      );
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
           <h2 className="text-2xl font-bold text-primary">{t('features.subscriptions.title')}</h2>
           <SubscriptionTable 
             subscriptions={subscriptions} 
             onSelectSubscription={setSelectedSub} 
             onDeleteSubscription={handleSubDelete}
             previewCurrency={previewCurrency}
           />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-app font-sans text-primary transition-colors duration-300">
       
       {/* Sidebar - Hidden on mobile, controlled via state */}
       <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 md:z-0 h-full`}>
          <Sidebar 
            onLogout={onLogout} 
            currentView={currentView} 
            onNavigate={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} 
            onOpenAI={() => setIsAIOpen(!isAIOpen)}
          />
       </div>

       {/* Mobile Overlay */}
       {isMobileMenuOpen && (
         <div className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
       )}

       <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden bg-card border-b border-subtle p-4 flex items-center justify-between sticky top-0 z-20">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-secondary p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <Menu size={24} />
             </button>
             <span className="font-bold text-primary text-lg">SubscriptionHub</span>
             <div className="flex items-center gap-2">
               {/* Mobile Currency Switch */}
               <button onClick={() => setIsCurrencyModalOpen(true)} className="text-primary p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="text-xs font-bold">{currentCurrency}</span>
               </button>
               {/* Mobile AI Trigger */}
               <button onClick={() => setIsAIOpen(true)} className="text-primary p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="sr-only">AI Assistant</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path></svg>
               </button>
               <button onClick={() => setIsAddModalOpen(true)} className="text-primary p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Plus size={24} />
               </button>
             </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-app p-4 md:p-8 relative transition-colors duration-300">
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

       {/* AI Assistant */}
       <AIAssistant 
         isOpen={isAIOpen}
         onClose={() => setIsAIOpen(false)}
         subscriptions={subscriptions}
         currentPage={currentView}
       />

       {/* Currency Switcher (Base) */}
       <CurrencySelector 
         isOpen={isCurrencyModalOpen} 
         onClose={() => setIsCurrencyModalOpen(false)} 
         selectedCurrency={currentCurrency}
         onSelect={setCurrency}
       />

       {/* Onboarding Tour */}
       {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

       {/* Global Toast */}
       {toastMsg && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[100] animate-in slide-in-from-bottom-2 fade-in">
               <span className="font-medium text-sm">{toastMsg}</span>
           </div>
       )}
    </div>
  );
}
