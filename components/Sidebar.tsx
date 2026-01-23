import React from 'react';
import { LayoutGrid, CreditCard, PieChart, Users, Settings, LogOut, HelpCircle, ArrowRightLeft } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  onLogout: () => void;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export default function Sidebar({ onLogout, currentView = 'dashboard', onNavigate }: SidebarProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: t('sidebar.dashboard') },
    { id: 'friends', icon: Users, label: t('sidebar.friends') },
    { id: 'subscriptions', icon: CreditCard, label: t('sidebar.subscriptions') },
    { id: 'analytics', icon: PieChart, label: t('sidebar.analytics') },
    { id: 'compare', icon: ArrowRightLeft, label: t('sidebar.compare') },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-full">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-50 cursor-pointer" onClick={() => onNavigate && onNavigate('dashboard')}>
        <Logo className="h-8" />
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('sidebar.menu')}</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.id)}
            className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-gray-50 text-gray-900 font-medium' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'} />
            <span>{item.label}</span>
          </button>
        ))}
        
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4">{t('sidebar.account')}</p>
        <button 
          onClick={() => onNavigate && onNavigate('settings')}
          className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group ${
            currentView === 'settings' 
            ? 'bg-gray-50 text-gray-900 font-medium' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings size={20} className={currentView === 'settings' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'} />
          <span>{t('sidebar.settings')}</span>
        </button>
        <button 
          onClick={() => onNavigate && onNavigate('help')}
          className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group ${
            currentView === 'help' 
            ? 'bg-gray-50 text-gray-900 font-medium' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <HelpCircle size={20} className={currentView === 'help' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'} />
          <span>{t('sidebar.help')}</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
}