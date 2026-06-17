import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import {
  X, ChevronLeft, ChevronRight, Sparkles, Crown, Layers, Coffee,
  Download, Loader2, Wallet, TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Subscription } from './SubscriptionModal';
import { BrandIcon } from './BrandIcon';
import { CostDonut } from './AnalyticsCharts';
import Logo from './Logo';

/**
 * SubSense Wrapped — a Spotify-Wrapped-style annual spending recap.
 * Story-style, animated, theme-aware, fully i18n. The final slide is a
 * shareable summary card that can be downloaded as a PNG for organic reach.
 */

interface WrappedProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
}

const monthlyOf = (s: Subscription) => (s.cycle === 'Monthly' ? s.price : s.price / 12);

// Tasteful "fun framing" — approximate price of one coffee in the user's base currency.
const COFFEE_PRICE: Record<string, number> = {
  TRY: 90,
  USD: 5,
  EUR: 4.5,
  GBP: 4,
  default: 5,
};

export default function Wrapped({ isOpen, onClose, subscriptions }: WrappedProps) {
  const { t, formatPrice, convert, currentCurrency } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const year = new Date().getFullYear();

  // --- Compute the year in review (all amounts normalized to base currency) ---
  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => (s.status || 'Active') === 'Active');

    const monthlySpend = active.reduce((a, s) => a + convert(monthlyOf(s), s.currency), 0);
    const yearlySpend = monthlySpend * 12;

    const sorted = [...active].sort(
      (a, b) => convert(monthlyOf(b), b.currency) - convert(monthlyOf(a), a.currency),
    );
    const topSub = sorted[0] || null;

    const categoryTotals: Record<string, number> = {};
    active.forEach((s) => {
      const c = s.category || 'Other';
      categoryTotals[c] = (categoryTotals[c] || 0) + convert(monthlyOf(s), s.currency);
    });
    const categoryCount = Object.keys(categoryTotals).length;

    const coffee = COFFEE_PRICE[currentCurrency] ?? COFFEE_PRICE.default;
    const coffees = coffee > 0 ? Math.round(yearlySpend / coffee) : 0;

    return {
      active,
      count: active.length,
      monthlySpend,
      yearlySpend,
      topSub,
      categoryTotals,
      categoryCount,
      coffees,
    };
  }, [subscriptions, convert, currentCurrency]);

  // Reset to first slide whenever reopened
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setExportError(false);
    }
  }, [isOpen]);

  const hasData = stats.count > 0;

  const slides = useMemo(() => {
    const base = ['intro', 'total', 'top', 'count', 'categories', 'fun', 'share'];
    // If the user has no subscriptions, only show intro + share (empty-friendly).
    return hasData ? base : ['intro', 'share'];
  }, [hasData]);

  const totalSteps = slides.length;
  const current = slides[step];

  const next = useCallback(() => setStep((s) => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, next, prev]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setExporting(true);
    setExportError(false);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        // Match the visible card background so transparent corners look intentional.
        backgroundColor: undefined,
        skipFonts: false,
      });
      const link = document.createElement('a');
      link.download = `subsense-wrapped-${year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      // Keep it robust — never crash the app if the browser blocks the export.
      console.error('[Wrapped] image export failed', err);
      setExportError(true);
    } finally {
      setExporting(false);
    }
  }, [year]);

  if (!isOpen) return null;

  const topName = stats.topSub?.nickname || stats.topSub?.name || '';

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="wrapped-overlay"
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Animated gradient backdrop */}
        <div
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
          onClick={onClose}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -top-1/4 -left-1/4 h-[60vh] w-[60vh] rounded-full bg-indigo-600/30 blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vh] rounded-full bg-fuchsia-600/30 blur-[120px]" />
        </div>

        {/* Story shell */}
        <motion.div
          key="wrapped-shell"
          className="relative z-10 flex h-full max-h-[760px] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-gray-900"
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          {/* Progress bars */}
          <div className="absolute inset-x-0 top-0 z-30 flex gap-1.5 px-4 pt-4">
            {slides.map((s, i) => (
              <div key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: i < step ? '100%' : i === step ? '100%' : '0%', opacity: i <= step ? 1 : 0 }}
                />
              </div>
            ))}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            aria-label={t('wrapped.close')}
            className="absolute right-3 top-7 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur transition hover:bg-black/40"
          >
            <X size={18} />
          </button>

          {/* Slide area */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                className="absolute inset-0 flex flex-col items-center justify-center px-7 pb-24 pt-16 text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {/* ---------------------------- INTRO ---------------------------- */}
                {current === 'intro' && (
                  <Stagger className="flex flex-col items-center gap-5">
                    <Reveal>
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
                        <Sparkles size={30} />
                      </span>
                    </Reveal>
                    <Reveal>
                      <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                        {t('wrapped.kicker').replace('{year}', String(year))}
                      </p>
                    </Reveal>
                    <Reveal>
                      <h2 className="font-display text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">
                        {t('wrapped.intro_title')}
                      </h2>
                    </Reveal>
                    <Reveal>
                      <p className="max-w-xs text-base text-gray-500 dark:text-gray-400">
                        {hasData ? t('wrapped.intro_desc') : t('wrapped.empty_desc')}
                      </p>
                    </Reveal>
                  </Stagger>
                )}

                {/* ---------------------------- TOTAL ---------------------------- */}
                {current === 'total' && (
                  <Stagger className="flex flex-col items-center gap-4">
                    <Reveal>
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                        <Wallet size={26} />
                      </span>
                    </Reveal>
                    <Reveal>
                      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {t('wrapped.total_label').replace('{year}', String(year))}
                      </p>
                    </Reveal>
                    <Reveal>
                      <p className="font-display text-5xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                        {formatPrice(stats.yearlySpend)}
                      </p>
                    </Reveal>
                    <Reveal>
                      <p className="max-w-xs text-base text-gray-500 dark:text-gray-400">
                        {t('wrapped.total_desc').replace('{monthly}', formatPrice(stats.monthlySpend))}
                      </p>
                    </Reveal>
                  </Stagger>
                )}

                {/* ----------------------------- TOP ----------------------------- */}
                {current === 'top' && stats.topSub && (
                  <Stagger className="flex flex-col items-center gap-4">
                    <Reveal>
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-500">
                        <Crown size={14} /> {t('wrapped.top_kicker')}
                      </span>
                    </Reveal>
                    <Reveal>
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg dark:border-white/10">
                        <BrandIcon
                          type={stats.topSub.type || stats.topSub.name}
                          logo={stats.topSub.logo}
                          className="h-20 w-20"
                          noBackground
                        />
                      </div>
                    </Reveal>
                    <Reveal>
                      <h2 className="font-display text-3xl font-extrabold text-gray-900 dark:text-white">
                        {topName}
                      </h2>
                    </Reveal>
                    <Reveal>
                      <p className="max-w-xs text-base text-gray-500 dark:text-gray-400">
                        {t('wrapped.top_desc')
                          .replace('{amount}', formatPrice(convert(monthlyOf(stats.topSub), stats.topSub.currency) * 12))}
                      </p>
                    </Reveal>
                  </Stagger>
                )}

                {/* ---------------------------- COUNT ---------------------------- */}
                {current === 'count' && (
                  <Stagger className="flex flex-col items-center gap-4">
                    <Reveal>
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
                        <Layers size={26} />
                      </span>
                    </Reveal>
                    <Reveal>
                      <div className="flex items-end justify-center gap-6">
                        <div className="flex flex-col items-center">
                          <span className="font-display text-6xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                            {stats.count}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {t('wrapped.count_subs')}
                          </span>
                        </div>
                        <div className="mb-1 h-12 w-px bg-gray-200 dark:bg-white/10" />
                        <div className="flex flex-col items-center">
                          <span className="font-display text-6xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                            {stats.categoryCount}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {t('wrapped.count_categories')}
                          </span>
                        </div>
                      </div>
                    </Reveal>
                    <Reveal>
                      <p className="max-w-xs text-base text-gray-500 dark:text-gray-400">
                        {t('wrapped.count_desc')}
                      </p>
                    </Reveal>
                  </Stagger>
                )}

                {/* -------------------------- CATEGORIES ------------------------- */}
                {current === 'categories' && (
                  <Stagger className="flex w-full flex-col items-center gap-4">
                    <Reveal>
                      <p className="font-display text-2xl font-extrabold text-gray-900 dark:text-white">
                        {t('wrapped.categories_title')}
                      </p>
                    </Reveal>
                    <Reveal className="w-full">
                      <div className="w-full text-left">
                        <CostDonut categoryTotals={stats.categoryTotals} />
                      </div>
                    </Reveal>
                  </Stagger>
                )}

                {/* ----------------------------- FUN ----------------------------- */}
                {current === 'fun' && (
                  <Stagger className="flex flex-col items-center gap-4">
                    <Reveal>
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Coffee size={26} />
                      </span>
                    </Reveal>
                    <Reveal>
                      <p className="font-display text-5xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                        {stats.coffees.toLocaleString()}
                      </p>
                    </Reveal>
                    <Reveal>
                      <p className="max-w-xs text-base text-gray-500 dark:text-gray-400">
                        {t('wrapped.fun_desc')
                          .replace('{amount}', formatPrice(stats.yearlySpend))
                          .replace('{coffees}', stats.coffees.toLocaleString())}
                      </p>
                    </Reveal>
                  </Stagger>
                )}

                {/* ---------------------------- SHARE ---------------------------- */}
                {current === 'share' && (
                  <div className="flex w-full flex-col items-center gap-5">
                    {/* The downloadable card */}
                    <motion.div
                      ref={cardRef}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="relative w-full max-w-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-left text-white shadow-2xl"
                    >
                      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                            {t('wrapped.kicker').replace('{year}', String(year))}
                          </span>
                          <Sparkles size={16} className="text-white/80" />
                        </div>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/70">
                          {t('wrapped.total_label').replace('{year}', String(year))}
                        </p>
                        <p className="font-display text-4xl font-extrabold tabular-nums">
                          {formatPrice(stats.yearlySpend)}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <CardStat
                            label={t('wrapped.count_subs')}
                            value={String(stats.count)}
                          />
                          <CardStat
                            label={t('wrapped.count_categories')}
                            value={String(stats.categoryCount)}
                          />
                        </div>

                        {stats.topSub && (
                          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white">
                              <BrandIcon
                                type={stats.topSub.type || stats.topSub.name}
                                logo={stats.topSub.logo}
                                className="h-8 w-8"
                                noBackground
                              />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                                {t('wrapped.top_kicker')}
                              </p>
                              <p className="truncate font-display text-sm font-bold">{topName}</p>
                            </div>
                            <Crown size={16} className="ml-auto shrink-0 text-amber-300" />
                          </div>
                        )}

                        <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                          <span className="rounded-lg bg-white px-2 py-1">
                            <Logo className="h-4" showText={false} />
                          </span>
                          <span className="font-display text-sm font-extrabold tracking-tight text-white">
                            SubSense
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <Reveal>
                      <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
                        {t('wrapped.share_desc')}
                      </p>
                    </Reveal>

                    <button
                      onClick={handleDownload}
                      disabled={exporting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95 disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                      {exporting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> {t('wrapped.share_exporting')}
                        </>
                      ) : (
                        <>
                          <Download size={16} /> {t('wrapped.share_button')}
                        </>
                      )}
                    </button>
                    {exportError && (
                      <p className="text-xs font-medium text-red-500">{t('wrapped.share_error')}</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 px-5 pb-5">
            <button
              onClick={prev}
              disabled={step === 0}
              aria-label={t('wrapped.prev')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-0 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <TrendingUp size={13} /> {step + 1} / {totalSteps}
            </span>

            {step < totalSteps - 1 ? (
              <button
                onClick={next}
                aria-label={t('wrapped.next')}
                className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-gray-900 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                {t('wrapped.next')} <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex h-11 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                {t('wrapped.done')}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

/* ----------------------------- Helpers ------------------------------ */

const CardStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
    <p className="font-display text-2xl font-extrabold tabular-nums leading-none">{value}</p>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">{label}</p>
  </div>
);

// Staggered container — children using <Reveal> animate in sequence.
const Stagger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
    }}
  >
    {children}
  </motion.div>
);

const Reveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 18 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
    }}
  >
    {children}
  </motion.div>
);
