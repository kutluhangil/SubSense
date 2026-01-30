
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown, Lightbulb, Users, Globe, Trophy, Sparkles, TrendingUp, Clock, Target, AlertCircle, CheckCircle2, Edit2, X } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_COLORS } from '../utils/data';
import { Subscription } from './SubscriptionModal';

// --- Types ---
interface DataPoint {
  label: string;
  value: number; // Base USD
  prevValue: number; // Base USD
}

interface AnalyticsProps {
  subscriptions?: Subscription[];
  budgetLimits?: Record<string, number>;
  setBudgetLimits?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  savingsGoal?: number;
  setSavingsGoal?: React.Dispatch<React.SetStateAction<number>>;
  totalSaved?: number;
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

// --- Visual Components ---

const SpendingTrendChart = ({ data, color = "#111827", convertPrice, currentCurrency }: { data: DataPoint[], color?: string, convertPrice: (v: number) => number, currentCurrency: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => setWidth(containerRef.current?.offsetWidth || 0);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const height = 240;
  const padding = { top: 20, bottom: 30, left: 40, right: 20 };
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  if (width === 0) return <div ref={containerRef} className="h-60 w-full" />;

  const convertedData = data.map(d => ({ ...d, value: convertPrice(d.value) }));
  const maxValue = Math.max(...convertedData.map(d => d.value)) * 1.1;
  const minValue = 0;
  
  const points = convertedData.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * drawWidth,
    y: padding.top + drawHeight - ((d.value - minValue) / (maxValue - minValue)) * drawHeight,
    ...d
  }));

  const pathD = generateSmoothPath(points);
  const fillPath = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <div ref={containerRef} className="h-60 w-full relative select-none">
       <svg width={width} height={height} className="overflow-visible">
          <defs>
             <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
             </linearGradient>
          </defs>
          {/* Grid */}
          {[0, 0.5, 1].map((t, i) => {
             const y = padding.top + drawHeight * (1 - t);
             return (
                <g key={i}>
                   <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F3F4F6" strokeDasharray="4 4" />
                   <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-medium">{Math.round(maxValue * t)}</text>
                </g>
             );
          })}
          
          <path d={fillPath} fill="url(#trendGradient)" className="transition-all duration-300" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-sm transition-all duration-300" />

          {/* Interaction Points */}
          {points.map((p, i) => (
             <circle 
                key={i} 
                cx={p.x} cy={p.y} r={hoveredIndex === i ? 6 : 4} 
                fill={color} stroke="white" strokeWidth="2"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
             />
          ))}
          
          {/* X Axis Labels */}
          {points.map((p, i) => (
             <text key={i} x={p.x} y={height} textAnchor="middle" className="text-[10px] fill-gray-400 uppercase font-bold tracking-wider">{p.label}</text>
          ))}
       </svg>
       
       {/* Tooltip */}
       {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
             className="absolute bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none z-10"
             style={{ left: points[hoveredIndex].x, top: points[hoveredIndex].y - 12 }}
          >
             {currentCurrency} {points[hoveredIndex].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
       )}
    </div>
  );
};

const SpendingHeatmap = () => {
  // Generate a consistent pattern for the heatmap
  const getOpacity = (i: number) => {
     // Create a pseudo-random looking but deterministic pattern
     const pattern = Math.abs(Math.sin(i * 12.34) * Math.cos(i * 5.67)); 
     if (pattern > 0.8) return 0.9;
     if (pattern > 0.6) return 0.6;
     if (pattern > 0.4) return 0.3;
     return 0.1;
  };
  
  return (
    <div className="flex flex-col h-full justify-between py-2">
       <div className="grid grid-cols-12 gap-1.5">
          {Array.from({ length: 48 }).map((_, i) => (
             <div 
                key={i} 
                className="w-full aspect-square rounded-[2px] bg-gray-900 transition-all hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-gray-200"
                style={{ opacity: getOpacity(i) }}
                title={`Activity Level: ${Math.round(getOpacity(i)*100)}%`}
             ></div>
          ))}
       </div>
       <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-3 font-medium">
          <span>Less</span>
          <div className="w-3 h-3 bg-gray-900 rounded-[1px] opacity-10"></div>
          <div className="w-3 h-3 bg-gray-900 rounded-[1px] opacity-40"></div>
          <div className="w-3 h-3 bg-gray-900 rounded-[1px] opacity-70"></div>
          <div className="w-3 h-3 bg-gray-900 rounded-[1px] opacity-100"></div>
          <span>More</span>
       </div>
    </div>
  );
};

