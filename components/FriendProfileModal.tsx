import React from 'react';
import { X, MapPin, MessageCircle, ArrowRight, Wallet, Calendar, Clock, Plus, Minus, Edit3, Share2 } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { Friend } from './Friends';

interface FriendProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
}

export default function FriendProfileModal({ isOpen, onClose, friend }: FriendProfileModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !friend) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'ring-green-500 bg-green-500';
      case 'offline': return 'ring-gray-300 bg-gray-300';
      case 'away': return 'ring-blue-500 bg-blue-500';
      default: return 'ring-gray-300 bg-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[90vh]">
        
        {/* Header Section */}
        <div className="relative pt-8 pb-6 px-8 text-center bg-gray-50/50 border-b border-gray-100">
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
           >
             <X size={20} />
           </button>

           <div className="relative inline-block mb-4">
              <img 
                src={friend.avatar} 
                alt={friend.name} 
                className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ${getStatusColor(friend.status).split(' ')[0]}`}
              />
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(friend.status).split(' ')[1]}`}></div>
           </div>

           <h2 className="text-2xl font-bold text-gray-900">{friend.name}</h2>
           <p className="text-sm text-gray-500 font-medium mb-3">{friend.username}</p>
           
           <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
                 <MapPin size={12} className="text-gray-400" />
                 {friend.country}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
                 <Wallet size={12} className="text-gray-400" />
                 {friend.currency}
              </span>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
           
           {/* Stats Grid */}
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                 <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('friend.total_active')}</p>
                 <p className="text-xl font-bold text-gray-900">{friend.totalSubs}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 relative overflow-hidden">
                 <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('friend.lifetime')}</p>
                 <p className="text-xl font-bold text-gray-900">
                    {friend.currency === 'USD' ? '$' : friend.currency === 'EUR' ? '€' : friend.currency === 'GBP' ? '£' : '₺'}
                    {friend.totalSpent.toLocaleString()}
                 </p>
                 {/* Sparkline decoration */}
                 <svg className="absolute bottom-0 left-0 right-0 h-8 text-blue-100 opacity-50" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 20 L0 10 L20 15 L40 5 L60 12 L80 8 L100 14 L100 20 Z" fill="currentColor" />
                 </svg>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                 <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('friend.monthly')}</p>
                 <p className="text-xl font-bold text-gray-900">
                    {friend.currency === 'USD' ? '$' : friend.currency === 'EUR' ? '€' : friend.currency === 'GBP' ? '£' : '₺'}
                    {friend.monthlySpend.toLocaleString()}
                 </p>
              </div>
           </div>

           {/* Shared Services */}
           <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t('friend.shared')}</h3>
              <div className="flex flex-wrap gap-3">
                 {friend.sharedSubs.map((sub, i) => (
                    <div key={i} className="group relative">
                       <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform cursor-help">
                          <BrandIcon type={sub} className="w-8 h-8" noBackground />
                       </div>
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {sub.charAt(0).toUpperCase() + sub.slice(1)}
                       </div>
                    </div>
                 ))}
                 {friend.sharedSubs.length === 0 && (
                    <p className="text-sm text-gray-400 italic">{t('friend.no_shared')}</p>
                 )}
              </div>
           </div>

           {/* About Section */}
           <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{t('friend.about')}</h3>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                 <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {friend.about || t('friend.no_info')}
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {friend.tags.map((tag, i) => (
                       <span key={i} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          #{tag}
                       </span>
                    ))}
                 </div>
              </div>
           </div>

           {/* Recent Activity */}
           <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t('friend.activity')}</h3>
              <div className="space-y-3">
                 {friend.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                       <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'add' ? 'bg-green-100 text-green-600' :
                          activity.type === 'remove' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                       }`}>
                          {activity.type === 'add' && <Plus size={12} />}
                          {activity.type === 'remove' && <Minus size={12} />}
                          {activity.type === 'update' && <Edit3 size={12} />}
                       </div>
                       <div>
                          <p className="text-sm text-gray-800 font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                             <Clock size={10} /> {activity.date}
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row gap-3">
           <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-sm active:scale-95">
              <MessageCircle size={18} />
              {t('friend.message')}
           </button>
           <button className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
              <Share2 size={18} />
              {t('friend.view_shared')}
           </button>
        </div>

      </div>
    </div>
  );
}