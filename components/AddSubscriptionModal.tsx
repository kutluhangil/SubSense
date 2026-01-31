
import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionDetail, BRAND_COLORS, CURRENCIES } from '../utils/data';
import { Subscription } from './SubscriptionModal';
import { EXCHANGE_RATES } from '../utils/currency';
import { debugLog } from '../utils/debug';

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
  const [error, setError] = useState<string | null>(null);

  // Reset form when service changes or modal opens
  useEffect(() => {
    if (isOpen) {
        if (service) {
            setPrice(''); 
            setCurrency(service.currency || 'USD');
            setName(service.name || '');
        } else {
            setPrice('');
            setCurrency('USD');
            setName('');
        }
        setCycle('Monthly');
        setStartDate(new Date().toISOString().split('T')[0]);
        setError(null);
        debugLog('SUBSCRIPTION_CREATE', 'Modal Opened', { serviceName: service?.name });
    }
  }, [service, isOpen]);

  // Handle Currency Change with Calculation
  const handleCurrencyChange = (newCurrency: string) => {
    if (price && !isNaN(parseFloat(price))) {
        // Calculate new price based on FX rates
        const currentRate = EXCHANGE_RATES[currency] || 1;
        const newRate = EXCHANGE_RATES[newCurrency] || 1;
        
        // Base USD value
        const valInUSD = parseFloat(price) / currentRate;
        // New Value
        const valInNew = valInUSD * newRate;
        
        setPrice(valInNew.toFixed(2));
    }
    setCurrency(newCurrency);
  };

  if (!isOpen) return null;

  // Determine styling
  const brandKey = (service?.type || 'default').toLowerCase().replace(/\s+/g, '');
  const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

  const validate = () => {
      if (!name.trim()) return "Service name is required.";
      if (!price || parseFloat(price) <= 0) return "Price must be greater than 0.";
      if (!startDate) return "First payment date is required.";
      return null;
  };

  const handleSave = () => {
    const validationError = validate();
    if (validationError) {
        setError(validationError);
        return;
    }

    const priceVal = parseFloat(price);
    const dateObj = new Date(startDate);
    const billingDay = dateObj.getDate();
    
    // Construct final subscription object
    const newSub: any = {
        name: name,
        price: priceVal, 
        originalPrice: priceVal,
        currency: currency,
        cycle: cycle,
        nextDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: service?.type || 'default',
        status: 'Active',
        billingDay: billingDay,
        category: 'Uncategorized', 
        history: [priceVal]
    };

    debugLog('SUBSCRIPTION_CREATE', 'User committed new subscription', newSub);
    onAdd(newSub);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 max-h-[90vh]">
        
        {/* Header */}
        <div 
            className="h-24 relative flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brandColor}20 0%, var(--bg-card) 100%)` }}
        >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-white/50 dark:hover:bg-black/30 transition-colors z-10"
            >
                <X size={20} />
            </button>
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 flex items-center justify-center absolute -bottom-10 transform">
                {service ? (
                    <BrandIcon type={service.type} className="w-12 h-12" noBackground />
                ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-xl">?</div>
                )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-14 pb-8 px-8">
            <div className="text-center mb-6">
                {service ? (
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h2>
                ) : (
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(null); }}
                        placeholder="Service Name"
                        className="text-xl font-bold text-gray-900 dark:text-white text-center border-b border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-white bg-transparent outline-none w-full pb-1"
                        autoFocus
                    />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure your subscription details</p>
            </div>

            <div className="space-y-5">
                {/* Price & Currency */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1.5">Currency</label>
                        <select 
                            value={currency}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-gray-900 dark:focus:border-white cursor-pointer"
                        >
                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1.5">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 font-bold text-sm">
                                {CURRENCIES.find(c => c.code === currency)?.symbol}
                            </span>
                            <input 
                                type="number" 
                                value={price}
                                onChange={(e) => { setPrice(e.target.value); setError(null); }}
                                className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold focus:outline-none focus:border-gray-900 dark:focus:border-white placeholder-gray-400"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Cycle & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1.5">Billing Cycle</label>
                        <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                            <button 
                                onClick={() => setCycle('Monthly')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${cycle === 'Monthly' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Monthly
                            </button>
                            <button 
                                onClick={() => setCycle('Yearly')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${cycle === 'Yearly' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1.5">First Payment</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setError(null); }}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-gray-900 dark:focus:border-white cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <button 
                onClick={handleSave}
                className="w-full mt-8 py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
