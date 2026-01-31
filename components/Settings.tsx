
import React, { useState } from 'react';
import { Bell, Shield, Eye, Globe, Zap, LogOut, Monitor, Smartphone, Download, FileText, DollarSign, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Subscription } from './SubscriptionModal';
import { CURRENCY_DATA } from '../utils/currency'; 
import { User } from '../App';

interface SettingsProps {
  subscriptions?: Subscription[];
  onUpdateSubscriptions?: React.Dispatch<React.SetStateAction<Subscription[]>>;
  user?: User;
}

export default function Settings({ subscriptions = [], onUpdateSubscriptions, user }: SettingsProps) {
  const { t, currentCurrency, setCurrency } = useLanguage();
  const [showToast, setShowToast] = useState(false);

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
    link.setAttribute("download", "subscription_hub_export.csv");
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
    // 1. Update Global Context
    setCurrency(newCurrency);

    // 2. Update All Existing Subscriptions (Nominal Switch - No FX)
    if (onUpdateSubscriptions) {
        onUpdateSubscriptions(prev => prev.map(sub => ({
            ...sub,
            currency: newCurrency
        })));
    }

    // 3. Update User Persistence (if user exists)
    if (user) {
        try {
            const users = JSON.parse(localStorage.getItem('subscriptionhub.users') || '[]');
            const updatedUsers = users.map((u: User) => {
                if (u.email === user.email) {
                    return { ...u, currency: newCurrency };
                }
                return u;
            });
            localStorage.setItem('subscriptionhub.users', JSON.stringify(updatedUsers));
        } catch (e) {
            console.error("Failed to persist user currency preference", e);
        }
    }

    // 4. Show Feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
            
            {/* Currency & Localization */}
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
                         
                         {/* Important Note */}
                         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                <strong>Note:</strong> Changing your base currency will update how all subscription prices are displayed and calculated across the app. 
                                This does not convert prices using exchange rates — it only changes the currency used for your subscriptions.
                            </p>
                         </div>
                    </div>
                </div>
            </div>

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
                    
                    <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{t('settings.focus_area')}</h4>
                            <p className="text-xs text-indigo-700/60 dark:text-indigo-300/60">{t('settings.focus_area_desc')}</p>
                         </div>
                         <select className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
                            <option>Budget Saving</option>
                            <option>Global Comparison</option>
                            <option>Social Trends</option>
                         </select>
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.weekly_digest')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Summary via email</p>
                        </div>
                        <Toggle id="notify_digest" />
                    </div>
                </div>
            </div>

        </div>

        <div className="space-y-8">
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <Eye className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('settings.privacy_visibility')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe size={16} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Profile Visibility</span>
                            </div>
                            <select className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs font-medium rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                                <option>Public</option>
                                <option>Friends Only</option>
                                <option>Private</option>
                            </select>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-6">{t('settings.show_stats')}</span>
                            <Toggle id="priv_stats" defaultChecked />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-6">{t('settings.show_subs')}</span>
                            <Toggle id="priv_subs" defaultChecked />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-6">{t('settings.allow_requests')}</span>
                            <Toggle id="priv_requests" defaultChecked />
                         </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <FileText className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Data & Export</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                       Download a copy of your subscription data for your personal records or for use in other applications.
                    </p>
                    <button 
                      onClick={handleExportCSV}
                      className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 py-2.5 rounded-xl transition-colors"
                    >
                        <Download size={16} /> Export as CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <Shield className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('settings.security')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">{t('settings.recent_activity')}</h4>
                        <div className="space-y-3">
                             <div className="flex items-center justify-between text-xs p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                                 <div className="flex items-center gap-3">
                                     <Monitor size={14} className="text-gray-400" />
                                     <div>
                                         <p className="font-semibold text-gray-900 dark:text-white">Chrome on Windows</p>
                                         <p className="text-gray-500 dark:text-gray-400">New York, USA • Active now</p>
                                     </div>
                                 </div>
                                 <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-md border border-green-100 dark:border-green-800">Current</span>
                             </div>
                             <div className="flex items-center justify-between text-xs p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                 <div className="flex items-center gap-3">
                                     <Smartphone size={14} className="text-gray-400" />
                                     <div>
                                         <p className="font-semibold text-gray-900 dark:text-white">iPhone 13 App</p>
                                         <p className="text-gray-500 dark:text-gray-400">New York, USA • 2h ago</p>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                    
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
            <span className="font-medium text-sm">Base currency updated successfully.</span>
        </div>
      )}
    </div>
  );
}

const Toggle = ({ id, defaultChecked = false, color = "bg-gray-900 dark:bg-blue-600" }: { id: string, defaultChecked?: boolean, color?: string }) => {
  // Initialize state from localStorage or default
  const [enabled, setEnabled] = useState(() => {
      const saved = localStorage.getItem(`setting_${id}`);
      return saved !== null ? JSON.parse(saved) : defaultChecked;
  });

  const toggle = () => {
      const newVal = !enabled;
      setEnabled(newVal);
      localStorage.setItem(`setting_${id}`, JSON.stringify(newVal));
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
