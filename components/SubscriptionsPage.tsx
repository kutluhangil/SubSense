import React, { useMemo, useState } from 'react';
import { CreditCard, Plus, Search, Zap, Calendar, Layers, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SubscriptionTable from './SubscriptionTable';
import { Subscription } from './SubscriptionModal';
import { PageHeader, StatTile, Card, Segmented, PrimaryButton } from './ui';

interface Props {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onDeleteSubscription: (id: number | string) => void;
  previewCurrency?: string | null;
  onAdd?: () => void;
}

type StatusFilter = 'all' | 'active' | 'cancelled';

export default function SubscriptionsPage({
  subscriptions,
  onSelectSubscription,
  onDeleteSubscription,
  previewCurrency,
  onAdd,
}: Props) {
  const { t, formatPrice, convert } = useLanguage();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const toMonthlyBase = (s: Subscription) => convert(s.cycle === 'Monthly' ? s.price : s.price / 12, s.currency);

  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const monthlyTotal = activeSubs.reduce((a, s) => a + toMonthlyBase(s), 0);
  const yearlyTotal = monthlyTotal * 12;
  const avgPerSub = activeSubs.length ? monthlyTotal / activeSubs.length : 0;

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (status === 'active' && s.status !== 'Active') return false;
      if (status === 'cancelled' && s.status === 'Active') return false;
      if (query.trim() && !s.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [subscriptions, status, query]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        icon={CreditCard}
        title={t('features.subscriptions.title')}
        subtitle={t('subspage.subtitle')}
        actions={
          onAdd && (
            <PrimaryButton onClick={onAdd}>
              <Plus size={16} /> <span className="hidden sm:inline">{t('dashboard.add_sub')}</span>
            </PrimaryButton>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t('subspage.active')} value={String(activeSubs.length)} icon={Layers} accent="#6366f1" />
        <StatTile label={t('stats.monthly')} value={formatPrice(monthlyTotal)} icon={Zap} accent="#3b82f6" />
        <StatTile label={t('profile.yearly')} value={formatPrice(yearlyTotal)} icon={Calendar} accent="#8b5cf6" />
        <StatTile label={t('subspage.avg')} value={formatPrice(avgPerSub)} icon={TrendingUp} accent="#22c55e" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('subspage.search')}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: t('subspage.all') },
            { value: 'active', label: t('subspage.active') },
            { value: 'cancelled', label: t('subspage.cancelled') },
          ]}
        />
      </div>

      {/* Table */}
      <Card padding="p-0">
        {filtered.length > 0 ? (
          <SubscriptionTable
            subscriptions={filtered}
            onSelectSubscription={onSelectSubscription}
            onDeleteSubscription={onDeleteSubscription}
            previewCurrency={previewCurrency}
          />
        ) : (
          <p className="py-16 text-center text-sm text-gray-400">{t('subspage.empty')}</p>
        )}
      </Card>
    </div>
  );
}
