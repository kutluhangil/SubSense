import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  X,
  Sparkles,
} from 'lucide-react';
import { Subscription } from './SubscriptionModal';
import {
  detectSubscriptionPriceUpdates,
  dismissPriceUpdateSuggestion,
  syncLivePricesFromServer,
  getLastPriceSyncTime,
  PriceUpdateSuggestion,
} from '../utils/priceCatalog';
import { useLanguage } from '../contexts/LanguageContext';
import { CURRENCY_DATA } from '../utils/currency';
import { BrandIcon } from './BrandIcon';

interface PriceSyncBannerProps {
  subscriptions: Subscription[];
  onUpdateSubscriptionPrice: (sub: Subscription, newPrice: number) => Promise<void> | void;
}

const formatNativeCurrency = (amount: number, currency: string) => {
  const sym = CURRENCY_DATA[currency]?.symbol || `${currency} `;
  return `${sym}${amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function PriceSyncBanner({
  subscriptions,
  onUpdateSubscriptionPrice,
}: PriceSyncBannerProps) {
  const { currentLanguage } = useLanguage();
  const isTr = currentLanguage === 'tr';

  const [refreshTick, setRefreshTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [updatingAll, setUpdatingAll] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => getLastPriceSyncTime());

  useEffect(() => {
    const onPricesUpdated = () => {
      setRefreshTick((t) => t + 1);
      setLastSyncedAt(getLastPriceSyncTime());
    };
    window.addEventListener('aboneyim:prices-updated', onPricesUpdated);
    return () => window.removeEventListener('aboneyim:prices-updated', onPricesUpdated);
  }, []);

  const suggestions: PriceUpdateSuggestion[] = useMemo(() => {
    void refreshTick;
    return detectSubscriptionPriceUpdates(subscriptions);
  }, [subscriptions, refreshTick]);

  const handleLiveSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setStatusMessage(null);
    try {
      const brandNames = Array.from(
        new Set(subscriptions.filter((s) => s.status !== 'Inactive').map((s) => s.name))
      );
      const res = await syncLivePricesFromServer({
        brands: brandNames.length > 0 ? brandNames : undefined,
      });
      setLastSyncedAt(res.syncedAt);
      setRefreshTick((t) => t + 1);
      const latestSuggestions = detectSubscriptionPriceUpdates(subscriptions);
      if (latestSuggestions.length > 0) {
        setStatusMessage(
          isTr
            ? `${latestSuggestions.length} aboneliğiniz için güncel tarife farkı bulundu.`
            : `Found updated pricing for ${latestSuggestions.length} of your subscriptions.`
        );
      } else {
        setStatusMessage(
          isTr
            ? 'Tüm abonelikleriniz güncel 2026 tarifeleriyle birebir uyumlu.'
            : 'All your subscriptions match the latest 2026 official rates.'
        );
      }
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const handleApplyOne = async (item: PriceUpdateSuggestion) => {
    const key = String(item.sub.id);
    setUpdatingIds((prev) => ({ ...prev, [key]: true }));
    try {
      await onUpdateSubscriptionPrice(item.sub, item.newPrice);
      setRefreshTick((t) => t + 1);
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleApplyAll = async () => {
    if (updatingAll || suggestions.length === 0) return;
    setUpdatingAll(true);
    try {
      for (const item of suggestions) {
        await onUpdateSubscriptionPrice(item.sub, item.newPrice);
      }
      setRefreshTick((t) => t + 1);
      setStatusMessage(
        isTr
          ? `${suggestions.length} aboneliğin fiyatı otomatik olarak güncellendi!`
          : `Automatically updated ${suggestions.length} subscription prices!`
      );
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setUpdatingAll(false);
    }
  };

  const handleDismiss = (item: PriceUpdateSuggestion) => {
    dismissPriceUpdateSuggestion(item.sub.id, item.newPrice);
    setRefreshTick((t) => t + 1);
  };

  if (subscriptions.length === 0) return null;

  // Compact bar when everything is already up to date
  if (suggestions.length === 0) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] px-4 py-3">
        <div className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-200">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={14} />
          </span>
          <div>
            <span className="font-semibold">
              {isTr ? 'Otomatik Fiyat Kontrolü Aktif' : 'Auto Price Sync Active'}
            </span>
            <span className="mx-1.5 text-stone-400">·</span>
            <span className="text-stone-500 dark:text-stone-400">
              {statusMessage ||
                (isTr
                  ? 'Abonelikleriniz güncel 2026 resmi tarifeleriyle uyumlu.'
                  : 'Your subscriptions match current 2026 official rates.')}
            </span>
          </div>
        </div>

        <button
          onClick={handleLiveSync}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:border-amber-500/50 transition-all disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin text-amber-500' : ''} />
          <span>
            {syncing
              ? isTr
                ? 'Denetleniyor...'
                : 'Checking...'
              : isTr
              ? 'Fiyatları Şimdi Denetle'
              : 'Check Prices Now'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.07] via-white to-indigo-500/[0.05] dark:from-amber-500/[0.1] dark:via-gray-900 dark:to-indigo-500/[0.08] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/15 dark:border-white/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {isTr
                  ? `Otomatik Fiyat Güncelleme Radarı (${suggestions.length})`
                  : `Automatic Price Update Radar (${suggestions.length})`}
              </h3>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                2026 Canlı Tarife
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
              {isTr
                ? 'Kayıtlı aboneliklerinizden bazılarının resmi 2026 fiyatı değişmiş görünüyor. Tek tıkla güncelleyebilirsiniz.'
                : 'Some of your saved subscriptions have updated 2026 official prices. Update them with one click.'}
            </p>
            {lastSyncedAt && (
              <p className="mt-0.5 text-[10px] text-gray-400">
                {isTr ? 'Son denetim: ' : 'Last checked: '}
                {new Date(lastSyncedAt).toLocaleTimeString(isTr ? 'tr-TR' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLiveSync}
            disabled={syncing || updatingAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            <span>{isTr ? 'Tarifeleri Yenile' : 'Refresh Rates'}</span>
          </button>

          <button
            onClick={handleApplyAll}
            disabled={updatingAll || syncing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 dark:bg-amber-500 text-white dark:text-gray-950 px-4 py-2 text-xs font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 size={14} />
            <span>
              {updatingAll
                ? isTr
                  ? 'Güncelleniyor...'
                  : 'Updating...'
                : isTr
                ? 'Tümünü Otomatik Güncelle'
                : 'Auto-Update All'}
            </span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          {statusMessage}
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {suggestions.map((item) => {
          const isIncrease = item.diff > 0;
          const isUpdating = Boolean(updatingIds[String(item.sub.id)]);

          return (
            <div
              key={item.sub.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-gray-800/80 px-3.5 py-2.5 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                  <BrandIcon type={item.sub.type || item.sub.name.toLowerCase()} size="sm" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {item.sub.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      · {item.matchedPlan}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                    <span className="line-through text-gray-400 tabular-nums">
                      {formatNativeCurrency(item.oldPrice, item.currency)}
                    </span>
                    <ArrowRight size={11} className="text-gray-400" />
                    <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                      {formatNativeCurrency(item.newPrice, item.currency)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        isIncrease
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isIncrease ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isIncrease ? '+' : ''}
                      {item.percentChange}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleApplyOne(item)}
                  disabled={isUpdating || updatingAll}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 text-[11px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating
                    ? isTr
                      ? '...'
                      : '...'
                    : isTr
                    ? 'Güncelle'
                    : 'Update'}
                </button>
                <button
                  onClick={() => handleDismiss(item)}
                  title={isTr ? 'Mevcut fiyatımı koru (Yoksay)' : 'Keep my current price (Dismiss)'}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
