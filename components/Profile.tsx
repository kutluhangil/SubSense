
import React, { useState, useEffect } from 'react';
import { User, MapPin, Globe, Mail, Phone, Camera, Edit2, Link as LinkIcon, Calendar, Activity, CheckCircle, Zap, Sun, Moon, Monitor, Check, Trophy, Wallet, Flame, Clock, Brain, Tv, CreditCard, Palette, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Mock Data
const INITIAL_USER = {
  name: "Alex Morgan",
  username: "alexmorgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 123-4567",
  location: "New York, USA",
  website: "alexmorgan.design",
  bio: "Product designer based in NY. Obsessed with coffee and optimizing my subscription stack. ☕️ ✨",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  joinedDate: "October 2023",
  totalSubs: 12,
  monthlySpend: 245.50,
  lastLogin: "2 hours ago",
  activeStreak: 12,
  theme: "system"
};

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
];

const BADGES = [
  { id: 'top_saver', name: 'Top Saver', desc: 'Saved 20%+ compared to avg spend', icon: Wallet, color: 'from-green-400 to-green-600', earned: true },
  { id: 'active_tracker', name: 'Active Tracker', desc: 'Logged in 7 days in a row', icon: Flame, color: 'from-orange-400 to-red-600', earned: true },
  { id: 'early_adopter', name: 'Early Adopter', desc: 'Joined within first 3 months', icon: Clock, color: 'from-blue-400 to-indigo-600', earned: true },
  { id: 'smart_optimizer', name: 'Smart Optimizer', desc: 'Canceled overlapping subscriptions', icon: Brain, color: 'from-purple-400 to-pink-600', earned: false },
  { id: 'global_explorer', name: 'Global Explorer', desc: 'Compared pricing across 3+ countries', icon: Globe, color: 'from-teal-400 to-cyan-600', earned: true },
  { id: 'entertainment', name: 'Entertainment Lover', desc: 'Subscribed to 3+ streaming services', icon: Tv, color: 'from-red-400 to-rose-600', earned: true },
  { id: 'pro_planner', name: 'Pro Planner', desc: 'Used analytics for 30 days', icon: Calendar, color: 'from-indigo-400 to-violet-600', earned: false },
  { id: 'annual_saver', name: 'Annual Saver', desc: 'Switched to an annual plan', icon: CreditCard, color: 'from-yellow-400 to-amber-600', earned: true },
  { id: 'milestone', name: 'Milestone', desc: 'Managed over $1000 in subs', icon: Trophy, color: 'from-fuchsia-400 to-pink-600', earned: true },
  { id: 'customizer', name: 'Customizer', desc: 'Personalized theme settings', icon: Palette, color: 'from-gray-400 to-gray-600', earned: true },
];

