import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, X, Check, Users, MapPin, Loader2, CreditCard, Mail, Inbox } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { convertAmount } from '../utils/currency';
import {
  searchPeople,
  sendFriendRequest,
  respondFriendRequest,
  listFriendRequests,
  listFriends,
  type FriendProfile,
  type FriendRequestPreview,
  type PersonResult,
} from '../utils/friends';
import { PageHeader, Card, SectionCard, EmptyState, PrimaryButton, Pill } from './ui';

const initial = (s: string | null | undefined) => (s || '?')[0].toUpperCase();

const Avatar = ({ name, size = 'md' }: { name: string | null | undefined; size?: 'sm' | 'md' }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 font-bold text-white ${
      size === 'sm' ? 'h-9 w-9 text-sm' : 'h-12 w-12 text-lg'
    }`}
  >
    {initial(name)}
  </span>
);

export default function Friends() {
  const { currentUser } = useAuth();
  const { t, currentCurrency, formatPrice } = useLanguage();

  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequestPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PersonResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!currentUser) return;
    const [f, r] = await Promise.all([listFriends(), listFriendRequests()]);
    setFriends(f);
    setRequests(r);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [currentUser, reload]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setSentTo(null);
    try {
      setSearchResults(await searchPeople(searchTerm));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSend = async (user: PersonResult) => {
    setBusyId(user.uid);
    try {
      const status = await sendFriendRequest(user.uid);
      setSentTo(status === 'already_friends' ? t('friends.already_friends') : t('friends.sent_alert').replace('{0}', user.displayName || user.email));
    } finally {
      setBusyId(null);
    }
  };

  const handleRespond = async (senderUid: string, accept: boolean) => {
    setBusyId(senderUid);
    try {
      await respondFriendRequest(senderUid, accept);
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const closeAdd = () => {
    setIsAddOpen(false);
    setSearchResults([]);
    setSearchTerm('');
    setSentTo(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        icon={Users}
        title={t('features.friends.title')}
        subtitle={t('friends.subtitle')}
        actions={
          <PrimaryButton onClick={() => setIsAddOpen(true)}>
            <UserPlus size={16} /> <span className="hidden sm:inline">{t('friends.add_btn')}</span>
          </PrimaryButton>
        }
      />

      {/* Incoming requests */}
      {requests.length > 0 && (
        <SectionCard title={t('friends.requests')} icon={Inbox} iconColor="#f59e0b" action={<Pill color="#f59e0b">{requests.length}</Pill>}>
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.uid} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={r.displayName || r.email} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{r.displayName || 'User'}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{r.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleRespond(r.uid, true)}
                    disabled={busyId === r.uid}
                    className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={13} /> {t('friends.accept')}
                  </button>
                  <button
                    onClick={() => handleRespond(r.uid, false)}
                    disabled={busyId === r.uid}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <X size={13} /> {t('friends.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Friends grid */}
      {friends.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((f) => (
            <Card key={f.uid} hover glow="#6366f1" className="flex flex-col">
              <div className="mb-4 flex items-center gap-3">
                <Avatar name={f.displayName || f.email} />
                <div className="min-w-0">
                  <h3 className="truncate font-display font-bold text-gray-900 dark:text-white">{f.displayName || 'User'}</h3>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{f.email}</p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {f.region && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={13} /> {f.region}
                  </span>
                )}
                {typeof f.totalSubscriptions === 'number' && (
                  <Pill color="#6366f1">
                    <CreditCard size={11} /> {t('friends.subs_count').replace('{n}', String(f.totalSubscriptions))}
                  </Pill>
                )}
              </div>
              <div className="mt-auto border-t border-gray-100 dark:border-white/5 pt-3 text-sm">
                {typeof f.monthlySpend === 'number' ? (
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                    {formatPrice(convertAmount(f.monthlySpend, f.baseCurrency || 'USD', currentCurrency))}
                    <span className="ml-1 text-xs font-normal text-gray-400">/mo</span>
                  </span>
                ) : (
                  <span className="text-xs italic text-gray-400">{t('friends.no_public_spend')}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={t('friends.empty_title')}
          desc={t('friends.empty_desc')}
          action={<PrimaryButton onClick={() => setIsAddOpen(true)}>{t('friends.find_friends_btn')}</PrimaryButton>}
        />
      )}

      {/* Add friend modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <button onClick={closeAdd} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
            </button>
            <h3 className="mb-4 font-display text-lg font-bold text-gray-900 dark:text-white">{t('friends.add_btn')}</h3>
            <form onSubmit={handleSearch}>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('friends.email_label')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('friends.email_placeholder')}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white py-3 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="mt-3 w-full rounded-xl bg-gray-900 dark:bg-blue-600 py-3 text-sm font-bold text-white hover:bg-gray-800 dark:hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? t('friends.searching') : t('friends.search_btn')}
              </button>
            </form>

            {sentTo && <p className="mt-4 rounded-lg bg-green-50 dark:bg-green-900/30 px-3 py-2 text-center text-xs font-medium text-green-700 dark:text-green-300">{sentTo}</p>}

            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold uppercase text-gray-500">{t('friends.results')}</p>
                {searchResults.map((user) => (
                  <div key={user.uid} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-700 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={user.displayName || user.email} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{user.displayName || 'User'}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSend(user)}
                      disabled={busyId === user.uid}
                      className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {t('friends.add_action')}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && searchTerm && !isSearching && !sentTo && (
              <p className="mt-4 text-center text-xs text-gray-400">{t('friends.no_users_found')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
