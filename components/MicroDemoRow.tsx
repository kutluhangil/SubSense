import React from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Card = ({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) => (
  <div className="group relative rounded-2xl border border-gray-100 dark:border-white/10 bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl p-4 h-36 flex flex-col shadow-sm overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
    <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" style={{ background: accent }} />
    <p className="relative z-10 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
    <div className="relative z-10 flex-1 flex flex-col justify-center">{children}</div>
  </div>
);

export default function MicroDemoRow() {
  const { t } = useLanguage();

  return (
    <div className="py-14 bg-gradient-to-b from-transparent via-gray-50/60 to-transparent dark:via-gray-900/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Spend chart */}
        <Card label={t('demo.spend_chart')} accent="#3B82F6">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-display font-extrabold text-gray-900 dark:text-white tabular-nums">₺399</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600 dark:text-green-400"><TrendingUp size={11} /> +4,2%</span>
          </div>
          <svg viewBox="0 0 200 40" className="w-full h-10" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mdr-spend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,30 C20,28 30,14 50,16 C75,19 85,6 110,12 C140,18 155,8 200,14 L200,40 L0,40 Z" fill="url(#mdr-spend)" />
            <path d="M0,30 C20,28 30,14 50,16 C75,19 85,6 110,12 C140,18 155,8 200,14" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Card>

        {/* Sharing */}
        <Card label={t('demo.sharing')} accent="#0D9488">
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {['from-rose-400 to-pink-500', 'from-sky-400 to-blue-500', 'from-amber-400 to-orange-500'].map((g, i) => (
                <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} border-2 border-white dark:border-gray-800 shadow-sm`} style={{ zIndex: i }} />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">+2 {t('demo.new')}</span>
              <span className="mt-1 flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500"><Users size={10} /> split ×3</span>
            </div>
          </div>
        </Card>

        {/* Price compare */}
        <Card label={t('demo.price_compare')} accent="#EA580C">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span>🇺🇸</span> US</span>
              <span className="font-bold text-gray-900 dark:text-white tabular-nums">$15.99</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span>🇹🇷</span> TR</span>
              <span className="font-bold text-green-600 dark:text-green-400 tabular-nums">$4.50</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500" style={{ width: '72%' }} />
            </div>
          </div>
        </Card>

        {/* Budget */}
        <Card label={t('demo.budget')} accent="#7C3AED">
          <div className="flex items-center justify-center">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeWidth="3.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="75, 100" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-display font-extrabold text-violet-600 dark:text-violet-400">75%</div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
