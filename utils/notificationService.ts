
import { Subscription } from '../components/SubscriptionModal';

// --- Constants ---
const NOTIFICATION_STORAGE_KEY = 'subsense_notified';
const REMINDER_DAYS = 3; // Notify 3 days before renewal

// --- Localisation helpers ---
// Reads the user's language preference from localStorage (same key as LanguageContext).
// notificationService cannot import React context, so it reads directly from storage.
const getLang = (): 'tr' | 'en' => {
    const stored = localStorage.getItem('userLanguagePreference');
    return stored === 'tr' ? 'tr' : 'en';
};

/** Returns localised day-distance text like "Today", "Tomorrow", "In 3 days" */
const dayDistanceText = (daysUntil: number): string => {
    const lang = getLang();
    if (lang === 'tr') {
        if (daysUntil === 0) return 'Bugün';
        if (daysUntil === 1) return 'Yarın';
        return `${daysUntil} gün içinde`;
    }
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
};

/** Returns localised "renews X" phrase for push notification title */
const renewsTitleText = (name: string, daysUntil: number): string => {
    const lang = getLang();
    const when = dayDistanceText(daysUntil).toLowerCase();
    if (lang === 'tr') {
        return `💳 ${name} ${when} yenileniyor`;
    }
    return `💳 ${name} renews ${when}`;
};

/** Returns localised "renews X" phrase for in-app notification text */
const renewsInAppText = (name: string, currency: string, price: number, daysUntil: number): string => {
    const lang = getLang();
    const when = dayDistanceText(daysUntil);
    const priceStr = `${currency} ${price.toFixed(2)}`;
    if (lang === 'tr') {
        return `${name} ${when.toLowerCase()} yenileniyor — ${priceStr}`;
    }
    return `${name} renews ${when.toLowerCase()} — ${priceStr}`;
};

/** Returns localised cycle label for push notification body */
const cycleText = (cycle: string): string => {
    const lang = getLang();
    if (lang === 'tr') {
        return cycle === 'Yearly' ? 'Yıllık abonelik' : 'Aylık abonelik';
    }
    return `${cycle} subscription`;
};

/** Returns localised budget-exceeded notification texts */
const budgetExceededText = (category: string): { title: string; body: string } => {
    const lang = getLang();
    if (lang === 'tr') {
        return {
            title: `⚠️ Bütçe aşıldı: ${category}`,
            body: `Bu ay ${category} bütçenizi aştınız.`,
        };
    }
    return {
        title: `⚠️ Budget exceeded: ${category}`,
        body: `You've gone over your ${category} budget this month.`,
    };
};

// --- Permission ---

/**
 * Requests browser notification permission.
 * Returns true if granted, false otherwise.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
};

/**
 * Returns current notification permission status.
 */
export const getNotificationStatus = (): NotificationPermission | 'unsupported' => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
};

// --- Renewal Checking ---

interface RenewalAlert {
    subscription: Subscription;
    daysUntil: number;
}

/**
 * Finds subscriptions renewing within REMINDER_DAYS.
 */
export const getUpcomingRenewals = (subscriptions: Subscription[]): RenewalAlert[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return subscriptions
        .filter(sub => sub.status === 'Active' || !sub.status)
        .map(sub => {
            const nextDate = new Date(sub.nextDate);
            if (isNaN(nextDate.getTime())) return null;

            nextDate.setHours(0, 0, 0, 0);
            const diffMs = nextDate.getTime() - now.getTime();
            const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (daysUntil >= 0 && daysUntil <= REMINDER_DAYS) {
                return { subscription: sub, daysUntil };
            }
            return null;
        })
        .filter((alert): alert is RenewalAlert => alert !== null)
        .sort((a, b) => a.daysUntil - b.daysUntil);
};

// --- Browser Notifications ---

/**
 * Gets the set of subscription IDs that were already notified today.
 */
const getNotifiedToday = (): Set<string> => {
    try {
        const data = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        if (!data) return new Set();
        const parsed = JSON.parse(data);
        const today = new Date().toDateString();
        if (parsed.date !== today) return new Set(); // Reset each day
        return new Set(parsed.ids || []);
    } catch {
        return new Set();
    }
};

/**
 * Marks a subscription as notified today.
 */
const markAsNotified = (subId: string) => {
    const notified = getNotifiedToday();
    notified.add(subId);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify({
        date: new Date().toDateString(),
        ids: Array.from(notified)
    }));
};

/**
 * Sends browser push notifications for upcoming renewals (localised EN/TR).
 * Skips subscriptions that were already notified today.
 */
export const sendRenewalNotifications = (subscriptions: Subscription[]): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const alerts = getUpcomingRenewals(subscriptions);
    const notified = getNotifiedToday();

    alerts.forEach(({ subscription, daysUntil }) => {
        if (notified.has(String(subscription.id))) return; // Already notified today

        const priceText = `${subscription.currency} ${subscription.price.toFixed(2)}`;

        try {
            new Notification(renewsTitleText(subscription.name, daysUntil), {
                body: `${priceText} • ${cycleText(subscription.cycle)}`,
                icon: '/favicon.ico',
                tag: `renewal-${subscription.id}`, // Prevents duplicate browser notifications
                silent: false
            });
            markAsNotified(String(subscription.id));
        } catch (e) {
            console.warn('Failed to show notification', e);
        }
    });
};

/**
 * Sends browser push notifications when a category exceeds its budget (localised EN/TR).
 * Runs once per category per day to avoid spam.
 */
export const sendBudgetAlertNotifications = (
    categoryBreakdown: Record<string, number>,
    budgetLimits: Record<string, number>
): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const BUDGET_KEY = 'subsense_budget_notified';
    const today = new Date().toDateString();

    let notifiedToday: Set<string>;
    try {
        const stored = localStorage.getItem(BUDGET_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        notifiedToday = parsed?.date === today ? new Set(parsed.cats || []) : new Set();
    } catch {
        notifiedToday = new Set();
    }

    let changed = false;
    Object.entries(budgetLimits).forEach(([cat, limit]) => {
        if (limit <= 0) return;
        const spent = categoryBreakdown[cat] || 0;
        if (spent > limit && !notifiedToday.has(cat)) {
            const { title, body } = budgetExceededText(cat);
            try {
                new Notification(title, {
                    body,
                    icon: '/favicon.ico',
                    tag: `budget-${cat}`,
                });
                notifiedToday.add(cat);
                changed = true;
            } catch { /* ignore */ }
        }
    });

    if (changed) {
        try {
            localStorage.setItem(BUDGET_KEY, JSON.stringify({ date: today, cats: Array.from(notifiedToday) }));
        } catch { /* ignore */ }
    }
};

/**
 * Generates in-app notification objects from upcoming renewals (localised EN/TR).
 * Use this to populate the Dashboard notification dropdown.
 */
export const generateRenewalNotifications = (subscriptions: Subscription[]): Array<{
    id: string;
    text: string;
    time: string;
    read: boolean;
    type: 'renewal';
}> => {
    const alerts = getUpcomingRenewals(subscriptions);

    return alerts.map(({ subscription, daysUntil }) => {
        const timeLabel = dayDistanceText(daysUntil);
        return {
            id: `renewal-${subscription.id}`,
            text: renewsInAppText(subscription.name, subscription.currency, subscription.price, daysUntil),
            time: timeLabel,
            read: false,
            type: 'renewal' as const
        };
    });
};
