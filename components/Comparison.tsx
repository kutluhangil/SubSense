import React, { useState } from 'react';
import { ChevronDown, ArrowRightLeft, Globe, TrendingUp, TrendingDown, Info, Search } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { ALL_SUBSCRIPTIONS, CURRENCIES } from '../utils/data';

// --- Mock Data for Charts ---
// We map the popular ones to specific mock data, others default to a generic pattern
const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$' },
];

const MOCK_DATA: Record<string, any[]> = {
  netflix: [
    { country: 'United States', price: 15.49, currency: 'USD', usdPrice: 15.49, history: [14.00, 14.00, 15.49, 15.49, 15.49, 15.49] },
    { country: 'United Kingdom', price: 10.99, currency: 'GBP', usdPrice: 13.95, history: [12.50, 12.50, 13.00, 13.50, 13.95, 13.95] },
    { country: 'India', price: 649, currency: 'INR', usdPrice: 7.85, history: [7.00, 7.00, 7.50, 7.80, 7.85, 7.85] },
    { country: 'Japan', price: 1490, currency: 'JPY', usdPrice: 10.05, history: [11.00, 10.80, 10.50, 10.20, 10.05, 10.05] },
    { country: 'Brazil', price: 39.90, currency: 'BRL', usdPrice: 8.15, history: [8.00, 8.00, 8.20, 8.10, 8.15, 8.15] },
  ],
  spotify: [
    { country: 'United States', price: 10.99, currency: 'USD', usdPrice: 10.99, history: [9.99, 9.99, 10.99, 10.99, 10.99, 10.99] },
    { country: 'United Kingdom', price: 10.99, currency: 'GBP', usdPrice: 13.95, history: [11.50, 11.50, 12.00, 13.50, 13.95, 13.95] },
    { country: 'India', price: 119, currency: 'INR', usdPrice: 1.45, history: [1.30, 1.30, 1.40, 1.45, 1.45, 1.45] },
    { country: 'Japan', price: 980, currency: 'JPY', usdPrice: 6.60, history: [7.00, 6.90, 6.80, 6.70, 6.60, 6.60] },
    { country: 'Brazil', price: 21.90, currency: 'BRL', usdPrice: 4.50, history: [4.20, 4.30, 4.40, 4.50, 4.50, 4.50] },
  ]
};

// Generic mock generator for other services to prevent crashes
const getGenericMockData = (basePriceUSD: number) => [
  { country: 'United States', price: basePriceUSD, currency: 'USD', usdPrice: basePriceUSD, history: Array(6).fill(basePriceUSD) },
  { country: 'United Kingdom', price: basePriceUSD * 0.8, currency: 'GBP', usdPrice: basePriceUSD * 1.05, history: Array(6).fill(basePriceUSD * 1.05) },
  { country: 'India', price: basePriceUSD * 20, currency: 'INR', usdPrice: basePriceUSD * 0.4, history: Array(6).fill(basePriceUSD * 0.4) },
  { country: 'Japan', price: basePriceUSD * 110, currency: 'JPY', usdPrice: basePriceUSD * 0.8, history: Array(6).fill(basePriceUSD * 0.8) },
  { country: 'Brazil', price: basePriceUSD * 4, currency: 'BRL', usdPrice: basePriceUSD * 0.6, history: Array(6).fill(basePriceUSD * 0.6) },
];

// --- Custom Components ---

