
import React, { useState } from 'react';
import { Search, MapPin, UserPlus, MoreHorizontal, MessageCircle, UserMinus } from 'lucide-react';
import BrandIcon from './BrandIcon';
import ProfileCardModal, { UserProfile } from './ProfileCardModal';
import { useLanguage } from '../contexts/LanguageContext';

// Helper to convert friend data to profile format
const mapFriendToProfile = (friend: Friend): UserProfile => ({
    name: friend.name,
    username: friend.username.replace('@', ''),
    avatar: friend.avatar,
    location: friend.country,
    bio: friend.about,
    totalSubs: friend.totalSubs,
    monthlySpend: friend.monthlySpend,
    currency: friend.currency,
    status: friend.status,
    integrations: ['spotify', 'github'], // Mock integrations for friends
    isSelf: false
});

export interface Friend {
  id: number;
  name: string;
  username: string;
  country: string;
  avatar: string;
  totalSubs: number;
  sharedSubs: Array<'netflix' | 'spotify' | 'amazon' | 'youtube' | 'apple' | 'adobe' | 'google'>;
  status: 'online' | 'offline' | 'away';
  currency: string;
  totalSpent: number;
  monthlySpend: number;
  about: string;
  tags: string[];
  recentActivity: { action: string; date: string; type: 'add' | 'remove' | 'update' }[];
}

export default function Friends() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const { t, formatPrice } = useLanguage();

  const friends: Friend[] = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      username: '@sarahj',
      country: 'United States',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 8,
      sharedSubs: ['netflix', 'spotify', 'amazon'],
      status: 'online',
      currency: 'USD',
      totalSpent: 3450.50,
      monthlySpend: 95.00,
      about: 'Digital nomad and streaming enthusiast. Always looking for the best family plan deals.',
      tags: ['streaming', 'music', 'productivity'],
      recentActivity: [
        { action: 'Added Disney+ Bundle', date: '2 days ago', type: 'add' },
        { action: 'Upgraded Spotify Family', date: '1 week ago', type: 'update' }
      ]
    },
    {
      id: 2,
      name: 'David Chen',
      username: '@dchen_88',
      country: 'Canada',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 12,
      sharedSubs: ['adobe', 'apple'],
      status: 'away',
      currency: 'CAD',
      totalSpent: 1499.35,
      monthlySpend: 145.30,
      about: 'Designer by day, gamer by night. Tracking all my creative tools here.',
      tags: ['design', 'gaming', 'software'],
      recentActivity: [
        { action: 'Cancelled Figma Pro', date: 'Yesterday', type: 'remove' },
        { action: 'Renewed Adobe Creative Cloud', date: '3 days ago', type: 'update' }
      ]
    },
    {
      id: 3,
      name: 'Emma Wilson',
      username: '@em_wilson',
      country: 'United Kingdom',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 5,
      sharedSubs: ['netflix', 'youtube'],
      status: 'offline',
      currency: 'GBP',
      totalSpent: 850.00,
      monthlySpend: 45.50,
      about: 'Minimalist. Only keeping what brings joy.',
      tags: ['minimalism', 'video', 'news'],
      recentActivity: [
        { action: 'Added YouTube Premium', date: '1 month ago', type: 'add' }
      ]
    },
    {
      id: 4,
      name: 'Marcus Johnson',
      username: '@mjohnson',
      country: 'Germany',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 15,
      sharedSubs: ['spotify', 'google', 'amazon', 'apple'],
      status: 'online',
      currency: 'EUR',
      totalSpent: 5200.00,
      monthlySpend: 210.00,
      about: 'Tech geek tracking SaaS subscriptions for my startup and personal use.',
      tags: ['tech', 'saas', 'business'],
      recentActivity: [
        { action: 'Added Notion AI', date: '5 hours ago', type: 'add' },
        { action: 'Downgraded Netflix', date: '2 weeks ago', type: 'update' },
        { action: 'Removed Slack Huddle', date: '3 weeks ago', type: 'remove' }
      ]
    }
  ];

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('features.friends.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('friends.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
                </div>
                <input
                type="text"
                placeholder={t('friends.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white w-full md:w-64 transition-all"
                />
            </div>
            <button className="flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                <UserPlus size={16} />
                <span className="hidden sm:inline">{t('friends.add_btn')}</span>
            </button>
        </div>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFriends.map((friend) => (
          <div 
            key={friend.id} 
            onClick={() => setSelectedFriend(friend)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer hover:-translate-y-1"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={friend.avatar} 
                    alt={friend.name} 
                    className={`w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm ring-2 ${
                        friend.status === 'online' ? 'ring-green-500' : 
                        friend.status === 'away' ? 'ring-blue-500' : 'ring-gray-200'
                    }`}
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      friend.status === 'online' ? 'bg-green-500' : 
                      friend.status === 'away' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{friend.name}</h3>
                  <p className="text-xs text-gray-500">{friend.username}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); }} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center text-xs text-gray-500">
                <MapPin size={14} className="mr-1" />
                {friend.country}
              </div>
              <div className="w-px h-3 bg-gray-200"></div>
              <div className="text-xs font-medium text-gray-700">
                {friend.totalSubs} {t('friends.subscriptions')}
              </div>
            </div>

            {/* Shared Subscriptions */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">{t('friends.shared_with_you')}</p>
              <div className="flex -space-x-2">
                {friend.sharedSubs.map((sub, index) => (
                  <div key={index} className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden z-10 hover:z-20 transition-all hover:scale-110">
                     <BrandIcon type={sub} className="w-full h-full p-1.5" noBackground />
                  </div>
                ))}
                {friend.sharedSubs.length === 0 && <span className="text-xs text-gray-400 italic pl-1">{t('friends.none')}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-50">
               <button 
                 onClick={(e) => { e.stopPropagation(); /* Add logic */ }}
                 className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
               >
                  <MessageCircle size={14} className="mr-2" />
                  {t('friend.message')}
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); /* Add logic */ }}
                 className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
               >
                  <UserMinus size={14} className="mr-2" />
                  {t('friends.remove')}
               </button>
            </div>
          </div>
        ))}
      </div>

      <ProfileCardModal 
        isOpen={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
        user={selectedFriend ? mapFriendToProfile(selectedFriend) : null}
      />
    </div>
  );
}
