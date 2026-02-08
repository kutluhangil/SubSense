import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown, Lightbulb, Users, Globe, Trophy, Sparkles, TrendingUp, Clock, Target, AlertCircle, CheckCircle2, Edit2, X, DollarSign } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_COLORS, SUBSCRIPTION_CATALOG } from '../utils/data';
import { Subscription } from './SubscriptionModal';
import { debugLog } from '../utils/debug';

// --- Types ---
interface DataPoint {
  label: string;
  value: number; // In Base Currency
  date: Date;    // For sorting/processing
}

interface AggregatedAnalytics {
  trendData: DataPoint[];
  categoryTotals: Record<string, number>;
  serviceTotals: Record<number, number>; // ID -> Total Spend
  totalSpendInPeriod: number;
  periodLabel: string;
  monthsInPeriod: number;
}

interface AnalyticsProps {
  subscriptions?: Subscription[];
  budgetLimits?: Record<string, number>;
  setBudgetLimits?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  savingsGoal?: number;
  setSavingsGoal?: React.Dispatch<React.SetStateAction<number>>;
  totalSaved?: number;
  lifetimeSpend?: number;
}

// --- Helper Functions ---
const generateSmoothPath = (points: {x: number, y: number}[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) * 0.2;
    const cp1y = p1.y + (p2.y - p0.y) * 0.2;
    const cp2x = p2.x - (p3.x - p1.x) * 0.2;
    const cp2y = p2.y - (p3.y - p1.y) * 0.2;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

// --- Logic: Data Generation ---
// Changed 'range' to accept keys '30d', '3m', '6m', '12m'
const processSubscriptionsForRange = (
  subscriptions: Subscription[], 
  rangeKey: string, 
  convert: (amount: number, from: string) => number,
  baseCurrency: string
): AggregatedAnalytics => {
  
  const now = new Date();
  let startDate = new Date();
  let groupBy: 'day' | 'month' = 'month';
  let monthsInPeriod = 1;

  // 1. Determine Time Window
  switch (rangeKey) {
    case '30d':
      startDate.setDate(now.getDate() - 30);
      groupBy = 'day';
      monthsInPeriod = 1;
      break;
    case '3m':
      startDate.setMonth(now.getMonth() - 3);
      groupBy = 'month';
      monthsInPeriod = 3;
      break;
    case '6m':
      startDate.setMonth(now.getMonth() - 6);
      groupBy = 'month';
      monthsInPeriod = 6;
      break;
    case '12m':
      startDate.setMonth(now.getMonth() - 12);
      groupBy = 'month';
      monthsInPeriod = 12;
      break;
    default:
      startDate.setMonth(now.getMonth() - 6);
      monthsInPeriod = 6;
  }

  // Set start of day for accurate comparison
  startDate.setHours(0,0,0,0);

  debugLog('ANALYTICS_RANGE', `Processing range: ${rangeKey}`, { startDate: startDate.toISOString(), groupBy });

  const categoryTotals: Record<string, number> = {};
  const serviceTotals: Record<number, number> = {};
  let totalSpendInPeriod = 0;
  
  // Temporal Buckets
  const buckets: Record<string, { label: string, value: number, date: Date }> = {};

  // Initialize Buckets to ensure continuous line (no gaps)
  if (groupBy === 'day') {
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      buckets[key] = { label, value: 0, date: new Date(d) };
    }
  } else {
    // Monthly buckets
    const tempDate = new Date(startDate);
    tempDate.setDate(1); 
    
    while (tempDate <= now) {
      const key = `${tempDate.getFullYear()}-${tempDate.getMonth()}`;
      const label = tempDate.toLocaleDateString('default', { month: 'short' });
      buckets[key] = { label, value: 0, date: new Date(tempDate) };
      tempDate.setMonth(tempDate.getMonth() + 1);
    }
  }

  // 2. Project Payments Backward
  let transactionCount = 0;

  subscriptions.forEach(sub => {
    if (sub.status !== 'Active') return;

    const price = convert(sub.price, sub.currency);
    
    const nextPay = new Date(sub.nextDate);
    if (isNaN(nextPay.getTime())) return;

    let pointerDate = new Date(nextPay);
    
    let safety = 0;
    while (pointerDate > now && safety < 100) {
      if (sub.cycle === 'Monthly') pointerDate.setMonth(pointerDate.getMonth() - 1);
      else pointerDate.setFullYear(pointerDate.getFullYear() - 1);
      safety++;
    }

    safety = 0;
    while (pointerDate >= startDate && safety < 1000) {
      const bucketKey = groupBy === 'day' 
        ? pointerDate.toISOString().split('T')[0]
        : `${pointerDate.getFullYear()}-${pointerDate.getMonth()}`;

      if (buckets[bucketKey]) {
        buckets[bucketKey].value += price;
      }

      const cat = sub.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + price;
      serviceTotals[sub.id] = (serviceTotals[sub.id] || 0) + price;
      totalSpendInPeriod += price;
      transactionCount++;

      if (sub.cycle === 'Monthly') pointerDate.setMonth(pointerDate.getMonth() - 1);
      else pointerDate.setFullYear(pointerDate.getFullYear() - 1);
      
      safety++;
    }
  });

  const trendData = Object.values(buckets).sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    trendData,
    categoryTotals,
    serviceTotals,
    totalSpendInPeriod,
    periodLabel: rangeKey,
    monthsInPeriod
  };
};