const PriceHistoryChart = ({ data }: { data: any[] }) => {
  // Normalize history data for charting (using USD prices)
  const maxPrice = Math.max(...data.flatMap(d => d.history)) * 1.1;
  const minPrice = 0;
  
  const colors = ['#111827', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']; // US, UK, IN, JP, BR

  const getPoints = (history: number[]) => {
    return history.map((val, i) => {
      const x = (i / (history.length - 1)) * 100;
      const y = 100 - ((val - minPrice) / (maxPrice - minPrice)) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="h-64 w-full relative">
       {/* Grid Lines */}
       <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6 pl-0">
        {[100, 75, 50, 25, 0].map(pct => (
          <div key={pct} className="w-full flex items-center border-b border-dashed border-gray-100 h-0">
             <span className="absolute left-0 -translate-y-1/2 bg-white pr-2">${((pct/100) * maxPrice).toFixed(0)}</span>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 left-8 right-0 bottom-6 top-2">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {data.map((item, index) => (
            <g key={item.country}>
              <polyline 
                points={getPoints(item.history)} 
                fill="none" 
                stroke={colors[index % colors.length]} 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="hover:stroke-[3] transition-all duration-300"
              />
              {/* End Dot */}
              {(() => {
                 const history = item.history;
                 const val = history[history.length - 1];
                 const x = 100;
                 const y = 100 - ((val - minPrice) / (maxPrice - minPrice)) * 100;
                 return (
                   <circle cx={`${x}%`} cy={`${y}%`} r="3" fill={colors[index % colors.length]} stroke="white" strokeWidth="2" />
                 );
              })()}
            </g>
          ))}
        </svg>
      </div>
      
      {/* X Axis */}
      <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 font-medium uppercase tracking-wide">
         <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
      </div>
    </div>
  );
};

export default function Comparison() {
  const [selectedService, setSelectedService] = useState('Netflix');
  const [baseCurrency, setBaseCurrency] = useState('USD'); 

  // Normalize ID for mock data lookup
  const normalizedId = selectedService.toLowerCase().replace(/\s+/g, '');
  
  // Use specific mock data or fall back to generic generation based on name length (pseudo-random)
  const currentData = MOCK_DATA[normalizedId] || getGenericMockData(10 + (selectedService.length % 20));
  
  const baseDataPoint = currentData.find(d => d.currency === baseCurrency) || currentData[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Global Pricing</h2>
        <p className="text-gray-500 text-sm mt-1">Compare subscription costs across different regions.</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service Selector */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Service</label>
            <div className="relative">
                <select 
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-2.5 pr-8 cursor-pointer font-medium"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                >
                    {ALL_SUBSCRIPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>

        {/* Base Currency Selector */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Base Currency</label>
            <div className="relative">
                <select 
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-2.5 pr-8 cursor-pointer font-medium"
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                >
                    {/* Filter to just the main ones we have mock data for in the simplified array, 
                        or map the big list if we had data for all of them. 
                        For this specific table, we stick to the ones that match our mock table structure. */}
                    {COUNTRIES.map(c => <option key={c.code} value={c.currency}>{c.name} ({c.currency})</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-900 p-4 rounded-xl text-white shadow-sm flex items-center justify-between">
             <div>
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Potential Savings</p>
                 <div className="text-2xl font-bold flex items-baseline gap-1">
                    <span>49%</span>
                    <span className="text-xs font-normal text-gray-400">vs India</span>
                 </div>
             </div>
             <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
                 <ArrowRightLeft size={20} className="text-white" />
             </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <BrandIcon type={selectedService} className="w-8 h-8 rounded-lg shadow-sm" />
                      <div>
                          <h3 className="font-semibold text-gray-900">Price History (USD)</h3>
                          <p className="text-xs text-gray-500">6 Month Trend Analysis for {selectedService}</p>
                      </div>
                  </div>
                  {/* Simple Legend */}
                  <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                          <span className="text-xs text-gray-500">US</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs text-gray-500">UK</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-500">India</span>
                      </div>
                  </div>
              </div>
              <PriceHistoryChart data={currentData} />
          </div>

          {/* Comparison Table Section */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">Regional Pricing</h3>
                  <Globe size={16} className="text-gray-400" />
              </div>
              <div className="flex-1 overflow-auto">
                  <table className="w-full text-left">
                      <tbody className="divide-y divide-gray-50">
                          {currentData.map((item, idx) => {
                              // Calculate difference percentage relative to baseDataPoint
                              const diff = ((item.usdPrice - baseDataPoint.usdPrice) / baseDataPoint.usdPrice) * 100;
                              const isCheaper = diff < 0;
                              const isBase = item.currency === baseCurrency;
                              
                              return (
                                  <tr key={idx} className={`hover:bg-gray-50 transition-colors ${isBase ? 'bg-blue-50/30' : ''}`}>
                                      <td className="px-4 py-3">
                                          <div className="flex flex-col">
                                              <span className="text-sm font-medium text-gray-900">{item.country}</span>
                                              <span className="text-xs text-gray-500">{item.currency} {item.price.toFixed(2)}</span>
                                          </div>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                          <div className="flex flex-col items-end">
                                              <span className="text-sm font-bold text-gray-900">${item.usdPrice.toFixed(2)}</span>
                                              {!isBase && (
                                                  <span className={`text-[10px] font-medium flex items-center ${isCheaper ? 'text-green-600' : 'text-red-600'}`}>
                                                      {isCheaper ? <TrendingDown size={10} className="mr-0.5" /> : <TrendingUp size={10} className="mr-0.5" />}
                                                      {Math.abs(diff).toFixed(0)}%
                                                  </span>
                                              )}
                                              {isBase && (
                                                  <span className="text-[10px] font-medium text-gray-400">Base</span>
                                              )}
                                          </div>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50/30">
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                      <Info size={14} className="mt-0.5 flex-shrink-0" />
                      <p>Prices are converted to USD for comparison. Actual exchange rates may vary.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}