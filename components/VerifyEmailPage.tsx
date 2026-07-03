
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, ArrowRight, RefreshCw, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface VerifyEmailPageProps {
    email: string;
    onBackToLogin: () => void;
    onResendAttempt: () => void;
}

export default function VerifyEmailPage({ email, onBackToLogin, onResendAttempt }: VerifyEmailPageProps) {
    const { resendVerificationEmail } = useAuth();
    const { t } = useLanguage();
    const [cooldown, setCooldown] = useState(0);
    const [resendCount, setResendCount] = useState(0);
    const [showResendSuccess, setShowResendSuccess] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        setErrorMsg(null);

        try {
            await resendVerificationEmail();

            // Show success feedback
            setShowResendSuccess(true);
            setTimeout(() => setShowResendSuccess(false), 4000);

            setResendCount(prev => prev + 1);
            // Exponential cooldown: 60s, 90s, 120s, 180s, 300s
            const cooldownDurations = [60, 90, 120, 180, 300];
            const nextCooldown = cooldownDurations[Math.min(resendCount, cooldownDurations.length - 1)];
            setCooldown(nextCooldown);

            // Also trigger parent's callback (optional)
            if (onResendAttempt) onResendAttempt();

        } catch (err: any) {
            console.error("Resend failed:", err);
            let msg = t('verify.resend_error');
            if (err.code === 'auth/too-many-requests') {
                msg = t('verify.too_many_resend');
                setCooldown(60); // Enforce cooldown
            }
            setErrorMsg(msg);
        } finally {
            setIsResending(false);
        }
    }, [cooldown, resendCount, isResending, resendVerificationEmail, onResendAttempt]);

    // Mask email for privacy: kut***@gmail.com
    const maskedEmail = email.replace(/(.{3}).+(@.+)/, '$1***$2');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8">

                    {/* Icon with badge */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <Mail size={36} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                                <ShieldCheck size={16} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('verify.title')}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {t('verify.sent_to')}
                            <br />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{maskedEmail}</span>
                        </p>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700 space-y-3">
                        {[t('verify.step1'), t('verify.step2'), t('verify.step3')].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>

                    {/* Error Feedback */}
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in slide-in-from-top-2 duration-200">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    {/* Resend Success Toast */}
                    {showResendSuccess && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 animate-in slide-in-from-top-2 duration-200">
                            <CheckCircle size={16} />
                            {t('verify.resend_success')}
                        </div>
                    )}

                    {/* Resend Button */}
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || resendCount >= 5 || isResending}
                        className={`w-full rounded-xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 mb-3 ${cooldown > 0 || resendCount >= 5
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                        {resendCount >= 5
                            ? t('verify.max_resend')
                            : isResending
                                ? t('auth.sending')
                                : cooldown > 0
                                    ? t('verify.resend_in').replace('{s}', String(cooldown))
                                    : t('verify.resend')
                        }
                    </button>

                    {/* Primary CTA — Go to login */}
                    <button
                        onClick={onBackToLogin}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3.5 font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center justify-center transform active:scale-[0.98]"
                    >
                        {t('verify.verified_login')}
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 text-center border-t border-gray-100 dark:border-gray-600">
                    <button
                        onClick={onBackToLogin}
                        className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        <ArrowLeft size={12} />
                        {t('auth.back_login')}
                    </button>
                </div>
            </div>

            {/* Security Note */}
            <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center max-w-sm">
                {t('verify.security_note')}
            </p>
        </div>
    );
}