// --- Visual Components ---

const SpendingTrendChart = ({ data, color = "#111827", currentCurrency }: { data: DataPoint[], color?: string, currentCurrency: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { currentTheme } = useLanguage();

  const strokeColor = currentTheme === 'dark' || (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) 
    ? (color === '#111827' ? '#e5e7eb' : color) 
    : color;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => setWidth(containerRef.current?.offsetWidth || 0);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const height = 200; 
  const padding = { top: 20, bottom: 20, left: 35, right: 15 }; 
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  if (width === 0) return <div ref={containerRef} className="h-[200px] w-full" />;

  const maxVal = Math.max(...data.map(d => d.value));
  const maxValue = maxVal > 0 ? maxVal * 1.1 : 100;
  const minValue = 0;
  
  const points = data.map((d, i) => ({
    x: padding.left + (i / (Math.max(1, data.length - 1))) * drawWidth,
    y: padding.top + drawHeight - ((d.value - minValue) / (maxValue - minValue)) * drawHeight,
    ...d
  }));

  const pathD = generateSmoothPath(points);
  const fillPath = points.length > 0 ? `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z` : '';

  return (
    <div ref={containerRef} className="h-[200px] w-full relative select-none">
       <svg width={width} height={height} className="overflow-visible">
          <defs>
             <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
             </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t, i) => {
             const y = padding.top + drawHeight * (1 - t);
             return (
                <g key={i}>
                   <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--chart-grid)" strokeDasharray="4 4" />
                   <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[9px] fill-gray-400 dark:fill-gray-500 font-medium">{Math.round(maxValue * t)}</text>
                </g>
             );
          })}
          {data.length > 0 && (
            <>
              <path d={fillPath} fill="url(#trendGradient)" className="transition-all duration-300" />
              <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-sm transition-all duration-300" />
            </>
          )}
          {points.map((p, i) => (
             <circle 
                key={i} 
                cx={p.x} cy={p.y} r={hoveredIndex === i ? 6 : 4} 
                fill={strokeColor} stroke="var(--bg-card)" strokeWidth="2"
                className="transition-all duration-200 cursor-pointer opacity-0 hover:opacity-100"
                style={{ opacity: hoveredIndex === i ? 1 : 0 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
             />
          ))}
          {points.map((p, i) => {
             const step = Math.ceil(points.length / 5);
             if (i % step !== 0 && i !== points.length - 1) return null;
             return (
               <text key={i} x={p.x} y={height - 5} textAnchor="middle" className="text-[9px] fill-gray-400 dark:fill-gray-500 uppercase font-bold tracking-wider">{p.label}</text>
             );
          })}
       </svg>
       {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
             No spending data for this period
          </div>
       )}
       {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
             className="absolute bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none z-10 transition-all"
             style={{ left: points[hoveredIndex].x, top: points[hoveredIndex].y - 12 }}
          >
             <span className="block text-[9px] opacity-70 mb-0.5">{points[hoveredIndex].label}</span>
             {currentCurrency} {points[hoveredIndex].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45"></div>
          </div>
       )}
    </div>
  );
};

