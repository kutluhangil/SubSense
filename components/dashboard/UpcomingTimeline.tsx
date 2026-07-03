import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Subscription } from '../SubscriptionModal';
import { BrandIcon } from '../BrandIcon';
import { getUpcomingRenewals } from '../../utils/notificationService';

interface UpcomingTimelineProps {
   subscriptions: Subscription[];
   subscriptionsLoading: boolean;
   setIsCalendarOpen: (open: boolean) => void;
   setSelectedSub: (sub: Subscription) => void;
   handleMarkAsPaid: (id: string | number) => void;
}

export default function UpcomingTimeline({ 
   subscriptions, 
   subscriptionsLoading, 
   setIsCalendarOpen, 
   setSelectedSub, 
   handleMarkAsPaid 
}: UpcomingTimelineProps) {
   const { t, formatPrice } = useLanguage();
   const upcoming = [...subscriptions].sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()).slice(0, 4);

   if (upcoming.length === 0 && !subscriptionsLoading) {
      return (
         <div className="bg-card rounded-2xl border border-subtle shadow-sm p-6 text-center">
            <h3 className="font-bold text-primary text-sm mb-2">{t('dashboard.upcoming')}</h3>
            <p className="text-xs text-muted">{t('dashboard.no_upcoming')}</p>
         </div>
      );
   }

   return (
      <div className="bg-card rounded-2xl border border-subtle shadow-sm p-6">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-primary text-sm flex items-center gap-2">
               <Calendar size={16} className="text-muted" /> {t('dashboard.upcoming')}
            </h3>
            <button
               onClick={() => setIsCalendarOpen(true)}
               className="text-[10px] font-bold text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
               {t('dashboard.view_calendar')}
            </button>
         </div>
         {subscriptionsLoading ? (
            <div className="space-y-4">
               {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>)}
            </div>
         ) : (
            <div className="space-y-4">
               {upcoming.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 group">
                     <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-subtle flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform cursor-pointer" onClick={() => setSelectedSub(sub)}>
                        <BrandIcon type={sub.type} logo={sub.logo} className="w-6 h-6" noBackground />
                     </div>
                     <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedSub(sub)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                           <h4 className="text-sm font-semibold text-primary truncate pr-2">{sub.name}</h4>
                           <span className="text-xs font-bold text-primary">
                              {formatPrice(sub.price, sub.currency)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] text-secondary">{sub.nextDate}</span>
                           {(() => {
                              const renewals = getUpcomingRenewals([sub]);
                              const isRenewingSoon = renewals.length > 0;
                              if (isRenewingSoon) {
                                 const dayText = renewals[0].daysUntil === 0 ? t('dashboard.today') : renewals[0].daysUntil === 1 ? t('dashboard.tomorrow') : `${renewals[0].daysUntil}d`;
                                 return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 animate-pulse">{dayText}</span>;
                              }
                              return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${sub.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>{sub.status}</span>;
                           })()}
                        </div>
                     </div>
                     <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(sub.id); }}
                        className="p-1.5 text-muted hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title={t('dashboard.mark_paid')}
                     >
                        <CheckCircle2 size={16} />
                     </button>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
