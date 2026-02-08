import React from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { getBrandLogo } from '../utils/logoUtils';
import { LogoRenderer } from './LogoRenderer';
import { BRAND_COLORS } from '../utils/data';

interface DuplicateSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
    onGoToDashboard: () => void;
}

export default function DuplicateSubscriptionModal({ isOpen, onClose, serviceName, onGoToDashboard }: DuplicateSubscriptionModalProps) {
    if (!isOpen) return null;

    const brandKey = serviceName.toLowerCase().replace(/\s+/g, '');
    const brandColor = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];
    const logoUrl = getBrandLogo(serviceName);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">

                {/* Rainbow/Aurora Ring Animation */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
                    <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,85,247,0.3)_90deg,transparent_180deg,rgba(59,130,246,0.3)_270deg,transparent_360deg)] animate-[spin_4s_linear_infinite] opacity-50"></div>
                </div>

                {/* Content Container (Inner Bg) */}
                <div className="relative m-[1px] bg-white dark:bg-gray-900 rounded-[23px] p-8 flex flex-col items-center text-center z-10">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Icon with Celebratory Badge */}
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center bg-white dark:bg-gray-800 p-2 border border-gray-100 dark:border-gray-700 relative z-10">
                            <LogoRenderer
                                logoUrl={logoUrl}
                                name={serviceName}
                                className="w-full h-full rounded-xl"
                                variant="color"
                                fallback={<BrandIcon type={serviceName} className="w-full h-full" noBackground />}
                            />
                        </div>
                        {/* Success Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-[3px] border-white dark:border-gray-900 shadow-md z-20 animate-in zoom-in duration-300 delay-100">
                            <CheckCircle2 size={16} strokeWidth={3} />
                        </div>
                        {/* Background Glow */}
                        <div
                            className="absolute inset-0 bg-current blur-2xl opacity-20 rounded-full transform scale-150 -z-10"
                            style={{ color: brandColor }}
                        ></div>
                    </div>

                    {/* Text Content */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        This subscription is already in your Dashboard
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                        You’ve already added <strong className="text-gray-900 dark:text-white font-semibold">{serviceName}</strong>. You can manage it directly from your Dashboard.
                    </p>

                    {/* Primary CTA */}
                    <button
                        onClick={onGoToDashboard}
                        className="w-full py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
                        style={{ backgroundColor: brandColor }}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            Go to Dashboard <ArrowRight size={18} />
                        </span>
                    </button>

                </div>
            </div>
        </div>
    );
}
