import React, { useState, useEffect } from 'react';
import { Search, MapPin, UserPlus, MoreHorizontal, UserMinus, X, Check, Copy, Users, Loader2 } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import ProfileCardModal, { UserProfile } from './ProfileCardModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { searchUsers, sendFriendRequest, getFriendsList, getUserDocument, UserProfileData } from '../utils/firestore';

// Helper to convert Firestore profile to UI format
const mapProfileToUI = (profile: UserProfileData): UserProfile => ({
  name: profile.displayName || 'User',
  username: profile.email.split('@')[0],
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", // Fallback if no avatar in UserProfileData
  location: profile.preferences.region || 'Unknown',
  bio: "No bio yet", // UserProfileData needs bio field in future
  totalSubs: profile.stats.totalSubscriptions,
  monthlySpend: profile.stats.monthlySpend,
  currency: profile.preferences.baseCurrency,
  status: 'offline', // Online status requires realtime presence
  integrations: [],
  isSelf: false
});

export default function Friends() {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<UserProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfileData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<UserProfileData | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { t } = useLanguage();

  // Load Friends
  useEffect(() => {
    if (!currentUser) return;

    const loadFriends = async () => {
      setLoading(true);
      const friendIds = await getFriendsList(currentUser.uid);
      const friendDocs = await Promise.all(friendIds.map(uid => getUserDocument(uid)));
      setFriends(friendDocs.filter(f => f !== null) as UserProfileData[]);
      setLoading(false);
    };

    loadFriends();
  }, [currentUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !searchTerm.trim()) return;

    setIsSearching(true);
    const results = await searchUsers(searchTerm, currentUser.uid);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSendRequest = async (toUser: UserProfileData) => {
    if (!currentUser) return;
    await sendFriendRequest(currentUser.uid, toUser.uid);
    alert(t('friends.sent_alert').replace('{0}', toUser.displayName || toUser.email));
    setIsAddModalOpen(false);
  };

  const handleViewProfile = (friend: UserProfileData) => {
    setSelectedFriend(friend);
    setActiveDropdown(null);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Search (Local Filter) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('features.friends.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('friends.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
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
      {friends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend) => (
            <div
              key={friend.uid}
              onClick={() => handleViewProfile(friend)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer hover:-translate-y-1 relative"
            >
              {/* Minimal Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {/* Fallback Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {(friend.displayName || friend.email)[0].toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{friend.displayName || 'User'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                  </div>
                </div>
              </div>

              {/* Simplified Stats */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <MapPin size={14} className="mr-1" />
                  {friend.preferences.region || 'Unknown'}
                </div>
                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700"></div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {friend.stats.totalSubscriptions} Subs
                </div>
              </div>

              <div className="text-xs text-gray-400 italic">
                {friend.stats.monthlySpend > 0
                  ? t('friends.spends_approx').replace('{0}', String(friend.stats.monthlySpend))
                  : t('friends.no_public_spend')}
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('friends.empty_title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-xs">{t('friends.empty_desc')}</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gray-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-blue-700 transition-all"
          >
            {t('friends.find_friends_btn')}
          </button>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileCardModal
        isOpen={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
        user={selectedFriend ? mapProfileToUI(selectedFriend) : null}
      />

      {/* Add Friend Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => { setIsAddModalOpen(false); setSearchResults([]); setSearchTerm(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('friends.add_btn')}</h3>
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{t('friends.email_label')}</label>
                <input
                  type="email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('friends.email_placeholder')}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
              <button type="submit" disabled={isSearching} className="w-full bg-gray-900 dark:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-blue-700 transition-all disabled:opacity-50">
                {isSearching ? t('friends.searching') : t('friends.search_btn')}
              </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase">{t('friends.results')}</p>
                {searchResults.map(user => (
                  <div key={user.uid} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        {(user.displayName || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.displayName || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user)}
                      className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700"
                    >
                      {t('friends.add_action')}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && searchTerm && !isSearching && (
              <p className="mt-4 text-center text-xs text-gray-400">{t('friends.no_users_found')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}