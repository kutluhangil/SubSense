
import React, { useState } from 'react';
import { Bell, Shield, Eye, Lock, Globe, Zap, LogOut, Monitor, Smartphone, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Settings() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('settings.desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 space-y-8">
            
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-indigo-100/50 flex items-center gap-3">
                    <Zap className="text-indigo-600" size={20} />
                    <h3 className="text-base font-bold text-indigo-900">{t('settings.ai_title')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-sm text-indigo-800/70">{t('settings.ai_desc')}</p>
                    
                    <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-sm font-bold text-indigo-900">{t('settings.smart_suggestions')}</h4>
                            <p className="text-xs text-indigo-700/60">{t('settings.smart_suggestions_desc')}</p>
                         </div>
                         <Toggle defaultChecked color="bg-indigo-600" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-sm font-bold text-indigo-900">{t('settings.focus_area')}</h4>
                            <p className="text-xs text-indigo-700/60">{t('settings.focus_area_desc')}</p>
                         </div>
                         <select className="bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
                            <option>Budget Saving</option>
                            <option>Global Comparison</option>
                            <option>Social Trends</option>
                         </select>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-indigo-100">
                        <div className="flex h-5 items-center mt-0.5">
                            <input type="checkbox" id="train-ai" className="text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" defaultChecked />
                        </div>
                        <label htmlFor="train-ai" className="text-xs text-indigo-800 leading-snug cursor-pointer select-none">
                            {t('settings.train_ai')}
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <Bell className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900">{t('settings.notifications')}</h3>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">{t('settings.payment_due')}</h4>
                            <p className="text-xs text-gray-500">3 days before renewal</p>
                        </div>
                        <Toggle defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">{t('settings.price_alerts')}</h4>
                            <p className="text-xs text-gray-500">Global price changes</p>
                        </div>
                        <Toggle defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">{t('settings.weekly_digest')}</h4>
                            <p className="text-xs text-gray-500">Summary via email</p>
                        </div>
                        <Toggle />
                    </div>
                </div>
            </div>

        </div>

        <div className="space-y-8">
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <Eye className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900">{t('settings.privacy_visibility')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe size={16} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">Profile Visibility</span>
                            </div>
                            <select className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                                <option>Public</option>
                                <option>Friends Only</option>
                                <option>Private</option>
                            </select>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 pl-6">{t('settings.show_stats')}</span>
                            <Toggle defaultChecked />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 pl-6">{t('settings.show_subs')}</span>
                            <Toggle defaultChecked />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 pl-6">{t('settings.allow_requests')}</span>
                            <Toggle defaultChecked />
                         </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <Shield className="text-gray-400" size={20} />
                    <h3 className="text-base font-bold text-gray-900">{t('settings.security')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">{t('settings.recent_activity')}</h4>
                        <div className="space-y-3">
                             <div className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl border border-gray-100">
                                 <div className="flex items-center gap-3">
                                     <Monitor size={14} className="text-gray-400" />
                                     <div>
                                         <p className="font-semibold text-gray-900">Chrome on Windows</p>
                                         <p className="text-gray-500">New York, USA • Active now</p>
                                     </div>
                                 </div>
                                 <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-100">Current</span>
                             </div>
                             <div className="flex items-center justify-between text-xs p-3 bg-white rounded-xl border border-gray-100">
                                 <div className="flex items-center gap-3">
                                     <Smartphone size={14} className="text-gray-400" />
                                     <div>
                                         <p className="font-semibold text-gray-900">iPhone 13 App</p>
                                         <p className="text-gray-500">New York, USA • 2h ago</p>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                    
                    <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors">
                        <LogOut size={16} /> {t('settings.logout_all')}
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}

const Toggle = ({ defaultChecked = false, color = "bg-gray-900" }: { defaultChecked?: boolean, color?: string }) => {
  const [enabled, setEnabled] = useState(defaultChecked);
  return (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? color : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
    </button>
  );
};