const TopExpensesList = ({ 
  subscriptions, 
  serviceTotals, 
  formatPrice, 
  periodLabel 
}: { 
  subscriptions: Subscription[], 
  serviceTotals: Record<number, number>, 
  formatPrice: (v: number) => string,
  periodLabel: string
}) => {
    const { t } = useLanguage();
    const sorted = [...subscriptions]
      .filter(sub => (serviceTotals[sub.id] || 0) > 0)
      .sort((a, b) => (serviceTotals[b.id] || 0) - (serviceTotals[a.id] || 0))
      .slice(0, 3);

    return (
        <div className="flex flex-col h-full justify-center space-y-4">
            <div className="flex justify-between items-center mb-1">
               <p className="text-gray-900 dark:text-white font-bold text-sm">Top Expenses</p>
               <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">{t(`analytics.range.${periodLabel}`)}</span>
            </div>
            {sorted.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-600 group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-colors">
                            <BrandIcon type={sub.type} className="w-5 h-5" noBackground />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{sub.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{sub.category}</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {formatPrice(serviceTotals[sub.id])}
                    </span>
                </div>
            ))}
            {sorted.length === 0 && <p className="text-xs text-gray-400 text-center py-4">{t('help.no_results')}</p>}
        </div>
    );
};

const CostDistributionChart = ({ categoryTotals, formatPrice }: { categoryTotals: Record<string, number>, formatPrice: (v: number) => string }) => {
   const data = useMemo(() => {
      return Object.entries(categoryTotals)
        .map(([name, value]) => {
           const color = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][name.length % 5];
           return { name, value, color };
        })
        .sort((a,b) => b.value - a.value)
        .slice(0, 5); 
   }, [categoryTotals]);

   const total = data.reduce((a, b) => a + b.value, 0);
   let cumulativePercent = 0;

   if (total === 0) return <div className="flex items-center justify-center h-full text-xs text-gray-400">No spending data</div>;

   return (
    <div className="flex items-start gap-6 h-full">
      <div className="relative w-28 h-28 flex-shrink-0 self-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
           {data.map((seg, i) => {
              const start = cumulativePercent;
              const pct = seg.value / total;
              cumulativePercent += pct;
              const circumference = 2 * Math.PI * 40; 
              const strokeDasharray = `${pct * circumference} ${circumference}`;
              const strokeDashoffset = -1 * start * circumference;
              
              return (
                <circle 
                  key={i} cx="50" cy="50" r="40" fill="none" stroke={seg.color} strokeWidth="12"
                  strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-[14] cursor-pointer"
                />
              )
           })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-gray-900 dark:text-white">{formatPrice(total)}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 pt-1">
         {data.map((d, i) => (
           <div key={i} className="flex items-center justify-between text-xs">
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
               <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[80px]">{d.name}</span>
             </div>
             <span className="text-gray-500 dark:text-gray-400 font-medium">{formatPrice(d.value)}</span>
           </div>
         ))}
      </div>
    </div>
   );
};

