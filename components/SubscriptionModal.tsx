
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Calendar, Edit2, TrendingUp, TrendingDown, Bell, Lightbulb, Trash2, Check, ExternalLink } from 'lucide-react';
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
  category?: string;
  reminderEnabled?: boolean; // New Field
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSave: (updatedSub: Subscription) => void;
  onDelete: (id: number) => void;
}

// Static cancel links
const CANCEL_LINKS: Record<string, string> = {
  'netflix': 'https://www.netflix.com/cancelplan',
  'spotify': 'https://www.spotify.com/account/cancel/',
  'amazon': 'https://www.amazon.com/gp/help/customer/display.html?nodeId=G57V745LBUAWDQ78',
  'youtube': 'https://www.youtube.com/paid_memberships',
  'adobe': 'https://account.adobe.com/plans',
  'apple': 'https://support.apple.com/en-us/HT202039',
};

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

// Helper for generating smooth Bezier curves
const generateSmoothPath = (points: {x: number, y: number}[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) * 0.2;
    const cp1y = p1.y + (p2.y - p0.y) * 0.2;
    const cp2x = p2.x - (p3.x - p1.x) * 0.2;
    const cp2y = p2.y - (p3.y - p1.y) * 0.2;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

// Helper to generate past month labels
const getMonthLabels = (count: number) => {
  const months = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
  }
  return months;
};

