import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Shared UI primitives — the single source of design truth for every panel
 * screen. Built to match the landing aesthetic: Bricolage display headings,
 * clean cards with subtle borders + shadows, colored hover glow, and full
 * light/dark support via Tailwind `dark:` + theme CSS variables.
 */

/* ----------------------------- Page header ----------------------------- */

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, actions }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm">
          <Icon size={20} />
        </span>
      )}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* -------------------------------- Card --------------------------------- */

export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    glow?: string;
    hover?: boolean;
    padding?: string;
  }
> = ({ glow, hover = false, padding = 'p-6', className = '', children, ...rest }) => (
  <div
    className={`group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-800/60 shadow-sm ${padding} ${
      hover ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl' : ''
    } ${className}`}
    {...rest}
  >
    {glow && (
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: glow }}
      />
    )}
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

/* ----------------------------- Section card ---------------------------- */

export const SectionCard: React.FC<{
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, iconColor = '#6366f1', action, className = '', bodyClassName = '', children }) => (
  <Card padding="p-0" className={className}>
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${iconColor}1a`, color: iconColor }}
          >
            <Icon size={16} />
          </span>
        )}
        <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {action}
    </div>
    <div className={`px-5 py-5 ${bodyClassName}`}>{children}</div>
  </Card>
);

/* ------------------------------ Stat tile ------------------------------ */

export const StatTile: React.FC<{
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: string;
  trend?: { value: string; up?: boolean };
  hint?: string;
}> = ({ label, value, icon: Icon, accent = '#6366f1', trend, hint }) => (
  <Card hover glow={accent} className="flex flex-col">
    <div className="mb-4 flex items-start justify-between">
      {Icon && (
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon size={18} />
        </span>
      )}
      {trend && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            trend.up
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
    <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">{value}</p>
    {hint && <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
  </Card>
);

/* ----------------------------- Segmented ------------------------------- */

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) => (
  <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
    {options.map((opt) => {
      const active = opt.value === value;
      const Icon = opt.icon;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all ${
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
          } ${
            active
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

/* -------------------------------- Pill --------------------------------- */

export const Pill: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({
  children,
  color = '#6366f1',
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}
    style={{ backgroundColor: `${color}1a`, color }}
  >
    {children}
  </span>
);

/* ----------------------------- Buttons --------------------------------- */

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 dark:hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/* --------------------------- Empty state ------------------------------- */

export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30 px-6 py-16 text-center">
    <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40">
      <Icon size={28} className="text-indigo-500 dark:text-indigo-300" />
    </span>
    <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
    {desc && <p className="mt-1.5 max-w-xs text-sm text-gray-500 dark:text-gray-400">{desc}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/* ----------------------- Link-style "see all" -------------------------- */

export const SeeAllLink: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all"
  >
    {label} <ArrowRight size={13} />
  </button>
);
