import React, { useState } from 'react';
import { Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown } from 'lucide-react';

// Custom SVG Line Chart Component
const SpendingTrendChart = () => {
  const data = [1850, 2100, 1950, 2400, 2250, 2800, 2650];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const max = 3000;

  // Generate path points
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (val / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points.replace(/,/g, ' ')} 100,100`;

  return (
    <div className="h-64 w-full relative">
      {/* Y-Axis Labels (Background) */}
      <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-8 pl-0">
        {[3000, 2250, 1500, 750, 0].map(val => (
          <div key={val} className="w-full flex items-center border-b border-dashed border-gray-100 h-0">
             <span className="absolute left-0 -translate-y-1/2 bg-white pr-2">${val}</span>
          </div>
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="absolute inset-0 left-10 right-0 bottom-6 top-2">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
           <defs>
             <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#111827" stopOpacity="0.1" />
               <stop offset="100%" stopColor="#111827" stopOpacity="0" />
             </linearGradient>
           </defs>
           <polygon points={areaPoints} fill="url(#trendGradient)" />
           <polyline points={points} fill="none" stroke="#111827" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
           {data.map((val, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - (val / max) * 100;
              return (
                <g key={i} className="group cursor-pointer">
                  <circle cx={`${x}%`} cy={`${y}%`} r="4" fill="white" stroke="#111827" strokeWidth="2" className="transition-all duration-200 group-hover:r-6" />
                  <rect x={`${x}%`} y={`${y}%`} width="60" height="24" rx="4" transform="translate(-30, -35)" fill="#111827" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <text x={`${x}%`} y={`${y}%`} textAnchor="middle" dy="-20" fill="white" fontSize="10" className="opacity-0 group-hover:opacity-100 transition-opacity select-none font-medium">
                    ${val}
                  </text>
                </g>
              )
           })}
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-gray-400 font-medium uppercase tracking-wide">
         {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
};

// Custom SVG Donut Chart Component
const CategoryPieChart = () => {
  const segments = [
    { label: 'Entertainment', value: 45, color: '#111827' },
    { label: 'Software', value: 30, color: '#4B5563' },
    { label: 'Shopping', value: 15, color: '#9CA3AF' },
    { label: 'Utilities', value: 10, color: '#E5E7EB' }
  ];

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
           {segments.map((seg, i) => {
              const start = cumulativePercent;
              const circumference = 2 * Math.PI * 40; // r=40
              const strokeDasharray = `${(seg.value / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -1 * (start / 100) * circumference;
              cumulativePercent += seg.value;

              return (
                <circle 
                  key={i}
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-[12] cursor-pointer"
                />
              )
           })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900">$2.6k</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-2 gap-3 px-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700">{seg.label}</span>
              <span className="text-[10px] text-gray-400">{seg.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState('Last 6 Months');

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Track your spending habits and recurring expenses.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Calendar size={16} className="text-gray-400" />
              <span>{dateRange}</span>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
           </button>
           
           <button className="flex items-center justify-center p-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={18} className="text-gray-500" />
           </button>
           
           <button className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
           </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Line Chart Card */}
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Spending Trend</h3>
                <p className="text-xs text-gray-500">Monthly breakdown across all subscriptions</p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={16} className="mr-1" />
                <span>8.2%</span>
              </div>
            </div>
            <SpendingTrendChart />
         </div>

         {/* Pie Chart Card */}
         <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-base font-semibold text-gray-900">Category Split</h3>
               <button className="text-gray-400 hover:text-gray-600">
                 <MoreHorizontal size={18} />
               </button>
            </div>
            <CategoryPieChart />
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900">Category Breakdown</h3>
            <button className="text-sm text-gray-500 font-medium hover:text-gray-900">View Report</button>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                 <th className="px-6 py-4">Category</th>
                 <th className="px-6 py-4">Transactions</th>
                 <th className="px-6 py-4">Trend</th>
                 <th className="px-6 py-4">Total Spend</th>
                 <th className="px-6 py-4 text-right">% of Total</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {[
                 { name: 'Entertainment', count: 12, trend: '+12%', trendUp: true, total: '$1,245.00', pct: '45%' },
                 { name: 'Software & SaaS', count: 8, trend: '+5%', trendUp: true, total: '$840.50', pct: '30%' },
                 { name: 'Online Shopping', count: 15, trend: '-2.4%', trendUp: false, total: '$420.00', pct: '15%' },
                 { name: 'Utilities & Other', count: 4, trend: '0%', trendUp: null, total: '$280.00', pct: '10%' },
               ].map((cat, i) => (
                 <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                   <td className="px-6 py-4">
                     <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                   </td>
                   <td className="px-6 py-4 text-sm text-gray-500">
                     {cat.count} transactions
                   </td>
                   <td className="px-6 py-4">
                     <div className={`flex items-center text-xs font-medium ${cat.trendUp === true ? 'text-green-600' : cat.trendUp === false ? 'text-red-600' : 'text-gray-500'}`}>
                       {cat.trendUp === true && <ArrowUpRight size={14} className="mr-1" />}
                       {cat.trendUp === false && <ArrowDownRight size={14} className="mr-1" />}
                       {cat.trend}
                     </div>
                   </td>
                   <td className="px-6 py-4 font-medium text-gray-900 text-sm">
                     {cat.total}
                   </td>
                   <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-3">
                       <span className="text-sm text-gray-500">{cat.pct}</span>
                       <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-gray-900 rounded-full" style={{ width: cat.pct }}></div>
                       </div>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}