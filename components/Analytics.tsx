
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown, Lightbulb, Users, Globe, Trophy, Sparkles, TrendingUp, Clock } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_COLORS } from '../utils/data';

// --- Types ---
interface DataPoint {
  label: string;
  value: number; // Base USD
  prevValue: number; // Base USD
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

// --- Components ---

const SubscriptionLifetimeTimeline = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mock Data - In a real app this would come from the subscription list
  const subscriptions = [
    { name: 'Netflix', startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 3, 5, 15)).toISOString(), type: 'netflix' },
    { name: 'Spotify', startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2, 0, 20)).toISOString(), type: 'spotify' },
    { name: 'Adobe Creative Cloud', startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1, 2, 10)).toISOString(), type: 'adobe' },
    { name: 'Amazon Prime', startDate: new Date(new Date().setMonth(new Date().getMonth() - 18)).toISOString(), type: 'amazon' },
    { name: 'YouTube Premium', startDate: new Date(new Date().setMonth(new Date().getMonth() - 8)).toISOString(), type: 'youtube' },
    { name: 'ChatGPT Plus', startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), type: 'chatgpt' }
  ];

  const today = new Date();
  const timelineStart = new Date(today.getFullYear() - 3, today.getMonth(), 1); // 3 years ago
  const totalDuration = today.getTime() - timelineStart.getTime();

  // Helper to calculate position percentage
  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = date.getTime() - timelineStart.getTime();
    return Math.max(0, (diff / totalDuration) * 100);
  };

  const getDurationWidth = (dateStr: string) => {
    const start = getPosition(dateStr);
    return 100 - start; // Extends to "now" (100%)
  };

  const getDurationText = (dateStr: string) => {
      const start = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      
      if (years > 0) return `${years}y ${months}m`;
      return `${months}m`;
  };

  // Generate Year Markers
  const yearMarkers = [];
  const startYear = timelineStart.getFullYear();
  const endYear = today.getFullYear();
  
  for (let y = startYear; y <= endYear; y++) {
      const date = new Date(y, 0, 1);
      if (date >= timelineStart) {
          yearMarkers.push({ label: y.toString(), left: getPosition(date.toISOString()) });
      }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Subscription Lifetime
        </h3>
        <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">Scroll to view history</span>
      </div>

      <div className="relative w-full overflow-x-auto pb-4" ref={scrollContainerRef}>
        <div className="min-w-[600px] relative pr-16">
            
            {/* Timeline Header (Years) */}
            <div className="h-8 border-b border-gray-100 relative mb-6 text-xs font-semibold text-gray-400 select-none">
                {yearMarkers.map((marker) => (
                    <div 
                        key={marker.label} 
                        className="absolute bottom-0 border-l border-gray-200 pl-2 pb-1"
                        style={{ left: `${marker.left}%` }}
                    >
                        {marker.label}
                    </div>
                ))}
                <div className="absolute right-0 bottom-0 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold translate-y-1/2 z-10">Now</div>
            </div>

            {/* Subscriptions Lines */}
            <div className="space-y-5">
                {subscriptions.map((sub, index) => {
                    const left = getPosition(sub.startDate);
                    const width = getDurationWidth(sub.startDate);
                    const brandColor = BRAND_COLORS[sub.type] || BRAND_COLORS['default'];

                    return (
                        <div key={index} className="relative h-8 flex items-center group">
                            {/* Dotted Guide Line */}
                            <div className="absolute left-0 right-0 h-px bg-gray-100 top-1/2 -z-10 border-t border-dashed border-gray-200"></div>

                            {/* The Bar */}
                            <div 
                                className="absolute h-2.5 rounded-l-full shadow-sm group-hover:h-3.5 transition-all duration-300 opacity-80 group-hover:opacity-100"
                                style={{ 
                                    left: `${left}%`, 
                                    width: `${width}%`,
                                    background: `linear-gradient(90deg, ${brandColor}40 0%, ${brandColor} 100%)`
                                }}
                            ></div>

                            {/* Start Point (Icon) */}
                            <div 
                                className="absolute flex items-center gap-3 transition-all duration-300 z-10 group-hover:scale-110 cursor-pointer"
                                style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
                            >
                                <div className="w-8 h-8 bg-white rounded-full border border-gray-100 shadow-md flex items-center justify-center p-1.5 relative group/icon">
                                    <BrandIcon type={sub.type} className="w-full h-full" noBackground />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
                                        Started {new Date(sub.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                                    </div>
                                </div>
                            </div>

                            {/* Duration Label (floating right end) */}
                            <div 
                                className="absolute text-[10px] font-bold text-gray-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-gray-100 right-0 translate-x-full ml-2"
                            >
                                {getDurationText(sub.startDate)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Current Time Line */}
            <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-blue-500/20 z-0 border-r border-dashed border-blue-400"></div>
        </div>
      </div>
    </div>
  );
};

const SpendingTrendChart = ({ data, color = "#111827", convertPrice, currentCurrency }: { data: DataPoint[], color?: string, convertPrice: (v: number) => number, currentCurrency: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;
  const chartPadding = { top: 20, right: 10, bottom: 30, left: 50 };

  const { points, pathD, fillPath, maxValue } = useMemo(() => {
    if (width === 0 || height === 0) return { points: [], pathD: '', fillPath: '', maxValue: 0 };

    // Convert values for chart
    const convertedData = data.map(d => ({
        ...d,
        value: convertPrice(d.value),
        prevValue: convertPrice(d.prevValue)
    }));

    const max = Math.max(...convertedData.map(d => d.value)) * 1.1;
    const min = 0;
    const drawWidth = width - chartPadding.left - chartPadding.right;
    const drawHeight = height - chartPadding.top - chartPadding.bottom;

    const pts = convertedData.map((d, i) => ({
      x: chartPadding.left + (i / (convertedData.length - 1)) * drawWidth,
      y: chartPadding.top + drawHeight - ((d.value - min) / (max - min)) * drawHeight,
      ...d
    }));

    const path = generateSmoothPath(pts);
    const fill = `${path} L ${pts[pts.length-1].x} ${chartPadding.top + drawHeight} L ${chartPadding.left} ${chartPadding.top + drawHeight} Z`;
    
    return { points: pts, pathD: path, fillPath: fill, maxValue: max };
  }, [data, width, height, chartPadding, convertPrice]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || width === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const drawWidth = width - chartPadding.left - chartPadding.right;
    const chartX = x - chartPadding.left;
    if (chartX < -10 || chartX > drawWidth + 10) return;
    const rawIndex = (chartX / drawWidth) * (data.length - 1);
    const index = Math.round(Math.max(0, Math.min(data.length - 1, rawIndex)));
    setHoveredIndex(index);
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
      {width > 0 && height > 0 && (
        <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`} 
            className="absolute inset-0 overflow-visible"
        >
           <defs>
             <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor={color} stopOpacity="0.15" />
               <stop offset="100%" stopColor={color} stopOpacity="0" />
             </linearGradient>
           </defs>

           {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
               const y = chartPadding.top + (height - chartPadding.top - chartPadding.bottom) * (1 - tick);
               const val = Math.round(maxValue * tick);
               return (
                   <g key={i}>
                       <line x1={chartPadding.left} y1={y} x2={width - chartPadding.right} y2={y} stroke="#F3F4F6" strokeDasharray="4 4" />
                       <text x={chartPadding.left - 10} y={y} dy="3" textAnchor="end" className="text-[10px] fill-gray-400 font-medium">
                           {val.toLocaleString()}
                       </text>
                   </g>
               );
           })}
           <path d={fillPath} fill="url(#trendGradient)" className="transition-opacity duration-300 hidden sm:block" />
           <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
           {isHovering && hoveredPoint && (
             <line x1={hoveredPoint.x} y1={chartPadding.top} x2={hoveredPoint.x} y2={height - chartPadding.bottom} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
           )}
           {points.map((p, i) => {
             const isHovered = hoveredIndex === i;
             return (
               <circle key={i} cx={p.x} cy={p.y} r={isHovered ? 4 : 3} fill={color} stroke="white" strokeWidth={isHovered ? 2 : 1.5} className={`transition-all duration-200 ${isHovered ? 'shadow-md' : ''}`} />
             );
           })}
           {points.map((p, i) => (
               <text key={i} x={p.x} y={height - 10} textAnchor="middle" className={`text-[10px] font-medium uppercase tracking-wide fill-gray-400 transition-colors ${hoveredIndex === i ? 'fill-gray-900 font-bold' : ''}`}>
                   {p.label}
               </text>
           ))}
        </svg>
      )}
      {isHovering && hoveredPoint && (
         <div className="absolute z-20 pointer-events-none transition-all duration-100 ease-out" style={{ left: hoveredPoint.x, top: hoveredPoint.y, transform: `translate(-50%, -140%)` }}>
            <div className="bg-[#0f0f14]/95 text-white rounded-md px-3 py-2 shadow-none border border-white/10 w-max min-w-[100px]">
                <div className="flex items-center justify-between gap-4 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{hoveredPoint.label}</span>
                    <span className={`text-[10px] font-bold ${((hoveredPoint.value - hoveredPoint.prevValue) >= 0) ? 'text-green-400' : 'text-red-400'}`}>
                        {((hoveredPoint.value - hoveredPoint.prevValue) >= 0) ? '+' : ''}
                        {Math.abs(((hoveredPoint.value - hoveredPoint.prevValue)/hoveredPoint.prevValue)*100).toFixed(1)}%
                    </span>
                </div>
                <div className="text-base font-bold">{currentCurrency} {hoveredPoint.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#0f0f14]/95"></div>
            </div>
         </div>
       )}
    </div>
  );
};

const SpendingHeatmap = () => {
  const weeks = 14;
  const days = 7;
  const getActivity = (w: number, d: number) => {
    const val = Math.random();
    if (val > 0.8) return 'bg-gray-900'; 
    if (val > 0.6) return 'bg-gray-600'; 
    if (val > 0.4) return 'bg-gray-300'; 
    return 'bg-gray-100'; 
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
         {Array.from({ length: weeks }).map((_, w) => (
           <div key={w} className="flex flex-col gap-1">
             {Array.from({ length: days }).map((_, d) => (
               <div 
                 key={`${w}-${d}`} 
                 className={`w-3 h-3 rounded-[2px] ${getActivity(w, d)} hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 transition-all cursor-pointer`}
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

const CostDistributionChart = ({ formatPrice }: { formatPrice: (v:number) => string }) => {
  const data = [
    { name: 'Netflix', value: 19.99, color: BRAND_COLORS['netflix'] },
    { name: 'Spotify', value: 14.99, color: BRAND_COLORS['spotify'] },
    { name: 'Adobe', value: 54.99, color: BRAND_COLORS['adobe'] },
    { name: 'Amazon', value: 139.00/12, color: BRAND_COLORS['amazon'] },
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
      <div className="flex-1 space-y-2">
         {data.slice(0, 4).map((d, i) => (
           <div key={i} className="flex items-center justify-between text-xs">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
               <span className="font-medium text-gray-700">{d.name}</span>
             </div>
             <span className="text-gray-500 font-medium">{formatPrice(d.value)}</span>
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
             {title} <Sparkles size={12} className="text-yellow-500" />
           </h4>
           <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
     </div>
  </div>
);

const ComparisonWidget = ({ formatPrice }: { formatPrice: (v:number) => string }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-32 w-full px-4 justify-between border-b border-gray-100 pb-0 relative">
         <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
           <div className="border-t border-dashed border-gray-100 w-full"></div>
           <div className="border-t border-dashed border-gray-100 w-full"></div>
           <div className="border-t border-dashed border-gray-100 w-full"></div>
         </div>
         {[
           { label: 'You', height: '65%', color: 'bg-gray-900', val: 145 },
           { label: 'Avg User', height: '80%', color: 'bg-gray-300', val: 190 },
           { label: 'Friends', height: '45%', color: 'bg-blue-500', val: 110 },
         ].map((bar, i) => (
           <div key={i} className="flex flex-col items-center justify-end h-full w-1/4 group relative z-10">
              <span className="text-[10px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">{formatPrice(bar.val)}</span>
              <div className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-90 ${bar.color}`} style={{ height: bar.height }}></div>
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
  const { t, currentCurrency, formatPrice, convertPrice } = useLanguage();
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [viewMode, setViewMode] = useState<'personal' | 'friends'>('personal');

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
           <button className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95">
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
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-green-200 transition-colors">
            <div className="flex justify-between items-start mb-2">
               <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
               <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+4%</span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{t('analytics.potential_save')}</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatPrice(48.00)}<span className="text-sm text-gray-400 font-normal">/mo</span></h3>
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
            <SpendingTrendChart data={currentData} color={trendColor} convertPrice={convertPrice} currentCurrency={currentCurrency} />
         </div>
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900">{t('analytics.cost_dist')}</h3>
                  <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
               </div>
               <CostDistributionChart formatPrice={formatPrice} />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="text-base font-bold text-gray-900 mb-4">{t('analytics.global_compare')}</h3>
               <ComparisonWidget formatPrice={formatPrice} />
            </div>
         </div>
      </div>

      <SubscriptionLifetimeTimeline />

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
