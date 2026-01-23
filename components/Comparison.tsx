
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ArrowRightLeft, Globe, TrendingUp, TrendingDown, Info, Search, Zap, Lightbulb, AlertTriangle, Download, Clock, DollarSign, RotateCcw, Sparkles } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { ALL_SUBSCRIPTIONS } from '../utils/data';
import { useLanguage } from '../contexts/LanguageContext';

// --- Types & Constants ---

interface PricingData {
  country: string;
  currency: string;
  price: number;
  usdPrice: number;
  history: number[]; // 6 months
  taxInfo: string;
  lastUpdated: string;
  trend: number; // % change
}

interface EventMarker {
  monthIndex: number;
  type: 'price_hike' | 'currency_fluctuation' | 'promo';
  description: string;
}

const COUNTRY_CONFIG: Record<string, { color: string; flag: string }> = {
  'United States': { color: '#2D60FF', flag: '🇺🇸' },
  'United Kingdom': { color: '#FF8A00', flag: '🇬🇧' },
  'India': { color: '#1DB954', flag: '🇮🇳' },
  'Japan': { color: '#FF4C4C', flag: '🇯🇵' },
  'Brazil': { color: '#FFD700', flag: '🇧🇷' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

// --- Enhanced Mock Data ---

const MOCK_EVENTS: Record<string, EventMarker[]> = {
  netflix: [
    { monthIndex: 2, type: 'price_hike', description: 'Global price adjustment (+$1.50)' },
    { monthIndex: 4, type: 'currency_fluctuation', description: 'JPY Weakening impacting USD value' }
  ],
  spotify: [
    { monthIndex: 3, type: 'promo', description: 'Spring Promo: 3 Months Free ended' }
  ]
};

const MOCK_DATA: Record<string, PricingData[]> = {
  netflix: [
    { country: 'United States', price: 15.49, currency: 'USD', usdPrice: 15.49, history: [15.49, 15.49, 16.99, 16.99, 16.99, 16.99], taxInfo: '+ Tax', lastUpdated: '2 days ago', trend: 1.2 },
    { country: 'United Kingdom', price: 10.99, currency: 'GBP', usdPrice: 13.95, history: [13.50, 13.50, 13.50, 13.80, 13.95, 13.95], taxInfo: 'incl. VAT', lastUpdated: '1 week ago', trend: 3.3 },
    { country: 'India', price: 649, currency: 'INR', usdPrice: 7.85, history: [7.80, 7.80, 7.85, 7.85, 7.85, 7.85], taxInfo: 'incl. GST', lastUpdated: 'Just now', trend: 0 },
    { country: 'Japan', price: 1490, currency: 'JPY', usdPrice: 10.05, history: [11.20, 11.00, 10.80, 10.50, 10.20, 10.05], taxInfo: 'incl. Tax', lastUpdated: '3 days ago', trend: -10.2 },
    { country: 'Brazil', price: 39.90, currency: 'BRL', usdPrice: 8.15, history: [8.00, 8.05, 8.10, 8.15, 8.15, 8.15], taxInfo: 'incl. Tax', lastUpdated: '1 month ago', trend: 1.8 },
  ],
  spotify: [
    { country: 'United States', price: 11.99, currency: 'USD', usdPrice: 11.99, history: [10.99, 10.99, 10.99, 11.99, 11.99, 11.99], taxInfo: '+ Tax', lastUpdated: '1 month ago', trend: 9.1 },
    { country: 'United Kingdom', price: 11.99, currency: 'GBP', usdPrice: 15.20, history: [14.50, 14.50, 14.80, 15.00, 15.20, 15.20], taxInfo: 'incl. VAT', lastUpdated: '2 weeks ago', trend: 4.8 },
    { country: 'India', price: 119, currency: 'INR', usdPrice: 1.45, history: [1.45, 1.45, 1.45, 1.45, 1.45, 1.45], taxInfo: 'incl. GST', lastUpdated: 'Today', trend: 0 },
    { country: 'Japan', price: 980, currency: 'JPY', usdPrice: 6.60, history: [7.20, 7.00, 6.90, 6.80, 6.70, 6.60], taxInfo: 'incl. Tax', lastUpdated: '4 days ago', trend: -8.3 },
    { country: 'Brazil', price: 21.90, currency: 'BRL', usdPrice: 4.50, history: [4.50, 4.50, 4.50, 4.50, 4.50, 4.50], taxInfo: 'incl. Tax', lastUpdated: '2 weeks ago', trend: 0 },
  ]
};

const getGenericMockData = (basePriceUSD: number): PricingData[] => [
  { country: 'United States', price: basePriceUSD, currency: 'USD', usdPrice: basePriceUSD, history: Array(6).fill(basePriceUSD), taxInfo: '+ Tax', lastUpdated: 'Unknown', trend: 0 },
  { country: 'United Kingdom', price: basePriceUSD * 0.8, currency: 'GBP', usdPrice: basePriceUSD * 1.05, history: Array(6).fill(basePriceUSD * 1.05), taxInfo: 'incl. VAT', lastUpdated: 'Unknown', trend: 1 },
  { country: 'India', price: basePriceUSD * 20, currency: 'INR', usdPrice: basePriceUSD * 0.4, history: Array(6).fill(basePriceUSD * 0.4), taxInfo: 'incl. GST', lastUpdated: 'Unknown', trend: -5 },
  { country: 'Japan', price: basePriceUSD * 110, currency: 'JPY', usdPrice: basePriceUSD * 0.8, history: Array(6).fill(basePriceUSD * 0.8), taxInfo: 'incl. Tax', lastUpdated: 'Unknown', trend: -2 },
  { country: 'Brazil', price: basePriceUSD * 4, currency: 'BRL', usdPrice: basePriceUSD * 0.6, history: Array(6).fill(basePriceUSD * 0.6), taxInfo: 'incl. Tax', lastUpdated: 'Unknown', trend: 2 },
];

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

const GlobalPricingChart = ({ data, events, liveFx, timeTravelIndex }: { data: PricingData[], events: EventMarker[], liveFx: boolean, timeTravelIndex: number | null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  // Resize Observer
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
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  // Process Data for Rendering
  const chartData = useMemo(() => {
    if (!width || !height) return { paths: [], markers: [], maxValue: 0, eventPoints: [] };

    // Flatten history to find global max/min
    let allValues = data.flatMap(d => d.history);
    
    // Apply Live FX noise if enabled
    if (liveFx) {
       allValues = allValues.map(v => v * (1 + (Math.random() - 0.5) * 0.02));
    }

    const maxValue = Math.max(...allValues) * 1.15;
    const minValue = 0;

    const paths = data.map(d => {
      const pts = d.history.map((val, i) => {
        // Apply Live FX per point for render
        const jitter = liveFx ? (Math.random() - 0.5) * (val * 0.02) : 0;
        const displayVal = val + jitter;

        return {
            x: padding.left + (i / (d.history.length - 1)) * drawWidth,
            y: padding.top + drawHeight - ((displayVal - minValue) / (maxValue - minValue)) * drawHeight,
            value: displayVal,
            label: MONTHS[i]
        };
      });
      return { 
        country: d.country, 
        color: COUNTRY_CONFIG[d.country]?.color || '#999', 
        points: pts, 
        path: generateSmoothPath(pts) 
      };
    });

    // Calculate Event Marker Positions
    const eventPoints = events.map(e => {
        // Attach event to the first country's line (usually US or just visually top) or specific logic
        // For simplicity, we attach to US line, or just place it based on index
        const x = padding.left + (e.monthIndex / 5) * drawWidth;
        return { x, ...e };
    });

    return { paths, maxValue, eventPoints };
  }, [data, width, height, liveFx, events, padding, drawWidth, drawHeight]);

  // Interaction Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!width) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoveredX(x);
    
    // Find closest line
    const mouseY = e.clientY - rect.top;
    let minDist = Infinity;
    let closestCountry = null;

    if (x >= padding.left && x <= width - padding.right) {
        chartData.paths.forEach(p => {
            // Simple approximation: find point at this X index
            const index = Math.round(((x - padding.left) / drawWidth) * 5); // 5 segments
            const pt = p.points[Math.max(0, Math.min(5, index))];
            if (pt) {
                const dist = Math.abs(pt.y - mouseY);
                if (dist < 40) { // Tolerance
                   if (dist < minDist) {
                       minDist = dist;
                       closestCountry = p.country;
                   }
                }
            }
        });
        setActiveCountry(closestCountry);
    } else {
        setActiveCountry(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredX(null);
    setActiveCountry(null);
  };

  // Determine active data index based on Hover OR Time Travel
  let activeIndex = -1;
  if (hoveredX !== null && drawWidth > 0) {
     const raw = (hoveredX - padding.left) / drawWidth;
     activeIndex = Math.round(Math.max(0, Math.min(5, raw * 5)));
  } else if (timeTravelIndex !== null) {
     activeIndex = timeTravelIndex;
  }

  // Get data points for tooltip at active index
  const activePoints = activeIndex !== -1 
    ? chartData.paths.map(p => ({ ...p, point: p.points[activeIndex] })).sort((a,b) => b.point.value - a.point.value)
    : [];
    
  // Filter for single country tooltip if one is specifically hovered, else show all or top
  const tooltipData = activeCountry 
     ? activePoints.filter(p => p.country === activeCountry) 
     : activePoints;

  return (
    <div 
       ref={containerRef} 
       className="h-80 w-full relative select-none cursor-crosshair"
       onMouseMove={handleMouseMove}
       onMouseLeave={handleMouseLeave}
    >
       {width > 0 && height > 0 && (
          <svg width={width} height={height} className="overflow-visible">
             <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="2" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
             </defs>

             {/* Grid Lines (Vertical) */}
             {MONTHS.map((m, i) => {
                const x = padding.left + (i / 5) * drawWidth;
                return (
                   <line key={i} x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#F3F4F6" strokeDasharray="4 4" />
                );
             })}
             
             {/* Grid Lines (Horizontal) */}
             {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                const y = padding.top + drawHeight * (1 - t);
                return (
                   <g key={i}>
                      <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F3F4F6" />
                      <text x={padding.left - 10} y={y} dy="4" textAnchor="end" className="text-[10px] fill-gray-400 font-medium">
                         ${(chartData.maxValue * t).toFixed(0)}
                      </text>
                   </g>
                );
             })}

             {/* Lines */}
             {chartData.paths.map(p => (
                <path 
                   key={p.country}
                   d={p.path}
                   fill="none"
                   stroke={p.color}
                   strokeWidth={activeCountry && activeCountry !== p.country ? "1" : "2.5"}
                   strokeOpacity={activeCountry && activeCountry !== p.country ? "0.3" : "0.9"}
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   className="transition-all duration-300"
                />
             ))}

             {/* Hover/Active Vertical Line */}
             {activeIndex !== -1 && (
                <line 
                   x1={padding.left + (activeIndex / 5) * drawWidth} 
                   y1={padding.top} 
                   x2={padding.left + (activeIndex / 5) * drawWidth} 
                   y2={height - padding.bottom}
                   stroke="#9CA3AF"
                   strokeWidth="1"
                   strokeDasharray="4 4"
                />
             )}

             {/* Data Points */}
             {chartData.paths.map(p => {
                const isActive = activeCountry === p.country || (activeIndex !== -1);
                // Only show dots for active index or all if none active
                const pointsToShow = activeIndex !== -1 ? [p.points[activeIndex]] : p.points;

                return pointsToShow.map((pt, i) => (
                   <circle 
                      key={`${p.country}-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={activeCountry === p.country ? 5 : 3}
                      fill={p.color}
                      stroke="white"
                      strokeWidth="1.5"
                      opacity={activeCountry && activeCountry !== p.country ? 0.3 : 1}
                      className="transition-all duration-200"
                   />
                ));
             })}

             {/* Event Markers */}
             {chartData.eventPoints.map((e, i) => (
                 <g key={i} transform={`translate(${e.x}, ${padding.top - 10})`}>
                     <circle r="8" fill="#FFF" stroke="#F59E0B" strokeWidth="2" className="drop-shadow-sm" />
                     <text textAnchor="middle" dy="3" fontSize="10">!</text>
                     {/* Event Tooltip Area (invisible hit target) */}
                     <rect x="-10" y="-10" width="20" height="20" fill="transparent" />
                 </g>
             ))}

             {/* X-Axis Labels */}
             {MONTHS.map((m, i) => {
                const x = padding.left + (i / 5) * drawWidth;
                return (
                   <text 
                      key={i} 
                      x={x} 
                      y={height - 10} 
                      textAnchor="middle" 
                      className={`text-[10px] font-medium transition-colors ${i === activeIndex ? 'fill-gray-900 font-bold' : 'fill-gray-400'}`}
                   >
                      {m}
                   </text>
                );
             })}
          </svg>
       )}

       {/* HTML Tooltip */}
       {activeIndex !== -1 && tooltipData.length > 0 && width > 0 && (
          <div 
             className="absolute z-20 pointer-events-none transition-all duration-75 ease-out"
             style={{
                left: padding.left + (activeIndex / 5) * drawWidth,
                top: Math.min(...tooltipData.map(d => d.point.y)) - 20, // Position above highest point
                transform: `translate(${activeIndex > 2 ? '-105%' : '5%'}, -50%)`
             }}
          >
             <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 p-3 min-w-[160px]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{MONTHS[activeIndex]} Pricing</p>
                {tooltipData.map(d => (
                   <div key={d.country} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
                      <div className="flex items-center gap-2">
                         <span className="text-sm">{COUNTRY_CONFIG[d.country]?.flag}</span>
                         <span className="text-xs font-bold text-gray-700">{d.country}</span>
                      </div>
                      <div className="text-right">
                         <div className="text-xs font-bold text-gray-900">${d.point.value.toFixed(2)}</div>
                         {activeIndex > 0 && (
                            <div className="text-[9px] font-medium text-gray-500">
                               {((d.point.value - d.points[activeIndex-1].value) / d.points[activeIndex-1].value * 100).toFixed(1)}%
                            </div>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )}

       {/* Event Tooltip Override (Generic placement for demo) */}
       {chartData.eventPoints.some(e => activeIndex === e.monthIndex) && (
           <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-50 text-yellow-800 px-3 py-1.5 rounded-full text-xs font-medium border border-yellow-200 shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={12} />
              {events.find(e => e.monthIndex === activeIndex)?.description}
           </div>
       )}
    </div>
  );
};

const AIInsightsPanel = ({ data, baseCurrency, serviceName }: { data: PricingData[], baseCurrency: string, serviceName: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();

  // Simple logic to generate "AI" insights
  const cheapest = data.reduce((prev, curr) => prev.usdPrice < curr.usdPrice ? prev : curr);
  const mostExpensive = data.reduce((prev, curr) => prev.usdPrice > curr.usdPrice ? prev : curr);
  const diffPercent = ((mostExpensive.usdPrice - cheapest.usdPrice) / mostExpensive.usdPrice * 100).toFixed(0);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 overflow-hidden">
        <button 
           onClick={() => setIsOpen(!isOpen)}
           className="w-full flex items-center justify-between p-4 text-left hover:bg-white/50 transition-colors"
        >
           <div className="flex items-center gap-2 text-indigo-900">
              <Sparkles size={18} className="text-indigo-600" />
              <span className="font-bold text-sm">{t('compare.ai_insights')}</span>
           </div>
           <ChevronDown size={16} className={`text-indigo-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
           <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2">
              <div className="bg-white/80 p-3 rounded-xl text-xs text-gray-700 leading-relaxed shadow-sm border border-white">
                 <strong className="block text-indigo-700 mb-1">{cheapest.country} offers the best value</strong>
                 {serviceName} in {cheapest.country} is <span className="font-bold text-green-600">{diffPercent}% cheaper</span> than in {mostExpensive.country} due to regional purchasing power adjustments.
              </div>
              <div className="bg-white/80 p-3 rounded-xl text-xs text-gray-700 leading-relaxed shadow-sm border border-white">
                 <strong className="block text-indigo-700 mb-1">Currency Impact</strong>
                 Recent fluctuations in the {mostExpensive.currency} have made the subscription 3% more expensive for international users holding {baseCurrency}.
              </div>
              <div className="flex items-center gap-2 text-[10px] text-indigo-400 px-1">
                 <Zap size={10} /> Insights generated based on live exchange rates.
              </div>
           </div>
        )}
    </div>
  );
};

const SavingsComparisonBox = ({ data, baseCountry = 'United States' }: { data: PricingData[], baseCountry?: string }) => {
   const basePrice = data.find(d => d.country === baseCountry)?.usdPrice || 0;
   const cheapest = data.reduce((prev, curr) => prev.usdPrice < curr.usdPrice ? prev : curr);
   const savings = basePrice - cheapest.usdPrice;
   const savingsPercent = ((savings / basePrice) * 100).toFixed(0);
   const { t } = useLanguage();

   if (savings <= 0) return null;

   const formatMessage = (template: string, ...args: string[]) => {
     return template.replace(/{(\d+)}/g, (match, number) => {
       return typeof args[number] !== 'undefined' ? args[number] : match;
     });
   };

   return (
      <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} />
         </div>
         
         <div className="relative z-10">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t('compare.potential_savings')}</p>
            <div className="flex items-baseline gap-1 mb-1">
               <span className="text-4xl font-bold">${(savings * 12).toFixed(2)}</span>
               <span className="text-sm text-gray-400">/ year</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold">
                  {t('compare.save')} {savingsPercent}%
               </span>
               <span className="text-xs text-gray-400">{t('compare.vs')} {baseCountry}</span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed border-t border-gray-800 pt-3 mt-3">
               {formatMessage(
                 t('compare.switching_msg'), 
                 `${baseCountry}`, 
                 `${cheapest.country}`, 
                 `$${savings.toFixed(2)}`
               )}
            </p>
         </div>
      </div>
   );
};

const RegionalPriceTable = ({ data, baseCurrency }: { data: PricingData[], baseCurrency: string }) => {
   const baseItem = data.find(d => d.currency === baseCurrency) || data[0];
   const { t } = useLanguage();

   return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
         <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">{t('compare.regional_pricing')}</h3>
            <div className="text-xs text-gray-500 flex items-center gap-1">
               <Clock size={12} /> {t('compare.live')}
            </div>
         </div>
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
               <tbody className="divide-y divide-gray-50">
                  {data.map((item, idx) => {
                     const diff = ((item.usdPrice - baseItem.usdPrice) / baseItem.usdPrice) * 100;
                     const isCheaper = diff < 0;
                     const isBase = item.currency === baseCurrency;
                     
                     return (
                        <tr key={idx} className={`group hover:bg-gray-50 transition-colors ${isBase ? 'bg-blue-50/20' : ''}`}>
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                 <span className="text-lg">{COUNTRY_CONFIG[item.country]?.flag}</span>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">{item.country}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{item.taxInfo}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-3 text-right">
                              <div className="flex flex-col items-end">
                                 <span className="text-sm font-bold text-gray-900">${item.usdPrice.toFixed(2)}</span>
                                 <span className="text-[10px] text-gray-400">{item.currency} {item.price.toFixed(2)}</span>
                              </div>
                           </td>
                           <td className="px-4 py-3 text-right w-24">
                              {!isBase ? (
                                 <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isCheaper ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {isCheaper ? <TrendingDown size={10} className="mr-1" /> : <TrendingUp size={10} className="mr-1" />}
                                    {Math.abs(diff).toFixed(0)}%
                                 </div>
                              ) : (
                                 <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Base</span>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default function Comparison() {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState('Netflix');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [liveFx, setLiveFx] = useState(false);
  const [timeTravelIndex, setTimeTravelIndex] = useState<number | null>(null);

  const normalizedId = selectedService.toLowerCase().replace(/\s+/g, '');
  const currentData = MOCK_DATA[normalizedId] || getGenericMockData(15);
  const currentEvents = MOCK_EVENTS[normalizedId] || [];

  // Live FX Simulation
  useEffect(() => {
     if (!liveFx) return;
     const interval = setInterval(() => {
        // Trigger re-render to simulate noise in chart
     }, 200);
     return () => clearInterval(interval);
  }, [liveFx]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('features.compare.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('compare.subtitle')}</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setLiveFx(!liveFx)}
             className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${liveFx ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200'}`}
           >
              {liveFx ? <Zap size={14} className="animate-pulse" /> : <Zap size={14} />}
              {liveFx ? t('compare.live_fx_on') : t('compare.live_fx_off')}
           </button>
           <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              <Download size={14} /> {t('compare.export')}
           </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">{t('compare.service')}</label>
             <div className="relative">
                 <select 
                     className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-2.5 pr-8 font-medium"
                     value={selectedService}
                     onChange={(e) => setSelectedService(e.target.value)}
                 >
                     {ALL_SUBSCRIPTIONS.slice(0, 15).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
             </div>
         </div>
         <div className="md:col-span-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">{t('compare.base_currency')}</label>
             <div className="relative">
                 <select 
                     className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-2.5 pr-8 font-medium"
                     value={baseCurrency}
                     onChange={(e) => setBaseCurrency(e.target.value)}
                 >
                     <option value="USD">United States Dollar (USD)</option>
                     <option value="GBP">British Pound (GBP)</option>
                     <option value="EUR">Euro (EUR)</option>
                     <option value="JPY">Japanese Yen (JPY)</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
             </div>
         </div>
         {/* Savings Box takes up remaining space */}
         <div className="md:col-span-2">
             <SavingsComparisonBox data={currentData} />
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Insights */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                          <BrandIcon type={selectedService} className="w-10 h-10 rounded-xl shadow-sm border border-gray-100" />
                          <div>
                              <h3 className="font-bold text-gray-900">{t('compare.price_history')} (USD)</h3>
                              <p className="text-xs text-gray-500">{t('compare.trend_analysis')}</p>
                          </div>
                      </div>
                      
                      {/* Interactive Legend */}
                      <div className="flex gap-4">
                          {Object.entries(COUNTRY_CONFIG).slice(0, 3).map(([name, conf]) => (
                             <div key={name} className="flex items-center gap-1.5 opacity-80 hover:opacity-100 cursor-pointer">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color }}></div>
                                <span className="text-xs font-semibold text-gray-600 hidden sm:inline">{name}</span>
                             </div>
                          ))}
                      </div>
                  </div>
                  
                  <GlobalPricingChart 
                      data={currentData} 
                      events={currentEvents} 
                      liveFx={liveFx}
                      timeTravelIndex={timeTravelIndex}
                  />

                  {/* Time Travel Slider */}
                  <div className="mt-6 px-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                          <span>{MONTHS[0]}</span>
                          <span>{MONTHS[MONTHS.length - 1]}</span>
                      </div>
                      <input 
                         type="range" 
                         min="0" 
                         max="5" 
                         step="1"
                         className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
                         onChange={(e) => setTimeTravelIndex(parseInt(e.target.value))}
                         onMouseUp={() => setTimeTravelIndex(null)} // Snap back on release
                         onTouchEnd={() => setTimeTravelIndex(null)}
                      />
                      <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                          <RotateCcw size={10} /> {t('compare.drag_history')}
                      </p>
                  </div>
              </div>

              {/* AI Insights */}
              <AIInsightsPanel data={currentData} baseCurrency={baseCurrency} serviceName={selectedService} />
          </div>

          {/* Right Column: Comparison Table */}
          <div className="lg:col-span-1 h-full">
              <RegionalPriceTable data={currentData} baseCurrency={baseCurrency} />
          </div>
      </div>
    </div>
  );
}
