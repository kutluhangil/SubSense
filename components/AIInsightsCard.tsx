
import React, { useEffect, useState } from 'react';
import { Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import { generateDashboardInsights } from '../utils/gemini';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface AIInsightsCardProps {
  subscriptions: Subscription[];
}

export default function AIInsightsCard({ subscriptions }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentCurrency, currentLanguage, t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    const fetchInsights = async () => {
      if (subscriptions.length === 0) {
        if (mounted) {
            setInsights([t('ai.insight.default')]);
            setLoading(false);
        }
        return;
      }
      
      setLoading(true);
      // Pass current base currency and language to ensure insights are strictly localized
      const results = await generateDashboardInsights(subscriptions, currentCurrency, currentLanguage);
      if (mounted) {
        setInsights(results);
        setLoading(false);
      }
    };

    fetchInsights();
    return () => { mounted = false; };
  }, [subscriptions, currentCurrency, currentLanguage, t]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8 border border-indigo-700/50 group">
      {/* Animated Background Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
      
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">Gemini Intelligence</h3>
              <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider mt-1">Live Spending Analysis</p>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             <span className="text-[10px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
                {t('ai.powered_by')}
             </span>
          </div>
        </div>

        <div className="space-y-3 min-h-[80px]">
          {loading ? (
            <div className="space-y-3 animate-pulse">
               <div className="h-4 bg-white/10 rounded w-3/4"></div>
               <div className="h-4 bg-white/10 rounded w-5/6"></div>
               <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 150}ms` }}>
                <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-indigo-50 font-medium leading-snug">{insight}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
