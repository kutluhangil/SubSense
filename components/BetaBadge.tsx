
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BetaModal from './BetaModal';
import { useAuth } from '../contexts/AuthContext';
import { updateAchievements, getUserDocument } from '../utils/firestore';

const BetaBadge = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const { currentUser } = useAuth();

    const handleClick = async () => {
        // Increment click count for Easter Egg
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount === 5) {
            // Easter Egg Trigger!
            triggerEasterEgg();
        } else {
            // Normal behavior: Open modal
            setIsModalOpen(true);
        }

        // Reset count after a delay so it requires rapid clicks
        setTimeout(() => {
            setClickCount(0);
        }, 2000);
    };

    const triggerEasterEgg = async () => {
        // Visual or Sound effect could go here
        console.log("🧪 Beta Secret Found!");

        if (currentUser) {
            try {
                const userDoc = await getUserDocument(currentUser.uid);
                const currentAchievements = userDoc?.achievements || [];

                if (!currentAchievements.includes('beta_explorer')) {
                    await updateAchievements(currentUser.uid, [...currentAchievements, 'beta_explorer']);
                    // We could show a specific toast here, but relying on the Badge component might be tricky for global toasts.
                    // The user will see it in their Profile next time they check.
                    alert("🧪 You found a beta secret! 'Beta Explorer' badge unlocked.");
                }
            } catch (e) {
                console.error("Failed to unlock achievement", e);
            }
        }
    };

    return (
        <>
            <div
                className="relative group inline-flex items-center ml-2 cursor-pointer z-50 select-none"
                onClick={handleClick}
            >
                {/* Animated Badge */}
                <motion.div
                    className="relative px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-[10px] font-bold text-white shadow-lg overflow-hidden"
                    initial={{ opacity: 0.8 }}
                    animate={{
                        opacity: [0.8, 1, 0.8],
                        scale: [1, 1.05, 1],
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {/* Shimmer Effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                            x: ['-100%', '200%']
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 1
                        }}
                    />

                    <span className="relative z-10 tracking-wider">BETA</span>

                    {/* Glow Element */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-600 blur-md opacity-50"
                        animate={{
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            yoyo: Infinity
                        }}
                    />
                </motion.div>

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-64 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-[100]">
                    <div className="relative bg-gray-900/95 dark:bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-gray-700 dark:border-gray-200 text-left">
                        {/* Arrow */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 dark:bg-white/95 border-l border-t border-gray-700 dark:border-gray-200 transform rotate-45"></div>

                        <h4 className="text-orange-400 dark:text-orange-600 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            ⚠️ Beta Mode Enabled
                        </h4>
                        <p className="text-gray-300 dark:text-gray-700 text-xs leading-relaxed font-medium">
                            This product is in Beta. Things may break. Features may change. You’re early — that’s the deal.
                            <br /><br />
                            <span className="text-white dark:text-gray-900 font-bold">Click for details or to report bugs.</span>
                        </p>

                        {/* Animated Underline/Border Effect */}
                        <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default BetaBadge;
