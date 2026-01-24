
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, User, Globe, Calendar, Check, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  onLogin?: () => void;
  onSimulateReset?: () => void; // For demo purposes to switch to ResetPage
}

export default function AuthModal({ isOpen, onClose, initialMode, onLogin, onSimulateReset }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'email-sent'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  
  // Form Data State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'United States',
    birthYear: '',
    agreedToTerms: false
  });

  // Password strength visual logic
  const passwordStrength = React.useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length > 7) score++;
    if (pwd.match(/[0-9]/)) score++;
    if (pwd.match(/[^a-zA-Z0-9]/)) score++;
    return score; // 0 to 3
  }, [formData.password]);

  useEffect(() => {
    if (isOpen) {
        setMode(initialMode);
        setShowPassword(false);
        // Reset email-sent state when reopening
        if (initialMode !== 'login' && initialMode !== 'signup') {
           setMode('login');
        }
    }
  }, [initialMode, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      if (mode === 'forgot-password') {
        setMode('email-sent');
      } else if (onLogin) {
        onLogin(); // Triggers global login state in App
      }
    }, 1500);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>
        
        {/* Modal Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100 opacity-100 animate-in zoom-in-95 duration-200 border border-gray-100">
           
           {/* Close Button */}
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors z-20"
           >
             <X size={20} />
           </button>

           {/* Scrollable Content Area */}
           <div className="overflow-y-auto p-8 custom-scrollbar relative">
              
              {/* --- Header Section --- */}
              <div className="text-center mb-8">
                {mode === 'login' && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.welcome')}</h2>
                    <p className="text-gray-500 text-sm">{t('auth.login_desc')}</p>
                  </>
                )}
                {mode === 'signup' && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
                    <p className="text-gray-500 text-sm">Start tracking and managing your subscriptions today.</p>
                  </>
                )}
                {mode === 'forgot-password' && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h2>
                    <p className="text-gray-500 text-sm">Enter your email address and we’ll send you a reset link.</p>
                  </>
                )}
                {mode === 'email-sent' && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      If an account exists for <span className="font-semibold text-gray-700">{formData.email}</span>, we've sent a password reset link.
                    </p>
                  </div>
                )}
              </div>

              {/* --- Forms --- */}

              {/* Login Form */}
              {mode === 'login' && (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.email')}</label>
                      <div className="relative group">
                          <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                          <input 
                            type="email" 
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                          />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.password')}</label>
                      <div className="relative group">
                          <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                          <input 
                            type="password" 
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                            placeholder="••••••••"
                          />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => setMode('forgot-password')} 
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center justify-center transform active:scale-[0.98]">
                      {isSubmitting ? 'Logging in...' : t('auth.submit_login')} 
                      {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
                    </button>
                  </form>
              )}

              {/* Forgot Password Form */}
              {mode === 'forgot-password' && (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{t('auth.email')}</label>
                      <div className="relative group">
                          <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                          <input 
                            type="email" 
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
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
                      className={`w-full rounded-xl py-3.5 font-bold text-sm transition-all shadow-lg flex items-center justify-center transform active:scale-[0.98] ${
                        isValidEmail(formData.email) && !isSubmitting 
                        ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isSubmitting ? 'Sending...' : 'Send reset link'}
                      {!isSubmitting && <ArrowRight size={18} className="ml-2" />}
                    </button>
                  </form>
              )}

              {/* Email Sent Confirmation */}
              {mode === 'email-sent' && (
                  <div className="space-y-4">
                     <button 
                       onClick={() => setMode('login')}
                       className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center"
                     >
                       <ArrowLeft size={18} className="mr-2" /> Back to login
                     </button>
                     
                     <div className="text-center">
                        <p className="text-xs text-gray-400">Didn't receive the email? <button className="text-gray-900 font-bold hover:underline">Click to resend</button></p>
                        
                        {/* Demo Trigger Link */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                           <button 
                             onClick={() => onSimulateReset && onSimulateReset()}
                             className="text-[10px] text-blue-500 hover:text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded"
                           >
                             (Demo: Simulate clicking email link)
                           </button>
                        </div>
                     </div>
                  </div>
              )}

              {/* Signup Form */}
              {mode === 'signup' && (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                     
                     {/* Full Name */}
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
                        <div className="relative group">
                           <User size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                           <input 
                              type="text" 
                              value={formData.fullName}
                              onChange={(e) => handleChange('fullName', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all focus:bg-white placeholder-gray-400"
                              placeholder="John Doe"
                              required
                           />
                        </div>
                     </div>

                     {/* Username */}
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Username</label>
                        <input 
                           type="text" 
                           value={formData.username}
                           onChange={(e) => handleChange('username', e.target.value)}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all focus:bg-white placeholder-gray-400"
                           placeholder="@username"
                           required
                        />
                     </div>

                     {/* Email */}
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
                        <div className="relative group">
                           <Mail size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                           <input 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => handleChange('email', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all focus:bg-white placeholder-gray-400"
                              placeholder="name@example.com"
                              required
                           />
                        </div>
                     </div>

                     {/* Password Group */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                           <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
                           <div className="relative group">
                              <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                              <input 
                                 type={showPassword ? "text" : "password"}
                                 value={formData.password}
                                 onChange={(e) => handleChange('password', e.target.value)}
                                 className="w-full pl-10 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all focus:bg-white placeholder-gray-400"
                                 placeholder="••••••••"
                                 required
                              />
                              <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                           </div>
                        </div>
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                           <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Confirm</label>
                           <input 
                              type="password" 
                              value={formData.confirmPassword}
                              onChange={(e) => handleChange('confirmPassword', e.target.value)}
                              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all focus:bg-white placeholder-gray-400 ${
                                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                                  ? 'border-red-300 focus:ring-red-100' 
                                  : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-900'
                              }`}
                              placeholder="••••••••"
                              required
                           />
                        </div>
                     </div>
                     
                     {/* Strength Indicator */}
                     {formData.password && (
                        <div className="flex gap-1.5 h-1.5 mt-2 px-1">
                           <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 1 ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                           <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 2 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                           <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 3 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                        </div>
                     )}

                     {/* Country & Year */}
                     <div className="grid grid-cols-5 gap-4">
                        <div className="space-y-1 col-span-3">
                           <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Country</label>
                           <div className="relative group">
                              <Globe size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                              <select 
                                 value={formData.country}
                                 onChange={(e) => handleChange('country', e.target.value)}
                                 className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 appearance-none focus:bg-white cursor-pointer"
                              >
                                 <option>United States</option>
                                 <option>United Kingdom</option>
                                 <option>Turkey</option>
                                 <option>Germany</option>
                                 <option>Japan</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                           <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Birth Year</label>
                           <div className="relative group">
                              <Calendar size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                              <input 
                                 type="number" 
                                 value={formData.birthYear}
                                 onChange={(e) => handleChange('birthYear', e.target.value)}
                                 className="w-full pl-10 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all focus:bg-white placeholder-gray-400"
                                 placeholder="YYYY"
                              />
                           </div>
                        </div>
                     </div>

                     {/* Terms */}
                     <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                           <input 
                              type="checkbox" 
                              checked={formData.agreedToTerms}
                              onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                              className="mt-1 rounded border-gray-300 text-gray-900 focus:ring-gray-900 w-4 h-4 cursor-pointer" 
                           />
                           <span className="text-xs text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
                              I agree to the <a href="#" className="font-bold text-gray-900 hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-gray-900 hover:underline">Privacy Policy</a>.
                           </span>
                        </label>
                     </div>

                     <button 
                        type="submit"
                        disabled={!formData.agreedToTerms || isSubmitting}
                        className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center mt-2 ${
                           !formData.agreedToTerms || isSubmitting
                           ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                           : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20'
                        }`}
                     >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        {!isSubmitting && <Check size={18} className="ml-2" />}
                     </button>
                  </form>
              )}

           </div>

           {/* Footer: Switch Modes */}
           <div className="bg-gray-50 p-4 text-center border-t border-gray-100 text-xs font-medium text-gray-500">
             {(mode === 'login' || mode === 'forgot-password' || mode === 'email-sent') && (
               <>
                 Don't have an account? 
                 <button 
                   onClick={() => setMode('signup')}
                   className="font-bold text-gray-900 hover:underline focus:outline-none ml-1"
                 >
                   {t('nav.signup')}
                 </button>
               </>
             )}
             {mode === 'signup' && (
               <>
                 Already have an account? 
                 <button 
                   onClick={() => setMode('login')}
                   className="font-bold text-gray-900 hover:underline focus:outline-none ml-1"
                 >
                   {t('nav.login')}
                 </button>
               </>
             )}
           </div>
        </div>
     </div>
  );
}
