
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Users, Send, Loader2, CheckCircle2, Bug, MessageSquare } from 'lucide-react';
import { submitFeedback } from '../utils/firestore';
import { useAuth } from '../contexts/AuthContext';

interface BetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRect: DOMRect | null;
}

export default function BetaModal({ isOpen, onClose, anchorRect }: BetaModalProps) {
    const { currentUser } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleSubmit = async (type: 'bug' | 'feedback') => {
        if (!message.trim()) return;

        setLoading(true);
        try {
            await submitFeedback(currentUser?.uid || 'anonymous', {
                type,
                message,
                email: currentUser?.email || ''
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setMessage('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !anchorRect) return null;

    // Calculate Position: Slightly below and right of the anchor
    const top = anchorRect.bottom + 12; // 12px gap
    const left = anchorRect.left;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, scale: 0.92, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                        position: 'fixed',
                        top: top,
                        left: left,
                        zIndex: 9999, // Ensure it's above everything
                    }}
                    className="w-[340px]"
                >
                    <div className="relative bg-white dark:bg-gray-900 rounded-[20px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                        {/* Subtle Rotating Rainbow Border Effect */}
                        <div className="absolute inset-0 pointer-events-none rounded-[20px] border border-transparent [background:linear-gradient(45deg,transparent,rgba(255,165,0,0.3),rgba(236,72,153,0.3),rgba(168,85,247,0.3),transparent)_border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]" />

                        <div className="p-5">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span>⚠️</span> What’s unstable?
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-medium">
                                        You’re using an early version of SubSense. <br />
                                        Some things are solid. Some are evolving.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative z-10"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3 mb-6">
                                <FeatureCard
                                    icon={<Sparkles size={14} className="text-indigo-500" />}
                                    title="AI Insights"
                                    desc="Conservative logic, improving daily."
                                    bg="bg-indigo-50 dark:bg-indigo-900/20"
                                />
                                <FeatureCard
                                    icon={<Zap size={14} className="text-orange-500" />}
                                    title="Real-time Prices"
                                    desc="Mostly accurate, may lag market changes."
                                    bg="bg-orange-50 dark:bg-orange-900/20"
                                />
                                <FeatureCard
                                    icon={<Users size={14} className="text-blue-500" />}
                                    title="Friends & Social"
                                    desc="Functional, not battle-tested at scale."
                                    bg="bg-blue-50 dark:bg-blue-900/20"
                                />
                            </div>

                            {/* Feedback Section */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-1">
                                    Help shape SubSense
                                </h3>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                                    Found something broken or confusing?
                                </p>

                                {success ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                                    >
                                        <CheckCircle2 size={18} />
                                        <span>Thanks! We're on it.</span>
                                    </motion.div>
                                ) : (
                                    <>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what broke..."
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 resize-none mb-3"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSubmit('bug')}
                                                disabled={loading || !message.trim()}
                                                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-gray-600 dark:text-gray-400 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <Bug size={14} />
                                                Report Bug
                                            </button>
                                            <button
                                                onClick={() => handleSubmit('feedback')}
                                                disabled={loading || !message.trim()}
                                                className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 text-xs font-bold py-2 rounded-lg transition-opacity flex items-center justify-center gap-1.5"
                                            >
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                Feedback
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function FeatureCard({ icon, title, desc, bg }: { icon: React.ReactNode, title: string, desc: string, bg: string }) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl ${bg}`}>
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{title}</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{desc}</p>
            </div>
        </div>
    );
}
