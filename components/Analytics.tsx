import React, { useState, useMemo, useRef } from 'react';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown, Lightbulb, Users, Globe, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_COLORS } from '../utils/data';

// --- Types ---
interface DataPoint {
  label: string;
  value: number;
  prevValue: number;
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

    const cp1x = p1.x + (p2.x - p0.x) * 0.2; // 0.2 is tension
    const cp1y = p1.y + (p2.y - p0.y) * 0.2;
    const cp2x = p2.x - (p3.x - p1.x) * 0.2;
    const cp2y = p2.y - (p3.y - p1.y) * 0.2;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

// --- Components ---

const SpendingTrendChart = ({ data, color = "#111827" }: { data: DataPoint[], color?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Memoize calculations
  const { points, pathD, fillPath, maxValue } = useMemo(() => {
    const max = Math.max(...data.map(d => d.value)) * 1.1; // 10% headroom
    const min = 0;
    
    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - ((d.value - min) / (max - min)) * 100,
      ...d
    }));

    const path = generateSmoothPath(pts);
    const fill = `${path} L 100 100 L 0 100 Z`;
    
    return { points: pts, pathD: path, fillPath: fill, maxValue: max };
  }, [data]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Find nearest point
    const index = Math.round((x / width) * (data.length - 1));
    if (index >= 0 && index < data.length) {
        setHoveredIndex(index);
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoveredIndex(null);
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div 
        ref={containerRef}
        className="h-72 w-full relative group/chart cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
    >
      {/* Y-Axis Grid */}
      <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-8 pl-0 pointer-events-none">
        {[100, 75, 50, 25, 0].map(pct => (
          <div key={pct} className="w-full flex items-center border-b border-dashed border-gray-100 h-0 relative">
             <span className="absolute left-0 -translate-y-1/2 bg-white pr-2 z-10 font-medium">
               ${Math.round((pct/100) * maxValue).toLocaleString()}
             </span>
          </div>
        ))}
      </div>
      
      {/* SVG Rendering */}
      <div className="absolute inset-0 left-10 right-2 bottom-6 top-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
           <defs>
             <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor={color} stopOpacity="0.15" />
               <stop offset="100%" stopColor={color} stopOpacity="0" />
             </linearGradient>
           </defs>
           
           {/* Area Fill */}
           <path d={fillPath} fill="url(#trendGradient)" className="transition-opacity duration-300 hidden sm:block" />
           
           {/* Line */}
           <path 
             d={pathD} 
             fill="none" 
             stroke={color} 
             strokeWidth="2" 
             strokeLinecap="round" 
             strokeLinejoin="round" 
             vectorEffect="non-scaling-stroke"
             className="drop-shadow-sm"
           />

           {/* Vertical Hover Line */}
           {isHovering && hoveredPoint && (
             <line 
                x1={`${hoveredPoint.x}%`} y1="0" 
                x2={`${hoveredPoint.x}%`} y2="100" 
                stroke={color} 
                strokeWidth="1" 
                strokeDasharray="4 4" 
                opacity="0.2"
                vectorEffect="non-scaling-stroke"
             />
           )}

           {/* Data Points */}
           {points.map((p, i) => {
             const isHovered = hoveredIndex === i;
             return (
               <circle 
                 key={i}
                 cx={`${p.x}%`} 
                 cy={`${p.y}%`} 
                 r={isHovered ? "4" : "3"} 
                 fill={color} 
                 stroke="white" 
                 strokeWidth="1.5" 
                 className={`transition-all duration-200 ${isHovered ? 'shadow-md scale-110' : ''}`}
                 style={{ opacity: isHovering && !isHovered ? 0.5 : 1 }}
               />
             );
           })}
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="absolute bottom-0 left-10 right-2 flex justify-between text-xs text-gray-400 font-medium uppercase tracking-wide">
         {data.map((d, i) => (
             <span key={i} className={`transition-colors ${hoveredIndex === i ? 'text-gray-900 font-bold' : ''}`}>
                 {d.label}
             </span>
         ))}
      </div>

      {/* HTML Tooltip Overlay */}
      {isHovering && hoveredPoint && (
         <div 
            className="absolute z-20 transition-all duration-100 ease-out pointer-events-none"
            style={{ 
                left: `calc(10% + ${hoveredPoint.x * 0.9}%)`, // Adjust for left padding (10%) and width factor
                top: `${hoveredPoint.y}%`,
                transform: `translate(-50%, -130%)` 
            }}
         >
            <div className="bg-[#0f0f14]/90 backdrop-blur-md text-white rounded-lg px-3 py-2 shadow-xl border border-white/10 w-max max-w-[180px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{hoveredPoint.label}</div>
                <div className="text-base font-bold mb-0.5">${hoveredPoint.value.toLocaleString()}</div>
                
                {/* Percentage Change */}
                <div className={`text-[11px] font-medium flex items-center ${
                    ((hoveredPoint.value - hoveredPoint.prevValue) >= 0) ? 'text-green-400' : 'text-red-400'
                }`}>
                    {((hoveredPoint.value - hoveredPoint.prevValue) >= 0) ? <TrendingUp size={10} className="mr-1" /> : <TrendingUp size={10} className="mr-1 rotate-180" />}
                    {Math.abs(((hoveredPoint.value - hoveredPoint.prevValue)/hoveredPoint.prevValue)*100).toFixed(1)}% 
                    <span className="text-gray-500 ml-1 font-normal">vs last mo</span>
                </div>
                
                {/* Tooltip Arrow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0f0f14]/90"></div>
            </div>
         </div>
       )}
    </div>
  );
};

const SpendingHeatmap = () => {
  // Mock last 3 months (approx 12 weeks)
  const weeks = 14;
  const days = 7;
  // Pseudo-random activity
  const getActivity = (w: number, d: number) => {
    const val = Math.random();
    if (val > 0.8) return 'bg-gray-900'; // High
    if (val > 0.6) return 'bg-gray-600'; // Med
    if (val > 0.4) return 'bg-gray-300'; // Low
    return 'bg-gray-100'; // None
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex gap-1 overflow-x-auto pb-2">
         {Array.from({ length: weeks }).map((_, w) => (
           <div key={w} className="flex flex-col gap-1">
             {Array.from({ length: days }).map((_, d) => (
               <div 
                 key={`${w}-${d}`} 
                 className={`w-3 h-3 rounded-[2px] ${getActivity(w, d)} hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 transition-all`}
                 title={`Activity level: ${w*d}`}
               ></div>
             ))}
           </div>
         ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-2">
        <span>Less</span>
        <div className="w-3 h-3 bg-gray-100 rounded-[2px]"></div>
        <div className="w-3 h-3 bg-gray-300 rounded-[2px]"></div>
        <div className="w-3 h-3 bg-gray-600 rounded-[2px]"></div>
        <div className="w-3 h-3 bg-gray-900 rounded-[2px]"></div>
        <span>More</span>
      </div>
    </div>
  );
};

const CostDistributionChart = () => {
  const data = [
    { name: 'Netflix', value: 19.99, color: BRAND_COLORS['netflix'] },
    { name: 'Spotify', value: 14.99, color: BRAND_COLORS['spotify'] },
    { name: 'Adobe', value: 54.99, color: BRAND_COLORS['adobe'] },
    { name: 'Amazon', value: 139.00/12, color: BRAND_COLORS['amazon'] }, // Monthly equiv
    { name: 'Others', value: 45.00, color: '#9CA3AF' }
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="flex items-center gap-6">
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
                  key={i}
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-[14] cursor-pointer"
                />
              )
           })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-gray-900">${Math.round(total)}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
         {data.slice(0, 4).map((d, i) => (
           <div key={i} className="flex items-center justify-between text-xs">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
               <span className="font-medium text-gray-700">{d.name}</span>
             </div>
             <span className="text-gray-500 font-medium">${d.value.toFixed(2)}</span>
           </div>
         ))}
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
             {title} 
             <Sparkles size={12} className="text-yellow-500" />
           </h4>
           <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
     </div>
  </div>
);

const ComparisonWidget = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-32 w-full px-4 justify-between border-b border-gray-100 pb-0 relative">
         {/* Grid Lines */}
         <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
           <div className="border-t border-dashed border-gray-100 w-full"></div>
           <div className="border-t border-dashed border-gray-100 w-full"></div>
           <div className="border-t border-dashed border-gray-100 w-full"></div>
         </div>
         
         {/* Bars */}
         {[
           { label: 'You', height: '65%', color: 'bg-gray-900', val: '$145' },
           { label: 'Avg User', height: '80%', color: 'bg-gray-300', val: '$190' },
           { label: 'Friends', height: '45%', color: 'bg-blue-500', val: '$110' },
         ].map((bar, i) => (
           <div key={i} className="flex flex-col items-center justify-end h-full w-1/4 group relative z-10">
              <span className="text-[10px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">{bar.val}</span>
              <div 
                className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-90 ${bar.color}`} 
                style={{ height: bar.height }}
              ></div>
              <span className="text-[10px] font-medium text-gray-400 mt-2">{bar.label}</span>
           </div>
         ))}
      </div>
      <p className="text-xs text-gray-500 text-center">
        You spend <span className="font-bold text-green-600">23% less</span> than the average user in your region.
      </p>
    </div>
  );
};

export default function Analytics() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [viewMode, setViewMode] = useState<'personal' | 'friends'>('personal');

  // Mock Data
  const personalTrendData = [
    { label: 'Jan', value: 1850, prevValue: 1700 },
    { label: 'Feb', value: 2100, prevValue: 1850 },
    { label: 'Mar', value: 1950, prevValue: 2100 },
    { label: 'Apr', value: 2400, prevValue: 1950 },
    { label: 'May', value: 2250, prevValue: 2400 },
    { label: 'Jun', value: 2800, prevValue: 2250 },
  ];

  const friendsTrendData = [
    { label: 'Jan', value: 1600, prevValue: 1550 },
    { label: 'Feb', value: 1750, prevValue: 1600 },
    { label: 'Mar', value: 1800, prevValue: 1750 },
    { label: 'Apr', value: 1850, prevValue: 1800 },
    { label: 'May', value: 2000, prevValue: 1850 },
    { label: 'Jun', value: 2100, prevValue: 2000 },
  ];

  const currentData = viewMode === 'personal' ? personalTrendData : friendsTrendData;
  const trendColor = viewMode === 'personal' ? '#111827' : '#3B82F6';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('analytics.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('analytics.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           {/* View Toggle */}
           <div className="bg-gray-100 p-1 rounded-xl flex items-center">
              <button 
                onClick={() => setViewMode('personal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'personal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('analytics.personal')}
              </button>
              <button 
                onClick={() => setViewMode('friends')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'friends' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('analytics.friends')}
              </button>
           </div>

           {/* Filter */}
           <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Calendar size={16} className="text-gray-400" />
              <span>{dateRange}</span>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
           </button>
           
           {/* Export */}
           <button className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95">
              <Download size={16} />
              <span className="hidden sm:inline">{t('analytics.export')}</span>
           </button>
        </div>
      </div>

      {/* 2. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* Lifetime Spending */}
         <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Trophy size={64} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t('analytics.lifetime')}</p>
            <h3 className="text-3xl font-bold mb-1">$12,450</h3>
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 w-fit px-2 py-1 rounded-lg">
               <Trophy size={12} className="text-yellow-400" /> Top 5% Spender
            </div>
         </div>

         {/* Savings Potential */}
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-green-200 transition-colors">
            <div className="flex justify-between items-start mb-2">
               <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
               <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+4%</span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{t('analytics.potential_save')}</p>
            <h3 className="text-2xl font-bold text-gray-900">$48.00<span className="text-sm text-gray-400 font-normal">/mo</span></h3>
         </div>

         {/* Heatmap Mini */}
         <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
               <p className="text-gray-900 font-bold text-sm">{t('analytics.heatmap')}</p>
               <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{t('analytics.heatmap_desc')}</span>
            </div>
            <SpendingHeatmap />
         </div>
      </div>

      {/* 3. Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Trend Chart */}
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
            <SpendingTrendChart data={currentData} color={trendColor} />
         </div>

         {/* Side Widgets */}
         <div className="space-y-6">
            {/* Cost Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900">{t('analytics.cost_dist')}</h3>
                  <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
               </div>
               <CostDistributionChart />
            </div>

            {/* Comparison Widget */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="text-base font-bold text-gray-900 mb-4">{t('analytics.global_compare')}</h3>
               <ComparisonWidget />
            </div>
         </div>
      </div>

      {/* 4. AI Insights Panel */}
      <div>
         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
           <Sparkles size={20} className="text-purple-600" /> {t('analytics.ai_insights')}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AIInsightCard 
               icon={ArrowUpRight}
               title="Entertainment Spike"
               desc="Your entertainment spending increased by 12% this quarter — mostly due to Netflix and Disney+ price hikes."
               color="bg-red-500"
            />
            <AIInsightCard 
               icon={Globe}
               title="Regional Optimization"
               desc="You’re spending 35% above average compared to users in your country for SaaS tools."
               color="bg-blue-500"
            />
            <AIInsightCard 
               icon={Lightbulb}
               title="Duplicate Services"
               desc="Spotify and YouTube Premium overlap — you could save $9.99 monthly by canceling one."
               color="bg-yellow-500"
            />
         </div>
      </div>

    </div>
  );
}