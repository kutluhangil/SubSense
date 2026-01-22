import React, { useState } from 'react';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import SubscriptionTable from './SubscriptionTable';
import Friends from './Friends';
import Analytics from './Analytics';
import Settings from './Settings';
import Comparison from './Comparison';
import HelpCenter from './HelpCenter';
import { Plus } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        onLogout={onLogout} 
        currentView={currentView} 
        onNavigate={setCurrentView} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
           
           {currentView === 'dashboard' && (
             <>
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, Alex. You have 2 payments due this week.</p>
                  </div>
                  
                  {/* Desktop Add Button */}
                  <button className="hidden sm:flex items-center justify-center space-x-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-95">
                      <Plus size={18} />
                      <span>Add Subscription</span>
                  </button>
                </div>

                {/* Stats Section */}
                <div className="mb-10">
                  <StatsCards />
                </div>
                
                {/* Main Table Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
                      <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        View All
                      </button>
                  </div>
                  <SubscriptionTable />
                </div>
             </>
           )}

           {currentView === 'friends' && <Friends />}
           {currentView === 'analytics' && <Analytics />}
           {currentView === 'compare' && <Comparison />}
           {currentView === 'settings' && <Settings />}
           {currentView === 'help' && <HelpCenter />}
           
           {/* Placeholder for other views */}
           {(currentView !== 'dashboard' && currentView !== 'friends' && currentView !== 'analytics' && currentView !== 'settings' && currentView !== 'compare' && currentView !== 'help') && (
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
      </main>

      {/* Mobile Floating Action Button - Only show on Dashboard */}
      {currentView === 'dashboard' && (
        <button className="fixed bottom-6 right-6 sm:hidden bg-gray-900 text-white p-4 rounded-full shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-transform active:scale-95 z-50">
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}