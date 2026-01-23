import React, { useState } from 'react';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import SubscriptionTable from './SubscriptionTable';
import Friends from './Friends';
import Analytics from './Analytics';
import Settings from './Settings';
import Comparison from './Comparison';
import HelpCenter from './HelpCenter';
import SubscriptionModal, { Subscription } from './SubscriptionModal';
import SubscriptionSearchPanel from './SubscriptionSearchPanel';
import { Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionDetail } from '../utils/data';

interface DashboardProps {
  onLogout: () => void;
}

// Initial Data
const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 1, name: 'Netflix', plan: 'Premium 4K', price: 19.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 24, 2023', type: 'netflix', status: 'Active', billingDay: 24, history: [15.99, 15.99, 17.49, 19.99, 19.99] },
  { id: 2, name: 'Spotify', plan: 'Duo Plan', price: 14.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 28, 2023', type: 'spotify', status: 'Active', billingDay: 28, history: [12.99, 12.99, 13.99, 14.99, 14.99] },
  { id: 3, name: 'Adobe Creative Cloud', plan: 'All Apps', price: 54.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Nov 01, 2023', type: 'adobe', status: 'Expiring', billingDay: 1, history: [52.99, 52.99, 52.99, 54.99, 54.99] },
  { id: 4, name: 'Amazon Prime', plan: 'Annual', price: 139.00, currency: 'USD', cycle: 'Yearly', nextDate: 'Feb 12, 2024', type: 'amazon', status: 'Active', billingDay: 12, history: [119.00, 119.00, 139.00, 139.00, 139.00] },
  { id: 5, name: 'YouTube Premium', plan: 'Individual', price: 13.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 15, 2023', type: 'youtube', status: 'Active', billingDay: 15, history: [11.99, 11.99, 11.99, 13.99, 13.99] },
];

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const { t } = useLanguage();

  const handleSubUpdate = (updatedSub: Subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  const handleSubDelete = (id: number) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSubscription = (service: SubscriptionDetail) => {
    const newSub: Subscription = {
        id: Math.max(...subscriptions.map(s => s.id), 0) + 1,
        name: service.name,
        plan: 'Standard',
        price: parseFloat(service.price),
        currency: service.currency,
        cycle: 'Monthly',
        nextDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: service.type,
        status: 'Active',
        billingDay: new Date().getDate(),
        history: [parseFloat(service.price)]
    };
    setSubscriptions(prev => [newSub, ...prev]);
    // Switch back to dashboard after a short delay or stay? 
    // Staying allows adding more. The toast in SearchPanel confirms action.
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        onLogout={onLogout} 
        currentView={currentView} 
        onNavigate={setCurrentView} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Full screen wrapper for search panel to handle its own layout */}
        {currentView === 'subscriptions' ? (
            <SubscriptionSearchPanel onAddSubscription={handleAddSubscription} />
        ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            
            {currentView === 'dashboard' && (
                <>
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
                        <p className="text-gray-500 text-sm mt-1">{t('dashboard.welcome')}</p>
                    </div>
                    
                    {/* Desktop Add Button */}
                    <button 
                        onClick={() => setCurrentView('subscriptions')}
                        className="hidden sm:flex items-center justify-center space-x-2 rtl:space-x-reverse bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        <span>{t('dashboard.add_sub')}</span>
                    </button>
                    </div>

                    {/* Stats Section */}
                    <div className="mb-10">
                    <StatsCards />
                    </div>
                    
                    {/* Main Table Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.active_subs')}</h2>
                        <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            {t('dashboard.view_all')}
                        </button>
                    </div>
                    <SubscriptionTable 
                        subscriptions={subscriptions}
                        onSelectSubscription={setSelectedSub}
                    />
                    </div>
                </>
            )}

            {currentView === 'friends' && <Friends />}
            {currentView === 'analytics' && <Analytics />}
            {currentView === 'compare' && <Comparison />}
            {currentView === 'settings' && <Settings />}
            {currentView === 'help' && <HelpCenter />}
            
            {/* Placeholder for other views */}
            {(currentView !== 'dashboard' && currentView !== 'friends' && currentView !== 'analytics' && currentView !== 'settings' && currentView !== 'compare' && currentView !== 'help' && currentView !== 'subscriptions') && (
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

      {/* Edit Modal */}
      <SubscriptionModal 
        isOpen={!!selectedSub} 
        subscription={selectedSub} 
        onClose={() => setSelectedSub(null)}
        onSave={handleSubUpdate}
        onDelete={handleSubDelete}
      />

      {/* Mobile Floating Action Button - Only show on Dashboard */}
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