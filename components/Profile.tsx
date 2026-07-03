import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  User, MapPin, Mail, Phone, Camera, Edit2, Link as LinkIcon, Calendar, Activity,
  CheckCircle, Zap, Check, Trophy, Wallet, X, Crown, CreditCard, Globe, PieChart, BadgeCheck,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User as AuthUser } from '../App';
import { Subscription } from './SubscriptionModal';
import { BrandIcon } from './BrandIcon';
import ImageCropperModal from './ImageCropperModal';
import { useAchievements } from '../hooks/useAchievements';
import { CostDonut } from './AnalyticsCharts';
import { Card, SectionCard, StatTile, Pill, PrimaryButton, GhostButton, SeeAllLink } from './ui';

interface ProfileProps {
  user: AuthUser;
  subscriptions: Subscription[];
  userKey: string;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80';

const monthly = (s: Subscription) => (s.cycle === 'Monthly' ? s.price : s.price / 12);

export default function Profile({ user, subscriptions, userKey }: ProfileProps) {
  const { t, formatPrice, convert } = useLanguage();
  const { isPro, currentUser } = useAuth();

  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(`subscriptionhub.${userKey}.profile`);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return {
      bio: '',
      location: '',
      website: '',
      phone: '',
      avatar: DEFAULT_AVATAR,
      coverImage: null,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImage, setCropperImage] = useState('');
  const [cropperType, setCropperType] = useState<'avatar' | 'cover'>('avatar');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const monthlySpend = activeSubs.reduce((a, s) => a + convert(monthly(s), s.currency), 0);
  const yearlySpend = monthlySpend * 12;
  const lifetimeSpend = subscriptions.reduce((a, s) => a + (s.history?.reduce((x, y) => x + y, 0) || s.price), 0);
  const topSubs = [...activeSubs].sort((a, b) => convert(monthly(b), b.currency) - convert(monthly(a), a.currency)).slice(0, 5);

  const categoryTotals = useMemo(() => {
    const m: Record<string, number> = {};
    activeSubs.forEach((s) => {
      const c = s.category || 'Other';
      m[c] = (m[c] || 0) + convert(monthly(s), s.currency);
    });
    return m;
  }, [activeSubs, convert]);

  const [localSaved] = useState(() => {
    try {
      return parseFloat(localStorage.getItem(`subscriptionhub.${userKey}.totalSaved`) || '0');
    } catch {
      return 0;
    }
  });
  const { unlockedIds, allAchievements } = useAchievements(user, subscriptions, localSaved);
  const badges = allAchievements.map((ach) => ({
    id: ach.id,
    name: t(ach.title) !== ach.title ? t(ach.title) : ach.title,
    desc: t(ach.description) !== ach.description ? t(ach.description) : ach.description,
    earned: unlockedIds.includes(ach.id),
    color: unlockedIds.includes(ach.id) ? 'from-yellow-400 to-orange-600' : 'from-gray-400 to-gray-600',
  }));
  const earnedCount = badges.filter((b) => b.earned).length;

  const completionFields = [
    !!profileData.bio,
    !!profileData.phone,
    !!profileData.location,
    !!profileData.website,
    profileData.avatar !== DEFAULT_AVATAR,
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  useEffect(() => {
    localStorage.setItem(`subscriptionhub.${userKey}.profile`, JSON.stringify(profileData));
  }, [profileData, userKey]);

  const handleInputChange = (field: string, value: string) => setProfileData((p) => ({ ...p, [field]: value }));
  const handleSave = () => {
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
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
    e.target.value = '';
  };
  const handleCropComplete = (cropped: string) =>
    setProfileData((p) => ({ ...p, [cropperType === 'avatar' ? 'avatar' : 'coverImage']: cropped }));

  const inputCls =
    'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gray-50/50 disabled:text-gray-500 dark:disabled:bg-gray-800';

  const chip = (icon: React.ReactNode, text: string) => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {icon} {text}
    </span>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleFileChange(e, 'avatar')} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleFileChange(e, 'cover')} />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* ---------------- Premium hero ---------------- */}
        <Card padding="p-0" className="overflow-visible">
          <div className="relative rounded-t-2xl overflow-hidden">
            <div className="group/cover relative h-60">
              {profileData.coverImage ? (
                <img src={profileData.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#6366f1,transparent_45%),radial-gradient(circle_at_85%_25%,#a855f7,transparent_45%),radial-gradient(circle_at_50%_90%,#3b82f6,transparent_55%)] bg-indigo-600">
                  <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:24px_24px]" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
              <button
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-black/50 group-hover/cover:opacity-100"
              >
                <Camera size={14} /> {t('profile.edit_cover')}
              </button>
            </div>
          </div>

          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                <button onClick={() => avatarInputRef.current?.click()} className="group/avatar relative shrink-0">
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 opacity-70 blur-[6px]" />
                  <span className="relative block h-32 w-32 rounded-full bg-white p-1.5 shadow-xl dark:bg-gray-800">
                    <img src={profileData.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  </span>
                  <span className="absolute inset-1.5 flex items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover/avatar:opacity-100">
                    <Camera className="text-white" size={24} />
                  </span>
                  <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-[3px] border-white bg-green-500 dark:border-gray-800" />
                </button>
                <div className="mb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{user.name}</h1>
                    {isPro ? <Pill color="#f59e0b"><Crown size={11} /> Pro</Pill> : <Pill color="#6b7280">Free</Pill>}
                    {currentUser?.emailVerified && <BadgeCheck size={18} className="text-blue-500" />}
                  </div>
                  <p className="mt-0.5 font-medium text-gray-500 dark:text-gray-400">{user.email}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {chip(<Calendar size={12} />, profileData.joinedDate)}
                    {profileData.location && chip(<MapPin size={12} />, profileData.location)}
                    {profileData.website && chip(<Globe size={12} />, profileData.website)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <GhostButton onClick={() => setIsEditing(true)}><Edit2 size={16} /> {t('profile.edit_profile')}</GhostButton>
                ) : (
                  <>
                    <GhostButton onClick={() => setIsEditing(false)}>{t('profile.cancel')}</GhostButton>
                    <PrimaryButton onClick={handleSave}>{t('profile.save_changes')}</PrimaryButton>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 max-w-2xl">
              {!isEditing ? (
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{profileData.bio || t('profile.no_bio')}</p>
              ) : (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  placeholder={t('profile.bio_placeholder')}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              )}
            </div>
          </div>
        </Card>

        {/* ---------------- Stat tiles ---------------- */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatTile label={t('stats.active')} value={String(activeSubs.length)} icon={CheckCircle} accent="#22c55e" />
          <StatTile label={t('stats.monthly')} value={formatPrice(monthlySpend)} icon={Zap} accent="#3b82f6" />
          <StatTile label={t('profile.yearly')} value={formatPrice(yearlySpend)} icon={Calendar} accent="#8b5cf6" />
          <StatTile label={t('profile.lifetime')} value={formatPrice(lifetimeSpend)} icon={Wallet} accent="#f59e0b" />
        </div>

        {/* ---------------- Main grid ---------------- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <SectionCard title={t('profile.personal_details')} icon={User}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('settings.full_name')}</label>
                  <input value={user.name} disabled className={inputCls} autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input value={user.email} disabled className={`${inputCls} pl-10`} autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('profile.phone')}</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input value={profileData.phone} disabled={!isEditing} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+90 (5__) ___ __ __" className={`${inputCls} pl-10`} autoComplete="tel" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('footer.region')}</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input value={profileData.location} disabled={!isEditing} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="İstanbul, Türkiye" className={`${inputCls} pl-10`} autoComplete="address-level2" />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('profile.website')}</label>
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <input value={profileData.website} disabled={!isEditing} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="yourwebsite.com" className={`${inputCls} pl-10`} autoComplete="url" />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t('profile.top_subs')} icon={CreditCard} iconColor="#3b82f6">
              {topSubs.length > 0 ? (
                <div className="space-y-2">
                  {topSubs.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                      <span className="w-5 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-white dark:border-white/10 dark:bg-gray-900">
                        <BrandIcon type={s.type || s.name} className="h-5 w-5" noBackground />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{s.name}</p>
                        <p className="text-[11px] text-gray-400">{s.category || s.cycle}</p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{formatPrice(convert(monthly(s), s.currency))}<span className="ml-1 text-xs font-normal text-gray-400">/mo</span></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-gray-400">{t('profile.no_subs_yet')}</p>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6 lg:col-span-4">
            {/* Spending by category — premium donut */}
            {activeSubs.length > 0 && (
              <SectionCard title={t('analytics.cost_dist')} icon={PieChart} iconColor="#22c55e">
                <CostDonut categoryTotals={categoryTotals} />
              </SectionCard>
            )}

            <SectionCard
              title={t('profile.achievements')}
              icon={Trophy}
              iconColor="#eab308"
              action={<SeeAllLink label={`${earnedCount}/${badges.length}`} onClick={() => setIsAchievementsOpen(true)} />}
            >
              <div className="grid grid-cols-4 gap-2">
                {badges.slice(0, 8).map((b) => (
                  <div key={b.id} title={b.name} className={`flex items-center justify-center rounded-xl border p-2 transition-all ${b.earned ? 'border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-gray-700' : 'border-transparent bg-gray-50/50 opacity-40 grayscale dark:bg-gray-800/50'}`}>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${b.color} text-white shadow-sm`}><Trophy size={15} /></span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title={t('profile.account_info')} icon={Activity} iconColor="#8b5cf6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('profile.member_since')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profileData.joinedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('profile.plan_label')}</span>
                  {isPro ? <Pill color="#f59e0b"><Crown size={11} /> Pro</Pill> : <Pill color="#6b7280">Free</Pill>}
                </div>
                <div className="border-t border-gray-100 pt-4 dark:border-white/5">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">{t('profile.completeness')}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{completion}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${completion}%` }} />
                  </div>
                  {completion < 100 && <p className="mt-2 text-[11px] text-gray-400">{t('profile.complete_hint')}</p>}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900 px-6 py-3 text-white shadow-2xl transition-all duration-300 dark:bg-white dark:text-gray-900 ${showToast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'}`}>
        <CheckCircle size={18} className="text-green-400 dark:text-green-600" />
        <span className="text-sm font-medium">{t('profile.saved_success')}</span>
      </div>

      {/* Achievements modal */}
      {isAchievementsOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <button onClick={() => setIsAchievementsOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
            <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-gray-900 dark:text-white"><Trophy className="text-yellow-500" /> {t('profile.all_achievements')}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {badges.map((b) => (
                <div key={b.id} className={`flex items-start gap-4 rounded-xl border p-4 ${b.earned ? 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700' : 'border-gray-100 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800'}`}>
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${b.color} text-white shadow-md`}><Trophy size={20} /></span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{b.name}</h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{b.desc}</p>
                    <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${b.earned ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                      {b.earned ? <><Check size={10} /> {t('profile.earned')}</> : t('profile.locked')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperImage}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        cropShape={cropperType === 'avatar' ? 'circle' : 'rect'}
        aspectRatio={cropperType === 'avatar' ? 1 : 3.5}
      />
    </div>
  );
}
