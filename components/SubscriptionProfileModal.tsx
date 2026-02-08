import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Globe, Building2, TrendingUp, Users, History, Briefcase } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { SubscriptionDetail, BRAND_COLORS } from '../utils/data';

interface SubscriptionProfileModalProps {
   isOpen: boolean;
   onClose: () => void;
   service: SubscriptionDetail | null;
   themeColor?: string;
   logoUrl?: string | null;
}

export default function SubscriptionProfileModal({ isOpen, onClose, service, themeColor, logoUrl }: SubscriptionProfileModalProps) {
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
   // Use passed themeColor or fallback to map or default
   const accentColor = themeColor || BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

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
            <div className="relative h-40 overflow-hidden">
               {/* Gradient Background based on Theme Color */}
               <div className="absolute inset-0 opacity-90" style={{ backgroundColor: accentColor }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

               {/* Close Button */}
               <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md z-10"
               >
                  <X size={20} />
               </button>

               {/* Centered Large Logo */}
               <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center pb-6">
                  <div className="relative z-10 transform translate-y-2">
                     {logoUrl ? (
                        <img
                           src={logoUrl}
                           alt={service.name}
                           className="h-16 md:h-20 w-auto object-contain drop-shadow-2xl filter brightness-0 invert"
                        // Note: We invert brightness to keep logos white on colored/dark backgrounds for consistency
                        // Additional logic could apply if logo is already colored, but white often looks best on brand headers
                        />
                     ) : (
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center p-4">
                           <BrandIcon type={service.type} className="w-full h-full" noBackground />
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Content */}
            <div className="pt-8 px-8 pb-8 overflow-y-auto">
               <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h2>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                     {service.headquarters !== 'Unknown' && (
                        <span className="flex items-center gap-1"><MapPin size={14} /> {service.headquarters}</span>
                     )}
                     {service.foundedYear !== 'Unknown' && (
                        <span className="flex items-center gap-1"><Calendar size={14} /> Est. {service.foundedYear}</span>
                     )}
                  </div>
               </div>

               <div className="flex justify-center mb-8">
                  <div className="inline-flex items-end px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 mb-1">Starting at</span>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                        {service.currency === 'USD' ? '$' : ''}{service.price}<span className="text-sm font-normal text-gray-500 ml-0.5">/mo</span>
                     </p>
                  </div>
               </div>

               <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-sm sm:text-base text-center max-w-lg mx-auto">
                  {service.description}
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
                        <History size={16} /> Key Milestones
                     </h3>
                     <div className="space-y-4 relative pl-2 lg:pl-0 lg:flex lg:flex-col lg:items-center">
                        {/* Simplified list for centered layout */}
                        <div className="w-full max-w-md mx-auto space-y-3">
                           {service.milestones.map((milestone, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-left">
                                 <div className="min-w-[6px] h-1.5 mt-1.5 bg-indigo-500 rounded-full"></div>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">{milestone}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}