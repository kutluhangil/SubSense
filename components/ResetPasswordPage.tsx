
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Check } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface ResetPasswordPageProps {
  onLoginClick: () => void;
}

export default function ResetPasswordPage({ onLoginClick }: ResetPasswordPageProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get Action Code from URL
  const queryParams = new URLSearchParams(window.location.search);
  const actionCode = queryParams.get('oobCode');

  // Validation Rules
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword
  };

  const isFormValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    if (!actionCode) {
      setErrorMsg(t('auth.error.invalid_code'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Verify code (optional, but confirmPasswordReset does it implicitly)
      // 2. Confirm Reset
      await confirmPasswordReset(auth, actionCode, password);

      setStep('success');
    } catch (error: any) {
      console.error("Password reset failed:", error);
      let msg = t('auth.error.reset_failed');
      if (error.code === 'auth/weak-password') {
        msg = t('auth.error.password_short');
      } else if (error.code === 'auth/expired-action-code') {
        msg = t('auth.error.expired_link');
      } else if (error.code === 'auth/invalid-action-code') {
        msg = t('auth.error.invalid_link');
      }
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-900 animate-in fade-in duration-500">

      {/* Brand Header */}
      <div className="mb-8 cursor-pointer" onClick={onLoginClick}>
        <Logo className="h-10" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden relative">
        <div className="p-8">

          {step === 'form' ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.set_new_pass')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('auth.reset_subtitle')}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-semibold border border-red-100 dark:border-red-900/30 mb-6 text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.new_password_label')}</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500 transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.confirm_password')}</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white ${confirmPassword && !validations.match ? 'border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900/20' : 'border-gray-200 dark:border-gray-600 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500'
                        }`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Requirements List */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t('auth.password_req')}</p>
                  <div className="space-y-1">
                    <RequirementItem met={validations.length} label={t('auth.min_chars')} />
                    <RequirementItem met={validations.uppercase} label={t('auth.uppercase')} />
                    <RequirementItem met={validations.number} label={t('auth.number')} />
                    <RequirementItem met={validations.match} label={t('auth.match')} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full rounded-xl py-3.5 font-bold text-sm transition-all shadow-lg flex items-center justify-center transform active:scale-[0.98] ${isFormValid && !isSubmitting
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-gray-900/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                    }`}
                >
                  {isSubmitting ? t('auth.resetting') : t('auth.reset_submit')}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.pass_updated')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                {t('auth.login_new_creds')}
              </p>
              <button
                onClick={onLoginClick}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3.5 font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center justify-center"
              >
                {t('auth.go_login')} <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        {step === 'form' && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 text-center border-t border-gray-100 dark:border-gray-600">
            <button
              onClick={onLoginClick}
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              ← {t('auth.back_login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const RequirementItem = ({ met, label }: { met: boolean, label: string }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${met ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800' : 'border-gray-300 dark:border-gray-600'}`}>
      {met && <Check size={10} />}
    </div>
    <span>{label}</span>
  </div>
);
