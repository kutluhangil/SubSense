
import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, DollarSign, RefreshCw } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionDetail, BRAND_COLORS, CURRENCIES } from '../utils/data';
import { Subscription } from './SubscriptionModal';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: SubscriptionDetail | null;
  onAdd: (subscription: Subscription) => void;
}

export default function AddSubscriptionModal({ isOpen, onClose, service, onAdd }: AddSubscriptionModalProps) {
  const { t } = useLanguage();
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [cycle, setCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      setPrice(service.price || '');
      setCurrency(service.currency || 'USD');
      setName(service.name || '');
      setCycle('Monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
    } else {
        // Custom subscription default
        setPrice('');
        setCurrency('USD');
        setName('');
        setCycle('Monthly');
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  // Determine styling
  const brandKey = (service?.type || 'default').toLowerCase().replace(/\s+/g, '');
  const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

  const handleSave = () => {
    if (!name || !price) return; // Simple validation

    const priceVal = parseFloat(price);
    const dateObj = new Date(startDate);
    const billingDay = dateObj.getDate();
    
    // Construct final subscription object
    const newSub: any = {
        name: name,
        price: priceVal, // Converted price logic normally happens in backend, here we store raw
        originalPrice: priceVal,
        currency: currency,
        cycle: cycle,
        nextDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: service?.type || 'default',
        status: 'Active',
        billingDay: billingDay,
        category: 'Uncategorized', // Default
        history: [priceVal]
    };

    onAdd(newSub);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[90vh]">
        
        {/* Header */}
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
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center absolute -bottom-10 transform">
                {service ? (
                    <BrandIcon type={service.type} className="w-12 h-12" noBackground />
                ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xl">?</div>
                )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-14 pb-8 px-8">
            <div className="text-center mb-6">
                {service ? (
                    <h2 className="text-xl font-bold text-gray-900">{service.name}</h2>
                ) : (
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Service Name"
                        className="text-xl font-bold text-gray-900 text-center border-b border-gray-300 focus:border-gray-900 outline-none w-full pb-1"
                        autoFocus
                    />
                )}
                <p className="text-xs text-gray-500 mt-1">Configure your subscription details</p>
            </div>

            <div className="space-y-5">
                {/* Price & Currency */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Currency</label>
                        <select 
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                        >
                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Price</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="number" 
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-gray-900"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Cycle & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Billing Cycle</label>
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <button 
                                onClick={() => setCycle('Monthly')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${cycle === 'Monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                            >
                                Monthly
                            </button>
                            <button 
                                onClick={() => setCycle('Yearly')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${cycle === 'Yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">First Payment</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={!price || (service ? false : !name)}
                className="w-full mt-8 py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: brandColor }}
            >
                <CheckCircle size={20} />
                {t('search.add_to_dash')}
            </button>
        </div>
      </div>
    </div>
  );
}
