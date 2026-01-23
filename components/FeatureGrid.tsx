import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Users, CreditCard, PieChart, ArrowRightLeft, Settings, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';

const features = [
  {
    id: 'dashboard',
    icon: LayoutGrid,
    title: "Dashboard",
    desc: "Track all your active subscriptions in one view.",
    color: "#3B82F6", // blue-500
    bg: "bg-blue-50",
    hoverBorder: "group-hover:border-blue-500/50"
  },
  {
    id: 'friends',
    icon: Users,
    title: "Friends",
    desc: "Share and compare your subscriptions with friends.",
    color: "#0D9488", // teal-600
    bg: "bg-teal-50",
    hoverBorder: "group-hover:border-teal-500/50"
  },
  {
    id: 'subscriptions',
    icon: CreditCard,
    title: "Subscriptions",
    desc: "Add, edit, and manage every service you use.",
    color: "#9333EA", // purple-600
    bg: "bg-purple-50",
    hoverBorder: "group-hover:border-purple-500/50"
  },
  {
    id: 'analytics',
    icon: PieChart,
    title: "Analytics",
    desc: "Visualize your spending and discover trends.",
    color: "#7C3AED", // violet-600
    bg: "bg-violet-50",
    hoverBorder: "group-hover:border-violet-500/50"
  },
  {
    id: 'compare',
    icon: ArrowRightLeft,
    title: "Compare",
    desc: "Compare global subscription prices by region.",
    color: "#EA580C", // orange-600
    bg: "bg-orange-50",
    hoverBorder: "group-hover:border-orange-500/50"
  },
  {
    id: 'settings',
    icon: Settings,
    title: "Settings",
    desc: "Customize your experience and preferences.",
    color: "#4B5563", // gray-600
    bg: "bg-gray-50",
    hoverBorder: "group-hover:border-gray-500/50"
  }
];

// --- Mini Animation Components ---

const DashboardPreview = ({ color }: { color: string }) => (
  <div className="w-full h-full flex flex-col justify-center items-center gap-2 p-2">
    <div className="flex items-end gap-1 h-12 w-full px-2 justify-center">
       {[30, 50, 40, 70, 55, 80].map((h, i) => (
         <div 
           key={i} 
           className="w-2 rounded-t-sm animate-pulse" 
           style={{ 
             height: `${h}%`, 
             backgroundColor: color, 
             opacity: 0.3 + (i/10),
             animationDelay: `${i * 0.1}s` 
           }}
         ></div>
       ))}
    </div>
    <div className="w-24 h-24 absolute opacity-10">
       <svg viewBox="0 0 100 100" className="animate-[spin_10s_linear_infinite]">
          <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="2" fill="none" strokeDasharray="40 10" />
       </svg>
    </div>
  </div>
);

const FriendsPreview = ({ color }: { color: string }) => (
  <div className="w-full h-full flex items-center justify-center relative">
     <div className="absolute w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center z-10 animate-[bounce_2s_infinite]" style={{ borderColor: color }}>
        <Users size={14} style={{ color }} />
     </div>
     <div className="absolute w-8 h-8 rounded-full bg-gray-200 border-2 border-white opacity-60 transform -translate-x-6 animate-[pulse_2s_infinite]"></div>
     <div className="absolute w-8 h-8 rounded-full bg-gray-200 border-2 border-white opacity-60 transform translate-x-6 animate-[pulse_2s_infinite] animation-delay-500"></div>
  </div>
);

