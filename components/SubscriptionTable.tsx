import React from 'react';
import BrandIcon from './BrandIcon';
import { MoreHorizontal } from 'lucide-react';
import { Subscription } from './SubscriptionModal';

interface SubscriptionTableProps {
  subscriptions?: Subscription[];
  onSelectSubscription?: (sub: Subscription) => void;
}

export default function SubscriptionTable({ subscriptions = [], onSelectSubscription }: SubscriptionTableProps) {
  // Fallback data if none provided (though usually it will be)
  const displaySubs = subscriptions.length > 0 ? subscriptions : [
    { id: 1, name: 'Netflix', plan: 'Premium 4K', price: 19.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 24, 2023', type: 'netflix', status: 'Active' },
    { id: 2, name: 'Spotify', plan: 'Duo Plan', price: 14.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 28, 2023', type: 'spotify', status: 'Active' },
    { id: 3, name: 'Adobe Creative Cloud', plan: 'All Apps', price: 54.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Nov 01, 2023', type: 'adobe', status: 'Expiring' },
    { id: 4, name: 'Amazon Prime', plan: 'Annual', price: 139.00, currency: 'USD', cycle: 'Yearly', nextDate: 'Feb 12, 2024', type: 'amazon', status: 'Active' },
    { id: 5, name: 'YouTube Premium', plan: 'Individual', price: 13.99, currency: 'USD', cycle: 'Monthly', nextDate: 'Oct 15, 2023', type: 'youtube', status: 'Active' },
  ] as Subscription[];

  return (
    <div className="overflow-x-auto">
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
                <div className="text-sm font-semibold text-gray-900">${sub.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{sub.cycle}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                {sub.nextDate}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}