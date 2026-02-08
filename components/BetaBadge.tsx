
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaModal from './BetaModal';
import { useAuth } from '../contexts/AuthContext';
import { updateAchievements, getUserDocument } from '../utils/firestore';

const BetaBadge = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const { currentUser } = useAuth();

    // Interaction Handlers
    const handleClick = async () => {
        // Increment click count for Easter Egg
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount === 5) {
            triggerEasterEgg();
            setClickCount(0);
        } else {
            // Normal behavior: Open modal
            setIsModalOpen(true);
        }

        // Reset count after a delay
        setTimeout(() => setClickCount(0), 2000);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    // Mobile tap handler (simulated via click for simplicity in this context, 
    // but in a real touch environment we might want distinct touch start/end logic.
    // Here, click opens modal, so hover is main "tooltip" trigger on desktop.
    // On mobile, prolonged press/tap might be needed, but requirements say "Tap mobile" -> tooltip.
    // However, click also opens modal. To avoid conflict, we'll keep tooltip on hover 
    // and rely on the modal for the full details on click.)

    const triggerEasterEgg = async () => {
        console.log("🧪 Beta Secret Found!");
        if (currentUser) {
            try {
                const userDoc = await getUserDocument(currentUser.uid);
                const currentAchievements = userDoc?.achievements || [];

                if (!currentAchievements.includes('beta_explorer')) {
                    await updateAchievements(currentUser.uid, [...currentAchievements, 'beta_explorer']);
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
                className="relative inline-flex items-center ml-3 align-middle select-none z-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* 
            Badge Container 
            - Pill shape
            - Rainbow subtle border (via background gradient + padding)
          */}
                <motion.button
                    onClick={handleClick}
                    className="relative p-[1px] rounded-full overflow-hidden group focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Beta Information"
                >
                    {/* Rainbow Border Gradient (Spinning/Moving optionally, but keeping it subtle) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 opacity-80" />

                    {/* Inner Content (Lava Background) */}
                    <div className="relative px-2.5 py-0.5 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
                        {/* Lava/Fire Animation Background */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-orange-600/40 via-red-600/40 to-orange-600/40 blur-sm"
                            animate={{
                                x: ['-100%', '100%'],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />

                        {/* Pulse effect */}
                        <motion.div
                            className="absolute inset-0 bg-orange-500/20"
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Text */}
                        <span className="relative z-10 text-[10px] font-black text-white tracking-widest uppercase text-shadow-sm">
                            BETA
                        </span>
                    </div>
                </motion.button>

                {/* Tooltip */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 5 }} // Positioned just below
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] z-[60]"
                        >
                            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl text-center">
                                {/* Rainbow Text Gradient */}
                                <p className="text-sm font-medium leading-relaxed bg-gradient-to-r from-orange-200 via-pink-200 to-white bg-clip-text text-transparent">
                                    This is a Beta.<br />
                                    Yes, things might break.<br />
                                    If you want perfection, come back later.<br />
                                    If you want the future — welcome aboard. 🚀
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </>
    );
};

export default BetaBadge;
