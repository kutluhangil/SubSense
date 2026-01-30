
import React, { useState, useRef, useEffect } from 'react';
import BrandIcon from './BrandIcon';
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface SubscriptionTableProps {
  subscriptions?: Subscription[];
  onSelectSubscription?: (sub: Subscription) => void;
  onDeleteSubscription?: (id: number) => void;
}

export default function SubscriptionTable({ subscriptions = [], onSelectSubscription, onDeleteSubscription }: SubscriptionTableProps) {
  const { formatPrice, formatDate } = useLanguage();
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
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleAction = (e: React.MouseEvent, action: 'edit' | 'delete', sub: Subscription) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (action === 'edit' && onSelectSubscription) {
        onSelectSubscription(sub);
    } else if (action === 'delete' && onDeleteSubscription) {
        // Confirmation?
        if (window.confirm("Are you sure you want to delete this subscription?")) {
            onDeleteSubscription(sub.id);
        }
    }
  };

  // Fallback data if none provided (though usually it will be)
  const displaySubs = subscriptions.length > 0 ? subscriptions : [] as Subscription[];

  return (
    <div className="overflow-x-visible">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-semibold bg-gray-50/50">
            <th className="px-6 py-4 rounded-tl-lg">Service</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Next Payment</th>
            <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {displaySubs.map((sub) => (
            <tr 
              key={sub.id} 
              className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
              onClick={() => onSelectSubscription && onSelectSubscription(sub)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 mr-4">
                     <BrandIcon type={sub.type} className="w-10 h-10 shadow-sm rounded-xl" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{sub.name}</div>
                    <div className="text-xs text-gray-500">{sub.plan}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  sub.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {sub.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{formatPrice(sub.price)}</div>
                <div className="text-xs text-gray-500">{sub.cycle}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                {formatDate(sub.nextDate)}
              </td>
              <td className="px-6 py-4 text-right relative">
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => handleDropdownClick(e, sub.id)}
                >
                  <MoreHorizontal size={18} />
                </button>
                
                {/* Dropdown Menu */}
                {activeDropdown === sub.id && (
                    <div ref={dropdownRef} className="absolute right-8 top-8 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                       <button 
                         onClick={(e) => handleAction(e, 'edit', sub)}
                         className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                       >
                          <Edit2 size={14} /> Edit Subscription
                       </button>
                       <button 
                         onClick={(e) => handleAction(e, 'edit', sub)}
                         className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                       >
                          <Eye size={14} /> View Details
                       </button>
                       <div className="h-px bg-gray-50 my-1"></div>
                       <button 
                         onClick={(e) => handleAction(e, 'delete', sub)}
                         className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                       >
                          <Trash2 size={14} /> Remove
                       </button>
                    </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
