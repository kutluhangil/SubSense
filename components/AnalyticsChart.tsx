import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface AnalyticsChartProps {
    subscriptions: Subscription[];
}

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export default function AnalyticsChart({ subscriptions }: AnalyticsChartProps) {
    const { formatPrice, convert, t } = useLanguage();

    const data = useMemo(() => {
        const categoryTotals: Record<string, number> = {};

        subscriptions.forEach(sub => {
            if (sub.status !== 'Active') return;
            
            // Calculate monthly equivalent in base currency
            let monthlyAmount = sub.price;
            if (sub.cycle === 'Yearly') {
                monthlyAmount = sub.price / 12;
            }
            
            // Share logic
            if (sub.isShared && sub.myShare !== undefined && sub.myShare > 0) {
                if (sub.cycle === 'Yearly') {
                    monthlyAmount = sub.myShare / 12;
                } else {
                    monthlyAmount = sub.myShare;
                }
            }

            const baseAmount = convert(monthlyAmount, sub.currency);
            const cat = sub.category || 'Other';
            
            categoryTotals[cat] = (categoryTotals[cat] || 0) + baseAmount;
        });

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [subscriptions, convert]);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dashboard.add_stats_hint')}</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white">{payload[0].name}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                        {formatPrice(payload[0].value)} / mo
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
