import React, { useMemo } from 'react';
import { PieChart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ExpenseBreakdownProps {
   metrics: any;
   subscriptionsLoading: boolean;
   setCurrentView: (view: string) => void;
}

export default function ExpenseBreakdown({ metrics, subscriptionsLoading, setCurrentView }: ExpenseBreakdownProps) {
   const { t } = useLanguage();

   const breakdown = useMemo(() => {
      const cats = metrics.categoryBreakdown;
      const total = metrics.monthlySpend;

      return Object.entries(cats)
         .sort(([, a], [, b]) => (b as number) - (a as number))
         .slice(0, 3)
         .map(([name, value]) => ({
            name,
            percentage: total > 0 ? ((value as number) / total) * 100 : 0
         }));
   }, [metrics]);

   return (
      <div className="bg-card rounded-2xl border border-subtle shadow-sm p-6 relative overflow-hidden">
         <h3 className="font-bold text-primary text-sm mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-muted" /> {t('dashboard.expense_breakdown')}
         </h3>

         {subscriptionsLoading ? (
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
               <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 animate-pulse"></div>
               </div>
            </div>
         ) : breakdown.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted">{t('dashboard.add_stats_hint')}</div>
         ) : (
            <div className="flex items-center gap-6">
               <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                     <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="20" />
                     {breakdown.map((item, i) => {
                        const dash = item.percentage;
                        const color = ['#3B82F6', '#8B5CF6', '#10B981'][i] || '#9CA3AF';
                        return (
                           <circle
                              key={i} cx="50" cy="50" r="40" fill="none"
                              stroke={color} strokeWidth="20"
                              strokeDasharray={`${dash} 1000`}
                              strokeDashoffset={-20 * i}
                              className="opacity-90"
                           />
                        );
                     })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-[10px] font-bold text-muted">
                        {new Date().toLocaleString('default', { month: 'short' })}
                     </span>
                  </div>
               </div>
               <div className="flex-1 space-y-2">
                  {breakdown.map((item, i) => {
                     const color = ['bg-blue-500', 'bg-purple-500', 'bg-green-500'][i] || 'bg-gray-400';
                     return (
                        <div key={i} className="flex items-center justify-between text-xs">
                           <div className="flex items-center gap-2 text-primary"><div className={`w-2 h-2 rounded-full ${color}`}></div>{item.name}</div>
                           <span className="font-bold text-primary">{item.percentage.toFixed(0)}%</span>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
         <button onClick={() => setCurrentView('analytics')} className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {t('dashboard.view_analytics')} <ArrowRight size={10} />
         </button>
      </div>
   );
}
