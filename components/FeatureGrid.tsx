import React from 'react';
import { LayoutGrid, Users, CreditCard, PieChart, ArrowRightLeft, Settings, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LogoRenderer } from './LogoRenderer';
import { getBrandLogo } from '../utils/logoUtils';

/* ---------------- Embedded mini visuals (always-on, subtle) ---------------- */

const DashboardVisual = ({ color }: { color: string }) => (
  <div className="w-full">
    <div className="flex items-baseline justify-between mb-3">
      <span className="text-2xl font-display font-extrabold text-gray-900 dark:text-white tabular-nums">₺4.788</span>
      <span className="text-[10px] font-bold text-green-600 dark:text-green-400">/yr</span>
    </div>
    <div className="flex items-end gap-1.5 h-16">
      {[42, 58, 35, 72, 50, 84, 64, 90].map((h, i) => (
        <div key={i} className="flex-1 rounded-t-md transition-all" style={{ height: `${h}%`, background: `linear-gradient(to top, ${color}, ${color}55)`, opacity: 0.55 + i / 20 }} />
      ))}
    </div>
  </div>
);

const AnalyticsVisual = ({ color }: { color: string }) => (
  <div className="w-full flex items-center justify-center py-1">
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeWidth="3.5" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="75, 100" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-display font-extrabold" style={{ color }}>75%</span>
      </div>
    </div>
  </div>
);

const CompareVisual = ({ color }: { color: string }) => (
  <div className="w-full space-y-2.5">
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="text-sm">🇺🇸</span> US</span>
      <span className="font-bold text-gray-900 dark:text-white tabular-nums">$15.99</span>
    </div>
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="text-sm">🇹🇷</span> TR</span>
      <span className="font-bold text-green-600 dark:text-green-400 tabular-nums">$4.50</span>
    </div>
    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: '72%', background: `linear-gradient(to right, ${color}, #22c55e)` }} />
    </div>
    <span className="inline-block text-[10px] font-bold text-green-600 dark:text-green-400">-71% cheaper</span>
  </div>
);

const FriendsVisual = () => (
  <div className="w-full flex flex-col items-center justify-center gap-2 py-2">
    <div className="flex -space-x-3">
      {['from-rose-400 to-pink-500', 'from-sky-400 to-blue-500', 'from-amber-400 to-orange-500'].map((g, i) => (
        <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} border-2 border-white dark:border-gray-800 shadow-sm`} style={{ zIndex: i }} />
      ))}
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[11px] font-bold text-gray-500 dark:text-gray-300">+5</div>
    </div>
    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">+2 new</span>
  </div>
);

const SubscriptionsVisual = () => {
  const rows = [
    { name: 'Netflix', price: '₺399', accent: '#E50914' },
    { name: 'Spotify', price: '₺59', accent: '#1DB954' },
  ];
  return (
    <div className="w-full space-y-2">
      {rows.map((r) => {
        const logo = getBrandLogo(r.name);
        return (
          <div key={r.name} className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 px-2.5 py-1.5 shadow-sm">
            <span className="w-6 h-6 rounded-md flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 overflow-hidden">
              {logo ? <LogoRenderer logoUrl={logo} name={r.name} className="w-4 h-4 object-contain" variant="auto" /> : <span style={{ color: r.accent }} className="text-xs font-bold">{r.name[0]}</span>}
            </span>
            <span className="flex-1 text-xs font-bold text-gray-800 dark:text-gray-100">{r.name}</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{r.price}</span>
          </div>
        );
      })}
    </div>
  );
};

const SettingsVisual = ({ color }: { color: string }) => (
  <div className="flex flex-col sm:flex-row gap-3 w-full">
    {[{ label: 'Dark Mode', on: true }, { label: 'Alerts', on: true }].map((s) => (
      <div key={s.label} className="flex items-center justify-between gap-4 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 px-3 py-2 flex-1 shadow-sm">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{s.label}</span>
        <span className="relative w-9 h-5 rounded-full transition-colors" style={{ backgroundColor: s.on ? color : '#d1d5db' }}>
          <span className="absolute top-1/2 -translate-y-1/2 left-[19px] w-3.5 h-3.5 rounded-full bg-white shadow flex items-center justify-center">
            <Check size={9} className="text-gray-600" strokeWidth={3} />
          </span>
        </span>
      </div>
    ))}
  </div>
);

/* ---------------- Card ---------------- */

interface Feature {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  color: string;
  span: string;
  minH: string;
  visual: React.ReactNode;
}

const renderFeatureCard = (f: Feature) => (
  <div
    key={f.id}
    className={`group relative ${f.span} ${f.minH} flex flex-col rounded-3xl border border-gray-100 dark:border-white/10 bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl p-6 shadow-sm overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-transparent`}
  >
    {/* hover accent glow */}
    <div
      className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
      style={{ background: f.color }}
    />
    {/* top edge accent */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${f.color}, transparent)` }} />

    <div className="relative z-10 flex items-start justify-between mb-4">
      <span
        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110"
        style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}cc)` }}
      >
        <f.icon size={20} className="text-white" />
      </span>
      <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" style={{ color: f.color }} />
    </div>

    <div className="relative z-10">
      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white tracking-tight">{f.title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
    </div>

    {/* embedded visual */}
    <div className="relative z-10 mt-auto pt-5">{f.visual}</div>
  </div>
);

export default function FeatureGrid() {
  const { t } = useLanguage();

  const features: Feature[] = [
    { id: 'dashboard', icon: LayoutGrid, title: t('features.dashboard.title'), desc: t('features.dashboard.desc'), color: '#3B82F6', span: 'lg:col-span-3', minH: 'min-h-[280px]', visual: <DashboardVisual color="#3B82F6" /> },
    { id: 'analytics', icon: PieChart, title: t('features.analytics.title'), desc: t('features.analytics.desc'), color: '#7C3AED', span: 'lg:col-span-3', minH: 'min-h-[280px]', visual: <AnalyticsVisual color="#7C3AED" /> },
    { id: 'subscriptions', icon: CreditCard, title: t('features.subscriptions.title'), desc: t('features.subscriptions.desc'), color: '#9333EA', span: 'lg:col-span-2', minH: 'min-h-[240px]', visual: <SubscriptionsVisual /> },
    { id: 'compare', icon: ArrowRightLeft, title: t('features.compare.title'), desc: t('features.compare.desc'), color: '#EA580C', span: 'lg:col-span-2', minH: 'min-h-[240px]', visual: <CompareVisual color="#EA580C" /> },
    { id: 'friends', icon: Users, title: t('features.friends.title'), desc: t('features.friends.desc'), color: '#0D9488', span: 'lg:col-span-2', minH: 'min-h-[240px]', visual: <FriendsVisual /> },
    { id: 'settings', icon: Settings, title: t('features.settings.title'), desc: t('features.settings.desc'), color: '#6366F1', span: 'lg:col-span-6', minH: 'min-h-[140px]', visual: <SettingsVisual color="#6366F1" /> },
  ];

  return (
    <div className="py-20 relative">
      <div className="text-center mb-14 px-4">
        <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 ring-1 ring-indigo-100 dark:ring-indigo-800/50">{t('features.tag')}</span>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter">{t('features.explore')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 max-w-6xl mx-auto px-4">
        {features.map(renderFeatureCard)}
      </div>
    </div>
  );
}
