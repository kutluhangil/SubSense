
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Check } from 'lucide-react';
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

  // Validation Rules
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword
  };

  const isFormValid = Object.values(validations).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50/50 animate-in fade-in duration-500">
      
      {/* Brand Header */}
      <div className="mb-8 cursor-pointer" onClick={onLoginClick}>
        <Logo className="h-10" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden relative">
        <div className="p-8">
          
          {step === 'form' ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Set new password</h1>
                <p className="text-sm text-gray-500">
                  Your new password must be different to previously used passwords.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">New Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="••••••••"
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

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white placeholder-gray-400 ${
                        confirmPassword && !validations.match ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-900'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Requirements List */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password Requirements</p>
                   <div className="space-y-1">
                      <RequirementItem met={validations.length} label="Minimum 8 characters" />
                      <RequirementItem met={validations.uppercase} label="At least 1 uppercase letter" />
                      <RequirementItem met={validations.number} label="At least 1 number" />
                      <RequirementItem met={validations.match} label="Passwords match" />
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full rounded-xl py-3.5 font-bold text-sm transition-all shadow-lg flex items-center justify-center transform active:scale-[0.98] ${
                    isFormValid && !isSubmitting 
                    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? 'Resetting password...' : 'Reset password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle size={32} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated</h2>
               <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                 Your password has been successfully reset. You can now log in with your new credentials.
               </p>
               <button 
                 onClick={onLoginClick}
                 className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 flex items-center justify-center"
               >
                 Go to login <ArrowRight size={18} className="ml-2" />
               </button>
            </div>
          )}

        </div>
        
        {/* Footer Bar */}
        {step === 'form' && (
          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <button 
              onClick={onLoginClick}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              ← Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const RequirementItem = ({ met, label }: { met: boolean, label: string }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? 'text-green-600' : 'text-gray-400'}`}>
     <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${met ? 'bg-green-100 border-green-200' : 'border-gray-300'}`}>
        {met && <Check size={10} />}
     </div>
     <span>{label}</span>
  </div>
);
