
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BetaModal from './BetaModal';
import { useAuth } from '../contexts/AuthContext';
import { updateAchievements, getUserDocument } from '../utils/firestore';

const BetaBadge = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const badgeRef = useRef<HTMLButtonElement>(null);
    const { currentUser } = useAuth();

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
            setIsHovered(false); // Hide tooltip when modal opens
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
                        <span className="relative z-10 text-[10px] font-black text-white tracking-widest uppercase text-shadow-sm">
                            BETA
                        </span>
                    </div>
                </motion.button>
            </div>

            {/* Portal Components */}
            <BetaTooltip isOpen={isHovered && !isModalOpen} anchorRect={anchorRect} />

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

    // Center tooltip below the badge
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
                    style={{
                        position: 'fixed',
                        top: top,
                        left: left,
                        zIndex: 9999,
                        pointerEvents: 'none' // Let clicks pass through if needed, but usually tooltip doesn't block much
                    }}
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

export default BetaBadge;
