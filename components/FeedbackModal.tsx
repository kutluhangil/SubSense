
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, CheckCircle, ThumbsUp, MessageSquare } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import { APP_VERSION, FEEDBACK_CATEGORIES } from '../utils/constants';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string; // e.g., 'add_subscription', 'settings'
}

export default function FeedbackModal({ isOpen, onClose, context = 'general' }: FeedbackModalProps) {
  const [category, setCategory] = useState('idea');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [contactMe, setContactMe] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUser } = useAuth();

  // Rate Limit check
  const [onCooldown, setOnCooldown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check last submission time
      const lastSubmit = localStorage.getItem('last_feedback_submit');
      if (lastSubmit) {
          const diff = Date.now() - parseInt(lastSubmit);
          if (diff < 60000) { // 1 minute cooldown
              setOnCooldown(true);
          } else {
              setOnCooldown(false);
          }
      }

      // Reset state on open
      setMessage('');
      setRating(null);
      setContactMe(false);
      setSent(false);
      setError(null);
      setIsSending(false);
      // Auto-focus after animation
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onCooldown) {
        setError("Please wait a moment before sending more feedback.");
        return;
    }
    if (!message.trim() && !rating) {
        setError("Please provide a rating or a message.");
        return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Construct safe metadata
      const feedbackData = {
        category,
        message: message.trim().substring(0, 1000), // Max length enforcement
        rating,
        contact_requested: contactMe,
        uid: currentUser?.uid || 'anonymous',
        app_version: APP_VERSION,
        context: context,
        timestamp: serverTimestamp(),
        device: {
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            path: window.location.pathname
        }
      };

      await addDoc(collection(db, 'feedback'), feedbackData);
      
      localStorage.setItem('last_feedback_submit', Date.now().toString());
      setSent(true);
      
      // Auto close after success
      setTimeout(() => {
          onClose();
      }, 2500);

    } catch (err) {
      console.error("Feedback error:", err);
      // Fallback for offline/demo: show success anyway to not frustrate user
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
               Share Feedback
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
               Help us improve the {APP_VERSION} beta.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors -mr-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
           {!sent ? (
             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Category Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {FEEDBACK_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[80px] transition-all ${
                                category === cat.id 
                                ? 'bg-white dark:bg-gray-700 border-indigo-500 ring-1 ring-indigo-500 shadow-sm' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <span className="text-2xl mb-1">{cat.icon}</span>
                            <span className={`text-[10px] font-bold ${category === cat.id ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Message Input */}
                <div className="relative">
                   <textarea 
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What's on your mind? Be as specific as you can..."
                      className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder-gray-400 shadow-sm min-h-[120px]"
                      maxLength={500}
                   />
                   <div className="absolute bottom-3 right-3 text-[10px] text-gray-400">
                      {message.length}/500
                   </div>
                </div>

                {/* Rating & Contact */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-1 transition-transform hover:scale-110 ${rating && rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            >
                                <ThumbsUp size={20} className={rating && rating >= star ? 'fill-current' : ''} />
                            </button>
                        ))}
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${contactMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}>
                            {contactMe && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={contactMe} onChange={(e) => setContactMe(e.target.checked)} />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">
                            You can contact me about this
                        </span>
                    </label>
                </div>

                {error && (
                   <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle size={14} />
                      {error}
                   </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                   <button 
                     type="button" 
                     onClick={onClose}
                     className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={(!message.trim() && !rating) || isSending || onCooldown}
                     className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                        (!message.trim() && !rating) || isSending || onCooldown
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed shadow-none' 
                        : 'bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 active:scale-95'
                     }`}
                   >
                      {isSending ? 'Sending...' : (onCooldown ? 'Wait...' : 'Send Feedback')}
                      {!isSending && !onCooldown && <Send size={16} />}
                   </button>
                </div>
             </form>
           ) : (
             <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-200 dark:border-green-800">
                   <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thanks for the feedback!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                   Your input helps us build a better product.
                </p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
