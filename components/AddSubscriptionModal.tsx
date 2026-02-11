import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CURRENCIES, BRAND_COLORS, SubscriptionDetail } from '../utils/data';
import { debugLog } from '../utils/debug';
import { generatePlaceholderLogo } from '../utils/logoGenerator';
import { Subscription } from './SubscriptionModal';
import { motion, AnimatePresence } from 'framer-motion';
import SubscriptionCard from './SubscriptionCard';

interface AddSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: SubscriptionDetail | null;
    onAdd: (subscription: Subscription) => Promise<void> | void;
    existingSubscriptions?: Subscription[];
}

export default function AddSubscriptionModal({ isOpen, onClose, service, onAdd, existingSubscriptions = [] }: AddSubscriptionModalProps) {
    const { t } = useLanguage();

    // Custom Form State (Only used if service is null)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState<string>('');
    const [currency, setCurrency] = useState('USD');
    const [cycle, setCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Uncategorized');
    const [notes, setNotes] = useState('');
    const [logo, setLogo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shake, setShake] = useState(false);

    // Reset Custom Form
    useEffect(() => {
        if (isOpen && !service) {
            setPrice('');
            setCurrency('USD');
            setName('');
            setCategory('Uncategorized');
            setCycle('Monthly');
            setStartDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            setLogo(null);
            setError(null);
            setLoading(false);
            debugLog('SUBSCRIPTION_CREATE', 'Custom Modal Opened');
        }
    }, [service, isOpen]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024) {
                setError("Logo file is too large (max 50KB).");
                setShake(true); setTimeout(() => setShake(false), 500);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomSave = async () => {
        if (!name.trim()) { setError("Service name is required."); setShake(true); setTimeout(() => setShake(false), 500); return; }
        if (!price || parseFloat(price) <= 0) { setError("Price must be greater than 0."); setShake(true); setTimeout(() => setShake(false), 500); return; }

        setLoading(true);
        try {
            const priceVal = parseFloat(price);
            const dateObj = new Date(startDate);
            const newSub: any = {
                name: name,
                price: priceVal,
                originalPrice: priceVal,
                currency: currency,
                cycle: cycle,
                nextDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                type: 'default',
                status: 'Active',
                billingDay: dateObj.getDate(),
                category: category,
                notes: notes,
                logo: logo || generatePlaceholderLogo(name),
                history: [priceVal]
            };

            await onAdd(newSub);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to add.");
            setShake(true); setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Content Wrapper */}
                    <div className="relative z-10 w-full max-w-lg">

                        {/* 
                            BRANCHING LOGIC:
                            If 'service' exists check -> Show Premium Card
                            If 'service' is null -> Show Custom Form
                        */}
                        {service ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", duration: 0.5 }}
                            >
                                <SubscriptionCard
                                    service={service}
                                    existingSubscriptions={existingSubscriptions}
                                    onAdd={onAdd}
                                    onClose={onClose}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{
                                    opacity: 1, scale: 1, y: 0,
                                    x: shake ? [0, -10, 10, -10, 10, 0] : 0
                                }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="relative bg-white dark:bg-gray-900 rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
                            >
                                {/* Custom Form Header */}
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Custom Subscription</h2>
                                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Custom Form Content */}
                                <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">

                                    {/* Logo Upload */}
                                    <div className="flex justify-center mb-2">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all border-2 border-dashed ${logo ? 'border-transparent' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        >
                                            {logo ? (
                                                <img src={logo} alt="Logo" className="w-full h-full object-contain bg-white rounded-xl shadow-sm" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Logo</span>
                                                </div>
                                            )}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                    </div>

                                    {/* Name Input */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Service Name</label>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Gym Membership"
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Price & Currency */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Price</label>
                                            <input
                                                type="number"
                                                autoComplete="off"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            >
                                                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Error & Action */}
                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                                            <AlertCircle size={14} /> {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCustomSave}
                                        disabled={loading}
                                        className="w-full py-4 rounded-xl text-white font-bold bg-gray-900 dark:bg-white dark:text-gray-900 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        {loading ? 'Adding...' : 'Add Custom Subscription'}
                                    </button>

                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}