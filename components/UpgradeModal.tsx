import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, startFreeTrial } from '../utils/stripe';
import { useLanguage } from '../contexts/LanguageContext';

interface UpgradeModalProps {
   isOpen: boolean;
   onClose: () => void;
   anchorRect: DOMRect | null;
}

export default function UpgradeModal({ isOpen, onClose, anchorRect }: UpgradeModalProps) {
   const { currentUser } = useAuth();
   const { t } = useLanguage();
   const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('year');
   const [isProcessing, setIsProcessing] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const modalRef = useRef<HTMLDivElement>(null);

   // Close on click outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         // Check if click is outside ref AND outside the anchor rect (the button itself)
         // We don't have access to the button ref here directly, but usually check ref.current.contains
         if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [isOpen, onClose]);

   // Close on ESC
   useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
         if (event.key === 'Escape') onClose();
      };
      if (isOpen) window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
   }, [isOpen, onClose]);

   const handleUpgrade = async () => {
      if (!currentUser) return;
      setIsProcessing(true);
      setError(null);
      try {
         await createCheckoutSession(currentUser.uid, billingCycle);
         onClose();
      } catch (e) {
         console.error(e);
         setError("Payment initialization failed.");
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
         setError("Could not start trial.");
      } finally {
         setIsProcessing(false);
      }
   };

   if (!isOpen || !anchorRect) return null;

   // Calculate position: To the right of the sidebar button
   // Sidebar is usually on the left.
   const left = anchorRect.right + 16;
   // Center vertically relative to the button, but clamp to screen edges if needed
   // Let's align top with the button top for simplicity, or slightly higher to center visually
   const top = anchorRect.top - 100; // Move up to show more content above the cursor level

   // Ensure it doesn't go off bottom of screen
   // const screenHeight = window.innerHeight;
   // const estimatedHeight = 500;
   // const adjustedTop = Math.min(top, screenHeight - estimatedHeight - 20);

   return createPortal(
      <AnimatePresence>
         {isOpen && (
            <motion.div
               ref={modalRef}
               initial={{ opacity: 0, scale: 0.92, x: -10 }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               exit={{ opacity: 0, scale: 0.92, x: -10 }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               style={{
                  position: 'fixed',
                  top: Math.max(20, Math.min(top, window.innerHeight - 520)), // Simple boundary check
                  left: left,
                  zIndex: 9999,
               }}
               className="w-[360px]" // slightly wider than Beta modal for pricing content
            >
               <div className="relative bg-white dark:bg-gray-900 rounded-[24px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                  {/* Subtle Rotating Rainbow Border Effect (Matched from BetaModal) */}
                  <div className="absolute inset-0 pointer-events-none rounded-[24px] border border-transparent [background:linear-gradient(45deg,transparent,rgba(255,165,0,0.3),rgba(236,72,153,0.3),rgba(168,85,247,0.3),transparent)_border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]" />

                  {/* Background Texture/Gradient for Header */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-900/5 via-purple-900/5 to-transparent dark:from-indigo-900/40 dark:via-purple-900/20 dark:to-transparent pointer-events-none" />

                  <div className="p-6 relative">
                     {/* Header */}
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                 <Star size={16} className="text-indigo-600 dark:text-indigo-400 fill-current" />
                              </div>
                              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                 Upgrade to Pro
                              </h2>
                           </div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed pl-1">
                              Unlock the full potential of SubSense.
                           </p>
                        </div>
                        <button
                           onClick={onClose}
                           className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                           <X size={18} />
                        </button>
                     </div>

                     {/* Toggle Month/Year */}
                     <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex relative w-full">
                           <button
                              onClick={() => setBillingCycle('month')}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'month' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                           >
                              Monthly
                           </button>
                           <button
                              onClick={() => setBillingCycle('year')}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'year' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
                           >
                              Yearly
                           </button>
                           {billingCycle === 'year' && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
                                 -37%
                              </span>
                           )}
                        </div>
                     </div>

                     {/* Price */}
                     <div className="text-center mb-6">
                        <div className="flex items-start justify-center gap-0.5 text-gray-900 dark:text-white">
                           <span className="text-xl font-bold mt-1">$</span>
                           <span className="text-5xl font-black tracking-tight">
                              {billingCycle === 'month' ? '3.99' : '2.49'}
                           </span>
                           <span className="text-lg font-medium text-gray-400 self-end mb-1">/mo</span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                           {billingCycle === 'month' ? 'Billed monthly' : 'Billed $29.99 yearly'}
                        </p>
                     </div>

                     {/* Features Compact */}
                     <div className="space-y-2 mb-6">
                        <FeatureRow text="Unlimited Subscriptions" />
                        <FeatureRow text="Advanced Analytics & AI" />
                        <FeatureRow text="Priority Support" />
                     </div>

                     {/* Error Message */}
                     {error && (
                        <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg text-center font-medium">
                           {error}
                        </div>
                     )}

                     {/* Actions */}
                     <div className="space-y-2.5">
                        <button
                           onClick={handleUpgrade}
                           disabled={isProcessing}
                           className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                           {isProcessing ? (
                              <>Processing...</>
                           ) : (
                              <>Upgrade Now <Zap size={16} className="fill-white" /></>
                           )}
                        </button>

                        <button
                           onClick={handleTrial}
                           disabled={isProcessing}
                           className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:border-gray-200 dark:hover:border-gray-600"
                        >
                           Start 7-Day Free Trial
                        </button>
                     </div>

                     <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-gray-400 dark:text-gray-500">
                        <ShieldCheck size={12} />
                        <span>Secure payment via Stripe</span>
                     </div>

                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body
   );
}

function FeatureRow({ text }: { text: string }) {
   return (
      <div className="flex items-center gap-2.5 px-2">
         <div className="p-0.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
            <Check size={10} strokeWidth={4} />
         </div>
         <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{text}</span>
      </div>
   );
}
