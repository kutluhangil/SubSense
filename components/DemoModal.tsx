
import React, { useState, useMemo } from 'react';
import { 
  X, LayoutGrid, Users, CreditCard, PieChart, 
  ArrowRightLeft, LogOut, Lock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import StatsCards from './StatsCards';
import SubscriptionTable from './SubscriptionTable';
import { Subscription } from './SubscriptionModal';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
}

const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: 1, name: 'Netflix', plan: 'Premium 4K', price: 19.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 24, 2023', type: 'netflix', status: 'Active', billingDay: 24, category: 'Entertainment', history: [15.99, 15.99, 19.99] },
  { id: 2, name: 'Spotify', plan: 'Duo Plan', price: 14.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 28, 2023', type: 'spotify', status: 'Active', billingDay: 28, category: 'Entertainment', history: [12.99, 14.99] },
  { id: 3, name: 'Adobe Creative Cloud', plan: 'All Apps', price: 54.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Nov 01, 2023', type: 'adobe', status: 'Expiring', billingDay: 1, category: 'Productivity', history: [54.99] },
  { id: 4, name: 'Amazon Prime', plan: 'Annual', price: 139.00, currency: 'USD', cycle: 'Yearly', nextDate: 'Feb 12, 2024', type: 'amazon', status: 'Active', billingDay: 12, category: 'Shopping', history: [139.00] },
];

export default function DemoModal({ isOpen, onClose, onSignup }: DemoModalProps) {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('dashboard');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showLockedToast = () => {
      setToastMsg(t('demo.sidebar.locked'));
      setTimeout(() => setToastMsg(null), 2000);
  };

  const metrics = useMemo(() => {
    let monthlyTotal = 0;
    let yearlyTotalForecast = 0;
    
    DEMO_SUBSCRIPTIONS.forEach(sub => {
      // Normalize to monthly cost
      if (sub.cycle === 'Monthly') {
        monthlyTotal += sub.price;
        yearlyTotalForecast += sub.price * 12;
      } else {
        monthlyTotal += sub.price / 12;
        yearlyTotalForecast += sub.price;
      }
    });

    return {
      monthlySpend: monthlyTotal,
      activeCount: DEMO_SUBSCRIPTIONS.length,
      yearlyForecast: yearlyTotalForecast
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        
        {/* Sidebar Mockup */}
        <div className="w-64 bg-gray-50 border-r border-gray-100 hidden md:flex flex-col">
           <div className="h-16 flex items-center px-6 border-b border-gray-100/50">
              <span className="font-bold text-gray-900 text-xl tracking-tight">Subscription<span className="text-blue-600">Hub</span></span>
           </div>
           <div className="p-4 space-y-1">
              <button 
                onClick={() => setCurrentView('dashboard')} 
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                 <LayoutGrid size={18} /> <span>{t('sidebar.dashboard')}</span>
              </button>
              <button 
                onClick={() => setCurrentView('subs')} 
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'subs' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                 <CreditCard size={18} /> <span>{t('sidebar.subscriptions')}</span>
              </button>
              {/* Disabled Items */}
              <button onClick={showLockedToast} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-100 transition-colors group cursor-not-allowed">
                 <div className="flex items-center space-x-3"><PieChart size={18} /> <span>{t('sidebar.analytics')}</span></div>
                 <Lock size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={showLockedToast} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-100 transition-colors group cursor-not-allowed">
                 <div className="flex items-center space-x-3"><Users size={18} /> <span>{t('sidebar.friends')}</span></div>
                 <Lock size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={showLockedToast} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-100 transition-colors group cursor-not-allowed">
                 <div className="flex items-center space-x-3"><ArrowRightLeft size={18} /> <span>{t('sidebar.compare')}</span></div>
                 <Lock size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
           </div>
           <div className="mt-auto p-4 border-t border-gray-100">
              <button onClick={onClose} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                 <LogOut size={18} /> <span>{t('demo.close')}</span>
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
           
           {/* Top Bar */}
           <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
              <h2 className="font-bold text-gray-900 text-lg">{t('demo.title')}</h2>
              <div className="flex items-center gap-3">
                 <button onClick={onSignup} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">
                    {t('nav.signup')}
                 </button>
                 <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                    <X size={20} />
                 </button>
              </div>
           </div>

           {/* Scrollable Area */}
           <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
              {currentView === 'dashboard' ? (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <StatsCards 
                      monthly={metrics.monthlySpend}
                      active={metrics.activeCount}
                      forecast={metrics.yearlyForecast}
                    />
                    <div className="space-y-4">
                       <h3 className="font-bold text-gray-900 text-lg">{t('dashboard.active_subs')}</h3>
                       <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                          <SubscriptionTable subscriptions={DEMO_SUBSCRIPTIONS} />
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                       <CreditCard size={40} />
                    </div>
                    <div className="max-w-md space-y-2">
                       <h3 className="text-2xl font-bold text-gray-900">{t('demo.unlock_all')}</h3>
                       <p className="text-gray-500">
                          {t('hero.take_control_desc')}
                       </p>
                    </div>
                    <button 
                      onClick={onSignup} 
                      className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                       {t('hero.start_tracking_free')} &rarr;
                    </button>
                 </div>
              )}
           </div>

           {/* Floating CTA Overlay */}
           <div 
             className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur text-white pl-5 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-4 z-20 hover:scale-105 transition-transform cursor-pointer border border-gray-700/50" 
             onClick={onSignup}
           >
              <span className="text-xs font-bold hidden sm:inline">{t('demo.tip')}</span>
              <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors">
                 {t('demo.start_trial')}
              </span>
           </div>

           {/* Toast for Locked Items */}
           {toastMsg && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg animate-in slide-in-from-top-2 fade-in z-50">
                    {toastMsg}
                </div>
           )}

        </div>
      </div>
    </div>
  );
}
