
import { useState, useEffect } from 'react';
import { User } from '../App';
import { Subscription } from '../components/SubscriptionModal';
import { checkAchievements, ACHIEVEMENTS } from '../utils/achievements';
import { getUserDocument, updateAchievements } from '../utils/firestore';

export const useAchievements = (user: User, subscriptions: Subscription[], totalSaved: number) => {
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

    useEffect(() => {
        if (!user || user.uid === 'guest') return;

        const syncAchievements = async () => {
            // 1. Get currently stored achievements
            const userDoc = await getUserDocument(user.uid || '');
            const storedInternal = userDoc?.achievements || [];

            // 2. Calculate what *should* be unlocked
            const calculated = checkAchievements(user, subscriptions, totalSaved);

            // 3. Find diff
            const newUnlocks = calculated.filter(id => !storedInternal.includes(id));

            if (newUnlocks.length > 0) {
                // 4. Update state and persistence
                const updatedList = [...new Set([...storedInternal, ...newUnlocks])];
                await updateAchievements(user.uid || '', updatedList);
                setUnlockedIds(updatedList);
                setNewlyUnlocked(newUnlocks);
            } else {
                setUnlockedIds(storedInternal.length > calculated.length ? storedInternal : calculated);
            }
        };

        syncAchievements();
    }, [user, subscriptions, totalSaved]);

    return { unlockedIds, newlyUnlocked, allAchievements: ACHIEVEMENTS };
};
