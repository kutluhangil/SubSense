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
         <h3 className="font-display font-bold text-primary text-sm mb-4 flex items-center gap-2">
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
            <div className="space-y-3.5">
               {breakdown.map((item, i) => {
                  const color = ['#6366f1', '#8b5cf6', '#22c55e'][i] || '#9ca3af';
                  return (
                     <div key={i}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                           <span className="flex items-center gap-2 font-medium text-primary">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                              {item.name}
                           </span>
                           <span className="font-bold tabular-nums text-primary">{item.percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                           <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percentage}%`, background: color }} />
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
         <button onClick={() => setCurrentView('analytics')} className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {t('dashboard.view_analytics')} <ArrowRight size={10} />
         </button>
      </div>
   );
}
