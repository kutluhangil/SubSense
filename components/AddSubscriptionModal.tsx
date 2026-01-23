
import React, { useState } from 'react';
import { X, Calendar, Globe, User, CheckCircle, DollarSign, MapPin, ExternalLink } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionDetail, BRAND_COLORS } from '../utils/data';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: SubscriptionDetail | null;
  onAdd: (service: SubscriptionDetail) => void;
}

export default function AddSubscriptionModal({ isOpen, onClose, service, onAdd }: AddSubscriptionModalProps) {
  const { t, formatPrice, currentCurrency } = useLanguage();
  const [mapError, setMapError] = useState(false);

  if (!isOpen || !service) return null;

  const brandKey = service.type.toLowerCase().replace(/\s+/g, '');
  const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

  // Format net worth dynamically if it's a number-string
  const formattedNetWorth = React.useMemo(() => {
    if (!service.netWorth || service.netWorth === "Unknown") return service.netWorth || "Unknown";
    
    // Try to parse number
    const val = parseFloat(service.netWorth);
    if (isNaN(val)) return service.netWorth;

    // Use Intl for billions/trillions formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);
  }, [service.netWorth]);

  // Map URL for generic embed (note: often requires API key for guaranteed service, using simplified mode)
  const mapEmbedUrl = service.coordinates 
    ? `https://maps.google.com/maps?q=${service.coordinates.lat},${service.coordinates.lng}&z=13&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(service.headquarters)}&z=13&output=embed`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[90vh]">
        
        {/* Dynamic Header */}
        <div 
            className="h-28 relative flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brandColor}20 0%, white 100%)` }}
        >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white/50 transition-colors z-10"
            >
                <X size={20} />
            </button>
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center absolute -bottom-12 transform transition-transform hover:scale-105">
                <BrandIcon type={service.type} className="w-16 h-16" noBackground />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-16 pb-8 px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{service.name}</h2>
            <p className="text-sm font-semibold mb-4" style={{ color: brandColor }}>
                {service.currency === 'TRY' ? '₺' : '$'}{service.price} / month
            </p>
            
            <p className="text-sm text-gray-500 leading-relaxed mb-6 border-b border-gray-100 pb-6">
                {service.description}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                {/* Founded */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <Calendar size={10} /> {t('search.founded')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate" title={service.foundedYear}>{service.foundedYear}</p>
                </div>
                {/* CEO */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <User size={10} /> {t('search.ceo')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate" title={service.ceo}>{service.ceo}</p>
                </div>
                {/* Net Worth */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                          <DollarSign size={10} /> {t('search.net_worth')}
                      </p>
                      <p className="text-sm font-bold text-green-700">
                        {formattedNetWorth !== "Unknown" ? formattedNetWorth : "–"} 
                        {formattedNetWorth !== "Unknown" && <span className="text-[10px] font-normal text-gray-400 ml-1">({t('search.as_of').replace('{0}', '2024')})</span>}
                      </p>
                    </div>
                    {/* Visual indicator of scale */}
                    {formattedNetWorth !== "Unknown" && (
                        <div className="flex gap-0.5">
                           <div className="w-1 h-3 bg-green-200 rounded-full"></div>
                           <div className="w-1 h-4 bg-green-300 rounded-full"></div>
                           <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Headquarters Map */}
            <div className="mb-8 text-left">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1">
                      <Globe size={10} /> {t('search.hq')}
                   </p>
                   <a 
                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.headquarters)}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                   >
                     {t('search.view_map')} <ExternalLink size={8} />
                   </a>
                </div>
                
                <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                   {!mapError ? (
                     <iframe 
                       width="100%" 
                       height="100%" 
                       style={{ border: 0 }}
                       src={mapEmbedUrl}
                       allowFullScreen
                       onError={() => setMapError(true)}
                       title={`${service.name} HQ Map`}
                       className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                     />
                   ) : (
                     <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                        <MapPin size={24} />
                     </div>
                   )}
                   {/* Overlay Label */}
                   <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 shadow-sm flex items-center gap-1 pointer-events-none">
                      <MapPin size={10} className="text-red-500" /> {service.headquarters}
                   </div>
                </div>
            </div>

            <button 
                onClick={() => onAdd(service)}
                className="w-full py-4 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
                style={{ backgroundColor: brandColor }}
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <CheckCircle size={20} />
                  {t('search.add_to_dash')}
                </div>
            </button>
        </div>
      </div>
    </div>
  );
}
