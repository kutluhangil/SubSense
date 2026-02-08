
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, AlertTriangle, Zap, Users, Sparkles, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { submitFeedback } from '../utils/firestore';
import { useAuth } from '../contexts/AuthContext';

interface BetaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BetaModal({ isOpen, onClose }: BetaModalProps) {
    const { currentUser } = useAuth();
    const [feedbackType, setFeedbackType] = useState('bug');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset state on open
    React.useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setLoading(false);
            setMessage('');
            setEmail(currentUser?.email || '');
        }
    }, [isOpen, currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            await submitFeedback(currentUser?.uid || 'anonymous', {
                type: feedbackType,
                message,
                email
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
                    >
                        {/* Top Gradient Line */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600"></div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                    <span className="text-2xl">⚠️</span> What’s unstable?
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                    You’re using an early version of SubSense. Some things are solid. Some things are still evolving.
                                </p>
                            </div>

                            {/* Unstable List */}
                            <div className="grid gap-4 mb-8">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Insights</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Logic is conservative, but still improving daily.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg shrink-0">
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Real-time Prices</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Currency rates update daily, but may lag slightly behind market.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Friends & Social</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Features are functional but not battle-tested with large groups.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Form */}
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    Help shape SubSense
                                </h3>

                                {success ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-4 rounded-xl flex flex-col items-center justify-center text-center py-8"
                                    >
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-3 text-green-600 dark:text-green-300">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <h4 className="font-bold text-lg">Feedback Received!</h4>
                                        <p className="text-sm opacity-80 mt-1">You’re helping build the future.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                value={feedbackType}
                                                onChange={(e) => setFeedbackType(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                            >
                                                <option value="bug">Report a Bug</option>
                                                <option value="ux">UX Issue</option>
                                                <option value="feature">Feature Request</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <input
                                                type="email"
                                                placeholder="Email (optional)"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what broke, confused you, or inspired you..."
                                            rows={3}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-indigo-600 dark:to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                            {loading ? 'Sending...' : 'Send Feedback'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
