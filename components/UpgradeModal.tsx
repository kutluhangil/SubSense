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
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
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

   // Centered Modal Design - No anchor positioning needed
   if (!isOpen) return null;

   return createPortal(
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
               {/* Backdrop */}
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               />

               {/* Modal Content */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                  className="relative w-full max-w-[380px] bg-[#1A1A1A] rounded-[24px] shadow-2xl overflow-hidden border border-white/10"
               >
                  {/* Purple Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/20 via-[#9333EA]/10 to-transparent pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#4F46E5]/20 to-transparent pointer-events-none" />

                  {/* Close Button */}
                  <button
                     onClick={onClose}
                     className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
                  >
                     <X size={20} />
                  </button>

                  <div className="relative p-6 px-7 flex flex-col items-center text-center z-10">
                     {/* Header Icon */}
                     <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#9333EA] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#4F46E5]/25">
                        <Star className="text-white fill-white" size={24} />
                     </div>

                     <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
                     <p className="text-sm text-gray-400 mb-8 max-w-[260px]">
                        Unlock the full potential of SubSense.
                     </p>

                     {/* Toggle */}
                     <div className="flex bg-[#2A2A2A] p-1 rounded-xl w-full mb-8 relative">
                        <motion.div
                           layout
                           className="absolute top-1 bottom-1 bg-[#3A3A3A] rounded-lg shadow-sm"
                           initial={false}
                           animate={{
                              left: billingCycle === 'month' ? '4px' : '50%',
                              width: 'calc(50% - 4px)',
                              x: billingCycle === 'month' ? 0 : 0
                           }}
                           transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                        <button
                           onClick={() => setBillingCycle('month')}
                           className={`flex-1 py-2.5 text-xs font-bold relative z-10 transition-colors ${billingCycle === 'month' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
                        >
                           Monthly
                        </button>
                        <button
                           onClick={() => setBillingCycle('year')}
                           className={`flex-1 py-2.5 text-xs font-bold relative z-10 transition-colors ${billingCycle === 'year' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
                        >
                           Yearly
                        </button>

                        {/* Discount Badge */}
                        <div className="absolute -top-3 -right-2 bg-[#10B981] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm transform rotate-3">
                           -37%
                        </div>
                     </div>

                     {/* Price */}
                     <div className="mb-8">
                        <div className="flex items-center justify-center gap-1 text-white">
                           <span className="text-2xl font-bold align-top mt-1">$</span>
                           <span className="text-6xl font-black tracking-tighter">
                              {billingCycle === 'month' ? '3.99' : '2.49'}
                           </span>
                           <span className="text-lg font-medium text-gray-400 self-end mb-1.5">/mo</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                           {billingCycle === 'month' ? 'Billed monthly' : 'Billed $29.99 yearly'}
                        </p>
                     </div>

                     {/* Features */}
                     <div className="space-y-3 w-full mb-8 text-left pl-4">
                        <FeatureRow text="Unlimited Subscriptions" />
                        <FeatureRow text="Advanced Analytics & AI" />
                        <FeatureRow text="Priority Support" />
                     </div>

                     {/* Error Message */}
                     {error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 text-red-400 text-xs rounded-lg w-full">
                           {error}
                        </div>
                     )}

                     {/* Main CTA */}
                     <button
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-[#6366F1] to-[#A855F7] hover:from-[#5558E6] hover:to-[#9333EA] text-white text-base font-bold py-3.5 rounded-xl shadow-lg shadow-[#6366F1]/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
                     >
                        {isProcessing ? (
                           <>Processing...</>
                        ) : (
                           <>Upgrade Now <Zap size={18} className="fill-white" /></>
                        )}
                     </button>

                     {/* Trial CTA */}
                     <button
                        onClick={handleTrial}
                        disabled={isProcessing}
                        className="w-full bg-[#2A2A2A] hover:bg-[#333] text-gray-300 text-xs font-bold py-3 rounded-xl transition-all border border-transparent hover:border-gray-700"
                     >
                        Start 7-Day Free Trial
                     </button>

                     <div className="flex items-center gap-1.5 mt-6 opacity-40">
                        <ShieldCheck size={12} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Secure payment via Stripe</span>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>,
      document.body
   );
}

function FeatureRow({ text }: { text: string }) {
   return (
      <div className="flex items-center gap-3">
         <div className="p-0.5 rounded-full bg-[#10B981]/20 text-[#10B981]">
            <Check size={12} strokeWidth={3} />
         </div>
         <span className="text-sm font-medium text-gray-300">{text}</span>
      </div>
   );
}
