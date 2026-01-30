
import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
}

export default function CalendarModal({ isOpen, onClose, subscriptions }: CalendarModalProps) {
  const { t, formatPrice } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Reset to current month when opening
  React.useEffect(() => {
    if (isOpen) setCurrentDate(new Date());
  }, [isOpen]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun
  
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleExportICS = () => {
    const events = subscriptions.map(sub => {
        const nextDate = new Date(sub.nextDate);
        if (isNaN(nextDate.getTime())) return '';
        
        // Format date to YYYYMMDD
        const dateStr = nextDate.toISOString().replace(/-|:|\.\d\d\d/g, "").split("T")[0];
        const rrule = sub.cycle === 'Monthly' ? 'FREQ=MONTHLY' : 'FREQ=YEARLY';
        
        return `BEGIN:VEVENT
SUMMARY:${sub.name} Payment
DTSTART;VALUE=DATE:${dateStr}
RRULE:${rrule}
DESCRIPTION:Payment of ${sub.price} ${sub.currency} for ${sub.plan} plan.
END:VEVENT`;
    }).join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SubscriptionHub//MVP//EN
${events}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'subscriptions.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map subscriptions to days
  const subsByDay = useMemo(() => {
    const map: Record<number, Subscription[]> = {};
    subscriptions.forEach(sub => {
      // Use billingDay if available, otherwise parse from nextDate string
      let day = sub.billingDay;
      if (!day) {
         const date = new Date(sub.nextDate);
         if (!isNaN(date.getTime())) day = date.getDate();
      }
      
      if (day) {
        if (!map[day]) map[day] = [];
        map[day].push(sub);
      }
    });
    return map;
  }, [subscriptions]);

  // Calculate total for this month view
  const monthlyTotal = subscriptions.reduce((acc, sub) => {
      // Simple logic: assume all monthly subs active this month
      if (sub.cycle === 'Monthly' && sub.status === 'Active') return acc + sub.price;
      // Yearly logic could be complex (check if this specific month), omitting for simple demo
      return acc;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <CalendarIcon size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-gray-900">Subscription Calendar</h2>
                <p className="text-xs text-gray-500">Overview of your billing cycle</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={handleExportICS}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                title="Export to Google Calendar, Apple Calendar, or Outlook"
             >
                <Download size={14} /> Add to Calendar
             </button>
             <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
             >
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-100">
           <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
              <ChevronLeft size={20} />
           </button>
           <span className="font-bold text-gray-900 text-lg select-none min-w-[140px] text-center">
              {monthName}
           </span>
           <button onClick={handleNextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
              <ChevronRight size={20} />
           </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
           {/* Days Header */}
           <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
                    {day}
                 </div>
              ))}
           </div>

           {/* Days Grid */}
           <div className="grid grid-cols-7 grid-rows-5 gap-2 h-full min-h-[400px]">
              {/* Empty slots for start of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                 <div key={`empty-${i}`} className="bg-gray-50/30 rounded-xl"></div>
              ))}

              {/* Actual Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                 const day = i + 1;
                 const subs = subsByDay[day] || [];
                 const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                 const dayTotal = subs.reduce((acc, s) => acc + s.price, 0);

                 return (
                    <div 
                       key={day} 
                       className={`relative border rounded-xl p-2 flex flex-col transition-all hover:shadow-md group min-h-[80px] ${
                          isToday 
                          ? 'bg-blue-50/50 border-blue-200' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                       }`}
                    >
                       <div className="flex justify-between items-start">
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                             {day}
                          </span>
                          {dayTotal > 0 && (
                             <span className="text-[9px] font-semibold text-gray-400">
                                {formatPrice(dayTotal)}
                             </span>
                          )}
                       </div>
                       
                       <div className="mt-2 flex flex-wrap gap-1 content-start">
                          {subs.map((sub, idx) => (
                             <div key={idx} className="relative group/icon">
                                <BrandIcon type={sub.type} className="w-6 h-6 rounded-md shadow-sm border border-gray-100" />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[120px] bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity z-20 pointer-events-none">
                                   <p className="font-bold">{sub.name}</p>
                                   <p>{formatPrice(sub.price)}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
           <div className="text-xs text-gray-500">
              Showing active recurring payments for this month.
           </div>
           <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Est. Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(monthlyTotal)}</span>
           </div>
        </div>

      </div>
    </div>
  );
}
