import React from 'react';
import { LayoutGrid, Users, CreditCard, PieChart, ArrowRightLeft, Settings, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: LayoutGrid,
    title: "Dashboard",
    desc: "Track all your active subscriptions in one view.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    hoverBorder: "hover:border-blue-200"
  },
  {
    icon: Users,
    title: "Friends",
    desc: "Share and compare your subscriptions with friends.",
    color: "text-teal-600",
    bg: "bg-teal-50",
    hoverBorder: "hover:border-teal-200"
  },
  {
    icon: CreditCard,
    title: "Subscriptions",
    desc: "Add, edit, and manage every service you use.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    hoverBorder: "hover:border-purple-200"
  },
  {
    icon: PieChart,
    title: "Analytics",
    desc: "Visualize your spending and discover trends.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    hoverBorder: "hover:border-violet-200"
  },
  {
    icon: ArrowRightLeft,
    title: "Compare",
    desc: "Compare global subscription prices by region.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    hoverBorder: "hover:border-orange-200"
  },
  {
    icon: Settings,
    title: "Settings",
    desc: "Customize your experience and preferences.",
    color: "text-gray-600",
    bg: "bg-gray-50",
    hoverBorder: "hover:border-gray-200"
  }
];

export default function FeatureGrid() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
         <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider mb-3">Features</span>
         <h2 className="text-3xl font-bold text-gray-900">Explore what you can do</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {features.map((f, i) => (
          <div 
            key={i}
            className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group cursor-pointer ${f.hoverBorder}`}
          >
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${f.bg}`}>
                <f.icon size={24} className={f.color} />
             </div>
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">{f.title}</h3>
                   <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}