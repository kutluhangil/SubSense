import React, { useState, useRef, useEffect } from 'react';
import { BrandIcon } from './BrandIcon';
import { LogoRenderer } from './LogoRenderer';
import { getBrandLogo } from '../utils/logoUtils';
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';
import { convertAmount } from '../utils/currency';

interface SubscriptionTableProps {
  subscriptions?: Subscription[];
  onSelectSubscription?: (sub: Subscription) => void;
  onDeleteSubscription?: (id: number) => void;
  previewCurrency?: string | null;
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = React.memo(({ subscriptions = [], onSelectSubscription, onDeleteSubscription, previewCurrency }) => {
  const { formatPrice, formatDate, currentCurrency } = useLanguage();
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    // Toggle: if clicking the same ID, close it; otherwise open new
    setActiveDropdown(prev => prev === id ? null : id);
  };

  const handleDelete = (e: React.MouseEvent, sub: Subscription) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (onDeleteSubscription) {
      if (window.confirm(`Are you sure you want to remove ${sub.name}? This cannot be undone.`)) {
        onDeleteSubscription(sub.id);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, sub: Subscription) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (onSelectSubscription) {
      onSelectSubscription(sub);
    }
  };

  const displaySubs = subscriptions.length > 0 ? subscriptions : [] as Subscription[];

  // Determine target currency for secondary display
  const targetCurrency = previewCurrency || currentCurrency;

  return (
    <div className="overflow-x-visible">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted font-semibold bg-gray-50/50 dark:bg-gray-800/50">
            <th className="px-6 py-4 rounded-tl-lg">Service</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Next Payment</th>
            <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {displaySubs.map((sub) => {
            // Logic:
            // 1. Always show original price prominently.
            // 2. Secondary line shows converted approximate value if:
            //    a) Preview Mode is ON (shows preview currency)
            //    b) Preview Mode is OFF AND sub currency != base currency (shows base currency)

            const isPreviewActive = !!previewCurrency;
            const needsConversion = isPreviewActive || sub.currency !== currentCurrency;

            let secondaryDisplay = null;

            if (needsConversion) {
              // Use imported currency util to convert to arbitrary target (preview) or base
              const convertedVal = convertAmount(sub.price, sub.currency, targetCurrency);
              const label = isPreviewActive ? '(preview)' : '';
              secondaryDisplay = `≈ ${formatPrice(convertedVal, targetCurrency)} ${label}`;
            }

            const logoUrl = getBrandLogo(sub.name);

            return (
              <tr
                key={sub.id}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer border-b border-subtle last:border-0"
                onClick={() => onSelectSubscription && onSelectSubscription(sub)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 mr-4 flex items-center justify-center">
                      <LogoRenderer
                        logoUrl={logoUrl || ''}
                        name={sub.name}
                        className="w-10 h-10 shadow-sm rounded-xl"
                        variant="color"
                        fallback={<BrandIcon type={sub.type} className="w-10 h-10 shadow-sm rounded-xl" />}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-primary text-sm">{sub.name}</div>
                      <div className="text-xs text-secondary">{sub.plan}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === 'Active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-primary">
                    {formatPrice(sub.price, sub.currency)}
                  </div>
                  {secondaryDisplay && (
                    <div className={`text-[10px] font-medium mt-0.5 ${isPreviewActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-muted'}`}>
                      {secondaryDisplay}
                    </div>
                  )}
                  <div className="text-xs text-secondary mt-0.5">{sub.cycle}</div>
                </td>
                <td className="px-6 py-4 text-sm text-secondary whitespace-nowrap">
                  {formatDate(sub.nextDate)}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    className="p-2 text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={(e) => handleDropdownClick(e, sub.id)}
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {activeDropdown === sub.id && (
                    <div ref={dropdownRef} className="absolute right-8 top-8 w-40 bg-card rounded-xl shadow-xl border border-subtle z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                      <button
                        onClick={(e) => handleEdit(e, sub)}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-secondary hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Edit Subscription
                      </button>
                      <button
                        onClick={(e) => handleEdit(e, sub)}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-secondary hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary flex items-center gap-2"
                      >
                        <Eye size={14} /> View Details
                      </button>
                      <div className="h-px bg-subtle my-1"></div>
                      <button
                        onClick={(e) => handleDelete(e, sub)}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default SubscriptionTable;