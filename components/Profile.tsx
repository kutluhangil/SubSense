
import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Globe, Mail, Phone, Camera, Edit2, Link as LinkIcon, Calendar, Activity, CheckCircle, Zap, Sun, Moon, Monitor, Check, Trophy, Wallet, Tv, Palette, ArrowRight, X } from 'lucide-react';
import { useLanguage, ThemeOption } from '../contexts/LanguageContext';
import { User as AuthUser } from '../App';
import { Subscription } from './SubscriptionModal';
import ImageCropperModal from './ImageCropperModal';
import { useAchievements } from '../hooks/useAchievements';

interface ProfileProps {
   user: AuthUser;
   subscriptions: Subscription[];
   userKey: string;
}

const BADGE_DEFINITIONS = [
   { id: 'first_sub', name: 'badge.first_sub.name', desc: 'badge.first_sub.desc', icon: CheckCircle, color: 'from-blue-400 to-blue-600' },
   { id: 'active_tracker', name: 'badge.active_tracker.name', desc: 'badge.active_tracker.desc', icon: Activity, color: 'from-orange-400 to-red-600' },
   { id: 'top_saver', name: 'badge.top_saver.name', desc: 'badge.top_saver.desc', icon: Wallet, color: 'from-green-400 to-green-600' },
   { id: 'global_explorer', name: 'badge.global_explorer.name', desc: 'badge.global_explorer.desc', icon: Globe, color: 'from-teal-400 to-cyan-600' },
   { id: 'entertainment', name: 'badge.entertainment.name', desc: 'badge.entertainment.desc', icon: Tv, color: 'from-red-400 to-rose-600' },
   { id: 'pro_planner', name: 'badge.pro_planner.name', desc: 'badge.pro_planner.desc', icon: Calendar, color: 'from-indigo-400 to-violet-600' },
   { id: 'milestone', name: 'badge.milestone.name', desc: 'badge.milestone.desc', icon: Trophy, color: 'from-fuchsia-400 to-pink-600' },
   { id: 'customizer', name: 'badge.customizer.name', desc: 'badge.customizer.desc', icon: Palette, color: 'from-gray-400 to-gray-600' },
];

