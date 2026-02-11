
import { Subscription } from '../components/SubscriptionModal';

// --- Constants ---
const NOTIFICATION_STORAGE_KEY = 'subsense_notified';
const REMINDER_DAYS = 3; // Notify 3 days before renewal

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
 * Sends browser push notifications for upcoming renewals.
 * Skips subscriptions that were already notified today.
 */
export const sendRenewalNotifications = (subscriptions: Subscription[]): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const alerts = getUpcomingRenewals(subscriptions);
    const notified = getNotifiedToday();

    alerts.forEach(({ subscription, daysUntil }) => {
        if (notified.has(String(subscription.id))) return; // Already notified today

        const dayText = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
        const priceText = `${subscription.currency} ${subscription.price.toFixed(2)}`;

        try {
            new Notification(`💳 ${subscription.name} renews ${dayText}`, {
                body: `${priceText} • ${subscription.cycle} subscription`,
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
 * Generates in-app notification objects from upcoming renewals.
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
        const dayText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
        return {
            id: `renewal-${subscription.id}`,
            text: `${subscription.name} renews ${dayText.toLowerCase()} — ${subscription.currency} ${subscription.price.toFixed(2)}`,
            time: dayText,
            read: false,
            type: 'renewal' as const
        };
    });
};