const ComparisonWidget = ({ formatPrice, monthlySpend, convert, currentCurrency }: { formatPrice: (v: number) => string, monthlySpend: number, convert: (v: number, c: string) => number, currentCurrency: string }) => {
  if (monthlySpend === 0) {
      return (
          <div className="h-32 flex items-center justify-center text-xs text-gray-400">
              Add subscriptions to see comparison.
          </div>
      );
  }

  const globalAvg = convert(50, 'USD'); 
  const diffPercent = ((monthlySpend - globalAvg) / globalAvg * 100).toFixed(0);
  const isLower = monthlySpend < globalAvg;

  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-end gap-3 h-32 w-full px-4 justify-between border-b border-gray-100 dark:border-gray-700 pb-0 relative">
         <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50 z-0">
           <div className="border-t border-dashed border-gray-100 dark:border-gray-700 w-full"></div>
           <div className="border-t border-dashed border-gray-100 dark:border-gray-700 w-full"></div>
           <div className="border-t border-dashed border-gray-100 dark:border-gray-700 w-full"></div>
           <div className="border-t border-dashed border-gray-100 dark:border-gray-700 w-full"></div>
         </div>
         
         {[
           { label: 'You', height: `${Math.min((monthlySpend / (globalAvg * 2)) * 100, 100)}%`, color: 'bg-gray-900 dark:bg-white', val: monthlySpend },
           { label: 'Global Avg', height: `${Math.min((globalAvg / (globalAvg * 2)) * 100, 100)}%`, color: 'bg-gray-300 dark:bg-gray-600', val: globalAvg },
         ].map((bar, i) => (
           <div key={i} className="flex flex-col items-center justify-end h-full w-1/3 group relative z-10 cursor-pointer">
              <span className="text-[10px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-white dark:bg-gray-700 dark:text-gray-300 shadow-sm px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-600">{formatPrice(bar.val)}</span>
              <div className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-90 shadow-sm ${bar.color}`} style={{ height: bar.height }}></div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-2">{bar.label}</span>
           </div>
         ))}
      </div>
      <p className={`text-[10px] text-center p-2 rounded-lg border ${isLower ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800' : 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-800'}`}>
        You spend <span className="font-bold">{Math.abs(parseInt(diffPercent))}% {isLower ? 'less' : 'more'}</span> than global average.
      </p>
    </div>
  );
};

const SubscriptionLifetimeTimeline = ({ subscriptions = [] }: { subscriptions?: Subscription[] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Subscription Lifetime
        </h3>
      </div>
      {subscriptions.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-8">Add subscriptions to view lifetime timeline</div>
      ) : (
        <div className="space-y-6">
            {subscriptions.slice(0, 5).map((sub, i) => {
                const width = Math.min(100, Math.max(20, Math.random() * 80 + 20)); 
                const brandKey = (sub.type || sub.name).toLowerCase().replace(/\s+/g, '');
                const color = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];
                const mockDuration = `${Math.floor(width / 8)}m`; 
                
                return (
                    <div key={i} className="flex items-center gap-4 group">
                    <div className="w-32 flex items-center gap-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <BrandIcon type={sub.type || sub.name} className="w-5 h-5" noBackground />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate" title={sub.name}>{sub.name}</p>
                            <p className="text-[10px] text-gray-400">Active</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative h-6 flex items-center">
                        <div className="absolute left-0 right-0 h-1.5 bg-gray-50 dark:bg-gray-700 rounded-full"></div>
                        <div 
                            className="absolute left-0 h-2 rounded-full transition-all duration-1000 ease-out group-hover:h-2.5 shadow-sm opacity-90"
                            style={{ width: `${width}%`, backgroundColor: color }}
                        ></div>
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 ml-2 text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${width}%` }}
                        >
                            {mockDuration}
                        </div>
                    </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

const SmartBudgetMonitor = ({ 
  categoryTotals,
  budgetLimits = {}, 
  setBudgetLimits, 
  formatPrice,
  monthsInPeriod
}: { 
  categoryTotals: Record<string, number>, 
  budgetLimits: Record<string, number>, 
  setBudgetLimits: any, 
  formatPrice: (v: number) => string,
  monthsInPeriod: number
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localLimits, setLocalLimits] = useState(budgetLimits);
  const { t } = useLanguage();

  const categories = Object.keys(budgetLimits);
  
  const handleSaveLimits = () => {
    if (setBudgetLimits) setBudgetLimits(localLimits);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target size={18} className="text-gray-400" /> Smart Budget
        </h3>
        <button 
          onClick={() => setIsEditing(true)}
          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded transition-colors"
        >
          {t('common.edit')}
        </button>
      </div>

      <div className="space-y-5">
        {categories.slice(0,3).map((cat, idx) => {
          const baseLimit = budgetLimits[cat] || 0;
          const scaledLimit = baseLimit * monthsInPeriod;
          const spent = categoryTotals[cat] || 0;
          
          const percentage = scaledLimit > 0 ? Math.min((spent / scaledLimit) * 100, 100) : 0;
          const isOverBudget = spent > scaledLimit;
          
          let barColor = 'bg-blue-500';
          if (percentage > 80) barColor = 'bg-yellow-500';
          if (isOverBudget) barColor = 'bg-red-500';

          return (
            <div key={idx} className="group">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{cat}</span>
                <span className={`text-[10px] font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                   {formatPrice(spent)} <span className="text-gray-300 dark:text-gray-600">/</span> {formatPrice(scaledLimit)}
                </span>
              </div>
              <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                 <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                    style={{ width: `${percentage}%` }}
                 ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {isEditing && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 flex flex-col p-6 rounded-2xl animate-in fade-in duration-200">
           <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white">Edit Monthly Limits</h4>
              <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"><X size={18} /></button>
           </div>
           <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {categories.map(cat => (
                 <div key={cat} className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">{cat}</label>
                    <div className="relative">
                       <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                       <input 
                         type="number" 
                         value={localLimits[cat]}
                         onChange={(e) => setLocalLimits(prev => ({...prev, [cat]: parseFloat(e.target.value) || 0}))}
                         className="w-full pl-6 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm"
                       />
                    </div>
                 </div>
              ))}
           </div>
           <button onClick={handleSaveLimits} className="w-full bg-gray-900 dark:bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm mt-4 hover:bg-gray-800 dark:hover:bg-blue-700">
              {t('common.saved')}
           </button>
        </div>
      )}
    </div>
  );
};

const SavingsGoalCard = ({ goal, setGoal, totalSaved, formatPrice }: { goal: number, setGoal: any, totalSaved: number, formatPrice: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);
  const { t } = useLanguage();
  
  const percentage = goal > 0 ? Math.min((totalSaved / goal) * 100, 100) : 0;
  const remaining = Math.max(0, goal - totalSaved);

  const handleSave = () => {
    if (setGoal) setGoal(tempGoal);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between">
       <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Savings Goal</p>
                {isEditing ? (
                   <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={tempGoal}
                        onChange={(e) => setTempGoal(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-lg font-bold"
                        autoFocus
                      />
                      <button onClick={handleSave} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">{t('common.saved')}</button>
                   </div>
                ) : (
                   <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={() => setIsEditing(true)}>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(goal)}</h3>
                      <Edit2 size={14} className="text-gray-300 group-hover/edit:text-gray-500 transition-colors" />
                   </div>
                )}
             </div>
             <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                <Trophy size={20} />
             </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-600 dark:text-gray-300">Saved: {formatPrice(totalSaved)}</span>
                <span className="text-green-600 dark:text-green-400">{percentage.toFixed(0)}%</span>
             </div>
             <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                   style={{ width: `${percentage}%` }}
                ></div>
             </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {goal > 0 && totalSaved >= goal 
                   ? "🎉 Goal achieved!" 
                   : goal > 0 
                   ? `Need ${formatPrice(remaining)} more.`
                   : "Set a goal to start saving."}
             </p>
          </div>
       </div>
    </div>
  );
};

const PotentialSavingsCard = ({ subscriptions, formatPrice }: { subscriptions: Subscription[], formatPrice: (v: number) => string }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col justify-center items-center text-center">
            <CheckCircle2 size={24} className="text-green-500 mb-2" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">Optimization Ready</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Savings insights will appear once enough data is collected.</p>
        </div>
    );
};

const AIInsightCard = ({ icon: Icon, title, desc, accentColor, tintColor }: { icon: any, title: string, desc: string, accentColor: string, tintColor: string }) => {
  return (
    <div className="rounded-xl p-5 border border-transparent shadow-sm relative overflow-hidden group h-full flex flex-col justify-center bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700" 
         style={{ 
             backgroundImage: `linear-gradient(to bottom right, ${tintColor}80, ${tintColor}40)` 
         }}>
       <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon size={48} style={{ color: accentColor }} />
       </div>
       <div className="relative z-10">
          <div className="p-2 rounded-lg w-fit mb-3 bg-white/60 dark:bg-gray-900/30 backdrop-blur-sm">
             <Icon size={20} style={{ color: accentColor }} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight">{title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed opacity-90">{desc}</p>
       </div>
    </div>
  );
};

export default function Analytics({ subscriptions = [], budgetLimits = {}, setBudgetLimits, savingsGoal = 0, setSavingsGoal, totalSaved = 0, lifetimeSpend = 0 }: AnalyticsProps) {
  const { t, currentCurrency, formatPrice, convert } = useLanguage();
  const [dateRangeKey, setDateRangeKey] = useState('6m');
  const [viewMode, setViewMode] = useState<'personal' | 'friends'>('personal');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Recalculate all metrics when subscriptions or dateRange changes
  const analyticsData = useMemo(() => {
    return processSubscriptionsForRange(subscriptions, dateRangeKey, convert, currentCurrency);
  }, [subscriptions, dateRangeKey, currentCurrency, convert]);

  const { trendData, categoryTotals, serviceTotals, totalSpendInPeriod, monthsInPeriod } = analyticsData;

  const handleExportCSV = () => {
    const headers = ["Date", "Label", "Value"];
    const rows = trendData.map(d => [
      d.date.toISOString().split('T')[0],
      d.label,
      d.value.toFixed(2)
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics_${dateRangeKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trendColor = viewMode === 'personal' ? '#111827' : '#3B82F6';

  const currentMonthlySpend = useMemo(() => {
      return subscriptions.reduce((acc, sub) => {
          const priceInBase = convert(sub.price, sub.currency);
          return acc + (sub.cycle === 'Monthly' ? priceInBase : priceInBase / 12);
      }, 0);
  }, [subscriptions, convert]);

  const rangeOptions = ['30d', '3m', '6m', '12m'];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('analytics.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('analytics.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
             <button 
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
             >
                <Calendar size={16} className="text-gray-400" />
                <span>{t(`analytics.range.${dateRangeKey}`)}</span>
                <ChevronDown size={14} className="text-gray-400 ml-1" />
             </button>
             {isDateDropdownOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setIsDateDropdownOpen(false)}></div>
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {rangeOptions.map(optionKey => (
                       <button
                         key={optionKey}
                         onClick={() => { setDateRangeKey(optionKey); setIsDateDropdownOpen(false); }}
                         className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 ${dateRangeKey === optionKey ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                       >
                         {t(`analytics.range.${optionKey}`)}
                       </button>
                    ))}
                 </div>
               </>
             )}
           </div>

           <button 
             onClick={handleExportCSV}
             className="flex items-center space-x-2 bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-sm active:scale-95"
           >
              <Download size={16} />
              <span className="hidden sm:inline">{t('analytics.export')}</span>
           </button>
        </div>
      </div>

      {/* 2. Insights Row */}
      <div>
         <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
           <Sparkles size={16} className="text-purple-600 dark:text-purple-400" /> {t('analytics.ai_insights')}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PotentialSavingsCard subscriptions={subscriptions} formatPrice={formatPrice} />
            
            {/* Conditional Insights based on data */}
            {subscriptions.length > 0 ? (
                <>
                    <AIInsightCard 
                        icon={Globe} 
                        title={t('analytics.insight.regional_optimization')} 
                        desc="Optimization opportunities detected in your current plan." 
                        accentColor="#3B82F6" 
                        tintColor="#EFF6FF"
                    />
                    <AIInsightCard 
                        icon={Lightbulb} 
                        title="Spending Alert" 
                        desc={`You spent ${formatPrice(totalSpendInPeriod)} in the ${t(`analytics.range.${dateRangeKey}`).toLowerCase()}.`} 
                        accentColor="#F59E0B" 
                        tintColor="#FFFBEB"
                    />
                </>
            ) : (
                <div className="col-span-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 text-xs">
                    Add subscriptions to unlock more AI insights.
                </div>
            )}
         </div>
      </div>

      {/* 3. Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Trophy size={64} /></div>
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Spend ({t(`analytics.range.${dateRangeKey}`)})</p>
                <h3 className="text-3xl font-bold mb-1">{formatPrice(totalSpendInPeriod)}</h3>
            </div>
            {totalSpendInPeriod > 1000 && (
                <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 w-fit px-2 py-1 rounded-lg mt-4">
                   <Trophy size={12} className="text-yellow-400" /> High Spender
                </div>
            )}
         </div>
         
         <div className="md:col-span-1">
            <SavingsGoalCard 
              goal={savingsGoal} 
              setGoal={setSavingsGoal} 
              totalSaved={totalSaved} 
              formatPrice={formatPrice} 
            />
         </div>
         
         {/* Top Expenses List */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm md:col-span-2 flex flex-col h-full">
            <TopExpensesList 
                subscriptions={subscriptions} 
                serviceTotals={serviceTotals}
                formatPrice={formatPrice}
                periodLabel={dateRangeKey}
            />
         </div>
      </div>

      {/* 4. Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
         
         {/* Left Column (2/3 width) - Charts */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Spending Trend */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('analytics.trend')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('analytics.trend_desc')}</p>
                  </div>
                </div>
                <SpendingTrendChart data={trendData} color={trendColor} currentCurrency={currentCurrency} />
            </div>

            {/* Subscription Lifetime */}
            <SubscriptionLifetimeTimeline subscriptions={subscriptions} />

         </div>

         {/* Right Column (1/3 width) - Widgets */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Cost Distribution */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('analytics.cost_dist')}</h3>
                  <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
               </div>
               <CostDistributionChart categoryTotals={categoryTotals} formatPrice={formatPrice} />
            </div>

            {/* Budget Monitor */}
            <SmartBudgetMonitor 
              categoryTotals={categoryTotals}
              budgetLimits={budgetLimits}
              setBudgetLimits={setBudgetLimits}
              formatPrice={formatPrice}
              monthsInPeriod={monthsInPeriod}
            />

            {/* Global Comparison */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
               <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">{t('analytics.global_compare')}</h3>
               <ComparisonWidget formatPrice={formatPrice} monthlySpend={currentMonthlySpend} convert={convert} currentCurrency={currentCurrency} />
            </div>

         </div>

      </div>
    </div>
  );
}