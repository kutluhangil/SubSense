
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, PlayCircle, CreditCard, Globe, Users, PieChart, Settings, Mail, HelpCircle, AlertTriangle, ServerOff, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ContactSupportModal from './ContactSupportModal';

const BackgroundVisual = ({ categoryId }: { categoryId: string }) => {
  const commonClasses = "absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.05] pointer-events-none transition-all duration-700 ease-in-out";
  switch(categoryId) {
    case 'limitations':
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
           <path d="M200 50 L350 350 L50 350 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
           <circle cx="200" cy="200" r="50" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case 'start':
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
           <path d="M50 200 L150 200 L150 300 L50 300 Z" fill="none" stroke="currentColor" strokeWidth="2" />
           <path d="M200 100 L300 100 L300 200 L200 200 Z" fill="none" stroke="currentColor" strokeWidth="2" />
           <circle cx="200" cy="200" r="10" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg className={commonClasses} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
           <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 10" />
        </svg>
      );
  }
};

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { t } = useLanguage();

  const CATEGORIES = useMemo(() => [
    { 
      id: 'start', 
      label: t('help.cat.start'), 
      icon: PlayCircle, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      description: t('help.cat.start_desc')
    },
    { 
      id: 'subs', 
      label: t('help.cat.subs'), 
      icon: CreditCard, 
      color: 'text-purple-600 dark:text-purple-400', 
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      description: t('help.cat.subs_desc')
    },
    { 
      id: 'analytics', 
      label: t('help.cat.analytics'), 
      icon: PieChart, 
      color: 'text-violet-600 dark:text-violet-400', 
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      description: t('help.cat.analytics_desc')
    },
    { 
      id: 'limitations', 
      label: t('help.cat.limitations'), 
      icon: AlertTriangle, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      description: t('help.cat.limitations_desc')
    },
    { 
      id: 'compare', 
      label: t('help.cat.compare'), 
      icon: Globe, 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-50 dark:bg-green-900/20',
      description: t('help.cat.compare_desc')
    },
    { 
      id: 'social', 
      label: t('help.cat.social'), 
      icon: Users, 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      description: t('help.cat.social_desc')
    },
    { 
      id: 'settings', 
      label: t('help.cat.settings'), 
      icon: Settings, 
      color: 'text-gray-600 dark:text-gray-400', 
      bg: 'bg-gray-50 dark:bg-gray-700/50',
      description: t('help.cat.settings_desc')
    },
  ], [t]);

  const FAQS = useMemo(() => [
    { id: 'local-first', category: 'start', question: t('help.faq.local_first.q'), answer: t('help.faq.local_first.a') },
    { id: 'currency-region', category: 'start', question: t('help.faq.currency.q'), answer: t('help.faq.currency.a') },
    { id: 'account-recovery', category: 'start', question: t('help.faq.account.q'), answer: t('help.faq.account.a') },
    
    // Limitations
    { id: 'limit-storage', category: 'limitations', question: t('help.faq.limit_storage.q'), answer: t('help.faq.limit_storage.a') },
    { id: 'limit-currency', category: 'limitations', question: t('help.faq.limit_currency.q'), answer: t('help.faq.limit_currency.a') },
    { id: 'limit-support', category: 'limitations', question: t('help.faq.limit_support.q'), answer: t('help.faq.limit_support.a') },
    
    // Add more mapped FAQs here if needed based on translation keys
  ], [t]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === faq.category;
    return searchQuery ? matchesSearch : matchesCategory;
  });

  const activeCategoryData = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="relative min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12 animate-in fade-in duration-500">
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className={activeCategory === 'limitations' ? 'text-amber-500' : 'text-gray-900 dark:text-white'}>
            <BackgroundVisual categoryId={activeCategory} />
         </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">{t('help.title')}</h1>
           <p className="text-gray-500 dark:text-gray-400">{t('help.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Navigation */}
           <div className="lg:col-span-4 space-y-6 sticky top-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-1">
                 <div className="relative">
                    <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input 
                       type="text" 
                       placeholder={t('help.search')}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none placeholder-gray-400 text-gray-900 dark:text-white"
                    />
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                 <div className="p-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('help.topics')}</h3>
                 </div>
                 <div className="p-2 space-y-1">
                    {CATEGORIES.map(cat => (
                       <button
                          key={cat.id}
                          onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                          className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group text-left ${
                             activeCategory === cat.id && !searchQuery
                             ? `${cat.bg} shadow-sm ring-1 ring-black/5 dark:ring-white/10` 
                             : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                       >
                          <div className={`p-2 rounded-lg ${activeCategory === cat.id ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600'} transition-colors mr-3`}>
                             <cat.icon size={18} className={activeCategory === cat.id ? cat.color : 'text-gray-500 dark:text-gray-400'} />
                          </div>
                          <div>
                             <span className={`block text-sm font-bold ${activeCategory === cat.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                {cat.label}
                             </span>
                             <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                {cat.description}
                             </span>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Content */}
           <div className="lg:col-span-8 space-y-6">
              
              {!searchQuery && (
                 <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                       <div className={`inline-flex p-3 rounded-xl mb-4 ${activeCategoryData?.bg}`}>
                          {activeCategoryData && React.createElement(activeCategoryData.icon, { size: 24, className: activeCategoryData.color })}
                       </div>
                       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeCategoryData?.label}</h2>
                       <p className="text-gray-500 dark:text-gray-400 max-w-md">
                          {activeCategoryData?.description}
                       </p>
                    </div>
                 </div>
              )}

              {/* Special Warning Banner for Limitations */}
              {activeCategory === 'limitations' && !searchQuery && (
                 <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg shrink-0">
                       <ServerOff size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">{t('help.mvp_notice')}</h3>
                       <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                          {t('help.cat.limitations_desc')}
                       </p>
                    </div>
                 </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                 {filteredFaqs.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                       {filteredFaqs.map((faq) => (
                          <div key={faq.id} className="group">
                             <button 
                                onClick={() => toggleItem(faq.id)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
                             >
                                <div className="flex items-center gap-3">
                                   {faq.category === 'limitations' ? (
                                      <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />
                                   ) : (
                                      <HelpCircle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                                   )}
                                   <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
                                </div>
                                {openItems.includes(faq.id) ? (
                                   <ChevronUp size={18} className="text-blue-500" />
                                ) : (
                                   <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                )}
                             </button>
                             {openItems.includes(faq.id) && (
                                <div className="px-6 pb-6 pt-0 ml-7">
                                   <div className={`text-sm leading-relaxed p-4 rounded-xl border animate-in fade-in slide-in-from-top-1 duration-200 ${
                                      faq.category === 'limitations' 
                                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-100'
                                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                   }`}>
                                      {faq.answer}
                                   </div>
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-12 text-center">
                       <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700 mb-4">
                          <Search size={28} className="text-gray-400" />
                       </div>
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('help.no_results')}</h3>
                       <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search terms.</p>
                    </div>
                 )}
              </div>

              {/* Support Footer Block */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                 
                 <div className="relative z-10 sm:flex items-center justify-between">
                    <div className="mb-6 sm:mb-0">
                       <div className="flex items-center gap-2 mb-3 text-gray-300">
                          <Info size={16} />
                          <span className="text-sm font-medium">{t('help.mvp_notice')}</span>
                       </div>
                       <h3 className="text-xl font-bold mb-2">{t('help.report')}</h3>
                       <p className="text-gray-400 text-sm max-w-sm">Found a bug? Let us know.</p>
                    </div>
                    <div>
                       <button 
                         onClick={() => setIsContactModalOpen(true)}
                         className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-md active:scale-95 w-full sm:w-auto"
                       >
                          <Mail size={18} />
                          <span>{t('help.contact')}</span>
                       </button>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>

      <ContactSupportModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
}
