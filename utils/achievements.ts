
import { Subscription } from '../components/SubscriptionModal';
import { User } from '../App';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Emoji or Lucide icon name
    condition: (user: User, subscriptions: Subscription[], totalSaved: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_sub',
        title: 'First Step',
        description: 'Add your first subscription.',
        icon: '🌱',
        condition: (_, subs) => subs.length >= 1
    },
    {
        id: 'power_user',
        title: 'Power User',
        description: 'Manage 5 or more subscriptions.',
        icon: '🚀',
        condition: (_, subs) => subs.length >= 5
    },
    {
        id: 'savvy_saver',
        title: 'Savvy Saver',
        description: 'Save over $100 annually by optimizing plans.',
        icon: '💰',
        condition: (_, __, saved) => saved >= 100
    },
    {
        id: 'yearly_subscriber',
        title: 'Long Term Thinker',
        description: 'Add a yearly subscription.',
        icon: '📅',
        condition: (_, subs) => subs.some(s => s.cycle === 'Yearly')
    },
    {
        id: 'diverse_portfolio',
        title: 'Diverse Portfolio',
        description: 'Have subscriptions in 3 different categories.',
        icon: '🎨',
        condition: (_, subs) => {
            const categories = new Set(subs.map(s => s.category));
            return categories.size >= 3;
        }
    },
    {
        id: 'streamer',
        title: 'Streamer',
        description: 'Subscribe to 3 or more Entertainment services.',
        icon: '🎬',
        condition: (_, subs) => subs.filter(s => s.category.includes('Entertainment')).length >= 3
    }
];

export const checkAchievements = (user: User, subscriptions: Subscription[], totalSaved: number): string[] => {
    return ACHIEVEMENTS.filter(achievement => achievement.condition(user, subscriptions, totalSaved)).map(a => a.id);
};
