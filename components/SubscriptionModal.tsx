import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Calendar, Edit2, TrendingUp, TrendingDown, Bell, Lightbulb, Trash2, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_COLORS, CURRENCIES } from '../utils/data';
import { EXCHANGE_RATES } from '../utils/currency';
import { debugLog } from '../utils/debug';

export interface Subscription {
  id: string | number;
  name: string;
  plan: string;
  price: number;
  originalPrice?: number; // Price in original currency
  currency: string; // Original currency code
  cycle: 'Monthly' | 'Yearly';
  nextDate: string;
  type: string;
  status: 'Active' | 'Expiring' | 'Inactive';
  nickname?: string;
  notes?: string;
  billingDay?: number;
  history?: number[];
  category?: string;
  reminderEnabled?: boolean;
  logo?: string; // Base64 or URL
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSave: (updatedSub: Subscription) => Promise<void> | void;
  onDelete: (id: string | number) => Promise<void> | void;
}

// Helper to find accent color
const getAccentColor = (type: string, name: string) => {
  const normalizedType = type?.toLowerCase().replace(/\s+/g, '') || '';
  const normalizedName = name?.toLowerCase().replace(/\s+/g, '') || '';

  if (BRAND_COLORS[normalizedType]) return BRAND_COLORS[normalizedType];

  for (const key in BRAND_COLORS) {
    if (normalizedType.includes(key) || normalizedName.includes(key)) {
      return BRAND_COLORS[key];
    }
  }
  return BRAND_COLORS['default'];
};

