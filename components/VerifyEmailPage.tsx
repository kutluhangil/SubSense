
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, ArrowRight, RefreshCw, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface VerifyEmailPageProps {
    email: string;
    onBackToLogin: () => void;
    onResendAttempt: () => void;
}

export default function VerifyEmailPage({ email, onBackToLogin, onResendAttempt }: VerifyEmailPageProps) {
    const { resendVerificationEmail } = useAuth();
    const [cooldown, setCooldown] = useState(0);
    const [resendCount, setResendCount] = useState(0);
    const [showResendSuccess, setShowResendSuccess] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Rate-limited resend via Cloud Function
    const handleResend = useCallback(async () => {
        if (cooldown > 0 || resendCount >= 5 || isResending) return;

        setIsResending(true);
        try {
            await resendVerificationEmail();
        } catch (_e) {
            // Silently handle — Cloud Function always returns success for security
        }
        setIsResending(false);

        setResendCount(prev => prev + 1);
        // Exponential cooldown: 60s, 90s, 120s, 180s, 300s
        const cooldownDurations = [60, 90, 120, 180, 300];
        const nextCooldown = cooldownDurations[Math.min(resendCount, cooldownDurations.length - 1)];
        setCooldown(nextCooldown);

        // Show success feedback
        setShowResendSuccess(true);
        setTimeout(() => setShowResendSuccess(false), 4000);

        // Also trigger parent's callback
        onResendAttempt();
    }, [cooldown, resendCount, isResending, resendVerificationEmail, onResendAttempt]);

    // Mask email for privacy: kut***@gmail.com
    const maskedEmail = email.replace(/(.{3}).+(@.+)/, '$1***$2');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white">

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8">

                    {/* Icon with badge */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                <Mail size={36} className="text-blue-600" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <ShieldCheck size={16} className="text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            We sent a verification link to
                            <br />
                            <span className="font-semibold text-gray-700">{maskedEmail}</span>
                        </p>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-blue-600">1</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Check your email inbox (and spam folder)
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-blue-600">2</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Click the verification link in the email
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-blue-600">3</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Come back here and log in
                            </p>
                        </div>
                    </div>

                    {/* Resend Success Toast */}
                    {showResendSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-xs font-bold text-green-600 animate-in slide-in-from-top-2 duration-200">
                            <CheckCircle size={16} />
                            New verification email sent! Check your inbox.
                        </div>
                    )}

                    {/* Resend Button */}
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || resendCount >= 5 || isResending}
                        className={`w-full rounded-xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 mb-3 ${cooldown > 0 || resendCount >= 5
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                        {resendCount >= 5
                            ? 'Maximum resend attempts reached'
                            : isResending
                                ? 'Sending...'
                                : cooldown > 0
                                    ? `Resend in ${cooldown}s`
                                    : 'Resend verification email'
                        }
                    </button>

                    {/* Primary CTA — Go to login */}
                    <button
                        onClick={onBackToLogin}
                        className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center justify-center transform active:scale-[0.98]"
                    >
                        I've verified — Log in
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <button
                        onClick={onBackToLogin}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        <ArrowLeft size={12} />
                        Back to login
                    </button>
                </div>
            </div>

            {/* Security Note */}
            <p className="mt-6 text-xs text-gray-400 text-center max-w-sm">
                For your security, you must verify your email address before accessing your account. This helps us protect your data.
            </p>
        </div>
    );
}
