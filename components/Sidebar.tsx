
import React, { useState } from 'react';
import { LayoutGrid, CreditCard, PieChart, Users, Settings, LogOut, HelpCircle, ArrowRightLeft, User, Compass, Sparkles, Star } from 'lucide-react';
import Logo from './Logo';
import BetaBadge from './BetaBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { updateFeatureUsage } from '../utils/firestore';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../utils/analytics';
import UpgradeModal from './UpgradeModal';

interface SidebarProps {
  onLogout: () => void;
  currentView?: string;
  onNavigate?: (view: string) => void;
  onOpenAI?: () => void; // New prop
}

const Sidebar = ({ onLogout, currentView = 'dashboard', onNavigate, onOpenAI }: SidebarProps) => {
  const { t } = useLanguage();
  const { currentUser, isPro } = useAuth();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeRect, setUpgradeRect] = useState<DOMRect | null>(null);
  const upgradeBtnRef = React.useRef<HTMLButtonElement>(null);

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
      trackEvent('feature_viewed', { feature_name: view });
      if (currentUser) {
        updateFeatureUsage(currentUser.uid, `view_${view}`);
      }
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: t('sidebar.dashboard') },
    { id: 'profile', icon: User, label: t('sidebar.profile') },
    { id: 'friends', icon: Users, label: t('sidebar.friends') },
    { id: 'subscriptions', icon: CreditCard, label: t('sidebar.subscriptions') },
    { id: 'analytics', icon: PieChart, label: t('sidebar.analytics') },
    { id: 'compare', icon: ArrowRightLeft, label: t('sidebar.compare') },
    { id: 'discover', icon: Compass, label: t('sidebar.discover') },
  ];

  return (
    <>
      <div className="hidden md:flex flex-col w-64 bg-sidebar border-r border-subtle h-full transition-colors duration-300">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-subtle cursor-pointer" onClick={() => handleNavigate('dashboard')}>
          <Logo className="h-8" />
          <BetaBadge />
        </div>

        {/* Navigation */}
        <div className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-4">{t('sidebar.menu')}</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              data-tour={`nav-${item.id}`}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === item.id
                ? 'bg-gray-50 dark:bg-gray-700/50 text-primary font-medium shadow-sm'
                : 'text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary'
                }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-primary' : 'text-muted group-hover:text-secondary'} />
              <span>{item.label}</span>
            </button>
          ))}

          {/* AI Assistant Divider */}
          <div className="my-4 border-t border-subtle mx-4"></div>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            <div className="relative">
              <Sparkles size={20} className="text-indigo-500 animate-pulse" />
              <div className="absolute inset-0 bg-indigo-400 blur-sm opacity-20 animate-pulse"></div>
            </div>
            <span className="font-semibold">AI Assistant</span>
          </button>

          <div className="my-4 border-t border-subtle mx-4"></div>

          <p className="px-4 text-xs font-semibold text-muted uppercase tracking-wider mb-4">{t('sidebar.account')}</p>
          <button
            data-tour="nav-settings"
            onClick={() => handleNavigate('settings')}
            className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'settings'
              ? 'bg-gray-50 dark:bg-gray-700/50 text-primary font-medium shadow-sm'
              : 'text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary'
              }`}
          >
            <Settings size={20} className={currentView === 'settings' ? 'text-primary' : 'text-muted group-hover:text-secondary'} />
            <span>{t('sidebar.settings')}</span>
          </button>
          <button
            onClick={() => handleNavigate('help')}
            className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'help'
              ? 'bg-gray-50 dark:bg-gray-700/50 text-primary font-medium shadow-sm'
              : 'text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary'
              }`}
          >
            <HelpCircle size={20} className={currentView === 'help' ? 'text-primary' : 'text-muted group-hover:text-secondary'} />
            <span>{t('sidebar.help')}</span>
          </button>
        </div>

        {/* Pro Upgrade CTA (Only for Free Users) */}
        {!isPro && (
          <div className="mx-4 mb-4">
            <button
              ref={upgradeBtnRef}
              onClick={() => {
                if (upgradeBtnRef.current) {
                  setUpgradeRect(upgradeBtnRef.current.getBoundingClientRect());
                }
                setIsUpgradeOpen(true);
              }}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-indigo-600 dark:to-purple-600 text-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Star size={16} className="text-yellow-300 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Upgrade to Pro</p>
                  <p className="text-[10px] text-gray-300">Unlock AI Insights</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="p-4 border-t border-subtle">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-secondary hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut size={20} className="text-muted group-hover:text-red-500 dark:group-hover:text-red-400" />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        anchorRect={upgradeRect}
      />
    </>
  );
};

export default React.memo(Sidebar);
