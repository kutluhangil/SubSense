import React, { useState, useEffect, useRef } from 'react';
import { X, Search, CheckCircle, AlertCircle, Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CURRENCIES, BRAND_COLORS, SubscriptionDetail } from '../utils/data';
import { debugLog } from '../utils/debug';
import { getBrandLogo } from '../utils/logoUtils';
import { Subscription } from './SubscriptionModal';

interface AddSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: SubscriptionDetail | null;
    onAdd: (subscription: Subscription) => void;
    existingSubscriptions?: Subscription[];
}

export default function AddSubscriptionModal({ isOpen, onClose, service, onAdd, existingSubscriptions = [] }: AddSubscriptionModalProps) {
    const { t } = useLanguage();
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

    // Reset form when service changes or modal opens
    useEffect(() => {
        if (isOpen) {
            if (service) {
                setPrice('');
                setCurrency(service.currency || 'USD');
                setName(service.name || '');
                setCategory(service.type || 'Uncategorized');
            } else {
                setPrice('');
                setCurrency('USD');
                setName('');
                setCategory('Uncategorized');
            }
            setCycle('Monthly');
            setStartDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            setLogo(null);
            setError(null);
            setLoading(false); // Reset loading
            debugLog('SUBSCRIPTION_CREATE', 'Modal Opened', { serviceName: service?.name });
        }
    }, [service, isOpen]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 50KB limit to be safe with firestore
            if (file.size > 50 * 1024) {
                setError("Logo file is too large (max 50KB). Please use a smaller image.");
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

    if (!isOpen) return null;

    // Determine styling
    const brandKey = (service?.type || 'default').toLowerCase().replace(/\s+/g, '');
    const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

    const validate = () => {
        if (!name.trim()) return "Service name is required.";
        if (!price || parseFloat(price) <= 0) return "Price must be greater than 0.";
        if (!startDate) return "First payment date is required.";

        // Duplicate Check
        if (existingSubscriptions.some(sub => sub.name.toLowerCase() === name.trim().toLowerCase())) {
            return `"${name}" already exists in your highlighted subscriptions.`;
        }

        return null;
    };

    const handleSave = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        const priceVal = parseFloat(price);
        const dateObj = new Date(startDate);
        const billingDay = dateObj.getDate();

        // Construct final subscription object
        // Note: ID will be assigned by backend/store
        const newSub: any = {
            name: name,
            price: priceVal,
            originalPrice: priceVal,
            currency: currency,
            cycle: cycle,
            nextDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: service?.type || 'default', // Keep original type if service exists, otherwise default
            status: 'Active',
            billingDay: billingDay,
            category: category,
            notes: notes,
            logo: logo || undefined, // Add logo if exists
            history: [priceVal]
        };

        try {
            debugLog('SUBSCRIPTION_CREATE', 'User committed new subscription', newSub);
            await onAdd(newSub);
            // Success is handled by parent closing the modal or separate cleanup
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            setError(err.message || "Failed to add subscription. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {service ? t('search.add_sub') : t('search.add_custom')}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pt-8 pb-8 px-8">
                    <div className="space-y-6">

                        {/* Logo Upload (Only for custom or if user wants to override) */}
                        <div className="flex justify-center">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload Custom Logo"
                            >
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all ${logo ? 'border-transparent shadow-md' : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    {logo ? (
                                        <img src={logo} alt="Logo" className="w-full h-full object-contain bg-white" />
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Logo</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center transition-opacity ${logo ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                                    <Upload className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                className="hidden"
                                onChange={handleLogoUpload}
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {t('modal.subscription_name')}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Netflix"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                autoFocus={!service}
                            />
                        </div>

                        {/* Price & Currency */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    {t('modal.price')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold text-lg">
                                            {CURRENCIES.find(c => c.code === currency)?.symbol}
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    {t('modal.currency')}
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Billing Cycle */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {t('modal.billing_cycle')}
                            </label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                {(['Monthly', 'Yearly'] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCycle(c)}
                                        className={`py-2.5 rounded-lg text-sm font-bold transition-all ${cycle === c
                                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* First Payment Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {t('modal.first_payment')}
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none"
                            >
                                {['Entertainment', 'Productivity', 'Tools', 'Shopping', 'Finance', 'Education', 'Health', 'Other', 'Uncategorized'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any details here..."
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                            <AlertCircle size={14} />
                            {error}
                            {error.includes("already exists") && (
                                <button
                                    onClick={() => {
                                        // Close modal and navigate/highlight?
                                        // For now just close, parent can handle dashboard nav if we had a callback
                                        onClose();
                                    }}
                                    className="ml-auto text-xs underline hover:text-red-800 dark:hover:text-red-300"
                                >
                                    Go to Dashboard
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full mt-8 py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                        style={{ backgroundColor: brandColor }}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                {t('search.add_to_dash')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}