export default function Profile({ user, subscriptions, userKey }: ProfileProps) {
   const { t, formatPrice, currentTheme, setTheme } = useLanguage();

   // Local state for profile fields
   const [profileData, setProfileData] = useState(() => {
      try {
         const saved = localStorage.getItem(`subscriptionhub.${userKey}.profile`);
         if (saved) return JSON.parse(saved);
      } catch (e) { }
      // Default clean state
      return {
         bio: '',
         location: '',
         website: '',
         phone: '',
         avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
         coverImage: null, // New field for cover image
         joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
   });

   const [isEditing, setIsEditing] = useState(false);
   const [showToast, setShowToast] = useState(false);
   const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

   // Cropper State
   const [cropperOpen, setCropperOpen] = useState(false);
   const [cropperImage, setCropperImage] = useState<string>('');
   const [cropperType, setCropperType] = useState<'avatar' | 'cover'>('avatar');

   // File Inputs
   const avatarInputRef = useRef<HTMLInputElement>(null);
   const coverInputRef = useRef<HTMLInputElement>(null);

   // Computed Stats
   const activeSubsCount = subscriptions.filter(s => s.status === 'Active').length;
   const monthlySpend = subscriptions.reduce((acc, sub) => {
      if (sub.status !== 'Active') return acc;
      return acc + (sub.cycle === 'Monthly' ? sub.price : sub.price / 12);
   }, 0);
   const yearlySpend = monthlySpend * 12;
   const lifetimeSpend = subscriptions.reduce((acc, sub) => acc + (sub.history?.reduce((a, b) => a + b, 0) || sub.price), 0);

   // Use Achievement Hook
   // We approximate "totalSaved" using local storage or props if passed, but for now we pass 0 or a placeholder if not available in props.
   // Ideally Dashboard passes totalSaved, but we can access it from localStorage for now.
   const [localSaved] = useState(() => {
      try { return parseFloat(localStorage.getItem(`subscriptionhub.${userKey}.totalSaved`) || '0'); } catch { return 0; }
   });

   const { unlockedIds, allAchievements } = useAchievements(user, subscriptions, localSaved);

   // Map to View Model
   const badges = allAchievements.map(ach => ({
      id: ach.id,
      name: t(ach.title) !== ach.title ? t(ach.title) : ach.title, // Check if key exists (simple fallback logic)
      desc: t(ach.description) !== ach.description ? t(ach.description) : ach.description,
      icon: Trophy, // Fallback icon, logic below could map specific icons if needed or update Achievements definition to use Lucide components
      // Simple color mapping based on ID hash or hardcoded fallback
      color: unlockedIds.includes(ach.id) ? 'from-yellow-400 to-orange-600' : 'from-gray-400 to-gray-600',
      earned: unlockedIds.includes(ach.id)
   }));

   // Persistence
   useEffect(() => {
      localStorage.setItem(`subscriptionhub.${userKey}.profile`, JSON.stringify(profileData));
   }, [profileData, userKey]);

   const handleInputChange = (field: string, value: string) => {
      setProfileData(prev => ({ ...prev, [field]: value }));
   };

   const handleSave = () => {
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
   };

   // --- Image Handling ---

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = () => {
            setCropperImage(reader.result as string);
            setCropperType(type);
            setCropperOpen(true);
         };
         reader.readAsDataURL(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
   };

   const handleCropComplete = (croppedBase64: string) => {
      if (cropperType === 'avatar') {
         setProfileData(prev => ({ ...prev, avatar: croppedBase64 }));
      } else {
         setProfileData(prev => ({ ...prev, coverImage: croppedBase64 }));
      }
   };

   return (
      <div className="animate-in fade-in duration-500 pb-12">

         {/* Hidden File Inputs */}
         <input type="file" ref={avatarInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, 'avatar')} />
         <input type="file" ref={coverInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, 'cover')} />

         <div className="max-w-5xl mx-auto space-y-6">

            {/* Header / Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative group">

               {/* Cover Image */}
               <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden group/cover">
                  {profileData.coverImage ? (
                     <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  )}

                  {/* Fix: Added z-20 to ensure it sits on top of everything and receives clicks */}
                  <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           coverInputRef.current?.click();
                        }}
                        className="bg-black/30 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/50 transition-colors flex items-center gap-2 cursor-pointer"
                     >
                        <Camera size={14} /> {t('profile.edit_cover')}
                     </button>
                  </div>
               </div>

               <div className="px-8 pb-8">
                  <div className="relative flex justify-between items-end -mt-12 mb-6">
                     <div className="flex items-end gap-6">
                        {/* Avatar */}
                        <div
                           className="relative group/avatar cursor-pointer"
                           onClick={() => avatarInputRef.current?.click()}
                        >
                           <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-gray-800 shadow-lg relative z-10">
                              <img src={profileData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                           </div>
                           <div className="absolute inset-0 bg-black/40 rounded-full z-20 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-[1px]">
                              <Camera className="text-white" size={24} />
                           </div>
                        </div>
                        <div className="mb-2">
                           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                           <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                        </div>
                     </div>

                     <div className="flex gap-3 mb-2">
                        {!isEditing ? (
                           <button
                              onClick={() => setIsEditing(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm"
                           >
                              <Edit2 size={16} /> {t('profile.edit_profile')}
                           </button>
                        ) : (
                           <>
                              <button
                                 onClick={() => setIsEditing(false)}
                                 className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                              >
                                 {t('profile.cancel')}
                              </button>
                              <button
                                 onClick={handleSave}
                                 className="px-4 py-2 bg-gray-900 dark:bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-md"
                              >
                                 {t('profile.save_changes')}
                              </button>
                           </>
                        )}
                     </div>
                  </div>

                  <div className="max-w-2xl">
                     {!isEditing ? (
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                           {profileData.bio || "No bio added yet."}
                        </p>
                     ) : (
                        <textarea
                           value={profileData.bio}
                           onChange={(e) => handleInputChange('bio', e.target.value)}
                           className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-800 transition-all"
                           rows={3}
                           placeholder={t('profile.bio_placeholder')}
                        />
                     )}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

               {/* Left Column: Personal Info */}
               <div className="lg:col-span-8 space-y-6">

                  {/* Personal Details Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                     <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <User size={18} className="text-gray-400" /> {t('profile.personal_details')}
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('settings.full_name')}</label>
                           <input
                              type="text"
                              autoComplete="name"
                              value={user.name}
                              disabled={true}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('auth.email')}</label>
                           <div className="relative">
                              <Mail size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                              <input
                                 type="email"
                                 autoComplete="email"
                                 value={user.email}
                                 disabled={true}
                                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('profile.phone')}</label>
                           <div className="relative">
                              <Phone size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                              <input
                                 type="tel"
                                 autoComplete="tel"
                                 value={profileData.phone}
                                 disabled={!isEditing}
                                 onChange={(e) => handleInputChange('phone', e.target.value)}
                                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white disabled:text-gray-500 disabled:bg-gray-50/50 dark:disabled:bg-gray-800 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                 placeholder="+1 (555) 000-0000"
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('footer.region')}</label>
                           <div className="relative">
                              <MapPin size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                              <input
                                 type="text"
                                 autoComplete="address-level2"
                                 value={profileData.location}
                                 disabled={!isEditing}
                                 onChange={(e) => handleInputChange('location', e.target.value)}
                                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white disabled:text-gray-500 disabled:bg-gray-50/50 dark:disabled:bg-gray-800 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                 placeholder="City, Country"
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('profile.website')}</label>
                           <div className="relative">
                              <LinkIcon size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                              <input
                                 type="url"
                                 autoComplete="url"
                                 value={profileData.website}
                                 disabled={!isEditing}
                                 onChange={(e) => handleInputChange('website', e.target.value)}
                                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white disabled:text-gray-500 disabled:bg-gray-50/50 dark:disabled:bg-gray-800 disabled:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                 placeholder="yourwebsite.com"
                              />
                           </div>
                        </div>
                     </div>
                  </div>


               </div>

               {/* Right Column: Stats & Achievements */}
               <div className="lg:col-span-4 space-y-6">

                  {/* Activity Snapshot */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                     <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-gray-400" /> {t('profile.activity_snapshot')}
                     </h3>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                 <CheckCircle size={16} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('stats.active')}</p>
                                 <p className="font-bold text-gray-900 dark:text-white text-sm">{activeSubsCount} Subscriptions</p>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                 <Zap size={16} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('stats.monthly')}</p>
                                 <p className="font-bold text-gray-900 dark:text-white text-sm">{formatPrice(monthlySpend)}</p>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                 <Calendar size={16} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('profile.yearly')}</p>
                                 <p className="font-bold text-gray-900 dark:text-white text-sm">{formatPrice(yearlySpend)}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Achievements & Milestones */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-fit">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           <Trophy size={18} className="text-gray-400" /> {t('profile.achievements')}
                        </h3>
                        <button
                           onClick={() => setIsAchievementsOpen(true)}
                           className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                        >
                           {t('profile.view_all')} <ArrowRight size={10} />
                        </button>
                     </div>

                     <div className="grid grid-cols-4 gap-2 mb-6">
                        {badges.slice(0, 8).map((badge) => (
                           <div
                              key={badge.id}
                              className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-help 
                            ${badge.earned ? 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 hover:border-gray-200' : 'bg-gray-50/50 dark:bg-gray-800/50 border-transparent opacity-40 grayscale'}
                          `}
                           >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${badge.color} text-white shadow-sm mb-1`}>
                                 <badge.icon size={14} />
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="mt-auto space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-gray-500 dark:text-gray-400 font-medium">{t('profile.member_since')}</span>
                           <span className="text-gray-900 dark:text-white font-semibold">{profileData.joinedDate}</span>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>

         {/* Toast Notification */}
         <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
         >
            <CheckCircle size={18} className="text-green-400 dark:text-green-600" />
            <span className="font-medium text-sm">{t('profile.saved_success')}</span>
         </div>

         {/* Achievements Modal */}
         {isAchievementsOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
                  <button onClick={() => setIsAchievementsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                     <Trophy className="text-yellow-500" /> {t('profile.all_achievements')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {badges.map((badge) => (
                        <div key={badge.id} className={`flex items-start gap-4 p-4 rounded-xl border ${badge.earned ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'}`}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${badge.color} text-white shadow-md flex-shrink-0`}>
                              <badge.icon size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.desc}</p>
                              <div className="mt-2">
                                 {badge.earned ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                       <Check size={10} /> {t('profile.earned')}
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                       {t('profile.locked')}
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

         {/* Image Cropper Modal */}
         <ImageCropperModal
            isOpen={cropperOpen}
            imageSrc={cropperImage}
            onClose={() => setCropperOpen(false)}
            onCropComplete={handleCropComplete}
            cropShape={cropperType === 'avatar' ? 'circle' : 'rect'}
            aspectRatio={cropperType === 'avatar' ? 1 : 3.5} // 3.5 for roughly cover aspect ratio
         />
      </div>
   );
}
