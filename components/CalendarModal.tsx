import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
}

const getEffectivePrice = (s: Subscription): number =>
  s.isShared && s.myShare ? s.myShare : s.price;

const parseLocalDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatICSDate = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

export default function CalendarModal({ isOpen, onClose, subscriptions }: CalendarModalProps) {
  const { t, currentCurrency, currentLanguage, convert, formatPrice } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Reset to current month when opening
  useEffect(() => {
    if (isOpen) setCurrentDate(new Date());
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun

  const monthName = currentDate.toLocaleString(
    currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleExportICS = () => {
    const events = subscriptions
      .filter((sub) => sub.status !== 'Inactive')
      .map((sub) => {
        const eventDate =
          sub.status === 'Trial' && sub.trialEndDate
            ? parseLocalDate(sub.trialEndDate)
            : parseLocalDate(sub.nextDate);
        if (!eventDate) return '';

        const dateStr = formatICSDate(eventDate);
        const rrule = sub.cycle === 'Yearly' ? 'FREQ=YEARLY' : 'FREQ=MONTHLY';
        const effectivePrice = getEffectivePrice(sub);
        const curr = sub.currency || currentCurrency;
        const planText = sub.plan ? ` (${sub.plan})` : '';

        return [
          'BEGIN:VEVENT',
          `SUMMARY:${sub.name}${sub.status === 'Trial' ? ' (Trial Ends)' : ' Payment'}`,
          `DTSTART;VALUE=DATE:${dateStr}`,
          ...(sub.status === 'Trial' && sub.trialEndDate ? [] : [`RRULE:${rrule}`]),
          `DESCRIPTION:Payment of ${effectivePrice.toFixed(2)} ${curr} for ${sub.name}${planText}.`,
          'END:VEVENT',
        ].join('\n');
      })
      .filter(Boolean)
      .join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aboneyim//Subscription Tracker//EN
X-WR-CALNAME:Aboneyim Payments
X-WR-TIMEZONE:UTC
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
    URL.revokeObjectURL(url);
  };

  // Map active & trial subscriptions to days in the viewed (year, month)
  const subsByDay = useMemo(() => {
    const map: Record<number, Subscription[]> = {};

    subscriptions.forEach((sub) => {
      if (sub.status === 'Inactive') return;

      let day: number | null = null;

      if (sub.status === 'Trial' && sub.trialEndDate) {
        const trialDate = parseLocalDate(sub.trialEndDate);
        if (
          trialDate &&
          trialDate.getFullYear() === year &&
          trialDate.getMonth() === month
        ) {
          day = trialDate.getDate();
        }
      } else if (sub.cycle === 'Yearly') {
        const nextDate = parseLocalDate(sub.nextDate);
        if (nextDate && nextDate.getMonth() === month) {
          const rawDay = sub.billingDay || nextDate.getDate();
          day = Math.min(Math.max(1, rawDay), daysInMonth);
        }
      } else {
        const nextDate = parseLocalDate(sub.nextDate);
        const rawDay = sub.billingDay || (nextDate ? nextDate.getDate() : 1) || 1;
        day = Math.min(Math.max(1, rawDay), daysInMonth);
      }

      if (day !== null) {
        if (!map[day]) map[day] = [];
        map[day].push(sub);
      }
    });

    return map;
  }, [subscriptions, year, month, daysInMonth]);

  // Calculate converted total in user's base currency for the viewed month
  const monthlyTotal = useMemo(() => {
    const allMonthSubs: Subscription[] = [];
    Object.keys(subsByDay).forEach((k) => {
      allMonthSubs.push(...subsByDay[Number(k)]);
    });
    return allMonthSubs.reduce(
      (acc, sub) => acc + convert(getEffectivePrice(sub), sub.currency || 'USD'),
      0
    );
  }, [subsByDay, convert, currentCurrency]);

  if (!isOpen) return null;

  const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const now = new Date();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('calendar.title')}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('calendar.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportICS}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={t('calendar.export_tooltip')}
            >
              <Download size={14} /> <span className="hidden sm:inline">{t('calendar.add_to_calendar')}</span>
              <span className="sm:hidden">iCal</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-lg transition-all text-gray-600 dark:text-gray-400"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-gray-900 dark:text-white text-lg select-none min-w-[140px] text-center capitalize">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-lg transition-all text-gray-600 dark:text-gray-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((dayKey) => (
              <div
                key={dayKey}
                className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2"
              >
                {t(`calendar.day.${dayKey}`)}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr gap-2 h-full min-h-[400px]">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50/30 dark:bg-gray-800/20 rounded-xl"></div>
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const subs = subsByDay[day] || [];
              const isToday =
                now.getDate() === day &&
                now.getMonth() === month &&
                now.getFullYear() === year;
              const dayTotal = subs.reduce(
                (acc, s) => acc + convert(getEffectivePrice(s), s.currency || 'USD'),
                0
              );

              return (
                <div
                  key={day}
                  className={`relative border rounded-xl p-2 flex flex-col transition-all hover:shadow-md group min-h-[80px] ${
                    isToday
                      ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 shrink-0 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {day}
                    </span>
                    {dayTotal > 0 && (
                      <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 truncate">
                        {formatPrice(dayTotal)}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1 content-start">
                    {subs.map((sub, idx) => {
                      const convertedSubPrice = convert(
                        getEffectivePrice(sub),
                        sub.currency || 'USD'
                      );
                      return (
                        <div key={`${sub.id}-${idx}`} className="relative group/icon">
                          <BrandIcon
                            type={sub.type}
                            className={`w-6 h-6 rounded-md shadow-sm border ${
                              sub.status === 'Trial'
                                ? 'border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/30'
                                : 'border-gray-100 dark:border-gray-700'
                            }`}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity z-20 pointer-events-none">
                            <p className="font-bold truncate">{sub.name}</p>
                            <p>{formatPrice(convertedSubPrice)}</p>
                            {sub.status === 'Trial' && (
                              <p className="text-amber-300 font-semibold">{t('calendar.trial_badge')}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('calendar.showing_payments')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('calendar.est_total')}
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(monthlyTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
