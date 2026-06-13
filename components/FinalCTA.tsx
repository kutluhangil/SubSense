import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LogoRenderer } from './LogoRenderer';
import { getBrandLogo } from '../utils/logoUtils';

interface FinalCTAProps {
  onStart: () => void;
  onDemo: () => void;
}

// Faint brand-logo chips floating around the panel (the "subscriptions" motif)
const CHIPS = [
  { name: 'Netflix', cls: 'top-10 left-[8%] rotate-[-8deg]', glow: '#E50914' },
  { name: 'Spotify', cls: 'bottom-12 left-[14%] rotate-[6deg]', glow: '#1DB954' },
  { name: 'Figma', cls: 'top-16 right-[10%] rotate-[7deg]', glow: '#A259FF' },
  { name: 'Adobe Creative Cloud', cls: 'bottom-10 right-[14%] rotate-[-6deg]', glow: '#FF0000' },
];

export default function FinalCTA({ onStart, onDemo }: FinalCTAProps) {
  const { t } = useLanguage();

  return (
    <section className="relative py-28 px-4 overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle,rgba(129,140,248,0.22)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_25%,transparent_72%)]" />

      {/* Aurora glows */}
      <div className="absolute -top-1/4 left-[15%] w-[40%] h-[70%] bg-indigo-600/25 blur-[130px] rounded-full" />
      <div className="absolute -bottom-1/4 right-[15%] w-[40%] h-[70%] bg-purple-600/25 blur-[130px] rounded-full" />

      {/* Floating brand chips (decorative, desktop only) */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none">
        {CHIPS.map((c) => {
          const logo = getBrandLogo(c.name);
          if (!logo) return null;
          return (
            <div key={c.name} className={`absolute ${c.cls} animate-cta-float`}>
              <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{ background: c.glow }} />
                <LogoRenderer logoUrl={logo} name={c.name} className="relative w-7 h-7 object-contain" variant="auto" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Glass panel */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="relative rounded-[32px] p-[1.5px] bg-gradient-to-br from-white/25 via-white/5 to-transparent shadow-[0_40px_120px_-30px_rgba(99,102,241,0.5)]">
          <div className="rounded-[31px] bg-gray-900/70 backdrop-blur-2xl px-6 py-14 sm:px-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 mb-6 backdrop-blur-sm">
              <Sparkles size={13} className="text-indigo-300" />
              {t('hero.tagline')}
            </span>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tighter text-white leading-[1.05] mb-5">
              {t('hero.join_community')}
            </h2>
            <p className="text-lg text-gray-300/90 mb-10 max-w-xl mx-auto leading-relaxed">
              {t('hero.take_control_desc')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStart}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base text-gray-900 bg-white hover:shadow-[0_10px_40px_-5px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {t('hero.start_tracking_free')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onDemo}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-base text-white bg-white/5 border border-white/15 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                {t('hero.view_live_demo')}
              </button>
            </div>

            {/* trust row */}
            <div className="mt-9 flex items-center justify-center gap-3 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {['from-rose-400 to-pink-500', 'from-sky-400 to-blue-500', 'from-amber-400 to-orange-500'].map((g, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-gray-900`} />
                ))}
              </div>
              <span>{t('hero.trusted')}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cta-float {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-14px) rotate(var(--r, 0deg)); }
        }
        .animate-cta-float { animation: cta-float 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-cta-float { animation: none; } }
      `}</style>
    </section>
  );
}