const CostDistributionChart = ({ formatPrice, subscriptions }: { formatPrice: (v: number) => string, subscriptions: Subscription[] }) => {
   // Calculate real distribution from props or fallback
   const data = useMemo(() => {
      const map: Record<string, number> = {};
      
      // If no subs, use mock data to show UI
      const source = subscriptions.length > 0 ? subscriptions : [
         { name: 'Netflix', price: 19.99, type: 'netflix' },
         { name: 'Spotify', price: 14.99, type: 'spotify' },
         { name: 'Adobe', price: 54.99, type: 'adobe' },
         { name: 'Amazon', price: 12.99, type: 'amazon' },
      ] as Subscription[];

      source.forEach(sub => {
         // Group by Name or Category
         const key = sub.name; 
         map[key] = (map[key] || 0) + sub.price;
      });

      // Convert map to array and sort
      return Object.entries(map)
        .map(([name, value]) => {
           // Find color
           const type = name.toLowerCase().replace(/\s+/g, '');
           const color = BRAND_COLORS[type] || ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random()*5)];
           return { name, value, color };
        })
        .sort((a,b) => b.value - a.value)
        .slice(0, 5); // Top 5
   }, [subscriptions]);

   const total = data.reduce((a, b) => a + b.value, 0);
   let cumulativePercent = 0;

   return (
    <div className="flex items-center gap-6 h-full">
      <div className="relative w-32 h-32 flex-shrink-0">
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
          <span className="text-xs font-bold text-gray-900">{formatPrice(total)}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
         {data.map((d, i) => (
           <div key={i} className="flex items-center justify-between text-xs">
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
               <span className="font-semibold text-gray-700 truncate max-w-[80px]">{d.name}</span>
             </div>
             <span className="text-gray-500 font-medium">{formatPrice(d.value)}</span>
           </div>
         ))}
      </div>
    </div>
   );
};

