
import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Sun, Monitor, Camera, Save, Eye, EyeOff, Lock, Globe, Share2, Zap, Layout, LogOut, Smartphone, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ProfileCardModal, { UserProfile } from './ProfileCardModal';
import BrandIcon from './BrandIcon';

export default function Settings() {
  const { t } = useLanguage();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [integrations, setIntegrations] = useState<{id: string, name: string, connected: boolean, icon: string}[]>([
    { id: 'spotify', name: 'Spotify', connected: true, icon: 'spotify' },
    { id: 'youtube', name: 'YouTube', connected: false, icon: 'youtube' },
    { id: 'notion', name: 'Notion', connected: false, icon: 'notion' },
    { id: 'discord', name: 'Discord', connected: true, icon: 'discord' },
    { id: 'behance', name: 'Behance', connected: false, icon: 'behance' }
  ]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Mock User Data for Preview
  const userData: UserProfile = {
    name: "Alex Morgan",
    username: "alexmorgan",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Product designer based in NY. Obsessed with coffee and optimizing my subscription stack. ☕️ ✨",
    location: "New York, USA",
    website: "alexmorgan.design",
    joinedDate: "October 2023",
    totalSubs: 12,
    monthlySpend: 245.50,
    currency: "USD",
    status: "online",
    isSelf: true,
    integrations: integrations.filter(i => i.connected).map(i => i.id)
  };

  const handleConnect = (id: string) => {
    if (integrations.find(i => i.id === id)?.connected) {
      // Disconnect logic
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false } : i));
    } else {
      // Connect simulation
      setConnectingId(id);
      setTimeout(() => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true } : i));
        setConnectingId(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('settings.desc')}</p>
        </div>
        <button 
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Eye size={16} /> {t('settings.preview')}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-8">
            
            {/* Profile Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <User className="text-indigo-600" size={20} />
                    <h3 className="text-base font-bold text-gray-900">{t('settings.profile')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100">
                                <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-lg text-gray-900">{userData.name}</h4>
                            <p className="text-sm text-gray-500 mb-3">Update your photo and personal details.</p>
                            <div className="flex gap-3 justify-center sm:justify-start">
                                <button className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Change Photo</button>
                                <button className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1.5">{t('friends.remove')}</button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
                            <input type="text" defaultValue={userData.name} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Username</label>
                            <div className="relative">
                                <span className="absolute left-4 top-2.5 text-gray-400 font-medium">@</span>
                                <input type="text" defaultValue={userData.username} className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900" />
                                <Check size={16} className="absolute right-3 top-3 text-green-500" />
                            </div>
                            <p className="text-[10px] text-gray-400 pl-1">subscriptionhub.com/u/{userData.username}</p>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">About Me</label>
                            <textarea 
                                defaultValue={userData.bio} 
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                placeholder="Tell the world who you are..."
                            />
                            <div className="flex justify-end">
                                <span className="text-[10px] text-gray-400">84/160</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Location</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3.5 top-3 text-gray-400" />
                                <input type="text" defaultValue={userData.location} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="City, Country" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Website</label>
                            <input type="text" defaultValue={userData.website} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="https://" />
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                    <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md active:scale-95">
                        <Save size={16} />
                        {t('settings.save')}
                    </button>
                </div>
            </div>

            {/* Integrations Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <Share2 className="text-purple-600" size={20} />
                    <div>
                        <h3 className="text-base font-bold text-gray-900">{t('settings.connected')}</h3>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6">{t('settings.connect_desc')}</p>
                    <div className="space-y-4">
                        {integrations.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg group-hover:scale-110 transition-transform">
                                        <BrandIcon type={app.icon} className="w-6 h-6" noBackground />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{app.name}</h4>
                                        <p className="text-xs text-gray-500">{app.connected ? t('settings.connected_status') : t('settings.not_connected')}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleConnect(app.id)}
                                    disabled={connectingId === app.id}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                        app.connected 
                                            ? 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100' 
                                            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                                    }`}
                                >
                                    {connectingId === app.id ? (
                                        <span className="animate-pulse">Connecting...</span>
                                    ) : app.connected ? (
                                        <span className="flex items-center gap-1"><Check size={12} /> {t('settings.connected_status')}</span>
                                    ) : (
                                        t('settings.connect_btn')
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* AI Settings */}
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
                         <select className="bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                            <option>Budget Saving</option>
                            <option>Global Comparison</option>
                            <option>Social Trends</option>
                         </select>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-indigo-100">
                        <input type="checkbox" id="train-ai" className="mt-0.5 text-indigo-600 rounded focus:ring-indigo-500" defaultChecked />
                        <label htmlFor="train-ai" className="text-xs text-indigo-800 leading-snug cursor-pointer">
                            {t('settings.train_ai')}
                        </label>
                    </div>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
            
            {/* Privacy & Visibility */}
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
                            <select className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-medium rounded-lg px-2 py-1 focus:outline-none">
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

            {/* Notifications */}
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

            {/* Security Log */}
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
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                           <Lock size={16} className="text-gray-400" />
                           <span className="text-sm font-medium text-gray-700">{t('settings.two_step')}</span>
                        </div>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">{t('settings.setup')}</button>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors">
                        <LogOut size={16} /> {t('settings.logout_all')}
                    </button>
                </div>
            </div>

        </div>

      </div>

      {/* Profile Card Preview Modal */}
      <ProfileCardModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        user={userData}
      />
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
