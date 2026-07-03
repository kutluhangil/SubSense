import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Globe, Building2, TrendingUp, Users, History, Briefcase, Award, Sparkles } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { SubscriptionDetail, BRAND_COLORS } from '../utils/data';

interface SubscriptionProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: SubscriptionDetail | null;
}

export default function SubscriptionProfileModal({ isOpen, onClose, service }: SubscriptionProfileModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;
  if (!service) return null;

  const brandKey = (service.type || service.name).toLowerCase().replace(/\s+/g, '');
  const accentColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      <div 
        className={`relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} border border-gray-100 dark:border-gray-800 max-h-[90vh]`}
      >
        {/* Header with Brand Color */}
        <div className="relative h-32 overflow-hidden">
           <div className="absolute inset-0 opacity-90" style={{ backgroundColor: accentColor }}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
           
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md z-10"
           >
             <X size={20} />
           </button>

           <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-1">
                 <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                    <BrandIcon type={service.type} className="w-full h-full" noBackground />
                 </div>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="pt-12 px-8 pb-8 overflow-y-auto">
           <div className="mb-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{service.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                       {service.headquarters !== 'Unknown' && (
                          <span className="flex items-center gap-1"><MapPin size={14} /> {service.headquarters}</span>
                       )}
                       {service.foundedYear !== 'Unknown' && (
                          <span className="flex items-center gap-1"><Calendar size={14} /> Est. {service.foundedYear}</span>
                       )}
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Starting at</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{service.currency === 'USD' ? '$' : ''}{service.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                 </div>
              </div>
           </div>

           <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-sm sm:text-base">
              {service.description}
           </p>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {service.ceo !== 'Unknown' && (
                 <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-blue-600 dark:text-blue-400">
                       <Briefcase size={18} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">CEO</p>
                       <p className="font-semibold text-gray-900 dark:text-white text-sm">{service.ceo}</p>
                    </div>
                 </div>
              )}
              {service.founders !== 'Unknown' && (
                 <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-purple-600 dark:text-purple-400">
                       <Users size={18} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">Founders</p>
                       <p className="font-semibold text-gray-900 dark:text-white text-sm">{service.founders}</p>
                    </div>
                 </div>
              )}
              {service.globalUserCount && (
                 <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-green-600 dark:text-green-400">
                       <Globe size={18} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">Users</p>
                       <p className="font-semibold text-gray-900 dark:text-white text-sm">{service.globalUserCount}</p>
                    </div>
                 </div>
              )}
              {service.netWorth && (
                 <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-yellow-600 dark:text-yellow-400">
                       <TrendingUp size={18} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">Valuation</p>
                       <p className="font-semibold text-gray-900 dark:text-white text-sm">{service.netWorth}</p>
                    </div>
                 </div>
              )}
           </div>

           {service.milestones && service.milestones.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History size={16} /> Key Milestones
                 </h3>
                 <div className="space-y-4 relative pl-2">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                    {service.milestones.map((milestone, idx) => (
                       <div key={idx} className="relative pl-6">
                          <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white dark:bg-gray-900 border-2 border-indigo-500 rounded-full z-10"></div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{milestone}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}