import React, { useState, useMemo } from 'react';
import { Search, Mic, Plus, PenTool } from 'lucide-react';
import FloatingLogoLayer from './FloatingLogoLayer';
import AddSubscriptionModal from './AddSubscriptionModal';
import DuplicateSubscriptionModal from './DuplicateSubscriptionModal';
import { BrandIcon } from './BrandIcon';
import { LogoRenderer } from './LogoRenderer'; // Import
import { getBrandLogo } from '../utils/logoUtils'; // Import
import { useLanguage } from '../contexts/LanguageContext';
import { ALL_SUBSCRIPTIONS, SUBSCRIPTION_CATALOG, SubscriptionDetail, BRAND_COLORS } from '../utils/data';
import { Subscription } from './SubscriptionModal';
import { useFeedback } from '../contexts/FeedbackContext';


interface SubscriptionSearchPanelProps {
   onAddSubscription: (service: Subscription) => void;
   existingSubscriptions: Subscription[];
   onGoToDashboard: () => void;
}

export default function SubscriptionSearchPanel({ onAddSubscription, existingSubscriptions, onGoToDashboard }: SubscriptionSearchPanelProps) {
   const { t } = useLanguage();
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedService, setSelectedService] = useState<SubscriptionDetail | null>(null);
   const [duplicateService, setDuplicateService] = useState<string | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [showToast, setShowToast] = useState(false);
   const { triggerMicroFeedback } = useFeedback();

   // Filter subscriptions based on search
   const filteredServices = useMemo(() => {
      if (!searchTerm) return [];
      const lowerTerm = searchTerm.toLowerCase();
      return ALL_SUBSCRIPTIONS.filter(sub => sub.toLowerCase().includes(lowerTerm)).slice(0, 5);
   }, [searchTerm]);

   const handleSelect = (serviceName: string) => {
      // 1. Check for duplicates (Frontend Pre-check)
      const isDuplicate = existingSubscriptions.some(sub =>
         sub.name.toLowerCase() === serviceName.toLowerCase()
      );

      if (isDuplicate) {
         setDuplicateService(serviceName);
         return;
      }

      // 2. Look up detailed info, or create a basic fallback
      const key = serviceName.toLowerCase();
      const detail = Object.values(SUBSCRIPTION_CATALOG).find(s => s.name.toLowerCase() === key || s.id === key) || {
         id: key,
         name: serviceName,
         description: `${serviceName} subscription.`,
         foundedYear: "-",
         founders: "-",
         ceo: "-",
         headquarters: "-",
         price: "0.00",
         currency: "USD",
         type: key
      } as SubscriptionDetail;

      setSelectedService(detail);
      setIsModalOpen(true);
   };

   const handleCustomAdd = () => {
      setSelectedService(null); // Null service implies custom entry in modal
      setIsModalOpen(true);
   };

   const handleConfirmAdd = (subscription: Subscription) => {
      onAddSubscription(subscription);
      setIsModalOpen(false);
      setSelectedService(null);
      setSearchTerm('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Trigger feedback contextually
      triggerMicroFeedback('add_subscription');
   };

   return (
      <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-gray-50/50">

         {/* 1. Animated Background Layer */}
         <FloatingLogoLayer />

         {/* 2. Main Search Container */}
         <div className="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center">

            <div className="mb-8 text-center">
               <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                  {t('search.title')}
               </h1>
               <p className="text-gray-500 text-lg">Find and track your recurring expenses.</p>
            </div>

            {/* Search Input Box */}
            <div className="w-full relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center p-2 transition-all group-hover:shadow-2xl group-hover:scale-[1.01]">
                  <div className="pl-4 pr-3 text-gray-400">
                     <Search size={24} />
                  </div>
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder={t('search.placeholder')}
                     className="flex-1 h-12 text-lg outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                     autoFocus
                  />
                  <button className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors" title={t('search.voice')}>
                     <Mic size={20} />
                  </button>
               </div>

               {/* Dropdown Suggestions */}
               {filteredServices.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                     <div className="p-2">
                        {filteredServices.map((serviceName, idx) => {
                           const brandKey = serviceName.toLowerCase().replace(/\s+/g, '');
                           const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];
                           const logoUrl = getBrandLogo(serviceName); // Check for logo

                           return (
                              <div
                                 key={idx}
                                 onClick={() => handleSelect(serviceName)}
                                 className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group/item"
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center p-1 group-hover/item:scale-110 transition-transform overflow-hidden">
                                       <LogoRenderer
                                          logoUrl={logoUrl}
                                          name={serviceName}
                                          className="w-full h-full"
                                          variant="color"
                                          fallback={<BrandIcon type={serviceName} className="w-full h-full" noBackground />}
                                       />
                                    </div>
                                    <span className="font-semibold text-gray-900 text-base">{serviceName}</span>
                                 </div>
                                 <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Plus size={20} style={{ color: brandColor }} />
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                     <div className="bg-gray-50 px-4 py-3 text-center border-t border-gray-100">
                        <button
                           onClick={handleCustomAdd}
                           className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 w-full"
                        >
                           <PenTool size={12} /> Create Custom Subscription
                        </button>
                     </div>
                  </div>
               )}
            </div>

            {/* Empty State / Suggestions Tags */}
            {!searchTerm && (
               <div className="mt-8 flex flex-col items-center gap-4 opacity-80">
                  <div className="flex flex-wrap justify-center gap-2">
                     {['Netflix', 'Spotify', 'Trendyol', 'Hepsiburada', 'Exxen', 'Disney+'].map(tag => (
                        <button
                           key={tag}
                           onClick={() => handleSelect(tag)}
                           className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                        >
                           {tag}
                        </button>
                     ))}
                  </div>
                  <button
                     onClick={handleCustomAdd}
                     className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors underline"
                  >
                     Can't find it? Add custom
                  </button>
               </div>
            )}
         </div>

         {/* Add Modal (Editable Form) */}
         <AddSubscriptionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            service={selectedService}
            onAdd={handleConfirmAdd}
         />

         {/* Duplicate Warning Modal */}
         <DuplicateSubscriptionModal
            isOpen={!!duplicateService}
            onClose={() => setDuplicateService(null)}
            serviceName={duplicateService || ''}
            onGoToDashboard={onGoToDashboard}
         />

         {/* Toast Notification */}
         <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
               <Plus size={12} className="text-white" />
            </div>
            <span className="font-medium text-sm">Subscription added to Dashboard.</span>
         </div>

      </div>
   );
}