import React, { useState } from 'react';
import { Search, MapPin, UserPlus, MoreHorizontal, UserMinus, X, Check, Copy, Users } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
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
  // Start with empty friends list for honest MVP state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { t } = useLanguage();

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveFriend = (id: number) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
        setFriends(prev => prev.filter(f => f.id !== id));
        setActiveDropdown(null);
    }
  };

  const handleViewProfile = (friend: Friend) => {
    setSelectedFriend(friend);
    setActiveDropdown(null);
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would query a backend. 
    // For local MVP, we just show an alert that the user wasn't found (since there are no other users).
    alert("User not found. (In this local MVP, you cannot add real friends yet.)");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('features.friends.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('friends.subtitle')}</p>
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
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 bg-white dark:bg-gray-800 dark:text-white w-full md:w-64 transition-all"
                />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center space-x-2 bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-sm"
            >
                <UserPlus size={16} />
                <span className="hidden sm:inline">{t('friends.add_btn')}</span>
            </button>
        </div>
      </div>

      {/* Friends Grid */}
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => (
            <div 
                key={friend.id} 
                onClick={() => handleViewProfile(friend)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer hover:-translate-y-1 relative"
            >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                    <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className={`w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm ring-2 ${
                            friend.status === 'online' ? 'ring-green-500' : 
                            friend.status === 'away' ? 'ring-blue-500' : 'ring-gray-200'
                        }`}
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        friend.status === 'online' ? 'bg-green-500' : 
                        friend.status === 'away' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    </div>
                    <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{friend.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{friend.username}</p>
                    </div>
                </div>
                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === friend.id ? null : friend.id); }} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    {activeDropdown === friend.id && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={(e) => { e.stopPropagation(); handleViewProfile(friend); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Profile</button>
                        <div className="h-px bg-gray-50 dark:bg-gray-700 my-1"></div>
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend.id); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Remove</button>
                        </div>
                    )}
                </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={14} className="mr-1" />
                    {friend.country}
                </div>
                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700"></div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {friend.totalSubs} {t('friends.subscriptions')}
                </div>
                </div>

                {/* Shared Subscriptions */}
                <div className="mb-6">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">{t('friends.shared_with_you')}</p>
                <div className="flex -space-x-2">
                    {friend.sharedSubs.map((sub, index) => (
                    <div key={index} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center overflow-hidden z-10 hover:z-20 transition-all hover:scale-110">
                        <BrandIcon type={sub} className="w-full h-full p-1.5" noBackground />
                    </div>
                    ))}
                    {friend.sharedSubs.length === 0 && <span className="text-xs text-gray-400 italic pl-1">{t('friends.none')}</span>}
                </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-700">
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        navigator.clipboard.writeText(`https://subsense.app/u/${friend.username}`);
                        alert("Profile link copied!");
                    }}
                    className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Copy size={14} className="mr-2" />
                    Share Profile
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend.id); }}
                    className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-100 transition-colors"
                >
                    <UserMinus size={14} className="mr-2" />
                    {t('friends.remove')}
                </button>
                </div>
            </div>
            ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No friends added yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-xs">
                Add friends to compare subscription costs and see what services they use.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gray-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-blue-700 transition-all"
            >
                Add Your First Friend
            </button>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileCardModal 
        isOpen={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
        user={selectedFriend ? mapFriendToProfile(selectedFriend) : null}
      />

      {/* Add Friend Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('friends.add_btn')}</h3>
              <form onSubmit={handleAddFriendSubmit}>
                 <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Username or Email</label>
                    <input type="text" placeholder="@username or email" className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                 </div>
                 <button type="submit" className="w-full bg-gray-900 dark:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-blue-700 transition-all">Send Request</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}