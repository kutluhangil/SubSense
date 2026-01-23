import React from 'react';
import { X, Calendar, Globe, User, CheckCircle } from 'lucide-react';
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
  const { t } = useLanguage();

  if (!isOpen || !service) return null;

  const brandKey = service.type.toLowerCase().replace(/\s+/g, '');
  const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        
        {/* Dynamic Header */}
        <div 
            className="h-24 relative flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brandColor}20 0%, white 100%)` }}
        >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white/50 transition-colors z-10"
            >
                <X size={20} />
            </button>
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border-2 border-white flex items-center justify-center absolute -bottom-10 transform transition-transform hover:scale-105">
                <BrandIcon type={service.type} className="w-14 h-14" noBackground />
            </div>
        </div>

        <div className="pt-12 pb-8 px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{service.name}</h2>
            <p className="text-sm font-semibold mb-4" style={{ color: brandColor }}>
                {service.currency === 'TRY' ? '₺' : '$'}{service.price} / month
            </p>
            
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {service.description}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <Calendar size={10} /> {t('search.founded')}
                    </p>
                    <p className="text-xs font-medium text-gray-900 truncate" title={service.foundedYear}>{service.foundedYear}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <User size={10} /> {t('search.ceo')}
                    </p>
                    <p className="text-xs font-medium text-gray-900 truncate" title={service.ceo}>{service.ceo}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <Globe size={10} /> {t('search.hq')}
                    </p>
                    <p className="text-xs font-medium text-gray-900">{service.headquarters}</p>
                </div>
            </div>

            <button 
                onClick={() => onAdd(service)}
                className="w-full py-3.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                style={{ backgroundColor: brandColor }}
            >
                <CheckCircle size={18} className="opacity-80 group-hover:opacity-100" />
                {t('search.add_to_dash')}
            </button>
        </div>
      </div>
    </div>
  );
}