const ComparisonWidget = ({ formatPrice }: { formatPrice: (v: number) => string }) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-end gap-3 h-40 w-full px-4 justify-between border-b border-gray-100 pb-0 relative">
         {/* Grid lines background */}
         <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50 z-0">
           <div className="border-t border-dashed border-gray-100 w-full"></div>
           <div className="border-t border-dashed border-gray-100 w-full"></div>
           <div className="border-t border-dashed border-gray-100 w-full"></div>
           <div className="border-t border-dashed border-gray-100 w-full"></div>
         </div>
         
         {[
           { label: 'You', height: '65%', color: 'bg-gray-900', val: 145 },
           { label: 'Avg User', height: '80%', color: 'bg-gray-300', val: 190 },
           { label: 'Friends', height: '45%', color: 'bg-blue-500', val: 110 },
         ].map((bar, i) => (
           <div key={i} className="flex flex-col items-center justify-end h-full w-1/4 group relative z-10 cursor-pointer">
              <span className="text-[10px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-white shadow-sm px-1.5 py-0.5 rounded border border-gray-100">{formatPrice(bar.val)}</span>
              <div className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-90 shadow-sm ${bar.color}`} style={{ height: bar.height }}></div>
              <span className="text-[10px] font-bold text-gray-500 mt-2">{bar.label}</span>
           </div>
         ))}
      </div>
      <p className="text-xs text-gray-500 text-center bg-green-50 p-2 rounded-lg border border-green-100">
        You spend <span className="font-bold text-green-700">23% less</span> than the average user in your region.
      </p>
    </div>
  );
};

const SubscriptionLifetimeTimeline = ({ subscriptions = [] }: { subscriptions?: Subscription[] }) => {
  // Use props or mock if empty
  const displaySubs = subscriptions.length > 0 ? subscriptions : [
     { name: 'Netflix', startDate: '2021-01-01', type: 'netflix' },
     { name: 'Spotify', startDate: '2022-03-15', type: 'spotify' },
     { name: 'Adobe', startDate: '2023-06-01', type: 'adobe' },
     { name: 'Amazon Prime', startDate: '2023-01-10', type: 'amazon' }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Subscription Lifetime
        </h3>
        <span className="text-xs text-gray-400 font-medium">Joined vs Duration</span>
      </div>
      <div className="space-y-5">
         {displaySubs.slice(0, 5).map((sub, i) => {
            const width = Math.min(100, Math.max(20, Math.random() * 80 + 20)); // Mock visual width
            const brandKey = (sub.type || sub.name).toLowerCase().replace(/\s+/g, '');
            const color = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];
            
            return (
                <div key={i} className="relative h-8 w-full flex items-center group">
                   {/* Background Track */}
                   <div className="absolute left-0 right-0 h-1 bg-gray-50 rounded-full top-1/2 -translate-y-1/2"></div>
                   
                   {/* Active Bar */}
                   <div 
                      className="absolute left-0 h-2 rounded-full transition-all duration-1000 group-hover:h-3 opacity-80"
                      style={{ width: `${width}%`, backgroundColor: color }}
                   ></div>
                   
                   {/* Icon Indicator */}
                   <div 
                      className="relative z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full border border-gray-100 shadow-sm transition-transform group-hover:scale-110"
                      style={{ marginLeft: `calc(${width}% - 16px)` }}
                   >
                      <BrandIcon type={sub.type || sub.name} className="w-5 h-5" noBackground />
                   </div>
                   
                   {/* Label */}
                   <div className="ml-4 flex flex-col justify-center">
                      <span className="text-xs font-bold text-gray-900">{sub.name}</span>
                   </div>
                </div>
            );
         })}
      </div>
    </div>
  );
};

const SmartBudgetMonitor = ({ 
  subscriptions = [], 
  budgetLimits = {}, 
  setBudgetLimits, 
  formatPrice 
}: { 
  subscriptions: Subscription[], 
  budgetLimits: Record<string, number>, 
  setBudgetLimits: any, 
  formatPrice: (v: number) => string 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localLimits, setLocalLimits] = useState(budgetLimits);

  // Calculate spent per category
  const spendingByCategory = useMemo(() => {
    const spending: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const cat = sub.category || 'Other';
      const monthlyCost = sub.cycle === 'Yearly' ? sub.price / 12 : sub.price;
      spending[cat] = (spending[cat] || 0) + monthlyCost;
    });
    return spending;
  }, [subscriptions]);

  const categories = Object.keys(budgetLimits);
  // FIX: Explicitly cast Object.values results to number[] to avoid "unknown" type errors in reduce
  const totalBudget = (Object.values(budgetLimits) as number[]).reduce((a, b) => a + b, 0);
  const totalSpent = (Object.values(spendingByCategory) as number[]).reduce((a, b) => a + b, 0);

  const handleSaveLimits = () => {
    if (setBudgetLimits) setBudgetLimits(localLimits);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Target size={18} className="text-gray-400" /> Smart Budget Monitor
          </h3>
          <p className="text-xs text-gray-500 mt-1">Monthly limits per category</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Edit Limits
        </button>
      </div>

      <div className="space-y-6">
        {categories.map((cat, idx) => {
          const limit = budgetLimits[cat] || 0;
          const spent = spendingByCategory[cat] || 0;
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOverBudget = spent > limit;
          
          let barColor = 'bg-blue-500';
          if (percentage > 80) barColor = 'bg-yellow-500';
          if (isOverBudget) barColor = 'bg-red-500';

          return (
            <div key={idx} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100`}>
                      <span className="text-[10px] font-bold text-gray-500">{cat.substring(0, 2).toUpperCase()}</span>
                   </div>
                   <div>
                      <span className="block text-sm font-bold text-gray-900">{cat}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Limit: {formatPrice(limit)}</span>
                   </div>
                </div>
                <div className="text-right">
                   <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatPrice(spent)}
                   </span>
                   <span className="text-[10px] text-gray-400 ml-1">/ mo</span>
                </div>
              </div>
              
              <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                    style={{ width: `${percentage}%` }}
                 ></div>
              </div>

              {isOverBudget && (
                 <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-red-600 animate-in fade-in slide-in-from-left-2">
                    <AlertCircle size={10} /> You've exceeded your budget by {formatPrice(spent - limit)}
                 </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
         <span>Total Budget: <span className="font-bold text-gray-900">{formatPrice(totalBudget)}</span></span>
         <span>Used: <span className="font-bold text-gray-900">{formatPrice(totalSpent)}</span> ({totalBudget > 0 ? ((totalSpent/totalBudget)*100).toFixed(0) : 0}%)</span>
      </div>

      {/* Edit Modal Overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col p-6 rounded-2xl animate-in fade-in duration-200">
           <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900">Edit Category Limits</h4>
              <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
           </div>
           <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {categories.map(cat => (
                 <div key={cat} className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{cat}</label>
                    <div className="relative">
                       <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                       <input 
                         type="number" 
                         value={localLimits[cat]}
                         onChange={(e) => setLocalLimits(prev => ({...prev, [cat]: parseFloat(e.target.value) || 0}))}
                         className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                       />
                    </div>
                 </div>
              ))}
           </div>
           <button onClick={handleSaveLimits} className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm mt-4 hover:bg-gray-800">
              Save Limits
           </button>
        </div>
      )}
    </div>
  );
};

const SavingsGoalCard = ({ goal, setGoal, totalSaved, formatPrice }: { goal: number, setGoal: any, totalSaved: number, formatPrice: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);
  
  const percentage = Math.min((totalSaved / goal) * 100, 100);
  const remaining = Math.max(0, goal - totalSaved);

  const handleSave = () => {
    if (setGoal) setGoal(tempGoal);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
       {/* Background decoration */}
       <div className="absolute top-0 right-0 p-8 bg-green-50 rounded-bl-[100px] opacity-50 transition-all group-hover:scale-110 duration-500"></div>
       
       <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monthly Savings Goal</p>
                {isEditing ? (
                   <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={tempGoal}
                        onChange={(e) => setTempGoal(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-lg font-bold"
                        autoFocus
                      />
                      <button onClick={handleSave} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">Save</button>
                   </div>
                ) : (
                   <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={() => setIsEditing(true)}>
                      <h3 className="text-2xl font-bold text-gray-900">{formatPrice(goal)}</h3>
                      <Edit2 size={14} className="text-gray-300 group-hover/edit:text-gray-500 transition-colors" />
                   </div>
                )}
             </div>
             <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Trophy size={20} />
             </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-600">Saved: {formatPrice(totalSaved)}</span>
                <span className="text-green-600">{percentage.toFixed(0)}%</span>
             </div>
             <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                   style={{ width: `${percentage}%` }}
                ></div>
             </div>
             <p className="text-xs text-gray-500 mt-2">
                {totalSaved >= goal 
                   ? "🎉 Goal achieved! Great job optimizing." 
                   : `You need ${formatPrice(remaining)} more to reach your goal.`}
             </p>
          </div>
       </div>
    </div>
  );
};

const AIInsightCard = ({ icon: Icon, title, desc, color }: any) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
     <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
     <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors`}>
           <Icon size={18} className="text-gray-900" />
        </div>
        <div>
           <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
             {title} <Sparkles size={12} className="text-yellow-500" />
           </h4>
           <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
     </div>
  </div>
);

export default function Analytics({ subscriptions = [], budgetLimits = {}, setBudgetLimits, savingsGoal = 0, setSavingsGoal, totalSaved = 0 }: AnalyticsProps) {
  const { t, currentCurrency, formatPrice, convertPrice } = useLanguage();
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [viewMode, setViewMode] = useState<'personal' | 'friends'>('personal');

  // CSV Export Logic
  const handleExportCSV = () => {
    const headers = ["Name", "Category", "Price", "Currency", "Billing Cycle", "Next Payment", "Status"];
    const rows = subscriptions.map(sub => [
        sub.name,
        sub.category || "Uncategorized",
        sub.price.toFixed(2),
        sub.currency,
        sub.cycle,
        sub.nextDate,
        sub.status
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "subscription_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const personalTrendData = [
    { label: 'Jan', value: 1850, prevValue: 1700 },
    { label: 'Feb', value: 2100, prevValue: 1850 },
    { label: 'Mar', value: 1950, prevValue: 2100 },
    { label: 'Apr', value: 2400, prevValue: 1950 },
    { label: 'May', value: 2250, prevValue: 2400 },
    { label: 'Jun', value: 2800, prevValue: 2250 },
  ];

  const trendColor = viewMode === 'personal' ? '#111827' : '#3B82F6';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('analytics.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('analytics.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="bg-gray-100 p-1 rounded-xl flex items-center">
              <button onClick={() => setViewMode('personal')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'personal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('analytics.personal')}</button>
              <button onClick={() => setViewMode('friends')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'friends' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('analytics.friends')}</button>
           </div>
           <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Calendar size={16} className="text-gray-400" />
              <span>{dateRange}</span>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
           </button>
           <button 
             onClick={handleExportCSV}
             className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95"
           >
              <Download size={16} />
              <span className="hidden sm:inline">{t('analytics.export')}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Trophy size={64} /></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t('analytics.lifetime')}</p>
            <h3 className="text-3xl font-bold mb-1">{formatPrice(12450)}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 w-fit px-2 py-1 rounded-lg">
               <Trophy size={12} className="text-yellow-400" /> Top 5% Spender
            </div>
         </div>
         {/* Savings Goal Card (New) */}
         <div className="md:col-span-1">
            <SavingsGoalCard 
              goal={savingsGoal} 
              setGoal={setSavingsGoal} 
              totalSaved={totalSaved} 
              formatPrice={formatPrice} 
            />
         </div>
         <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
               <p className="text-gray-900 font-bold text-sm">{t('analytics.heatmap')}</p>
               <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{t('analytics.heatmap_desc')}</span>
            </div>
            <SpendingHeatmap />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">{t('analytics.trend')}</h3>
                <p className="text-xs text-gray-500">{t('analytics.trend_desc')}</p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2.5 py-1.5 rounded-xl">
                <ArrowUpRight size={16} className="mr-1" />
                <span>8.2%</span>
              </div>
            </div>
            <SpendingTrendChart data={personalTrendData} color={trendColor} convertPrice={convertPrice} currentCurrency={currentCurrency} />
         </div>
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900">{t('analytics.cost_dist')}</h3>
                  <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
               </div>
               <CostDistributionChart formatPrice={formatPrice} subscriptions={subscriptions} />
            </div>
            {/* Real Budget Monitor */}
            <SmartBudgetMonitor 
              subscriptions={subscriptions}
              budgetLimits={budgetLimits}
              setBudgetLimits={setBudgetLimits}
              formatPrice={formatPrice}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <SubscriptionLifetimeTimeline subscriptions={subscriptions} />
         </div>
         <div className="lg:col-span-1 h-full">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
               <h3 className="text-base font-bold text-gray-900 mb-4">{t('analytics.global_compare')}</h3>
               <ComparisonWidget formatPrice={formatPrice} />
            </div>
         </div>
      </div>

      <div>
         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
           <Sparkles size={20} className="text-purple-600" /> {t('analytics.ai_insights')}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AIInsightCard icon={ArrowUpRight} title={t('analytics.insight.entertainment_spike')} desc={t('analytics.insight.entertainment_desc')} color="bg-red-500" />
            <AIInsightCard icon={Globe} title={t('analytics.insight.regional_optimization')} desc={t('analytics.insight.regional_desc')} color="bg-blue-500" />
            <AIInsightCard icon={Lightbulb} title={t('analytics.insight.duplicate_services')} desc={t('analytics.insight.duplicate_desc')} color="bg-yellow-500" />
         </div>
      </div>
    </div>
  );
}
