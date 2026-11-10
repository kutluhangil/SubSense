import type { AppSettings, Subscription, PriceChange } from '../types';
import { daysUntil, longDate, convert, formatMoney, parseDate } from './format';
import { subCyclePrice } from './pricing';
import { tStatic, type Lang } from './i18n';
import { LocalNotifications } from '@capacitor/local-notifications';
import { desktopNotify, isDesktop, isNative } from './native';

/** Stable positive 32-bit id from a subscription id (native notifications need ints). */
function notifId(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) >>> 0;
  return (h % 2_000_000_000) + 1;
}

async function nativePermitted(): Promise<boolean> {
  const cur = await LocalNotifications.checkPermissions();
  if (cur.display === 'granted') return true;
  if (cur.display === 'denied') return false;
  return (await LocalNotifications.requestPermissions()).display === 'granted';
}

/** Phones: cancel and reschedule a 10:00 reminder on each renewal (soonest 60, iOS caps at 64). */
async function scheduleNative(subs: Subscription[], settings: AppSettings, rates: Record<string, number>) {
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  if (!settings.notificationsEnabled || !settings.renewalAlerts || !(await nativePermitted())) return;
  const lang: Lang = settings.language === 'tr' ? 'tr' : 'en';
  const base = settings.baseCurrency;
  const now = Date.now();
  const list = subs
    .filter((s) => s.status !== 'Inactive' && s.reminderEnabled !== false)
    .map((s) => {
      const at = parseDate(s.nextDate);
      if (!at) return null;
      at.setHours(10, 0, 0, 0);
      if (at.getTime() <= now) return null;
      return {
        id: notifId(s.id),
        title: tStatic(lang, 'notif.title', { name: s.name }),
        body: tStatic(lang, 'notif.body', { amount: formatMoney(subCyclePrice(s, base, rates), base), date: longDate(s.nextDate) }),
        schedule: { at },
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .sort((a, b) => a.schedule.at.getTime() - b.schedule.at.getTime())
    .slice(0, 60);
  if (list.length) await LocalNotifications.schedule({ notifications: list });
}

const SENT_KEY = 'subsense.notified.v1';

/** Active, reminder-enabled renewals due within `days` that were not announced yet. */
export function dueReminders(subs: Subscription[], sent: Record<string, string>, days = 3): Subscription[] {
  return subs.filter((s) => {
    if (s.status === 'Inactive' || s.reminderEnabled === false) return false;
    const d = daysUntil(s.nextDate);
    return d >= 0 && d <= days && sent[s.id] !== s.nextDate;
  });
}

function readSent(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

async function permitted(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

/**
 * Browser has no scheduler, so on each app open we announce renewals due in the next
 * 3 days once per billing date. The desktop app replaces this with native scheduling.
 */
export async function syncRenewalNotifications(subs: Subscription[], settings: AppSettings, rates: Record<string, number>): Promise<void> {
  if (isNative) return scheduleNative(subs, settings, rates).catch(() => {});
  if (!settings.notificationsEnabled || !settings.renewalAlerts) return;
  const sent = readSent();
  const due = dueReminders(subs, sent);
  if (!due.length || (!isDesktop && !(await permitted()))) return;
  const lang: Lang = settings.language === 'tr' ? 'tr' : 'en';
  const base = settings.baseCurrency;
  for (const s of due) {
    const amount = formatMoney(subCyclePrice(s, base, rates), base);
    const title = tStatic(lang, 'notif.title', { name: s.name });
    const body = tStatic(lang, 'notif.body', { amount, date: longDate(s.nextDate) });
    if (isDesktop) await desktopNotify(title, body);
    else new Notification(title, { body, tag: `renew:${s.id}:${s.nextDate}` });
    sent[s.id] = s.nextDate;
  }
  localStorage.setItem(SENT_KEY, JSON.stringify(sent));
}

export async function notifyPriceChanges(changes: PriceChange[], settings: AppSettings, rates: Record<string, number>): Promise<void> {
  if (isNative) {
    if (!settings.notificationsEnabled || !changes.length || !(await nativePermitted().catch(() => false))) return;
    const lang: Lang = settings.language === 'tr' ? 'tr' : 'en';
    await LocalNotifications.schedule({
      notifications: changes.map((c) => ({
        id: notifId('price:' + c.id),
        title: tStatic(lang, 'notif.priceTitle'),
        body: tStatic(lang, 'notif.priceBody', { name: c.name, price: formatMoney(convert(c.toUsd, 'USD', settings.baseCurrency, rates), settings.baseCurrency) }),
        schedule: { at: new Date(Date.now() + 1500) },
      })),
    }).catch(() => {});
    return;
  }
  if (!settings.notificationsEnabled || !changes.length || (!isDesktop && !(await permitted()))) return;
  const lang: Lang = settings.language === 'tr' ? 'tr' : 'en';
  if (isDesktop) {
    for (const c of changes) await desktopNotify(tStatic(lang, 'notif.priceTitle'), tStatic(lang, 'notif.priceBody', { name: c.name, price: formatMoney(convert(c.toUsd, 'USD', settings.baseCurrency, rates), settings.baseCurrency) }));
    return;
  }
  for (const c of changes) {
    new Notification(tStatic(lang, 'notif.priceTitle'), {
      body: tStatic(lang, 'notif.priceBody', {
        name: c.name,
        price: formatMoney(convert(c.toUsd, 'USD', settings.baseCurrency, rates), settings.baseCurrency),
      }),
      tag: `price:${c.id}`,
    });
  }
}
