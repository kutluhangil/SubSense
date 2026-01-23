import React from 'react';

export default function MicroDemoRow() {
  return (
    <div className="py-12 bg-gray-50/50 border-y border-gray-100 overflow-hidden">
       <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Dashboard Mini */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 h-32 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
             <p className="text-[10px] font-bold text-gray-400 uppercase">Spend Chart</p>
             <div className="flex items-end gap-1 h-16 pb-2">
                {[40, 60, 30, 70, 50, 80, 65].map((h, i) => (
                   <div 
                     key={i} 
                     className="flex-1 bg-blue-100 rounded-t-sm animate-pulse" 
                     style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                   ></div>
                ))}
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"></div>
          </div>

          {/* Friends Mini */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 h-32 flex flex-col justify-center items-center shadow-sm relative overflow-hidden group hover:border-teal-200 transition-colors">
             <p className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 uppercase">Sharing</p>
             <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white z-10 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white z-20 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white z-30 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
             <div className="mt-2 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+2 New</div>
          </div>

          {/* Compare Mini */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 h-32 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
             <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Price Compare</p>
             <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> US</div>
                   <span className="font-bold">$15.99</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> TR</div>
                   <span className="font-bold text-green-600">$4.50</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                   <div className="h-full bg-green-500 w-1/3 animate-[width_2s_ease-in-out_infinite]"></div>
                </div>
             </div>
          </div>

          {/* Analytics Mini */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 h-32 flex items-center justify-center shadow-sm relative overflow-hidden group hover:border-violet-200 transition-colors">
             <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                   <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                   <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="75, 100" className="animate-[dash_3s_ease-in-out_infinite]" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-600">75%</div>
             </div>
             <p className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 uppercase">Budget</p>
          </div>

       </div>
       <style>{`
         @keyframes width {
           0%, 100% { width: 30%; }
           50% { width: 70%; }
         }
         @keyframes dash {
           0% { stroke-dasharray: 0, 100; }
           50% { stroke-dasharray: 75, 100; }
           100% { stroke-dasharray: 0, 100; }
         }
       `}</style>
    </div>
  );
}