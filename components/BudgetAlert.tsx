
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BudgetAlertProps {
    categoryBreakdown: Record<string, number>;
    budgetLimits: Record<string, number>;
    onEditBudgets: () => void;
}

interface AlertItem {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
}

const BudgetAlert: React.FC<BudgetAlertProps> = ({ categoryBreakdown, budgetLimits, onEditBudgets }) => {
    const { formatPrice } = useLanguage();

    // Find categories that exceed 80% of their budget
    const alerts: AlertItem[] = (Object.entries(budgetLimits) as [string, number][])
        .map(([category, limit]) => {
            const spent = categoryBreakdown[category] || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            return { category, spent, limit, percentage };
        })
        .filter(a => a.percentage >= 80 && a.spent > 0)
        .sort((a, b) => b.percentage - a.percentage);

    if (alerts.length === 0) return null;

    return (
        <div className="bg-card rounded-2xl border border-subtle shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-subtle flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/10">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Budget Alerts</h3>
                </div>
                <button
                    onClick={onEditBudgets}
                    className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                    Edit Limits
                </button>
            </div>
            <div className="p-4 space-y-3">
                {alerts.map(({ category, spent, limit, percentage }) => {
                    const isOver = percentage >= 100;
                    const barColor = isOver
                        ? 'bg-red-500'
                        : percentage >= 90
                            ? 'bg-amber-500'
                            : 'bg-amber-400';
                    const textColor = isOver
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400';

                    return (
                        <div key={category}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-primary">{category}</span>
                                <span className={`text-[10px] font-bold ${textColor}`}>
                                    {formatPrice(spent)} / {formatPrice(limit)}
                                    {isOver && ' — Over budget!'}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetAlert;
