import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, CheckCircle2, ChevronRight, Globe, Building2, User, AlertCircle } from 'lucide-react';
import { BRAND_COLORS, CURRENCIES, SubscriptionDetail } from '../utils/data';
import { LogoRenderer } from './LogoRenderer';
import { getBrandLogo } from '../utils/logoUtils';
import { Subscription } from './SubscriptionModal';
import { generatePlaceholderLogo } from '../utils/logoGenerator';
import { debugLog } from '../utils/debug';

interface SubscriptionCardProps {
    service: SubscriptionDetail;
    existingSubscriptions: Subscription[];
    onAdd: (sub: Subscription) => void;
    onClose: () => void;
}

export default function SubscriptionCard({ service, existingSubscriptions, onAdd, onClose }: SubscriptionCardProps) {
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState(service.price || '');
    const [currency, setCurrency] = useState(service.currency || 'USD');
    const [cycle, setCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(service.type || 'Uncategorized');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    const brandKey = service.name.toLowerCase().replace(/\s+/g, '');
    // Ensure we have a valid color, fallback to default if missing
    const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

    // Use dynamic logo util
    const logoUrl = getBrandLogo(service.name);

    useEffect(() => {
        // Reset or init logic if needed when service changes
        setPrice(service.price || '');
        setCurrency(service.currency || 'USD');
        setCycle('Monthly');
        setStartDate(new Date().toISOString().split('T')[0]);
        setError(null);
    }, [service]);

    const handleSave = async () => {
        if (!price || parseFloat(price) <= 0) {
            setError("Please enter a valid price.");
            return;
        }

        // Check for duplicates
        if (existingSubscriptions.some(sub => sub.name.toLowerCase() === service.name.toLowerCase())) {
            setError("You already have this subscription.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const priceVal = parseFloat(price);
            const dateObj = new Date(startDate);

            const newSub: any = {
                name: service.name,
                price: priceVal,
                originalPrice: priceVal,
                currency: currency,
                cycle: cycle,
                nextDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                type: service.type || 'default', // Using type for icon mapping
                status: 'Active',
                billingDay: dateObj.getDate(),
                category: category,
                notes: notes,
                logo: logoUrl || generatePlaceholderLogo(service.name),
                history: [priceVal]
            };

            debugLog('SUBSCRIPTION_CREATE', 'Adding subscription from card', newSub);
            await onAdd(newSub);
            // Modal close is handled by parent upon success usually, but we can trigger close here if passed
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to add subscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Main Card Container with Premium Styling */}
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

                    {/* Header Section */}
                    <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center relative z-10">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 mb-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-4 flex items-center justify-center border border-gray-100 dark:border-gray-700 relative group"
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

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{service.name}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed px-4 line-clamp-3">
                            {service.description || "Manage your subscription."}
                        </p>
                    </div>

                    {/* Editor Form */}
                    <div className="px-6 pb-8 pt-2 space-y-5">
                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                        {/* Price & Currency Row */}
                        <div className="grid grid-cols-5 gap-3">
                            <div className="col-span-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Price</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold">{CURRENCIES.find(c => c.code === currency)?.symbol}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-indigo-500/20 rounded-2xl pl-8 pr-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Currency</label>
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
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Billing Cycle</label>
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
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">First Payment</label>
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
                                        <>Adding...</>
                                    ) : (
                                        <>
                                            Add to Dashboard
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
