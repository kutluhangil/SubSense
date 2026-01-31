
import React, { useState } from 'react';
import { X, Check, Star, ShieldCheck, Zap, AlertCircle, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, startFreeTrial } from '../utils/stripe';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { currentUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('year');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    setError(null);
    try {
      await createCheckoutSession(currentUser.uid, billingCycle);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Payment initialization failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrial = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      await startFreeTrial(currentUser.uid);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Could not start trial. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* Left Side: Value Prop */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
           
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                 <Star className="text-yellow-400 fill-current" size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4 leading-tight">Stop wasting money on duplicate apps.</h2>
              <p className="text-indigo-100 text-sm leading-relaxed mb-8">
                 SubscriptionHub Pro automatically detects redundant services and helps you switch to annual billing for instant savings.
              </p>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="p-1 bg-white/20 rounded-full"><Copy size={12} /></div>
                    <span className="text-sm font-medium">Redundancy Detector</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-1 bg-white/20 rounded-full"><Check size={12} /></div>
                    <span className="text-sm font-medium">Billing Cycle Optimization</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-1 bg-white/20 rounded-full"><Check size={12} /></div>
                    <span className="text-sm font-medium">Priority Support</span>
                 </div>
              </div>
           </div>

           <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-indigo-200">
                 <ShieldCheck size={14} />
                 <span>Secure payment via Stripe. Cancel anytime.</span>
              </div>
           </div>
        </div>

        {/* Right Side: Pricing */}
        <div className="md:w-7/12 p-8 bg-white dark:bg-gray-900 flex flex-col">
           <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Choose your plan</h3>
              
              <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl relative">
                 <button 
                   onClick={() => setBillingCycle('month')}
                   className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'month' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                 >
                    Monthly
                 </button>
                 <button 
                   onClick={() => setBillingCycle('year')}
                   className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'year' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                 >
                    Yearly
                 </button>
                 {billingCycle === 'year' && (
                    <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                       SAVE 37%
                    </span>
                 )}
              </div>
           </div>

           <div className="flex-1 flex flex-col justify-center items-center mb-8">
              <div className="text-center">
                 <div className="flex items-start justify-center gap-1 text-gray-900 dark:text-white mb-2">
                    <span className="text-2xl font-bold mt-1">$</span>
                    <span className="text-6xl font-black tracking-tight">
                       {billingCycle === 'month' ? '3.99' : '2.49'}
                    </span>
                    <span className="text-xl font-medium text-gray-400 self-end mb-1">/mo</span>
                 </div>
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                    {billingCycle === 'month' ? 'Billed monthly' : 'Billed $29.99 yearly'}
                 </p>
              </div>
           </div>

           {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs rounded-lg flex items-center gap-2">
                 <AlertCircle size={14} /> {error}
              </div>
           )}

           <div className="space-y-4">
              <button 
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 rounded-xl shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                 {isProcessing ? (
                    <>Processing...</>
                 ) : (
                    <>Subscribe Now <Zap size={18} className="fill-white" /></>
                 )}
              </button>
              
              <button
                onClick={handleTrial}
                disabled={isProcessing}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                 Start 7-Day Free Trial (No Card)
              </button>

              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                 Payments are processed securely by Stripe. You can cancel anytime from settings.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
