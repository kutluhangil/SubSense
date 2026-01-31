
import React, { useEffect, useState } from 'react';
import { Sparkles, Lightbulb, Lock } from 'lucide-react';
import { generateDashboardInsights } from '../utils/gemini';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import UpgradeModal from './UpgradeModal';

interface AIInsightsCardProps {
  subscriptions: Subscription[];
}

export default function AIInsightsCard({ subscriptions }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  
  const { currentCurrency, currentLanguage, t } = useLanguage();
  const { isPro } = useAuth(); // Check plan status

  useEffect(() => {
    // If not pro, don't fetch insights to save API quota & perform gating logic
    if (!isPro) {
        setLoading(false);
        return;
    }

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
      const results = await generateDashboardInsights(subscriptions, currentCurrency, currentLanguage);
      if (mounted) {
        setInsights(results);
        setLoading(false);
      }
    };

    fetchInsights();
    return () => { mounted = false; };
  }, [subscriptions, currentCurrency, currentLanguage, t, isPro]);

  // Locked State for Free Users
  if (!isPro) {
      return (
        <>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden mb-8 group cursor-pointer" onClick={() => setIsUpgradeOpen(true)}>
            {/* Blurry Content Layer */}
            <div className="filter blur-[3px] opacity-50 select-none pointer-events-none" aria-hidden="true">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI Analysis</h3>
                            <p className="text-[10px] text-gray-500">Live Insights</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">You could save $120/year by switching to annual billing on Netflix.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Unused subscription detected: Adobe Creative Cloud.</p>
                    </div>
                </div>
            </div>

            {/* Locked Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-white/60 to-white/90 dark:via-gray-900/60 dark:to-gray-900/90">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg mb-3 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                    <Lock size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Unlock AI Insights</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs text-center">
                    Get personalized savings recommendations and alerts with Pro.
                </p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors shadow-lg shadow-indigo-600/20">
                    Upgrade to Pro
                </button>
            </div>
        </div>
        <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
        </>
      );
  }

  // Active State for Pro Users
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8 border border-indigo-700/50 group">
      {/* Animated Background Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
      
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
