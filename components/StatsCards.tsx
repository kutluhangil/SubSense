
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsCardsProps {
  monthly: number;
  active: number;
  forecast: number;
  currencyCode?: string;
}

export default function StatsCards({ monthly, active, forecast, currencyCode }: StatsCardsProps) {
  const { t, formatPrice } = useLanguage();

  const stats = [
    {
      label: t('stats.monthly'),
      value: formatPrice(monthly, currencyCode),
      change: '+0.0%', // Could calculate this if history existed
      trend: 'neutral',
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      label: t('stats.active'),
      value: active.toString(),
      change: 'Active',
      trend: 'neutral',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    },
    {
      label: t('stats.forecast'),
      value: formatPrice(forecast, currencyCode),
      change: 'Projected',
      trend: 'up',
      icon: TrendingUp, 
      color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      hasGraph: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-card rounded-2xl p-6 border border-subtle shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            {stat.trend === 'up' && (
              <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <TrendingUp size={12} className="mr-1" /> {stat.change}
              </span>
            )}
            {stat.trend === 'down' && (
              <span className="flex items-center text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                <TrendingDown size={12} className="mr-1" /> {stat.change}
              </span>
            )}
             {stat.trend === 'neutral' && (
              <span className="flex items-center text-xs font-medium text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-secondary mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
            
            {/* Micro Graph for Forecast Card */}
            {stat.hasGraph && (
               <div className="mt-3 h-8 w-full relative opacity-75">
                  <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                     <path d="M0,10 C10,15 20,5 30,12 C40,18 50,8 60,14 C70,10 80,16 90,5 L100,12" 
                           fill="none" 
                           stroke="#16a34a" 
                           strokeWidth="2" 
                           vectorEffect="non-scaling-stroke"
                           strokeLinecap="round"
                     />
                     <path d="M0,10 C10,15 20,5 30,12 C40,18 50,8 60,14 C70,10 80,16 90,5 L100,12 L100,20 L0,20 Z" 
                           fill="url(#sparkGradient)" 
                           stroke="none"
                     />
                     <defs>
                        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2"/>
                           <stop offset="100%" stopColor="#16a34a" stopOpacity="0"/>
                        </linearGradient>
                     </defs>
                  </svg>
                  <p className="text-[10px] text-green-700 dark:text-green-400 mt-1 font-medium">Spending trend: <span className="font-bold">Projected based on active subs</span></p>
               </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