export default function Profile() {
  const { t, formatPrice } = useLanguage();
  const [user, setUser] = useState(() => {
      const savedTheme = localStorage.getItem('userThemePreference');
      return { ...INITIAL_USER, theme: savedTheme || 'system' };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Theme Logic
  useEffect(() => {
    const applyTheme = (theme: string) => {
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('userThemePreference', theme);
    };
    applyTheme(user.theme);
  }, [user.theme]);

  const handleInputChange = (field: string, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCoverClick = () => {
    fileInputRef.current?.click();
  };

  const earnedBadges = BADGES.filter(b => b.earned);

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header / Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
           {/* Cover Image */}
           <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={handleCoverClick}
                   className="bg-black/30 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/50 transition-colors flex items-center gap-2"
                 >
                    <Camera size={14} /> {t('profile.edit_cover')}
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={() => alert("Cover photo updated (Mock)")} />
              </div>
           </div>

           <div className="px-8 pb-8">
              <div className="relative flex justify-between items-end -mt-12 mb-6">
                 <div className="flex items-end gap-6">
                    <div className="relative group/avatar cursor-pointer">
                       <div className="w-32 h-32 rounded-full p-1 bg-white shadow-lg relative z-10">
                          <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                       </div>
                       <div className="absolute inset-0 bg-black/40 rounded-full z-20 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-[1px]">
                          <Camera className="text-white" size={24} />
                       </div>
                    </div>
                    <div className="mb-2">
                       <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                       <p className="text-gray-500 font-medium">@{user.username}</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-3 mb-2">
                    {!isEditing ? (
                       <button 
                         onClick={() => setIsEditing(true)}
                         className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
                       >
                          <Edit2 size={16} /> {t('profile.edit_profile')}
                       </button>
                    ) : (
                       <>
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                          >
                             {t('profile.cancel')}
                          </button>
                          <button 
                            onClick={handleSave}
                            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md"
                          >
                             {t('profile.save_changes')}
                          </button>
                       </>
                    )}
                 </div>
              </div>

              <div className="max-w-2xl">
                 {!isEditing ? (
                    <p className="text-gray-600 leading-relaxed text-sm">{user.bio}</p>
                 ) : (
                    <textarea 
                       value={user.bio}
                       onChange={(e) => handleInputChange('bio', e.target.value)}
                       className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition-all"
                       rows={3}
                    />
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Left Column: Personal Info */}
           <div className="lg:col-span-8 space-y-6">
              
              {/* Personal Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User size={18} className="text-gray-400" /> {t('profile.personal_details')}
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('settings.full_name')}</label>
                       <input 
                          type="text" 
                          value={user.name} 
                          disabled={!isEditing}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 disabled:text-gray-500 disabled:bg-gray-50/50 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('settings.username')}</label>
                       <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-gray-400 font-medium">@</span>
                          <input 
                             type="text" 
                             value={user.username}
                             disabled={!isEditing}
                             onChange={(e) => handleInputChange('username', e.target.value)}
                             className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 disabled:text-gray-500 disabled:bg-gray-50/50 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('auth.email')}</label>
                       <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                          <input 
                             type="email" 
                             value={user.email}
                             disabled={!isEditing}
                             onChange={(e) => handleInputChange('email', e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 disabled:text-gray-500 disabled:bg-gray-50/50 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.phone')}</label>
                       <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                          <input 
                             type="tel" 
                             value={user.phone}
                             disabled={!isEditing}
                             onChange={(e) => handleInputChange('phone', e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 disabled:text-gray-500 disabled:bg-gray-50/50 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('footer.region')}</label>
                       <div className="relative">
                          <MapPin size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                          <input 
                             type="text" 
                             value={user.location}
                             disabled={!isEditing}
                             onChange={(e) => handleInputChange('location', e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 disabled:text-gray-500 disabled:bg-gray-50/50 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.website')}</label>
                       <div className="relative">
                          <LinkIcon size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                          <input 
                             type="text" 
                             value={user.website}
                             disabled={!isEditing}
                             onChange={(e) => handleInputChange('website', e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 disabled:text-gray-500 disabled:bg-gray-50/50 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Avatar & Theme */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Monitor size={18} className="text-gray-400" /> Appearance
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">{t('profile.upload_photo')}</label>
                        <div className="flex gap-3">
                           {PRESET_AVATARS.slice(0, 4).map((avatar, i) => (
                              <button 
                                key={i}
                                onClick={() => isEditing && handleInputChange('avatar', avatar)}
                                disabled={!isEditing}
                                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${user.avatar === avatar ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:border-gray-200'}`}
                              >
                                 <img src={avatar} className="w-full h-full object-cover" alt="Avatar option" />
                              </button>
                           ))}
                           <button disabled={!isEditing} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                              <Camera size={16} />
                           </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">{t('profile.theme')}</label>
                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                           <button 
                             onClick={() => handleInputChange('theme', 'light')}
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${user.theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                              <Sun size={14} /> {t('profile.theme_light')}
                           </button>
                           <button 
                             onClick={() => handleInputChange('theme', 'dark')}
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${user.theme === 'dark' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                              <Moon size={14} /> {t('profile.theme_dark')}
                           </button>
                           <button 
                             onClick={() => handleInputChange('theme', 'system')}
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${user.theme === 'system' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                              <Monitor size={14} /> {t('profile.theme_system')}
                           </button>
                        </div>
                    </div>
                 </div>
              </div>

           </div>

           {/* Right Column: Stats & Achievements */}
           <div className="lg:col-span-4 space-y-6">
              
              {/* Activity Snapshot */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-gray-400" /> {t('profile.activity_snapshot')}
                 </h3>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                             <CheckCircle size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t('stats.active')}</p>
                             <p className="font-bold text-gray-900 text-sm">{user.totalSubs} Subscriptions</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                             <Zap size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t('stats.monthly')}</p>
                             <p className="font-bold text-gray-900 text-sm">{formatPrice(user.monthlySpend)}</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                             <Calendar size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t('profile.yearly')}</p>
                             <p className="font-bold text-gray-900 text-sm">{formatPrice(user.monthlySpend * 12)}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Achievements & Milestones */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-fit">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                       <Trophy size={18} className="text-gray-400" /> {t('profile.achievements')}
                    </h3>
                    {earnedBadges.length > 4 && (
                       <button 
                         onClick={() => setIsAchievementsOpen(true)}
                         className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                       >
                          {t('profile.view_all')} <ArrowRight size={10} />
                       </button>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-4 gap-2 mb-6">
                    {earnedBadges.slice(0, 8).map((badge) => (
                       <div 
                          key={badge.id} 
                          className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all cursor-help hover:-translate-y-1"
                       >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${badge.color} text-white shadow-sm mb-1`}>
                             <badge.icon size={14} />
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                             <p className="font-bold mb-0.5">{badge.name}</p>
                             <p className="text-gray-300 leading-tight">{badge.desc}</p>
                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                       </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - earnedBadges.slice(0, 8).length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="flex items-center justify-center p-2 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                             <Check size={14} />
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-gray-500 font-medium">{t('profile.member_since')}</span>
                       <span className="text-gray-900 font-semibold">{user.joinedDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-gray-500 font-medium">{t('profile.last_login')}</span>
                       <span className="text-gray-900 font-semibold">{user.lastLogin}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-gray-500 font-medium">{t('profile.streak')}</span>
                       <div className="flex items-center gap-1.5 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                          <Flame size={10} className="fill-orange-600" /> {user.activeStreak} Days
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
      >
         <CheckCircle size={18} className="text-green-400" />
         <span className="font-medium text-sm">{t('profile.saved_success')}</span>
      </div>

      {/* Achievements Modal */}
      {isAchievementsOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setIsAchievementsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <Trophy className="text-yellow-500" /> All Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {BADGES.map((badge) => (
                    <div key={badge.id} className={`flex items-start gap-4 p-4 rounded-xl border ${badge.earned ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${badge.color} text-white shadow-md flex-shrink-0`}>
                          <badge.icon size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-900 text-sm">{badge.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
                          <div className="mt-2">
                             {badge.earned ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                   <Check size={10} /> Earned
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                   Locked
                                </span>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