const SubscriptionsPreview = ({ color }: { color: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
     <div className="w-24 h-6 bg-white rounded-md shadow-sm border border-gray-100 flex items-center px-2 gap-2 animate-[translate-y_3s_ease-in-out_infinite]">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
        <div className="h-1.5 w-12 bg-gray-100 rounded"></div>
     </div>
     <div className="w-24 h-6 bg-white rounded-md shadow-sm border border-gray-100 flex items-center px-2 gap-2 animate-[translate-y_3s_ease-in-out_infinite_0.5s]">
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        <div className="h-1.5 w-10 bg-gray-100 rounded"></div>
     </div>
     <div className="w-24 h-6 bg-white rounded-md shadow-sm border border-gray-100 flex items-center px-2 gap-2 animate-[translate-y_3s_ease-in-out_infinite_1s]">
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        <div className="h-1.5 w-8 bg-gray-100 rounded"></div>
     </div>
  </div>
);

const AnalyticsPreview = ({ color }: { color: string }) => (
  <div className="w-full h-full flex items-center justify-center p-3">
     <div className="relative w-20 h-20">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
           <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="4" />
           <path 
             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
             fill="none" 
             stroke={color} 
             strokeWidth="4" 
             strokeDasharray="70, 100" 
             className="animate-[dash_3s_ease-in-out_infinite]"
           />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>70%</div>
     </div>
  </div>
);

const ComparePreview = ({ color }: { color: string }) => (
  <div className="w-full h-full flex items-center justify-center px-4">
     <div className="w-full h-16 relative flex items-end justify-between">
        {/* Line 1 */}
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
           <path d="M0,40 C10,35 20,45 30,20 C40,10 50,50 60,30" fill="none" stroke={color} strokeWidth="2" className="animate-pulse" />
        </svg>
        {/* Line 2 */}
        <svg className="absolute inset-0 w-full h-full overflow-visible opacity-40" preserveAspectRatio="none">
           <path d="M0,50 C15,45 25,55 35,30 C45,20 55,60 60,40" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="absolute -top-2 right-0 bg-white shadow-sm border px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ color }}>-20%</div>
     </div>
  </div>
);

const SettingsPreview = ({ color }: { color: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
     <div className="flex items-center gap-2">
        <div className="text-[10px] text-gray-400 font-bold uppercase">Dark Mode</div>
        <div className="relative w-8 h-4 bg-gray-200 rounded-full">
           <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm animate-[toggle_2s_infinite]" style={{ backgroundColor: color }}></div>
        </div>
     </div>
     <div className="flex items-center gap-2">
        <div className="text-[10px] text-gray-400 font-bold uppercase">Alerts</div>
        <div className="relative w-8 h-4 bg-gray-200 rounded-full">
           <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm animate-[toggle_2s_infinite_1s]"></div>
        </div>
     </div>
  </div>
);

const FeaturePreviewPopup = ({ feature }: { feature: typeof features[0] }) => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 h-32 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-50 transform origin-bottom">
       <div className="h-1 w-full" style={{ backgroundColor: feature.color }}></div>
       <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 opacity-50 bg-gradient-to-b from-white to-transparent"></div>
          {feature.id === 'dashboard' && <DashboardPreview color={feature.color} />}
          {feature.id === 'friends' && <FriendsPreview color={feature.color} />}
          {feature.id === 'subscriptions' && <SubscriptionsPreview color={feature.color} />}
          {feature.id === 'analytics' && <AnalyticsPreview color={feature.color} />}
          {feature.id === 'compare' && <ComparePreview color={feature.color} />}
          {feature.id === 'settings' && <SettingsPreview color={feature.color} />}
       </div>
       <div className="bg-white/50 p-2 text-center border-t border-white/20 backdrop-blur-md">
          <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">{feature.title} Preview</p>
       </div>
       {/* Arrow */}
       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/40 backdrop-blur-xl border-r border-b border-white/60 transform rotate-45"></div>
    </div>
  );
};

export default function FeatureGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [autoCycleIndex, setAutoCycleIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle logic when idle
  useEffect(() => {
    const startCycle = () => {
      idleTimerRef.current = setInterval(() => {
        setAutoCycleIndex(prev => {
          if (prev === null) return 0;
          return (prev + 1) % features.length;
        });
      }, 3000);
    };

    // Start immediately on mount
    startCycle();

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    setAutoCycleIndex(null);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    // Restart cycle after delay
    idleTimerRef.current = setInterval(() => {
      setAutoCycleIndex(prev => (prev === null ? 0 : (prev + 1) % features.length));
    }, 3000);
  };

  const activeIndex = hoveredIndex !== null ? hoveredIndex : autoCycleIndex;

  return (
    <div className="py-16 relative" ref={containerRef}>
      <div className="text-center mb-12">
         <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider mb-3">Features</span>
         <h2 className="text-3xl font-bold text-gray-900">Explore what you can do</h2>
      </div>
      
      {/* Grid Container with Blur Effect on Siblings */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 relative z-10 group/grid"
        onMouseLeave={handleMouseLeave}
      >
        {features.map((f, i) => {
          const isActive = activeIndex === i;
          
          return (
            <div 
              key={i}
              onMouseEnter={() => handleMouseEnter(i)}
              className={`
                relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm 
                transition-all duration-500 ease-out cursor-pointer group
                ${isActive ? 'scale-105 shadow-xl z-20 ring-1 ring-black/5' : 'hover:border-gray-200'}
                ${activeIndex !== null && !isActive ? 'opacity-50 blur-[2px] scale-95' : 'opacity-100 blur-0'}
              `}
            >
               {/* Animated Tracing Border (SVG Rect) */}
               {isActive && (
                 <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <svg className="absolute inset-0 w-full h-full">
                       <rect 
                         x="1" y="1" width="99%" height="99%" rx="15" ry="15"
                         fill="none" 
                         stroke={f.color} 
                         strokeWidth="2" 
                         strokeDasharray="400"
                         strokeDashoffset="400"
                         className="animate-[trace_2s_linear_infinite]"
                       />
                    </svg>
                 </div>
               )}

               {/* Hover Popup */}
               {isActive && <FeaturePreviewPopup feature={f} />}

               {/* Standard Card Content */}
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${isActive ? 'bg-gray-900 text-white' : f.bg}`}>
                  <f.icon size={24} className={`transition-colors duration-300 ${isActive ? 'text-white' : f.color}`} />
               </div>
               
               <div className="flex justify-between items-start relative z-10">
                  <div>
                     <h3 className={`text-lg font-bold mb-2 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-900'}`}>{f.title}</h3>
                     <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                  <ArrowRight 
                    size={16} 
                    className={`transition-all duration-300 transform ${isActive ? 'opacity-100 translate-x-1 text-gray-900' : 'opacity-0 -translate-x-2 text-gray-300'}`} 
                  />
               </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes trace {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes dash {
          0% { stroke-dasharray: 0, 100; }
          50% { stroke-dasharray: 75, 100; }
          100% { stroke-dasharray: 0, 100; }
        }
        @keyframes toggle {
          0% { transform: translateX(0); }
          50% { transform: translateX(100%); background-color: currentColor; }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}