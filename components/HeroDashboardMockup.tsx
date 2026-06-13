import React from 'react';
import { Bell, TrendingUp, Sparkles } from 'lucide-react';
import { LogoRenderer } from './LogoRenderer';
import { getBrandLogo } from '../utils/logoUtils';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Decorative, non-interactive product mockup shown in the hero.
 * A tilted "glass" dashboard card with real brand logos, a spending
 * sparkline, and floating accent pills for depth. Fully theme-aware.
 */

interface MiniSub {
  name: string;
  price: string;
  cadence: string;
  accent: string; // brand glow color
}

const SUBS: MiniSub[] = [
  { name: 'Netflix', price: '₺399,00', cadence: 'Monthly', accent: '#E50914' },
  { name: 'Spotify', price: '₺59,99', cadence: 'Monthly', accent: '#1DB954' },
  { name: 'Figma', price: '$15,00', cadence: 'Monthly', accent: '#A259FF' },
];

const StatTile = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="flex-1 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 px-3 py-2.5">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate">{label}</p>
    <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-white tabular-nums" style={accent ? { color: accent } : undefined}>{value}</p>
  </div>
);

export default function HeroDashboardMockup() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full max-w-[460px] mx-auto select-none [perspective:1600px]">
      {/* Ambient colored glow behind the card */}
      <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.28),transparent_55%)] blur-2xl opacity-70 dark:opacity-60" />

      {/* The tilted glass card */}
      <div
        className="group relative rounded-[28px] border border-white/70 dark:border-white/10 bg-white/70 dark:bg-gray-800/55 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(30,41,59,0.45)] dark:shadow-[0_30px_90px_-25px_rgba(0,0,0,0.8)] p-5 animate-hero-float transition-transform duration-700 ease-out [transform:rotateY(-9deg)_rotateX(4deg)] hover:[transform:rotateY(-3deg)_rotateX(1deg)] [transform-style:preserve-3d]"
      >
        {/* top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[28px] bg-gradient-to-b from-white/60 to-transparent dark:from-white/10" />

        {/* Window chrome */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-gray-700 dark:text-gray-200">
            <span className="w-4 h-4 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles size={9} className="text-white" />
            </span>
            SubSense
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> live
          </span>
        </div>

        {/* Stats */}
        <div className="relative flex gap-2 mb-4">
          <StatTile label={t('hero.mock.monthly')} value="₺399" />
          <StatTile label={t('hero.mock.active')} value="3" />
          <StatTile label={t('hero.mock.yearly')} value="₺4.788" />
        </div>

        {/* Sparkline */}
        <div className="relative rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 p-3 mb-4 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('hero.mock.trend')}</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
              <TrendingUp size={11} /> +4,2%
            </span>
          </div>
          <svg viewBox="0 0 280 60" className="w-full h-14" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,45 C25,42 35,20 60,24 C90,29 100,12 130,18 C160,24 175,8 205,14 C235,20 250,30 280,22 L280,60 L0,60 Z" fill="url(#heroSpark)" />
            <path d="M0,45 C25,42 35,20 60,24 C90,29 100,12 130,18 C160,24 175,8 205,14 C235,20 250,30 280,22" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Subscription rows */}
        <div className="relative space-y-1.5">
          {SUBS.map((s) => {
            const logo = getBrandLogo(s.name);
            return (
              <div key={s.name} className="flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <span
                  className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 overflow-hidden"
                >
                  {logo ? (
                    <LogoRenderer logoUrl={logo} name={s.name} className="w-5 h-5 object-contain" variant="auto" />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: s.accent }}>{s.name[0]}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{s.cadence}</p>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{s.price}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating accent pill — top right: notification */}
      <div className="absolute -top-5 -right-3 sm:-right-6 animate-hero-float-slow [transform:translateZ(60px)]">
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-xl pl-2 pr-3 py-2">
          <span className="w-7 h-7 rounded-lg bg-[#E50914]/10 flex items-center justify-center">
            <Bell size={13} className="text-[#E50914]" />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-gray-900 dark:text-white">Netflix</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">{t('hero.mock.renews')}</p>
          </div>
        </div>
      </div>

      {/* Floating accent pill — bottom left: savings */}
      <div className="absolute -bottom-4 -left-3 sm:-left-7 animate-hero-float [transform:translateZ(40px)]">
        <div className="flex items-center gap-2 rounded-2xl bg-green-500 text-white shadow-xl shadow-green-500/30 px-3 py-2">
          <TrendingUp size={15} />
          <div className="leading-tight">
            <p className="text-[12px] font-extrabold tabular-nums">₺718</p>
            <p className="text-[9px] opacity-90">{t('hero.mock.saved')}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -12px; }
        }
        @keyframes hero-float-slow {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -18px; }
        }
        .animate-hero-float { animation: hero-float 6s ease-in-out infinite; }
        .animate-hero-float-slow { animation: hero-float-slow 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-hero-float, .animate-hero-float-slow { animation: none; }
        }
      `}</style>
    </div>
  );
}
