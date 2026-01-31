
import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Globe, Building2, TrendingUp, Users, History, Briefcase, Award } from 'lucide-react';
import BrandIcon from './BrandIcon';
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
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;
  if (!service) return null;

  const brandKey = service.type?.toLowerCase().replace(/\s+/g, '') || 'default';
  const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-gray-700 max-h-[90vh] transition-transform duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
      >
        
        {/* Header Section */}
        <div className="relative">
           {/* Background Accent */}
           <div className="absolute inset-0 h-48 overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10 dark:opacity-20 blur-2xl transform scale-110"
                style={{ backgroundColor: brandColor }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-900"></div>
           </div>

           {/* Content */}
           <div className="relative px-8 pt-10 pb-6 flex flex-col items-center text-center z-10">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors backdrop-blur-sm"
              >
                <X size={20} />
              </button>

              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-2 mb-5 ring-1 ring-black/5 dark:ring-white/10">
                 <BrandIcon type={service.type} className="w-full h-full rounded-xl" noBackground />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{service.name}</h2>
              <div className="flex flex-wrap items-center justify-center gap-2">
                 <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full">
                    {service.currency} {service.price} / mo
                 </span>
                 {service.parentCompany && (
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                       <Briefcase size={10} /> Owned by {service.parentCompany}
                    </span>
                 )}
              </div>
           </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-10 custom-scrollbar">
           
           {/* 1. Overview */}
           <section className="space-y-4">
              {service.description.split('\n\n').map((paragraph, index) => (
                 <p key={index} className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {paragraph}
                 </p>
              ))}
           </section>

           {/* 2. Company Facts Grid */}
           <section>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Building2 size={16} /> Company Facts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <InfoCard 
                    label="Founded" 
                    value={service.foundedYear} 
                    icon={Calendar} 
                    sub={service.founders ? `by ${service.founders}` : undefined}
                 />
                 <InfoCard 
                    label="Headquarters" 
                    value={service.headquarters} 
                    icon={MapPin} 
                    isLink
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.headquarters)}`}
                 />
                 <InfoCard 
                    label="CEO" 
                    value={service.ceo} 
                    icon={Users} 
                 />
                 <InfoCard 
                    label="Website" 
                    value={service.website || 'N/A'} 
                    icon={Globe} 
                    isLink
                    href={service.website ? `https://${service.website}` : undefined}
                 />
              </div>
           </section>

           {/* 3. Business Snapshot */}
           <section>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <TrendingUp size={16} /> Business Snapshot
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-600">
                 <div className="flex-1 text-center pb-4 sm:pb-0 sm:pr-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Est. Valuation</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{service.netWorth || 'Unknown'}</p>
                 </div>
                 <div className="flex-1 text-center pt-4 sm:pt-0 sm:pl-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Global Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{service.globalUserCount || 'Unknown'}</p>
                 </div>
              </div>
           </section>

           {/* 4. Timeline / Milestones */}
           {service.milestones && service.milestones.length > 0 && (
              <section>
                 <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History size={16} /> Key Milestones
                 </h3>
                 <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-6">
                    {service.milestones.map((milestone, idx) => (
                       <div key={idx} className="relative group">
                          <div 
                            className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 group-hover:scale-125 transition-transform duration-300"
                            style={{ backgroundColor: brandColor }}
                          ></div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                             {milestone}
                          </p>
                       </div>
                    ))}
                 </div>
              </section>
           )}

        </div>
      </div>
    </div>
  );
}

// Helper Card Component
const InfoCard = ({ label, value, sub, icon: Icon, isLink, href }: { label: string, value: string, sub?: string, icon: any, isLink?: boolean, href?: string }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow h-full">
     <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
        <Icon size={18} />
     </div>
     <div className="overflow-hidden flex-1">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        {isLink && href ? (
           <a 
             href={href} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
             title={value}
           >
              {value}
           </a>
        ) : (
           <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={value}>{value}</p>
        )}
        {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2" title={sub}>{sub}</p>}
     </div>
  </div>
);
