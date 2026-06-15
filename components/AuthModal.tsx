
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, User, Globe, Check, Eye, EyeOff, ArrowLeft, AlertCircle, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LegalModal from './LegalModal';
import { CURRENCIES } from '../utils/data';
import { getDefaultCurrency } from '../utils/currency';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  onLoginSubmit?: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  onSignupSubmit?: (name: string, email: string, password: string, currency: string, region: string) => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
}

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Turkey': 'TRY',
  'Germany': 'EUR',
  'Japan': 'JPY'
};

export default function AuthModal({ isOpen, onClose, initialMode, onLoginSubmit, onSignupSubmit, onResetPassword }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'email-sent'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);
  const { t } = useLanguage();

  // FV-09: Per-field error state for inline validation feedback
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'United States',
    currency: getDefaultCurrency(),
    birthYear: '',
    agreedToTerms: false
  });

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setShowPassword(false);
      setRememberMe(false);
      setErrorMsg(null);
      setFieldErrors({});
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    }
  }, [initialMode, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Auto-detect currency when country changes
      if (field === 'country') {
        const suggestedCurrency = COUNTRY_TO_CURRENCY[value];
        if (suggestedCurrency) {
          newData.currency = suggestedCurrency;
        }
      }
      // FV-07: Strip emojis and control characters from name fields
      if (field === 'fullName') {
        newData.fullName = value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').replace(/[\x00-\x1F\x7F]/g, '');
      }
      return newData;
    });
    setErrorMsg(null);
    // Clear the specific field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  // FV-09: Real-time per-field validation on blur
  const handleBlur = (field: string) => {
    const errors: Record<string, string> = { ...fieldErrors };
    if (field === 'fullName' && formData.fullName && formData.fullName.trim().length < 2) {
      errors.fullName = t('auth.error.name_required');
    } else if (field === 'email' && formData.email && !isValidEmail(formData.email)) {
      errors.email = t('auth.error.invalid_email') || 'Please enter a valid email address.';
    } else if (field === 'password' && formData.password && formData.password.length < 6) {
      errors.password = t('auth.error.password_short');
    } else {
      delete errors[field];
    }
    setFieldErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (mode === 'forgot-password' && onResetPassword) {
        await onResetPassword(formData.email);
        setMode('email-sent');
      } else if (mode === 'login' && onLoginSubmit) {
        await onLoginSubmit(formData.email, formData.password, rememberMe);
      } else if (mode === 'signup' && onSignupSubmit) {
        if (!formData.fullName.trim()) {
          throw new Error(t('auth.error.name_required'));
        }
        if (formData.password.length < 6) {
          throw new Error(t('auth.error.password_short'));
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error(t('auth.error.password_mismatch'));
        }
        await onSignupSubmit(formData.fullName.trim(), formData.email, formData.password, formData.currency, formData.country);
      }
    } catch (err: any) {
      // If user needs email verification, parent handles navigation.
      // Don't show an error in the modal \u2014 the VerifyEmailPage will appear.
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        return;
      }

      // Firebase error normalization \u2014 prevent email enumeration
      let msg = t('auth.error.generic');
      const code = err?.code || err?.message || '';

      if (code.includes('auth/invalid-credential') || code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) {
        msg = t('auth.error.invalid_credentials');
      } else if (code.includes('auth/email-already-in-use')) {
        msg = t('auth.error.email_exists');
      } else if (code.includes('auth/weak-password')) {
        msg = t('auth.error.password_short');
      } else if (code.includes('auth/too-many-requests')) {
        msg = t('auth.error.too_many');
      } else if (code.includes('auth/network-request-failed')) {
        msg = t('auth.error.network');
      } else if (err.message && !err.message.startsWith('auth/')) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100 opacity-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="overflow-y-auto p-8 custom-scrollbar relative">

            <div className="text-center mb-8">
              {mode === 'login' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.welcome')}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('auth.login_desc')}</p>
                </>
              )}
              {mode === 'signup' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.signup_title')}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('auth.signup_desc')}</p>
                </>
              )}
              {mode === 'forgot-password' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.forgot_title')}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('auth.forgot_desc')}</p>
                </>
              )}
              {mode === 'email-sent' && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.check_inbox')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('auth.reset_link_sent').replace('{email}', formData.email)}
                  </p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            {mode === 'login' && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">{t('auth.email')}</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      name="email"
                      autoComplete="username"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500 transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">{t('auth.password')}</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500 transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white select-none cursor-pointer">
                      {t('auth.remember_me')}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {t('auth.forgot_password')}
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3.5 font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center justify-center transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? t('auth.logging_in') : t('auth.submit_login')}
                  {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
                </button>
              </form>
            )}

            {mode === 'forgot-password' && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">{t('auth.email')}</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      autoComplete="email"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500 transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!isValidEmail(formData.email) || isSubmitting}
                  className={`w-full rounded-xl py-3.5 font-bold text-sm transition-all shadow-lg flex items-center justify-center transform active:scale-[0.98] ${isValidEmail(formData.email) && !isSubmitting
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-gray-900/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                    }`}
                >
                  {isSubmitting ? t('auth.sending') : t('auth.send_reset_link')}
                  {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
                </button>
              </form>
            )}

            {mode === 'email-sent' && (
              <div className="space-y-4">
                <button
                  onClick={() => setMode('login')}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl py-3.5 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center"
                >
                  <ArrowLeft size={18} className="mr-2" /> {t('auth.back_login')}
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <form className="space-y-4" onSubmit={handleSubmit}>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.fullname')}</label>
                    <div className="relative group">
                      <User size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                      <input
                        type="text"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        onBlur={() => handleBlur('fullName')}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all focus:bg-white dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white ${
                          fieldErrors.fullName
                            ? 'border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500'
                        }`}
                        placeholder="John Doe"
                        maxLength={60}
                        required
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-red-500 dark:text-red-400 text-[11px] font-medium mt-1">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.email')}</label>
                    <div className="relative group">
                      <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                      <input
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all focus:bg-white dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white ${
                          fieldErrors.email
                            ? 'border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500'
                        }`}
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-red-500 dark:text-red-400 text-[11px] font-medium mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.password')}</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        className={`w-full pl-10 pr-9 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all focus:bg-white dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white ${
                          fieldErrors.password
                            ? 'border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-red-500 dark:text-red-400 text-[11px] font-medium mt-1">{fieldErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.confirm_label')}</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all focus:bg-white dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white ${formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500'
                        }`}
                      placeholder="••••••••"
                      required
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 dark:text-red-400 text-[11px] font-medium mt-1">{t('auth.passwords_no_match')}</p>
                    )}
                  </div>
                </div>

                {/* Regional Preferences */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.country')}</label>
                    <div className="relative group">
                      <Globe size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                      <select
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500 appearance-none focus:bg-white dark:focus:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                      >
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Turkey</option>
                        <option>Germany</option>
                        <option>Japan</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t('auth.currency_label')}</label>
                    <div className="relative group">
                      <DollarSign size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                      <select
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-gray-500 appearance-none focus:bg-white dark:focus:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-5 items-center mt-0.5">
                      <input
                        id="terms"
                        type="checkbox"
                        required
                        checked={formData.agreedToTerms}
                        onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 focus:ring-gray-900 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-snug cursor-pointer select-none">
                      {t('auth.terms_agree')}{' '}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setLegalModalType('terms'); }}
                        className="font-semibold text-gray-900 dark:text-white hover:underline focus:outline-none"
                      >
                        {t('auth.terms')}
                      </button>
                      {' '}{t('auth.and')}{' '}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setLegalModalType('privacy'); }}
                        className="font-semibold text-gray-900 dark:text-white hover:underline focus:outline-none"
                      >
                        {t('auth.privacy')}
                      </button>
                      .
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!formData.agreedToTerms || isSubmitting}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center mt-2 ${!formData.agreedToTerms || isSubmitting
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-gray-900/20'
                    }`}
                >
                  {isSubmitting ? t('auth.creating') : t('auth.submit_signup')}
                  {!isSubmitting && <Check size={18} className="ml-2" />}
                </button>
              </form>
            )}

          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 text-center border-t border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
            {(mode === 'login' || mode === 'forgot-password' || mode === 'email-sent') && (
              <>
                {t('auth.no_account')}
                <button
                  onClick={() => setMode('signup')}
                  className="font-bold text-gray-900 dark:text-white hover:underline focus:outline-none ml-1"
                >
                  {t('nav.signup')}
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                {t('auth.has_account')}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-gray-900 dark:text-white hover:underline focus:outline-none ml-1"
                >
                  {t('nav.login')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {legalModalType && (
        <LegalModal
          isOpen={true}
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </>
  );
}
