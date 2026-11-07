
import React, { useEffect, useState } from 'react';
import { Sparkles, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';
import { generateDashboardInsights, AIInsight } from '../utils/gemini';
import { getChangedBrands } from '../utils/priceCatalog';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface AIInsightsCardProps {
  subscriptions: Subscription[];
}

const AIInsightsCard = ({ subscriptions }: AIInsightsCardProps) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentCurrency, currentLanguage, t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    const fetchInsights = async () => {
      if (subscriptions.length === 0) {
        if (mounted) setLoading(false);
        return;
      }

      setLoading(true);

      // Check for catalog price changes / price hikes for user's subscriptions
      const changedBrands = getChangedBrands();
      const priceChangeInsights: AIInsight[] = [];

      changedBrands.forEach(brand => {
        const matchingSub = subscriptions.find(s => {
          const sNorm = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const bNorm = brand.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return sNorm === bNorm || sNorm.includes(bNorm) || bNorm.includes(sNorm);
        });

        if (matchingSub) {
          const regionPrice = currentCurrency === 'TRY' ? (brand.tr || brand.us) : (brand.us || brand.tr);
          const priceInfo = regionPrice?.price != null ? ` (${regionPrice.price} ${regionPrice.currency})` : '';

          priceChangeInsights.push({
            type: 'redundancy',
            title: currentLanguage === 'tr'
              ? `Fiyat Değişimi Uyarısı: ${matchingSub.name}`
              : `Price Change Alert: ${matchingSub.name}`,
            description: currentLanguage === 'tr'
              ? `${matchingSub.name} servisinin katalog fiyatında yakın zamanda bir değişiklik tespit edildi${priceInfo}. Güncel planınızı kontrol etmeniz önerilir.`
              : `A price change was recently detected for ${matchingSub.name}${priceInfo}. We recommend reviewing your current plan.`,
            estimatedSavings: ''
          });
        }
      });

      const results = await generateDashboardInsights(subscriptions, currentCurrency, currentLanguage);
      if (mounted) {
        setInsights([...priceChangeInsights, ...results]);
        setLoading(false);
      }
    };

    fetchInsights();
    return () => { mounted = false; };
  }, [subscriptions, currentCurrency, currentLanguage, t]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-indigo-900 dark:to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-8 border border-white/10">

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none tracking-tight">{t('ai.card.smart_title')}</h3>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                {t('ai.card.optimized_by')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-white/5 rounded-xl border border-white/5"></div>
              <div className="h-16 bg-white/5 rounded-xl border border-white/5"></div>
            </div>
          ) : insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:bg-white/15 transition-colors group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-lg ${insight.type === 'redundancy' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                      {insight.type === 'redundancy' ? <AlertTriangle size={16} /> : <TrendingUp size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-100 leading-tight mb-1">{insight.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                  {insight.estimatedSavings && (
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">{t('ai.card.save_label')}</span>
                      <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                        {insight.estimatedSavings}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 text-xs bg-white/5 rounded-xl border border-white/5 border-dashed">
              <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>{t('ai.card.no_insights')}</p>
              <p>{t('ai.card.add_more')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AIInsightsCard);
