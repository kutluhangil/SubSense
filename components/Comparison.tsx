import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Globe, TrendingUp, TrendingDown, Clock, DollarSign, Zap, Sparkles } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { ALL_SUBSCRIPTIONS, SUBSCRIPTION_CATALOG, SubscriptionDetail } from '../utils/data';
import { useLanguage } from '../contexts/LanguageContext';
import { EXCHANGE_RATES, CURRENCY_DATA, convertAmount } from '../utils/currency';
import { debugLog } from '../utils/debug';

// --- Types & Constants ---

interface PricingData {
   country: string;
   currency: string;
   price: number;
   displayPrice: number; // Converted to user selected base currency
   history: number[]; // 6 months in display currency
   taxInfo: string;
   lastUpdated: string;
   trend: number; // % change
}

const COUNTRY_CONFIG: Record<string, { color: string; flag: string; ppp: number; code: string; currency: string }> = {
   'United States': { color: '#2D60FF', flag: '🇺🇸', ppp: 1.0, code: 'US', currency: 'USD' },
   'United Kingdom': { color: '#FF8A00', flag: '🇬🇧', ppp: 1.15, code: 'GB', currency: 'GBP' }, // Slightly more exp usually
   'India': { color: '#1DB954', flag: '🇮🇳', ppp: 0.20, code: 'IN', currency: 'INR' },
   'Japan': { color: '#FF4C4C', flag: '🇯🇵', ppp: 0.85, code: 'JP', currency: 'JPY' },
   'Brazil': { color: '#FFD700', flag: '🇧🇷', ppp: 0.55, code: 'BR', currency: 'BRL' },
   'Turkey': { color: '#E30A17', flag: '🇹🇷', ppp: 0.35, code: 'TR', currency: 'TRY' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const generateLivePricing = (serviceName: string, baseCurrency: string): PricingData[] => {
   const key = serviceName.toLowerCase().replace(/\s+/g, '');
   const service = SUBSCRIPTION_CATALOG[key];
   const basePriceUSD = service ? parseFloat(service.price) : 10.00;

   return Object.entries(COUNTRY_CONFIG).map(([country, config]) => {
      // Calculate local price based on PPP and Exchange Rate (simulated)
      const localPriceRaw = basePriceUSD * config.ppp * (EXCHANGE_RATES[config.currency] || 1);
      let formattedLocalPrice = localPriceRaw;

      // Rounding conventions
      if (config.currency === 'JPY' || config.currency === 'HUF') {
         formattedLocalPrice = Math.round(localPriceRaw / 10) * 10;
      } else {
         formattedLocalPrice = Math.round(localPriceRaw) - 0.01;
      }

      // Ensure price is positive
      const finalLocalPrice = Math.max(0, formattedLocalPrice);

      // Convert local price to Selected Base Currency for comparison
      const displayPrice = convertAmount(finalLocalPrice, config.currency, baseCurrency);

      // Generate history based on display price
      const history = Array.from({ length: 6 }, (_, i) => {
         const fluctuation = 1 + (Math.random() - 0.5) * 0.05;
         return displayPrice * fluctuation;
      });

      return {
         country,
         currency: config.currency,
         price: finalLocalPrice, // Native price
         displayPrice: displayPrice, // Converted price
         history,
         taxInfo: country === 'United States' ? '+ Tax' : 'incl. Tax',
         lastUpdated: 'Live',
         trend: (Math.random() - 0.5) * 5
      };
   });
};

const generateSmoothPath = (points: { x: number, y: number }[]) => {
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

const GlobalPricingChart = ({ data, baseCurrencySymbol }: { data: PricingData[], baseCurrencySymbol: string }) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
   const [hoveredX, setHoveredX] = useState<number | null>(null);

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

   const chartData = useMemo(() => {
      if (!width || !height) return { paths: [], markers: [], maxValue: 0, eventPoints: [] };

      let allValues = data.flatMap(d => d.history);
      const maxValue = Math.max(...allValues) * 1.15;
      const minValue = 0;

      const paths = data.slice(0, 5).map(d => {
         const pts = d.history.map((val, i) => {
            return {
               x: padding.left + (i / (d.history.length - 1)) * drawWidth,
               y: padding.top + drawHeight - ((val - minValue) / (maxValue - minValue)) * drawHeight,
               value: val,
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

      return { paths, maxValue };
   }, [data, width, height, padding, drawWidth, drawHeight]);

   const handleMouseMove = (e: React.MouseEvent) => {
      if (!width) return;
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoveredX(x);
   };

   const handleMouseLeave = () => {
      setHoveredX(null);
   };

   let activeIndex = -1;
   if (hoveredX !== null && drawWidth > 0) {
      const raw = (hoveredX - padding.left) / drawWidth;
      activeIndex = Math.round(Math.max(0, Math.min(5, raw * 5)));
   }

   const activePoints = activeIndex !== -1
      ? chartData.paths.map(p => ({ ...p, point: p.points[activeIndex] })).sort((a, b) => b.point.value - a.point.value)
      : [];

   return (
      <div
         ref={containerRef}
         className="h-80 w-full relative select-none cursor-crosshair"
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
      >
         {width > 0 && height > 0 && (
            <svg width={width} height={height} className="overflow-visible">
               {MONTHS.map((m, i) => {
                  const x = padding.left + (i / 5) * drawWidth;
                  return (
                     <line key={i} x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="var(--chart-grid)" strokeDasharray="4 4" />
                  );
               })}

               {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                  const y = padding.top + drawHeight * (1 - t);
                  return (
                     <g key={i}>
                        <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--chart-grid)" />
                        <text x={padding.left - 10} y={y} dy="4" textAnchor="end" className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium">
                           {baseCurrencySymbol}{(chartData.maxValue * t).toFixed(0)}
                        </text>
                     </g>
                  );
               })}

               {chartData.paths.map(p => (
                  <path
                     key={p.country}
                     d={p.path}
                     fill="none"
                     stroke={p.color}
                     strokeWidth="2.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="transition-all duration-300"
                  />
               ))}

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

               {chartData.paths.map(p => {
                  const pointsToShow = activeIndex !== -1 ? [p.points[activeIndex]] : p.points;
                  return pointsToShow.map((pt, i) => (
                     <circle
                        key={`${p.country}-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r={3}
                        fill={p.color}
                        stroke="var(--bg-card)"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                     />
                  ));
               })}

               {MONTHS.map((m, i) => {
                  const x = padding.left + (i / 5) * drawWidth;
                  return (
                     <text
                        key={i}
                        x={x}
                        y={height - 10}
                        textAnchor="middle"
                        className={`text-[10px] font-medium transition-colors ${i === activeIndex ? 'fill-gray-900 dark:fill-white font-bold' : 'fill-gray-400 dark:fill-gray-500'}`}
                     >
                        {m}
                     </text>
                  );
               })}
            </svg>
         )}

         {activeIndex !== -1 && activePoints.length > 0 && width > 0 && (
            <div
               className="absolute z-20 pointer-events-none transition-all duration-75 ease-out"
               style={{
                  left: padding.left + (activeIndex / 5) * drawWidth,
                  top: 20,
                  transform: `translate(${activeIndex > 2 ? '-105%' : '5%'}, 0)`
               }}
            >
               <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 min-w-[160px]">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{MONTHS[activeIndex]} Pricing</p>
                  {activePoints.map(d => (
                     <div key={d.country} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
                        <div className="flex items-center gap-2">
                           <span className="text-sm">{COUNTRY_CONFIG[d.country]?.flag}</span>
                           <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{d.country}</span>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-bold text-gray-900 dark:text-white">{baseCurrencySymbol}{d.point.value.toFixed(2)}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};

const AIInsightsPanel = ({ data, serviceName, baseCurrencySymbol }: { data: PricingData[], serviceName: string, baseCurrencySymbol: string }) => {
   const [isOpen, setIsOpen] = useState(true);
   const { t } = useLanguage();

   const cheapest = data.reduce((prev, curr) => prev.displayPrice < curr.displayPrice ? prev : curr);
   const mostExpensive = data.reduce((prev, curr) => prev.displayPrice > curr.displayPrice ? prev : curr);
   const diffPercent = mostExpensive.displayPrice > 0
      ? ((mostExpensive.displayPrice - cheapest.displayPrice) / mostExpensive.displayPrice * 100).toFixed(0)
      : '0';

   return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 overflow-hidden">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
         >
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
               <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
               <span className="font-bold text-sm">{t('compare.ai_insights')}</span>
            </div>
            <ChevronDown size={16} className={`text-indigo-400 dark:text-indigo-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
         </button>

         {isOpen && (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2">
               <div className="bg-white/80 dark:bg-gray-900/50 p-3 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed shadow-sm border border-white dark:border-gray-700">
                  <strong className="block text-indigo-700 dark:text-indigo-300 mb-1">{cheapest.country} offers the best value</strong>
                  {serviceName} in {cheapest.country} is <span className="font-bold text-green-600 dark:text-green-400">{diffPercent}% cheaper</span> than in {mostExpensive.country} due to regional purchasing power adjustments.
               </div>
               <div className="flex items-center gap-2 text-[10px] text-indigo-400 dark:text-indigo-300 px-1">
                  <Zap size={10} /> Insights based on live currency rates.
               </div>
            </div>
         )}
      </div>
   );
};

const SavingsComparisonBox = ({ data, baseCountry = 'United States', baseCurrencySymbol }: { data: PricingData[], baseCountry?: string, baseCurrencySymbol: string }) => {
   // TEMP: Disabled until robust currency logic is verified.
   // Returning null hides this misleading section.
   debugLog('COMPARE_CALC', 'Potential Annual Savings Calculation Disabled', { reason: 'Pending currency logic validation' });
   return null;
};

const RegionalPriceTable = ({ data, baseCurrencySymbol }: { data: PricingData[], baseCurrencySymbol: string }) => {
   const baseItem = data.find(d => d.country === 'United States') || data[0];
   const { t } = useLanguage();

   return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
         <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('compare.regional_pricing')}</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
               <Clock size={12} /> {t('compare.live')}
            </div>
         </div>
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
               <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {data.map((item, idx) => {
                     const diff = baseItem.displayPrice > 0
                        ? ((item.displayPrice - baseItem.displayPrice) / baseItem.displayPrice) * 100
                        : 0;
                     const isCheaper = diff < 0;
                     const isBase = item.country === 'United States';

                     return (
                        <tr key={idx} className={`group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isBase ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}>
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                 <span className="text-lg">{COUNTRY_CONFIG[item.country]?.flag}</span>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.country}</span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{item.taxInfo}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-3 text-right">
                              <div className="flex flex-col items-end">
                                 <span className="text-sm font-bold text-gray-900 dark:text-white">{baseCurrencySymbol}{item.displayPrice.toFixed(2)}</span>
                                 <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.currency} {item.price.toLocaleString()}</span>
                              </div>
                           </td>
                           <td className="px-4 py-3 text-right w-24">
                              {!isBase ? (
                                 <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isCheaper ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                    {isCheaper ? <TrendingDown size={10} className="mr-1" /> : <TrendingUp size={10} className="mr-1" />}
                                    {Math.abs(diff).toFixed(0)}%
                                 </div>
                              ) : (
                                 <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Base</span>
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
   const { t, currentCurrency } = useLanguage(); // Use context currency as default
   const [selectedService, setSelectedService] = useState('Netflix');
   const [baseCurrency, setBaseCurrency] = useState(currentCurrency);

   // Sync local baseCurrency with global change if user hasn't overridden it locally (optional, staying consistent for now)
   useEffect(() => {
      setBaseCurrency(currentCurrency);
   }, [currentCurrency]);

   const currencies = useMemo(() => Object.values(CURRENCY_DATA), []);
   const baseCurrencySymbol = CURRENCY_DATA[baseCurrency]?.symbol || '$';

   // Real-time calculation based on exchange rates and selected base currency
   const currentData = useMemo(() => {
      // debugLog('COMPARE_CALC', `Recalculating comparison for ${selectedService}`, { baseCurrency }); // Reduced verbosity
      const marketData = generateLivePricing(selectedService, baseCurrency);

      // Inject User's Actual Price if they have this subscription
      // Note: We need access to subscriptions here. For now, we assume standard market rates are the focus.
      // If we wanted to compare "My Netlfix" vs "Global Netflix", we'd pass subs as props.
      // Leaving as Market Analysis tool for now per design.
      return marketData;
   }, [selectedService, baseCurrency]);

   // TODO: Future feature - "Compare with my price"
   // const mySub = subscriptions.find(s => s.name === selectedService);


   return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-500">

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('features.compare.title')}</h2>
               <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('compare.subtitle')}</p>
            </div>
         </div>

         {/* Controls */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block pl-1">{t('compare.service')}</label>
               <div className="relative">
                  <select
                     className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:focus:border-gray-500 block p-2.5 pr-8 font-medium"
                     value={selectedService}
                     onChange={(e) => setSelectedService(e.target.value)}
                  >
                     {ALL_SUBSCRIPTIONS.slice(0, 20).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
               </div>
            </div>
            <div className="md:col-span-1 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block pl-1">{t('compare.base_currency')}</label>
               <div className="relative">
                  <select
                     className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:focus:border-gray-500 block p-2.5 pr-8 font-medium"
                     value={baseCurrency}
                     onChange={(e) => setBaseCurrency(e.target.value)}
                  >
                     {currencies.map(c => (
                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                     ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
               </div>
            </div>
            {/* Savings Box takes up remaining space */}
            <div className="md:col-span-2">
               <SavingsComparisonBox data={currentData} baseCurrencySymbol={baseCurrencySymbol} />
            </div>
         </div>

         {/* Main Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Chart & Insights */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 relative">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <BrandIcon type={selectedService} className="w-10 h-10 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600" />
                        <div>
                           <h3 className="font-bold text-gray-900 dark:text-white">{t('compare.price_history')} ({baseCurrency})</h3>
                           <p className="text-xs text-gray-500 dark:text-gray-400">{t('compare.trend_analysis')}</p>
                        </div>
                     </div>

                     {/* Interactive Legend */}
                     <div className="flex gap-4">
                        {Object.entries(COUNTRY_CONFIG).slice(0, 3).map(([name, conf]) => (
                           <div key={name} className="flex items-center gap-1.5 opacity-80 hover:opacity-100 cursor-pointer">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color }}></div>
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline">{name}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <GlobalPricingChart data={currentData} baseCurrencySymbol={baseCurrencySymbol} />
               </div>

               {/* AI Insights */}
               <AIInsightsPanel data={currentData} serviceName={selectedService} baseCurrencySymbol={baseCurrencySymbol} />
            </div>

            {/* Right Column: Comparison Table */}
            <div className="lg:col-span-1 h-full">
               <RegionalPriceTable data={currentData} baseCurrencySymbol={baseCurrencySymbol} />
            </div>
         </div>
      </div>
   );
}