
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function StatsCards() {
  const { t, formatPrice } = useLanguage();

  const stats = [
    {
      label: t('stats.monthly'),
      value: formatPrice(245.50), // Base USD value
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: t('stats.active'),
      value: '12',
      change: '2 new',
      trend: 'neutral',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: t('stats.forecast'),
      value: formatPrice(2946.00), // Base USD value
      change: '-2.4%',
      trend: 'down',
      icon: TrendingUp, 
      color: 'bg-green-50 text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            {stat.trend === 'up' && (
              <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} className="mr-1" /> {stat.change}
              </span>
            )}
            {stat.trend === 'down' && (
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingDown size={12} className="mr-1" /> {stat.change}
              </span>
            )}
             {stat.trend === 'neutral' && (
              <span className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
