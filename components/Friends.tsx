import React, { useState } from 'react';
import { Search, MapPin, UserPlus, MoreHorizontal, MessageCircle, UserMinus } from 'lucide-react';
import BrandIcon from './BrandIcon';

interface Friend {
  id: number;
  name: string;
  username: string;
  country: string;
  avatar: string;
  totalSubs: number;
  sharedSubs: Array<'netflix' | 'spotify' | 'amazon' | 'youtube' | 'apple' | 'adobe' | 'google'>;
}

export default function Friends() {
  const [searchTerm, setSearchTerm] = useState('');

  const friends: Friend[] = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      username: '@sarahj',
      country: 'United States',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 8,
      sharedSubs: ['netflix', 'spotify', 'amazon']
    },
    {
      id: 2,
      name: 'David Chen',
      username: '@dchen_88',
      country: 'Canada',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 12,
      sharedSubs: ['adobe', 'apple']
    },
    {
      id: 3,
      name: 'Emma Wilson',
      username: '@em_wilson',
      country: 'United Kingdom',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 5,
      sharedSubs: ['netflix', 'youtube']
    },
    {
      id: 4,
      name: 'Marcus Johnson',
      username: '@mjohnson',
      country: 'Germany',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      totalSubs: 15,
      sharedSubs: ['spotify', 'google', 'amazon', 'apple']
    }
  ];

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Friends</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your connections and see shared interests.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
                </div>
                <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white w-full md:w-64 transition-all"
                />
            </div>
            <button className="flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                <UserPlus size={16} />
                <span className="hidden sm:inline">Add Friend</span>
            </button>
        </div>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={friend.avatar} 
                  alt={friend.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{friend.name}</h3>
                  <p className="text-xs text-gray-500">{friend.username}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
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
                {friend.totalSubs} Subscriptions
              </div>
            </div>

            {/* Shared Subscriptions */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Shared with you</p>
              <div className="flex -space-x-2">
                {friend.sharedSubs.map((sub, index) => (
                  <div key={index} className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden z-10 hover:z-20 transition-all hover:scale-110">
                     <BrandIcon type={sub} className="w-full h-full p-1.5" noBackground />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-50">
               <button className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <MessageCircle size={14} className="mr-2" />
                  Message
               </button>
               <button className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
                  <UserMinus size={14} className="mr-2" />
                  Remove
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}