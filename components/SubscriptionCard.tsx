import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronRight, Globe, Building2, AlertCircle, MapPin, Zap } from 'lucide-react';
import { BRAND_COLORS, CURRENCIES, SubscriptionDetail, PlanTier } from '../utils/data';
import { LogoRenderer } from './LogoRenderer';
import { getBrandLogo } from '../utils/logoUtils';
import { Subscription } from './SubscriptionModal';
import { generatePlaceholderLogo } from '../utils/logoGenerator';
import { debugLog } from '../utils/debug';
import { useLanguage } from '../contexts/LanguageContext';

interface SubscriptionCardProps {
    service: SubscriptionDetail;
    existingSubscriptions: Subscription[];
    onAdd: (sub: Subscription) => Promise<void> | void;
    onClose: () => void;
}

export default function SubscriptionCard({ service, existingSubscriptions, onAdd, onClose }: SubscriptionCardProps) {
    const { currentLanguage, t } = useLanguage();

    // Detect region from language
    const detectedRegion: 'TR' | 'US' = currentLanguage === 'tr' ? 'TR' : 'US';

    // Get available tiers for detected region
    const regionPricing = useMemo(() => {
        if (!service.regions) return null;
        return service.regions[detectedRegion] || service.regions['US'] || null;
    }, [service, detectedRegion]);

    const tiers = regionPricing?.tiers || [];
    const defaultCurrency = regionPricing?.currency || service.currency || 'USD';

    // Find the lowest-price monthly tier as default
    const defaultTierIndex = useMemo(() => {
        if (tiers.length === 0) return -1;
        const monthlyTiers = tiers.filter(t => t.cycle === 'Monthly');
        if (monthlyTiers.length === 0) return 0;
        const lowest = monthlyTiers.reduce((min, tier) => tier.price < min.price ? tier : min, monthlyTiers[0]);
        return tiers.indexOf(lowest);
    }, [tiers]);

    const [selectedTierIndex, setSelectedTierIndex] = useState(defaultTierIndex);
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState(defaultCurrency);
    const [cycle, setCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(service.type || 'Uncategorized');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    const brandKey = service.name.toLowerCase().replace(/\s+/g, '');
    const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];
    const logoUrl = getBrandLogo(service.name);

    // When tier selection changes, update price/currency/cycle
    useEffect(() => {
        if (selectedTierIndex >= 0 && selectedTierIndex < tiers.length) {
            const tier = tiers[selectedTierIndex];
            setPrice(tier.price.toString());
            setCurrency(defaultCurrency);
            setCycle(tier.cycle);
        } else {
            // Fallback to service default
            setPrice(service.price || '');
            setCurrency(service.currency || 'USD');
        }
    }, [selectedTierIndex, tiers, defaultCurrency, service]);

    // Reset when service changes
    useEffect(() => {
        setStartDate(new Date().toISOString().split('T')[0]);
        setError(null);
        setSelectedTierIndex(defaultTierIndex);
    }, [service, defaultTierIndex]);

    // Get localized tier name
    const getTierDisplayName = (tier: PlanTier): string => {
        if (currentLanguage === 'tr' && tier.nameLocalized) {
            return tier.nameLocalized;
        }
        return tier.name;
    };

    const handleSave = async () => {
        if (!price || parseFloat(price) <= 0) {
            setError(currentLanguage === 'tr' ? "Lütfen geçerli bir fiyat girin." : "Please enter a valid price.");
            return;
        }

        if (existingSubscriptions.some(sub => sub.name.toLowerCase() === service.name.toLowerCase())) {
            setError(currentLanguage === 'tr' ? "Bu abonelik zaten mevcut." : "You already have this subscription.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const priceVal = parseFloat(price);
            const dateObj = new Date(startDate);
            const selectedTier = selectedTierIndex >= 0 ? tiers[selectedTierIndex] : null;

            const newSub: any = {
                name: service.name,
                price: priceVal,
                originalPrice: priceVal,
                currency: currency,
                cycle: cycle,
                nextDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                type: service.type || 'default',
                status: 'Active',
                billingDay: dateObj.getDate(),
                category: category,
                notes: selectedTier ? `Plan: ${selectedTier.name}` : notes,
                logo: logoUrl || generatePlaceholderLogo(service.name),
                history: [priceVal]
            };

            debugLog('SUBSCRIPTION_CREATE', 'Adding subscription from card', newSub);
            await onAdd(newSub);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to add subscription.");
        } finally {
            setLoading(false);
        }
    };

    const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="relative bg-white dark:bg-gray-900 rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">

                {/* Decorative header gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none" style={{ background: `linear-gradient(180deg, ${brandColor}, transparent)` }} />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">

                    {/* Header Section — LOGO FIX: transparent bg instead of bg-white */}
                    <div className="px-8 pt-10 pb-4 flex flex-col items-center text-center relative z-10">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 mb-5 rounded-2xl p-4 flex items-center justify-center relative group"
                        >
                            <LogoRenderer
                                logoUrl={logoUrl}
                                name={service.name}
                                className="w-full h-full object-contain"
                                variant="color"
                            />
                            {/* Glow behind logo */}
                            <div className="absolute inset-0 bg-current blur-2xl opacity-20 rounded-full -z-10 transform scale-125 transition-transform group-hover:scale-150" style={{ color: brandColor }} />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{service.name}</h2>

                        {/* Company Info Row */}
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5 mb-1">
                            {service.headquarters && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={10} />
                                    {service.headquarters.split(',')[0]}
                                </span>
                            )}
                            {service.foundedYear && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    {service.foundedYear.split(' ')[0]}
                                </span>
                            )}
                            {service.globalUserCount && (
                                <span className="flex items-center gap-1">
                                    <Globe size={10} />
                                    {service.globalUserCount}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Editor Form */}
                    <div className="px-6 pb-8 pt-2 space-y-5">
                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                        {/* Plan Tier Selector (only if tiers exist) */}
                        {tiers.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                    {currentLanguage === 'tr' ? 'Plan Seçin' : 'Select Plan'}
                                    <span className="ml-2 text-[9px] font-medium text-gray-300 dark:text-gray-500 normal-case tracking-normal">
                                        ({detectedRegion === 'TR' ? '🇹🇷 Türkiye' : '🇺🇸 United States'})
                                    </span>
                                </label>
                                <div className="grid gap-2" style={{ gridTemplateColumns: tiers.length <= 2 ? `repeat(${tiers.length}, 1fr)` : `repeat(${Math.min(tiers.length, 3)}, 1fr)` }}>
                                    {tiers.map((tier, idx) => {
                                        const isSelected = idx === selectedTierIndex;
                                        return (
                                            <motion.button
                                                key={tier.name}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => setSelectedTierIndex(idx)}
                                                className={`relative py-3 px-2.5 rounded-xl text-center transition-all border-2 ${isSelected
                                                    ? 'border-current bg-current/5 shadow-sm'
                                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                                style={isSelected ? { borderColor: brandColor, color: brandColor } : {}}
                                            >
                                                <div className={`text-[11px] font-bold mb-0.5 truncate ${isSelected ? '' : 'text-gray-700 dark:text-gray-300'
                                                    }`}
                                                    style={isSelected ? { color: brandColor } : {}}
                                                >
                                                    {getTierDisplayName(tier)}
                                                </div>
                                                <div className={`text-sm font-extrabold ${isSelected ? '' : 'text-gray-900 dark:text-white'
                                                    }`}
                                                    style={isSelected ? { color: brandColor } : {}}
                                                >
                                                    {currencySymbol}{tier.price.toFixed(2)}
                                                </div>
                                                <div className="text-[9px] text-gray-400 mt-0.5">
                                                    /{tier.cycle === 'Monthly' ? (currentLanguage === 'tr' ? 'ay' : 'mo') : (currentLanguage === 'tr' ? 'yıl' : 'yr')}
                                                </div>
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="tier-indicator"
                                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                                        style={{ backgroundColor: brandColor }}
                                                    >
                                                        <Zap size={8} className="text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Price & Currency Row */}
                        <div className="grid grid-cols-5 gap-3">
                            <div className="col-span-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    {currentLanguage === 'tr' ? 'Fiyat' : 'Price'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold">{currencySymbol}</span>
                                    </div>
                                    <input
                                        type="number"
                                        autoComplete="off"
                                        value={price}
                                        onChange={(e) => {
                                            setPrice(e.target.value);
                                            // Deselect tier if user manually edits price
                                            if (selectedTierIndex >= 0) {
                                                const tier = tiers[selectedTierIndex];
                                                if (e.target.value !== tier.price.toString()) {
                                                    setSelectedTierIndex(-1);
                                                }
                                            }
                                        }}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-indigo-500/20 rounded-2xl pl-8 pr-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    {currentLanguage === 'tr' ? 'Para Birimi' : 'Currency'}
                                </label>
                                <div className="relative">
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-indigo-500/20 rounded-2xl px-3 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer"
                                    >
                                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Cycle Selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                {currentLanguage === 'tr' ? 'Ödeme Döngüsü' : 'Billing Cycle'}
                            </label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                {(['Monthly', 'Yearly'] as const).map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCycle(c)}
                                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${cycle === c
                                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5 scaling-100'
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {currentLanguage === 'tr' ? (c === 'Monthly' ? 'Aylık' : 'Yıllık') : c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                {currentLanguage === 'tr' ? 'İlk Ödeme' : 'First Payment'}
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-indigo-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400"
                            >
                                <AlertCircle size={14} />
                                {error}
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 relative overflow-hidden group active:scale-[0.98]"
                                style={{ backgroundColor: brandColor }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? (
                                        <>{currentLanguage === 'tr' ? 'Ekleniyor...' : 'Adding...'}</>
                                    ) : (
                                        <>
                                            {currentLanguage === 'tr' ? "Panele Ekle" : "Add to Dashboard"}
                                            <ChevronRight size={18} className="opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
