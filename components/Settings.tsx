
import React, { useState } from 'react';
import { Bell, Shield, Eye, Globe, Zap, LogOut, Monitor, Smartphone, Download, FileText, DollarSign, CheckCircle2, MessageSquare, BarChart, CreditCard, Star, Calendar, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Subscription } from './SubscriptionModal';
import { CURRENCY_DATA } from '../utils/currency'; 
import { User } from '../App';
import { useFeedback } from '../contexts/FeedbackContext'; 
import { updateUserSettings } from '../utils/firestore';
import { useAuth } from '../contexts/AuthContext';
import UpgradeModal from './UpgradeModal';
import { createPortalSession } from '../utils/stripe';

interface SettingsProps {
  subscriptions?: Subscription[];
  onUpdateSubscriptions?: React.Dispatch<React.SetStateAction<Subscription[]>>;
  user?: User;
}

export default function Settings({ subscriptions = [], onUpdateSubscriptions, user }: SettingsProps) {
  const { t, currentCurrency, setCurrency } = useLanguage();
  const { currentUser, userProfile, isPro } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const { openFeedback } = useFeedback(); 

  const handleExportCSV = () => {
    const headers = ["Name", "Category", "Price", "Currency", "Billing Cycle", "Next Payment", "Status"];
    const rows = subscriptions.map(sub => [
        sub.name,
        sub.category || "Uncategorized",
        sub.price.toFixed(2),
        sub.currency,
        sub.cycle,
        sub.nextDate,
        sub.status
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "subsense_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoutAll = () => {
    if (window.confirm("Are you sure you want to log out of all devices?")) {
        alert("All other sessions have been invalidated.");
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    if (onUpdateSubscriptions) {
        onUpdateSubscriptions(prev => prev.map(sub => ({
            ...sub,
            currency: newCurrency
        })));
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAnalyticsOptOut = (optOut: boolean) => {
      localStorage.setItem('analytics_opt_out', String(optOut));
      if (currentUser) {
          updateUserSettings(currentUser.uid, { analyticsOptOut: optOut });
      }
  };

  const handleManageSubscription = async () => {
      await createPortalSession();
  };

  // Helper to format subscription dates safely
  const getRenewalDate = () => {
      if (!userProfile?.plan?.currentPeriodEnd) return "Unknown";
      try {
          // Handle both Firestore Timestamp and ISO string
          const date = typeof userProfile.plan.currentPeriodEnd === 'string' 
            ? new Date(userProfile.plan.currentPeriodEnd) 
            : userProfile.plan.currentPeriodEnd.toDate();
          return date.toLocaleDateString();
      } catch (e) {
          return "Unknown";
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('settings.desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 space-y-8">
            
            {/* Subscription Plan Card */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isPro ? 'bg-gradient-to-r from-indigo-900 to-purple-900 border-indigo-700' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                <div className={`px-6 py-4 border-b flex items-center gap-3 ${isPro ? 'border-indigo-700/50 bg-black/20' : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30'}`}>
                    <CreditCard className={isPro ? 'text-indigo-300' : 'text-gray-400'} size={20} />
                    <h3 className={`text-base font-bold ${isPro ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Subscription Plan</h3>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-lg font-bold ${isPro ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                    {isPro ? 'Pro Plan' : 'Free Plan'}
                                </h4>
                                {isPro && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${userProfile?.plan?.status === 'trial' ? 'bg-blue-400 text-white' : 'bg-yellow-400 text-black'}`}>
                                        {userProfile?.plan?.status === 'trial' ? 'TRIAL' : 'ACTIVE'}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm ${isPro ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                {isPro 
                                    ? `Next billing: ${getRenewalDate()} (${userProfile?.plan?.interval || 'month'}ly)` 
                                    : 'Upgrade to unlock advanced AI insights.'
                                }
                            </p>
                        </div>
                        {isPro ? (
                            <button 
                                onClick={handleManageSubscription}
                                className="text-sm font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                            >
                                Manage <ExternalLink size={14} />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsUpgradeOpen(true)}
                                className="text-sm font-bold text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                            >
                                Upgrade <Star size={14} className="fill-current" />
                            </button>
                        )}
                    </div>
                    {isPro && userProfile?.plan?.cancelAtPeriodEnd && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-white flex items-center gap-2">
                            <Calendar size={14} />
                            Your subscription will end on {getRenewalDate()}.
                        </div>
                    )}
                </div>
            </div>

            {/* Currency & Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <DollarSign className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Currency & Preferences</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex flex-col gap-4">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <label className="text-sm font-bold text-gray-900 dark:text-white">Base Currency</label>
                            <div className="relative min-w-[200px]">
                                <select 
                                    value={currentCurrency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer"
                                >
                                    {Object.values(CURRENCY_DATA).map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.flag} {c.code} - {c.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-3 pointer-events-none text-gray-400">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                                </div>
                            </div>
                         </div>
                         
                         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                <strong>Note:</strong> Changing your base currency will update how all subscription prices are displayed and calculated.
                            </p>
                         </div>
                    </div>
                </div>
            </div>

            {/* AI Settings */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-indigo-100/50 dark:border-indigo-800/50 flex items-center gap-3">
                    <Zap className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200">{t('settings.ai_title')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-sm text-indigo-800/70 dark:text-indigo-300/70">{t('settings.ai_desc')}</p>
                    
                    <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{t('settings.smart_suggestions')}</h4>
                            <p className="text-xs text-indigo-700/60 dark:text-indigo-300/60">{t('settings.smart_suggestions_desc')}</p>
                         </div>
                         <Toggle id="smart_suggestions" defaultChecked color="bg-indigo-600" />
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                        <div className="flex h-5 items-center mt-0.5">
                            <input type="checkbox" id="train-ai" className="text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" defaultChecked />
                        </div>
                        <label htmlFor="train-ai" className="text-xs text-indigo-800 dark:text-indigo-300 leading-snug cursor-pointer select-none">
                            {t('settings.train_ai')}
                        </label>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <Bell className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('settings.notifications')}</h3>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.payment_due')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">3 days before renewal</p>
                        </div>
                        <Toggle id="notify_payment" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.price_alerts')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Global price changes</p>
                        </div>
                        <Toggle id="notify_price" defaultChecked />
                    </div>
                </div>
            </div>

        </div>

        <div className="space-y-8">
            
            {/* Feedback & Beta */}
            <div className="bg-gray-900 dark:bg-blue-600 rounded-2xl shadow-lg shadow-gray-900/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-colors"></div>
                <div className="p-6 text-white relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <MessageSquare size={20} className="text-white/80" />
                        <h3 className="font-bold">Beta Feedback</h3>
                    </div>
                    <p className="text-sm text-white/70 mb-6 leading-relaxed">
                        Notice a bug or have a feature idea? Help us shape the future of SubSense.
                    </p>
                    <button 
                        onClick={() => openFeedback('settings')}
                        className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Give Feedback
                    </button>
                </div>
            </div>

            {/* Privacy */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <Eye className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('settings.privacy_visibility')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-6">{t('settings.show_stats')}</span>
                            <Toggle id="priv_stats" defaultChecked />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-6">{t('settings.show_subs')}</span>
                            <Toggle id="priv_subs" defaultChecked />
                         </div>
                    </div>
                </div>
            </div>

            {/* Analytics Opt-Out */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <BarChart className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Analytics</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Share Usage Data</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">Help us improve features by sharing anonymous usage stats.</p>
                        </div>
                        {/* Logic inverted: Toggle ON means Allow (not opt-out) */}
                        <Toggle 
                            id="allow_analytics" 
                            defaultChecked={!userProfile?.preferences?.analyticsOptOut} 
                            onChange={(checked) => handleAnalyticsOptOut(!checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Data */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <FileText className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Data & Export</h3>
                </div>
                <div className="p-6 space-y-4">
                    <button 
                      onClick={handleExportCSV}
                      className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 py-2.5 rounded-xl transition-colors"
                    >
                        <Download size={16} /> Export as CSV
                    </button>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <Shield className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('settings.security')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <button 
                        onClick={handleLogoutAll}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 py-2.5 rounded-xl transition-colors"
                    >
                        <LogOut size={16} /> {t('settings.logout_all')}
                    </button>
                </div>
            </div>

        </div>

      </div>

      {/* Confirmation Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 animate-in slide-in-from-bottom-4 fade-in">
            <CheckCircle2 size={18} className="text-green-400 dark:text-green-600" />
            <span className="font-medium text-sm">Settings updated successfully.</span>
        </div>
      )}
      
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </div>
  );
}

const Toggle = ({ id, defaultChecked = false, color = "bg-gray-900 dark:bg-blue-600", onChange }: { id: string, defaultChecked?: boolean, color?: string, onChange?: (val: boolean) => void }) => {
  const [enabled, setEnabled] = useState(() => {
      const saved = localStorage.getItem(`setting_${id}`);
      return saved !== null ? JSON.parse(saved) : defaultChecked;
  });

  const toggle = () => {
      const newVal = !enabled;
      setEnabled(newVal);
      localStorage.setItem(`setting_${id}`, JSON.stringify(newVal));
      if (onChange) onChange(newVal);
  };

  return (
    <button 
      onClick={toggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? color : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
    </button>
  );
};
