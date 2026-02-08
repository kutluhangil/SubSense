import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { LogoRenderer } from './LogoRenderer'; // Import
import { getBrandLogo } from '../utils/logoUtils'; // Import
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
    onDuplicateFound?: (name: string) => void;
}

export default function AddSubscriptionModal({ isOpen, onClose, service, onAdd, onDuplicateFound }: AddSubscriptionModalProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState<string>('');
    const [currency, setCurrency] = useState('USD');
    const [cycle, setCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Check for SVG logo
    const logoUrl = service ? getBrandLogo(service.name) : null;

    // Reset form when service changes or modal opens
    useEffect(() => {
        if (isOpen) {
            // ... existing reset logic ...
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
            setLoading(false); // Reset loading
            debugLog('SUBSCRIPTION_CREATE', 'Modal Opened', { serviceName: service?.name });
        }
    }, [service, isOpen]);

    // ... handleCurrencyChange ...

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
            type: service?.type || 'default',
            status: 'Active',
            billingDay: billingDay,
            category: 'Uncategorized',
            history: [priceVal]
        };

        try {
            debugLog('SUBSCRIPTION_CREATE', 'User committed new subscription', newSub);
            await onAdd(newSub);
            // Success is handled by parent closing the modal or separate cleanup
        } catch (err: any) {
            console.error(err);
            setLoading(false);

            // Handle Duplicate Error (Backend 409)
            if (err.status === 409 || err.code === 'duplicate_subscription' || err.message?.includes('already in your Dashboard')) {
                if (onDuplicateFound) {
                    onDuplicateFound(name);
                    return;
                }
            }

            setError(err.message || "Failed to add subscription. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* ... */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 max-h-[90vh]">

                {/* ... header ... */}

                <div className="flex-1 overflow-y-auto pt-14 pb-8 px-8">
                    {/* ... form ... */}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                            <AlertCircle size={14} />
                            {error}
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