// --- REDESIGNED CHART COMPONENT ---
const PriceHistoryChart = ({ data, accentColor, currency }: { data: number[], accentColor: string, currency: string }) => {
  const { formatPrice } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  
  // Resize observer to make chart responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if(containerRef.current) setWidth(containerRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (!data || data.length === 0) return null;

  const height = 140;
  const padding = { top: 20, bottom: 20, left: 10, right: 10 };
  
  // Dynamic scaling
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  // Add 10% buffer to top and bottom, ensure range isn't zero
  const range = maxVal - minVal || maxVal * 0.1 || 10; 
  const yMin = minVal - range * 0.2; 
  const yMax = maxVal + range * 0.2;
  
  const points = data.map((val, i) => ({
    x: padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right),
    y: height - padding.bottom - ((val - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom),
    value: val,
    label: getMonthLabels(data.length)[i]
  }));

  const pathD = generateSmoothPath(points);
  const fillPath = `${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

  // Calculate percentage change for tooltip
  const getChange = (curr: number, prev: number) => {
    if (!prev) return 0;
    return ((curr - prev) / prev) * 100;
  };

  return (
    <div className="relative w-full h-[140px] select-none" ref={containerRef}>
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${accentColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={accentColor} floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={0} y1={height - padding.bottom} x2={width} y2={height - padding.bottom} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={0} y1={padding.top} x2={width} y2={padding.top} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />

          {/* Area Fill */}
          <path d={fillPath} fill={`url(#gradient-${accentColor})`} className="opacity-0 animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-out forwards' }} />

          {/* Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke={accentColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            filter="url(#shadow)"
            className="animate-draw-line"
            style={{ 
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
              animation: 'drawLine 1s ease-out forwards' 
            }}
          />

          {/* Interaction Points */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              {/* Invisible larger hit area */}
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" className="cursor-pointer" />
              
              {/* Visible dot */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredIndex === i ? 5 : 3} 
                fill={accentColor} 
                stroke="white" 
                strokeWidth="2" 
                className={`transition-all duration-200 ${hoveredIndex === i ? 'opacity-100 shadow-md' : 'opacity-0 hover:opacity-100'}`}
                style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4 }}
              />
            </g>
          ))}
        </svg>
      )}

      {/* Dynamic Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div 
          className="absolute z-20 pointer-events-none transition-all duration-200 ease-out"
          style={{ 
            left: points[hoveredIndex].x, 
            top: points[hoveredIndex].y - 10, 
            transform: `translate(-50%, -100%)` 
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-2.5 min-w-[120px] text-center animate-in fade-in zoom-in-95 duration-150">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{points[hoveredIndex].label}</p>
             <p className="text-sm font-bold text-gray-900 leading-tight">
               {formatPrice(points[hoveredIndex].value)}
             </p>
             {hoveredIndex > 0 && (
                <div className={`text-[10px] font-bold mt-1 flex items-center justify-center gap-0.5 ${
                   getChange(points[hoveredIndex].value, points[hoveredIndex-1].value) > 0 ? 'text-red-500' : 
                   getChange(points[hoveredIndex].value, points[hoveredIndex-1].value) < 0 ? 'text-green-500' : 'text-gray-400'
                }`}>
                   {getChange(points[hoveredIndex].value, points[hoveredIndex-1].value) > 0 ? '↑' : getChange(points[hoveredIndex].value, points[hoveredIndex-1].value) < 0 ? '↓' : '-'}
                   {Math.abs(getChange(points[hoveredIndex].value, points[hoveredIndex-1].value)).toFixed(1)}%
                </div>
             )}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-100"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default function SubscriptionModal({ isOpen, onClose, subscription, onSave, onDelete }: SubscriptionModalProps) {
  const { t, dir } = useLanguage();
  const [formData, setFormData] = useState<Partial<Subscription>>({});
  const [isSaveHovered, setIsSaveHovered] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        ...subscription,
        nickname: subscription.nickname || '',
        notes: subscription.notes || '',
        billingDay: subscription.billingDay || new Date(subscription.nextDate).getDate() || 1,
        // Set reminder state (default true if undefined)
        reminderEnabled: subscription.reminderEnabled ?? true,
        // Ensure mock history data if none exists
        history: subscription.history || [
           subscription.price * 0.9, 
           subscription.price * 0.9, 
           subscription.price * 0.95, 
           subscription.price, 
           subscription.price, 
           subscription.price * 1.05
        ]
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

  // --- TREND LOGIC ---
  const history = formData.history || [];
  const startPrice = history[0] || 0;
  const endPrice = history[history.length - 1] || 0;
  const trendPercent = startPrice ? ((endPrice - startPrice) / startPrice) * 100 : 0;
  
  let trendIcon = <TrendingUp size={16} />;
  let trendColor = 'text-gray-500 bg-gray-50';
  let trendText = t('modal.insight_text'); // Fallback

  if (trendPercent > 5) {
     trendIcon = <TrendingUp size={14} className="text-red-600" />;
     trendColor = 'text-red-700 bg-red-50 border-red-100';
     trendText = `Price increased by ${trendPercent.toFixed(1)}% this year. Consider switching to an annual plan to save.`;
  } else if (trendPercent < -2) {
     trendIcon = <TrendingDown size={14} className="text-green-600" />;
     trendColor = 'text-green-700 bg-green-50 border-green-100';
     trendText = `Your cost decreased by ${Math.abs(trendPercent).toFixed(1)}% — great job optimizing your plans!`;
  } else {
     trendIcon = <Check size={14} className="text-gray-600" />;
     trendColor = 'text-gray-700 bg-gray-50 border-gray-100';
     trendText = `Prices remained stable this year. No action needed.`;
  }

  // Visual trend badge for header
  const headerTrend = trendPercent > 0 
    ? `+${trendPercent.toFixed(1)}%` 
    : `${trendPercent.toFixed(1)}%`;

  // --- CANCEL LINK LOGIC ---
  const getCancelLink = () => {
    // Basic fuzzy matching
    for (const key in CANCEL_LINKS) {
      if (subscription.type.toLowerCase().includes(key) || subscription.name.toLowerCase().includes(key)) {
        return CANCEL_LINKS[key];
      }
    }
    // Fallback search
    return `https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(subscription.name)}+subscription`;
  };

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
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t('footer.currency')}</label>
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
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                           <TrendingUp size={16} style={{ color: accentColor }} /> {t('modal.price_history')}
                        </h3>
                        <div 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                        >
                            {headerTrend} vs Last Year
                        </div>
                    </div>
                    
                    <PriceHistoryChart 
                        data={formData.history || []} 
                        accentColor={accentColor} 
                        currency={formData.currency || 'USD'} 
                    />
                    
                    {/* Dynamic AI Insight */}
                    <div className={`mt-2 rounded-xl p-3 flex gap-3 items-start border transition-colors ${trendColor}`}>
                       <Lightbulb size={16} className="mt-0.5 flex-shrink-0" />
                       <div>
                          <p className="text-[10px] font-bold mb-0.5 uppercase tracking-wide opacity-80">{t('modal.ai_insight')}</p>
                          <p className="text-xs leading-snug font-medium">{trendText}</p>
                       </div>
                    </div>
                 </div>

                 {/* Calendar Widget */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Calendar size={16} style={{ color: accentColor }} /> {t('modal.next_payment')}
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
                           onClick={() => handleChange('reminderEnabled', !formData.reminderEnabled)}
                           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                           style={{ backgroundColor: formData.reminderEnabled ? accentColor : '#e5e7eb' }}
                        >
                           <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.reminderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                     </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="space-y-3">
                    {/* Cancel Guide Link */}
                    <a 
                      href={getCancelLink()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                    >
                       <ExternalLink size={16} /> How to Cancel
                    </a>
                    <p className="text-[10px] text-center text-gray-400">Redirects to provider's site. We do not automate cancellation.</p>

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
    </div>
  );
}
