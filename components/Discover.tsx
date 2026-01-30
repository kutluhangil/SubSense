
import React, { useState, useMemo } from 'react';
import { Search, Compass, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_CATALOG, ALL_SUBSCRIPTIONS } from '../utils/data';
import BrandIcon from './BrandIcon';
import SubscriptionProfileModal from './SubscriptionProfileModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function Discover() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Get list of services that have detailed catalog entries
  const services = useMemo(() => {
    // We prioritize services that are explicitly defined in CATALOG
    const catalogKeys = Object.keys(SUBSCRIPTION_CATALOG);
    
    // Create a rich object list for rendering
    let list = catalogKeys.map(key => SUBSCRIPTION_CATALOG[key]);

    // Filter by search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(lower) || 
        s.type.toLowerCase().includes(lower)
      );
    }

    return list;
  }, [searchTerm]);

  const selectedService = selectedServiceId ? SUBSCRIPTION_CATALOG[selectedServiceId] : null;

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
               <Compass className="text-indigo-500" /> Explore
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
               Discover services, compare valuations, and learn about the companies behind your subscriptions.
            </p>
         </div>

         <div className="w-full md:w-96 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search subscriptions (Netflix, Adobe...)"
               className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
            />
         </div>
      </div>

      {/* Editorial Grid */}
      {services.length > 0 ? (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-[180px]">
            {services.map((service, idx) => {
               // Determine tile size logic for "masonry" feel (purely visual variety)
               // Every 7th item is wide, every 3rd item is tall (pseudo-random feel)
               const isWide = idx % 7 === 0 && idx !== 0;
               const isTall = idx % 5 === 0 && !isWide;
               
               const colSpan = isWide ? 'col-span-2' : 'col-span-1';
               const rowSpan = isTall ? 'row-span-2' : 'row-span-1';

               return (
                  <div 
                     key={service.id}
                     onClick={() => setSelectedServiceId(service.id)}
                     className={`
                        ${colSpan} ${rowSpan}
                        group relative bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm 
                        hover:shadow-xl hover:scale-[1.03] hover:z-10
                        transition-all duration-300 ease-out cursor-pointer overflow-hidden
                     `}
                  >
                     {/* Background Decoration */}
                     <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-gray-700/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     
                     <div className="relative h-full flex flex-col justify-between z-10">
                        <div className="flex items-start justify-between">
                           <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-2 flex items-center justify-center border border-gray-50 dark:border-gray-700">
                              <BrandIcon type={service.type} className="w-full h-full" noBackground />
                           </div>
                           {/* Icon for featured/popular items */}
                           {(isWide || isTall) && (
                              <Sparkles size={16} className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity delay-100" />
                           )}
                        </div>

                        <div>
                           <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {service.name}
                           </h3>
                           <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {service.description}
                           </p>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      ) : (
         <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <Search size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No services found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Try searching for Netflix, Spotify, or Adobe.</p>
         </div>
      )}

      {/* Detail Modal */}
      <SubscriptionProfileModal 
         isOpen={!!selectedService}
         onClose={() => setSelectedServiceId(null)}
         service={selectedService}
      />

    </div>
  );
}