export default function SubscriptionModal({ isOpen, onClose, subscription, onSave, onDelete }: SubscriptionModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Subscription>>({});
  const [isSaveHovered, setIsSaveHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscription) {
      setFormData({
        ...subscription,
        nickname: subscription.nickname || '',
        notes: subscription.notes || '',
        billingDay: subscription.billingDay || new Date(subscription.nextDate).getDate() || 1,
        reminderEnabled: subscription.reminderEnabled ?? true,
        // Ensure editable fields are populated. If originalPrice missing, fallback to price
        originalPrice: subscription.originalPrice ?? subscription.price,
        currency: subscription.currency || 'USD',
        // Make sure we have a float for price editing
        price: subscription.price
      });
      setError(null);
      setLoading(false);
    }
  }, [subscription, isOpen]);

  const accentColor = useMemo(() => {
    if (!subscription) return BRAND_COLORS['default'];
    return getAccentColor(subscription.type, subscription.name);
  }, [subscription]);

  if (!isOpen || !subscription) return null;

  const handleChange = (field: keyof Subscription, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Currency conversion handling for edit mode
  const handleCurrencyChange = (newCurrency: string) => {
    const currentPrice = formData.originalPrice;
    const currentCurrency = formData.currency || 'USD';

    if (currentPrice !== undefined && !isNaN(currentPrice)) {
      const currentRate = EXCHANGE_RATES[currentCurrency] || 1;
      const newRate = EXCHANGE_RATES[newCurrency] || 1;

      const valInUSD = currentPrice / currentRate;
      const valInNew = valInUSD * newRate;

      setFormData(prev => ({
        ...prev,
        currency: newCurrency,
        originalPrice: parseFloat(valInNew.toFixed(2))
      }));
    } else {
      setFormData(prev => ({ ...prev, currency: newCurrency }));
    }
  };

  const handleSave = async () => {
    if (formData) {
      setLoading(true);
      setError(null);

      // In edit mode, price and originalPrice are effectively the same concept 
      // (the amount user pays in their specific currency).
      // We ensure 'price' property reflects this updated amount.
      const finalData: Subscription = {
        ...subscription,
        ...formData,
        price: formData.originalPrice || formData.price || 0,
        originalPrice: formData.originalPrice || formData.price || 0
      } as Subscription;

      try {
        await onSave(finalData);
        onClose();
      } catch (err: any) {
        console.error("Update failed:", err);
        setError(err.message || "Failed to update subscription. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this subscription? This action cannot be undone.")) {
      debugLog('REMOVE_ACTION', `Confirmed delete from Edit Modal for ID: ${subscription.id}`);
      setLoading(true);
      setError(null);

      try {
        await onDelete(subscription.id);
        onClose();
      } catch (err: any) {
        console.error("Delete failed:", err);
        setError(err.message || "Failed to delete subscription.");
        setLoading(false);
      }
    }
  };

  const currentDate = new Date();
  const nextPaymentMonth = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 max-h-[90vh]">

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ backgroundColor: accentColor }}></div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-xl opacity-30 blur-sm transition duration-300" style={{ backgroundColor: accentColor }}></div>
              <BrandIcon type={subscription.type} logo={subscription.logo} className="w-12 h-12 rounded-xl shadow-sm relative bg-white dark:bg-gray-800" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {subscription.name}
                {subscription.status === 'Active' ? (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium border"
                    style={{
                      borderColor: `${accentColor}30`,
                      backgroundColor: `${accentColor}10`,
                      color: accentColor
                    }}
                  >
                    Active
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                    {subscription.status}
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Edit2 size={12} /> {t('modal.edit_sub')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Editable Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('modal.nickname')}</label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => handleChange('nickname', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      placeholder="e.g. Family Account"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('modal.billing_cycle')}</label>
                      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => handleChange('cycle', 'Monthly')}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${formData.cycle === 'Monthly' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                          style={formData.cycle === 'Monthly' ? { color: accentColor, fontWeight: 'bold' } : {}}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => handleChange('cycle', 'Yearly')}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${formData.cycle === 'Yearly' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                          style={formData.cycle === 'Yearly' ? { color: accentColor, fontWeight: 'bold' } : {}}
                        >
                          Yearly
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('modal.billing_day')}</label>
                      <select
                        value={formData.billingDay}
                        onChange={(e) => handleChange('billingDay', parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 cursor-pointer"
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Multi-Currency Price Input */}
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('footer.currency')}</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 cursor-pointer"
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      >
                        {CURRENCIES.map(curr => (
                          <option key={curr.code} value={curr.code}>{curr.code}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('modal.price')}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 font-bold text-sm">
                          {CURRENCIES.find(c => c.code === formData.currency)?.symbol}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value))}
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all font-medium"
                          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('modal.notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all resize-none"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      placeholder="Add notes about this subscription..."
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSave}
                    onMouseEnter={() => setIsSaveHovered(true)}
                    onMouseLeave={() => setIsSaveHovered(false)}
                    disabled={loading}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-bold transition-all shadow-lg shadow-gray-900/10 dark:shadow-black/20 mt-2 border border-transparent active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2"
                    style={{
                      backgroundColor: isSaveHovered ? accentColor : undefined,
                      color: isSaveHovered ? '#ffffff' : undefined,
                      borderColor: isSaveHovered ? accentColor : 'transparent'
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : t('modal.save')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Insights */}
            <div className="lg:col-span-5 space-y-6">

              {/* Calendar Widget */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar size={16} style={{ color: accentColor }} /> {t('modal.next_payment')}
                  </h3>
                  <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {nextPaymentMonth} {formData.billingDay}
                  </span>
                </div>

                {/* Mini Calendar Visual */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-gray-400 dark:text-gray-500 font-medium py-1">{d}</div>)}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                    <div
                      key={d}
                      className={`py-1.5 rounded-lg transition-colors ${d === formData.billingDay
                        ? 'text-white font-bold'
                        : d < (formData.billingDay || 0)
                          ? 'text-gray-300 dark:text-gray-600'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      style={d === formData.billingDay ? { backgroundColor: accentColor } : {}}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Bell size={16} className="text-gray-400" /> {t('modal.reminder')}
                  </span>
                  <button
                    onClick={() => handleChange('reminderEnabled', !formData.reminderEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    style={{ backgroundColor: formData.reminderEnabled ? accentColor : '#e5e7eb' }} // Keep light gray track for off state visually
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.reminderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && error ? (
                    <span>Processing...</span> // Indicate working if retrying etc, but usually handleSave locks it.
                  ) : (
                    <>
                      <Trash2 size={16} /> {t('modal.delete')}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
