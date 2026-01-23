import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Edit2, TrendingUp, Bell, Lightbulb, Trash2 } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_COLORS } from '../utils/data';

export interface Subscription {
  id: number;
  name: string;
  plan: string;
  price: number;
  currency: string;
  cycle: 'Monthly' | 'Yearly';
  nextDate: string;
  type: string;
  status: 'Active' | 'Expiring' | 'Inactive';
  nickname?: string;
  notes?: string;
  billingDay?: number;
  history?: number[]; // Mock price history
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSave: (updatedSub: Subscription) => void;
  onDelete: (id: number) => void;
}

// Helper to find accent color
const getAccentColor = (type: string, name: string) => {
  const normalizedType = type?.toLowerCase().replace(/\s+/g, '') || '';
  const normalizedName = name?.toLowerCase().replace(/\s+/g, '') || '';
  
  // Direct match check
  if (BRAND_COLORS[normalizedType]) return BRAND_COLORS[normalizedType];
  
  // Partial match check
  for (const key in BRAND_COLORS) {
    if (normalizedType.includes(key) || normalizedName.includes(key)) {
      return BRAND_COLORS[key];
    }
  }
  return BRAND_COLORS['default'];
};

// Simple Line Chart Component for Price History
const PriceHistoryChart = ({ data, accentColor }: { data: number[], accentColor: string }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data) * 1.2;
  const min = Math.min(...data) * 0.8;
  const range = max - min;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-32 w-full relative mt-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M0,100 ${points.replace(/,/g, ' ')} 100,100`} fill="url(#chartGradient)" />
        <polyline 
          points={points} 
          fill="none" 
          stroke={accentColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          vectorEffect="non-scaling-stroke"
        />
        {data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val - min) / range) * 100;
            return (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r="3" fill="white" stroke={accentColor} strokeWidth="2" />
            )
        })}
      </svg>
      <div 
        className="absolute top-0 right-0 text-xs font-bold px-2 py-1 rounded-full"
        style={{ color: accentColor, backgroundColor: `${accentColor}15` }} // 15 = hex opacity ~8%
      >
         +12.5% vs Last Year
      </div>
    </div>
  );
};

export default function SubscriptionModal({ isOpen, onClose, subscription, onSave, onDelete }: SubscriptionModalProps) {
  const { t, dir } = useLanguage();
  const [formData, setFormData] = useState<Partial<Subscription>>({});
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isSaveHovered, setIsSaveHovered] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        ...subscription,
        nickname: subscription.nickname || '',
        notes: subscription.notes || '',
        billingDay: subscription.billingDay || new Date(subscription.nextDate).getDate() || 1,
        history: subscription.history || [subscription.price * 0.8, subscription.price * 0.9, subscription.price, subscription.price, subscription.price * 1.1]
      });
    }
  }, [subscription, isOpen]);

  const accentColor = useMemo(() => {
    if (!subscription) return BRAND_COLORS['default'];
    return getAccentColor(subscription.type, subscription.name);
  }, [subscription]);

  if (!isOpen || !subscription) return null;

  const handleChange = (field: keyof Subscription, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData) {
      onSave({ ...subscription, ...formData } as Subscription);
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(subscription.id);
    onClose();
  };

  // Generate simple next payment preview
  const currentDate = new Date();
  const nextPaymentMonth = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[90vh]">
        
        {/* Header - Dynamic Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ backgroundColor: accentColor }}></div>

        {/* Header Content */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="relative group">
               <div className="absolute -inset-0.5 rounded-xl opacity-30 blur-sm transition duration-300" style={{ backgroundColor: accentColor }}></div>
               <BrandIcon type={subscription.type} className="w-12 h-12 rounded-xl shadow-sm relative bg-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {subscription.name}
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium border"
                    style={{ 
                      borderColor: subscription.status === 'Active' ? `${accentColor}30` : 'transparent',
                      backgroundColor: subscription.status === 'Active' ? `${accentColor}10` : '#FEF3C7',
                      color: subscription.status === 'Active' ? accentColor : '#B45309'
                    }}
                  >
                    {subscription.status}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                   <Edit2 size={12} /> {t('modal.edit_sub')}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content - Two Columns */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Editable Details */}
              <div className="lg:col-span-7 space-y-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t('modal.nickname')}</label>
                          <input 
                            type="text" 
                            value={formData.nickname}
                            onChange={(e) => handleChange('nickname', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all focus:border-[color]"
                            style={{ '--focus-color': accentColor } as React.CSSProperties}
                            placeholder="e.g. Family Account"
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t('modal.billing_cycle')}</label>
                             <div className="flex bg-gray-100 rounded-lg p-1">
                                <button 
                                  onClick={() => handleChange('cycle', 'Monthly')}
                                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${formData.cycle === 'Monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                  style={formData.cycle === 'Monthly' ? { color: accentColor, fontWeight: 'bold' } : {}}
                                >
                                  Monthly
                                </button>
                                <button 
                                  onClick={() => handleChange('cycle', 'Yearly')}
                                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${formData.cycle === 'Yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                  style={formData.cycle === 'Yearly' ? { color: accentColor, fontWeight: 'bold' } : {}}
                                >
                                  Yearly
                                </button>
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t('modal.billing_day')}</label>
                             <select 
                               value={formData.billingDay}
                               onChange={(e) => handleChange('billingDay', parseInt(e.target.value))}
                               className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white"
                             >
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                             </select>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t('modal.price')}</label>
                             <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={formData.price}
                                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                  className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
                                />
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Currency</label>
                             <input 
                               type="text" 
                               value="USD" 
                               disabled 
                               className="w-full px-4 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-500 cursor-not-allowed font-medium" 
                             />
                          </div>
                       </div>

                       <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t('modal.notes')}</label>
                          <textarea 
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all resize-none"
                            placeholder="Add notes about this subscription..."
                          />
                       </div>

                       <button 
                         onClick={handleSave}
                         onMouseEnter={() => setIsSaveHovered(true)}
                         onMouseLeave={() => setIsSaveHovered(false)}
                         className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-gray-900/10 mt-2 border border-transparent"
                         style={{ 
                           backgroundColor: isSaveHovered ? accentColor : undefined,
                           color: isSaveHovered ? '#ffffff' : undefined,
                           borderColor: isSaveHovered ? accentColor : 'transparent'
                         }}
                       >
                         {t('modal.save')}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Right Column: Insights */}
              <div className="lg:col-span-5 space-y-6">
                 
                 {/* Price History */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                       <TrendingUp size={16} style={{ color: accentColor }} /> {t('modal.price_history')}
                    </h3>
                    <PriceHistoryChart data={formData.history || []} accentColor={accentColor} />
                    
                    {/* Tooltip */}
                    <div className="mt-4 rounded-lg p-3 flex gap-3 items-start" style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}20` }}>
                       <Lightbulb size={16} className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                       <div>
                          <p className="text-xs font-bold mb-0.5" style={{ color: accentColor }}>{t('modal.ai_insight')}</p>
                          <p className="text-xs leading-snug text-gray-600">Price has increased by 15% in the last 12 months. Consider checking for annual plan discounts.</p>
                       </div>
                    </div>
                 </div>

                 {/* Calendar Widget */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Calendar size={16} style={{ color: accentColor }} /> Next Payment
                        </h3>
                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                           {nextPaymentMonth} {formData.billingDay}
                        </span>
                     </div>
                     
                     {/* Mini Calendar Visual */}
                     <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
                        {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-gray-400 font-medium py-1">{d}</div>)}
                        {Array.from({length: 30}, (_, i) => i+1).map(d => (
                           <div 
                              key={d} 
                              className={`py-1.5 rounded-lg transition-colors ${
                                 d === formData.billingDay 
                                 ? 'text-white font-bold' 
                                 : d < (formData.billingDay || 0) 
                                 ? 'text-gray-300' 
                                 : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              style={d === formData.billingDay ? { backgroundColor: accentColor } : {}}
                           >
                              {d}
                           </div>
                        ))}
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                           <Bell size={16} className="text-gray-400" /> {t('modal.reminder')}
                        </span>
                        <button 
                           onClick={() => setReminderEnabled(!reminderEnabled)}
                           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                           style={{ backgroundColor: reminderEnabled ? accentColor : '#e5e7eb' }}
                        >
                           <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${reminderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                     </div>
                 </div>

                 {/* Delete Button */}
                 <button 
                   onClick={handleDelete}
                   className="w-full py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
                 >
                    <Trash2 size={16} /> {t('modal.delete')}
                 </button>

              </div>
           </div>
        </div>

      </div>
    </div>
  );
}