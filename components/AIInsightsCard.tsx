
import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, Lightbulb, Lock, ArrowRight, AlertTriangle, TrendingUp } from 'lucide-react';
import { generateDashboardInsights, AIInsight } from '../utils/gemini';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import UpgradeModal from './UpgradeModal';

interface AIInsightsCardProps {
  subscriptions: Subscription[];
}

export default function AIInsightsCard({ subscriptions }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  
  const { currentCurrency, currentLanguage, t, formatPrice } = useLanguage();
  const { isPro } = useAuth();

  // Heuristic calculation for the "Teaser" (Free users)
  // We calculate a conservative estimate locally to show value without API cost
  const potentialSavingsTeaser = useMemo(() => {
    if (subscriptions.length === 0) return 0;
    
    let savings = 0;
    subscriptions.forEach(sub => {
        // Simple heuristic: If monthly & > 10, assume 15% savings potential
        if (sub.cycle === 'Monthly' && sub.price > 10) {
            savings += (sub.price * 12) * 0.15;
        }
    });
    return savings;
  }, [subscriptions]);

  useEffect(() => {
    // Only fetch real AI insights if Pro
    if (!isPro) {
        setLoading(false);
        return;
    }

    let mounted = true;
    const fetchInsights = async () => {
      if (subscriptions.length === 0) {
        if (mounted) setLoading(false);
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

  // --- LOCKED STATE (Free Users) ---
  if (!isPro) {
      return (
        <>
        <div 
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-1 overflow-hidden mb-8 border border-gray-100 dark:border-gray-700 shadow-sm group cursor-pointer" 
            onClick={() => setIsUpgradeOpen(true)}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="relative p-5">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-900 dark:bg-white rounded-lg">
                            <Sparkles className="w-4 h-4 text-white dark:text-gray-900" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm tracking-wide">AI Insights</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Lock size={12} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Pro</span>
                    </div>
                </div>

                {/* Blurred Content Simulation */}
                <div className="space-y-4 filter blur-[5px] opacity-60 select-none">
                    <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="w-10 h-10 bg-blue-100 rounded-full shrink-0"></div>
                        <div className="space-y-2 w-full">
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="w-10 h-10 bg-orange-100 rounded-full shrink-0"></div>
                        <div className="space-y-2 w-full">
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>

                {/* Call to Action Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-gray-900/60 backdrop-blur-[2px]">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center max-w-xs transform transition-transform group-hover:scale-105">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Potential Savings Found
                        </p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                            {potentialSavingsTeaser > 0 ? formatPrice(potentialSavingsTeaser) : '$100+'}
                            <span className="text-sm font-medium text-gray-400">/yr</span>
                        </h3>
                        <button className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 text-white dark:text-gray-900 text-sm font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                            Unlock Insights <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
        </>
      );
  }

  // --- PRO STATE ---
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
              <h3 className="font-bold text-lg leading-none tracking-tight">Smart Insights</h3>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                Optimized by Gemini
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
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Save</span>
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
                <p>No optimization opportunities found yet.</p>
                <p>Add more subscriptions to activate analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
