import React, { useState } from 'react';
import { X, ArrowRight, BarChart3, Globe, Users, CreditCard, Plus, CheckCircle2, Search, Bell } from 'lucide-react';
import BrandIcon from './BrandIcon';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
}

export default function DemoModal({ isOpen, onClose, onSignup }: DemoModalProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  if (!isOpen) return null;

  const features = [
    { id: 1, label: 'Smart Tracking', icon: CreditCard, text: "Automatically organize all subscriptions in one place." },
    { id: 2, label: 'Global Currency', icon: Globe, text: "Real-time conversion for international services." },
    { id: 3, label: 'Analytics', icon: BarChart3, text: "Visualize spending habits and forecast costs." },
    { id: 4, label: 'Social Sharing', icon: Users, text: "Manage shared plans with friends and family." },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Experience SubscriptionHub</h2>
            <p className="text-sm text-gray-500 hidden sm:block">Interact with the dashboard to see how it works.</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={onSignup}
               className="hidden sm:flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
             >
               Start Free Trial <ArrowRight size={16} />
             </button>
             <button 
               onClick={onClose}
               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
             >
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-50">
           
           {/* Sidebar (Visual Only) */}
           <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-4 space-y-2 select-none">
              <div className="h-8 w-32 bg-gray-100 rounded-md mb-6 animate-pulse"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-10 w-full rounded-xl flex items-center px-3 gap-3 ${i === 1 ? 'bg-blue-50 text-blue-600' : 'text-gray-300'}`}>
                   <div className={`w-5 h-5 rounded ${i === 1 ? 'bg-blue-200' : 'bg-gray-100'}`}></div>
                   <div className={`h-2.5 rounded w-24 ${i === 1 ? 'bg-blue-200' : 'bg-gray-100'}`}></div>
                </div>
              ))}
              <div className="mt-auto bg-gray-900 rounded-xl p-4 text-white">
                <p className="text-xs font-bold mb-1">Pro Plan</p>
                <p className="text-[10px] text-gray-400">Unlock all features</p>
              </div>
           </div>

           {/* Dashboard Simulation */}
           <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
              
              {/* Header Sim */}
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-400 text-sm">Welcome back, User</p>
                 </div>
                 <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400"><Bell size={18} /></div>
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center"><Plus size={18} /></div>
                 </div>
              </div>

              {/* Stats Row */}
              <div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                onMouseEnter={() => setActiveFeature(3)} // Analytics Highlight
                onMouseLeave={() => setActiveFeature(null)}
              >
                 <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:ring-2 ring-blue-500/20 transition-all cursor-default">
                    <div className="flex justify-between mb-4">
                       <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={20} /></div>
                       <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total Monthly</p>
                    <p className="text-2xl font-bold text-gray-900">$245.50</p>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:ring-2 ring-purple-500/20 transition-all cursor-default">
                    <div className="flex justify-between mb-4">
                       <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Globe size={20} /></div>
                       <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">USD</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Foreign Currencies</p>
                    <p className="text-2xl font-bold text-gray-900">3 Sources</p>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:ring-2 ring-orange-500/20 transition-all cursor-default">
                    <div className="flex justify-between mb-4">
                       <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users size={20} /></div>
                       <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">New</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Shared Subs</p>
                    <p className="text-2xl font-bold text-gray-900">5 Active</p>
                 </div>
              </div>

              {/* Active Subs List */}
              <div 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                onMouseEnter={() => setActiveFeature(1)} // Smart Tracking Highlight
                onMouseLeave={() => setActiveFeature(null)}
              >
                 <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Your Subscriptions</h3>
                    <div className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Sorted by Price</div>
                 </div>
                 <div className="divide-y divide-gray-50">
                    {[
                      { name: 'Netflix', price: '$19.99', type: 'netflix', status: 'Active' },
                      { name: 'Spotify', price: '$14.99', type: 'spotify', status: 'Active' },
                      { name: 'Adobe Creative Cloud', price: '$54.99', type: 'adobe', status: 'Expiring Soon' },
                    ].map((sub, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                         <div className="flex items-center gap-4">
                            <BrandIcon type={sub.type} className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
                            <div>
                               <p className="font-semibold text-gray-900 text-sm">{sub.name}</p>
                               <p className="text-xs text-gray-400">Monthly Plan</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="font-bold text-gray-900">{sub.price}</p>
                            <p className={`text-[10px] font-bold ${sub.status === 'Active' ? 'text-green-600' : 'text-orange-500'}`}>{sub.status}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Floating Helper Tooltip (Simulated Interaction) */}
              <div className="absolute bottom-6 right-6 bg-gray-900 text-white p-4 rounded-xl shadow-xl max-w-xs animate-bounce hidden md:block">
                 <p className="text-sm font-medium">✨ Tip: Hover over cards to see features highlighted below!</p>
              </div>

           </div>
        </div>

        {/* Footer / Highlights */}
        <div className="bg-white border-t border-gray-100 p-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature) => (
                <div 
                  key={feature.id} 
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    activeFeature === feature.id 
                      ? 'bg-blue-50 ring-2 ring-blue-500 scale-105' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                   <div className="flex items-center gap-2 mb-2">
                      <feature.icon size={18} className={activeFeature === feature.id ? 'text-blue-600' : 'text-gray-500'} />
                      <span className={`font-semibold text-sm ${activeFeature === feature.id ? 'text-blue-900' : 'text-gray-900'}`}>{feature.label}</span>
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed">{feature.text}</p>
                </div>
              ))}
           </div>
           
           <div className="mt-6 flex sm:hidden flex-col gap-3">
             <button onClick={onSignup} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Start Free Trial</button>
             <button onClick={onClose} className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-medium">Close Demo</button>
           </div>
        </div>

      </div>
    </div>
  );
}