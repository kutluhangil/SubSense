
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
import CalendarModal from './CalendarModal'; // New Import
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // Calendar State
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
           <button 
             onClick={() => setIsCalendarOpen(true)}
             className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
           >
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
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="20"