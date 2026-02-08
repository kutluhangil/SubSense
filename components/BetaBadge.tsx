
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BetaModal from './BetaModal';
import { useAuth } from '../contexts/AuthContext';
import { updateAchievements, getUserDocument } from '../utils/firestore';

const BetaBadge = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showNudge, setShowNudge] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const badgeRef = useRef<HTMLButtonElement>(null);
    const { currentUser } = useAuth();

    // Timed Nudge Logic
    useEffect(() => {
        if (!currentUser) return;

        const hasSeenNudge = sessionStorage.getItem('beta_nudge_seen');
        if (hasSeenNudge) return;

        // Wait 30s before showing nudge
        const timer = setTimeout(() => {
            if (badgeRef.current) {
                setAnchorRect(badgeRef.current.getBoundingClientRect());
                setShowNudge(true);
                sessionStorage.setItem('beta_nudge_seen', 'true');

                // Auto-hide after 5s
                setTimeout(() => {
                    setShowNudge(false);
                }, 5000);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [currentUser]);

    // Interaction Handlers
    const handleClick = async () => {
        // Capture position for modal anchor
        if (badgeRef.current) {
            setAnchorRect(badgeRef.current.getBoundingClientRect());
        }

        // Increment click count for Easter Egg
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount === 5) {
            triggerEasterEgg();
            setClickCount(0);
        } else {
            // Normal behavior: Open modal
            setIsModalOpen(true);
            setIsHovered(false); // Hide tooltip
            setShowNudge(false); // Hide nudge if open
        }

        // Reset count after a delay
        setTimeout(() => setClickCount(0), 2000);
    };

    const handleMouseEnter = () => {
        if (badgeRef.current) {
            setAnchorRect(badgeRef.current.getBoundingClientRect());
        }
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

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
                {/* Badge Container */}
                <motion.button
                    ref={badgeRef}
                    onClick={handleClick}
                    className="relative p-[1px] rounded-full overflow-hidden group focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Beta Information"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 opacity-80" />
                    <div className="relative px-2.5 py-0.5 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
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
                        <motion.div
                            className="absolute inset-0 bg-orange-500/20"
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* 
                            BETA Text
                            - Base: White
                            - Logged In: Animated Rainbow Gradient
                        */}
                        <span
                            className={`relative z-10 text-[10px] font-black tracking-widest uppercase text-shadow-sm ${currentUser
                                    ? 'bg-gradient-to-r from-white via-orange-200 to-white bg-[length:200%_auto] text-transparent bg-clip-text animate-shimmer'
                                    : 'text-white'
                                }`}
                            style={{
                                animation: currentUser ? 'shimmer 3s linear infinite' : 'none'
                            }}
                        >
                            BETA
                        </span>

                        {/* Inline style for custom shimmer keyframe if needed, or rely on Tailwind config. 
                            If 'animate-shimmer' isn't in tailwind, we can use framer motion or style prop.
                            Let's use a simpler Framer Motion approach for text color to be safe.
                        */}
                        <style jsx>{`
                            @keyframes shimmer {
                                0% { background-position: 0% 50%; }
                                100% { background-position: 200% 50%; }
                            }
                        `}</style>
                    </div>
                </motion.button>
            </div>

            {/* Portal Components */}
            <BetaTooltip
                isOpen={isHovered && !isModalOpen && !showNudge}
                anchorRect={anchorRect}
            />

            <BetaNudge
                isOpen={showNudge && !isModalOpen && !isHovered}
                anchorRect={anchorRect}
            />

            <BetaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                anchorRect={anchorRect}
            />
        </>
    );
};

function BetaTooltip({ isOpen, anchorRect }: { isOpen: boolean; anchorRect: DOMRect | null }) {
    if (!isOpen || !anchorRect) return null;
    const top = anchorRect.bottom + 10;
    const left = anchorRect.left + (anchorRect.width / 2);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4, x: "-50%" }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.95, y: -4, x: "-50%" }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{ position: 'fixed', top, left, zIndex: 9999, pointerEvents: 'none' }}
                    className="w-[280px]"
                >
                    <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl text-center">
                        <p className="text-sm font-medium leading-relaxed bg-gradient-to-r from-orange-200 via-pink-200 to-white bg-clip-text text-transparent">
                            This is a Beta.<br />
                            Yes, things might break.<br />
                            If you want perfection, come back later.<br />
                            If you want the future — welcome aboard. 🚀
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function BetaNudge({ isOpen, anchorRect }: { isOpen: boolean; anchorRect: DOMRect | null }) {
    if (!isOpen || !anchorRect) return null;
    const top = anchorRect.bottom + 12; // Slightly more spacing
    // Nudge opens to the right of the badge slightly, or centered. Let's aligns left to badge left
    const left = anchorRect.left;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5, x: 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -5, x: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{ position: 'fixed', top, left, zIndex: 9999 }}
                    className="w-[220px]"
                >
                    <div className="bg-white dark:bg-gray-800 border-l-4 border-orange-500 rounded-r-lg shadow-xl p-3 flex items-start gap-2">
                        <div className="text-xl">👀</div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Got feedback?</p>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
                                Beta is the place for it.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default BetaBadge;
