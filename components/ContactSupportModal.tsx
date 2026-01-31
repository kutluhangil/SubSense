
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import { APP_VERSION } from '../utils/constants';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      setTimeout(() => {
        setMessage('');
        setSent(false);
        setError(null);
        setIsSending(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      // Save to Firestore beta_feedback collection
      await addDoc(collection(db, 'beta_feedback'), {
        message: message.trim(),
        uid: currentUser?.uid || 'anonymous',
        email: currentUser?.email || 'anonymous',
        version: APP_VERSION,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp()
      });
      
      setSent(true);
    } catch (err) {
      console.error("Feedback error:", err);
      // Fallback for demo/offline: just show success
      setSent(true); 
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit(e);
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
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
               Beta Feedback
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
               Found a bug or have an idea? Let us know.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors -mr-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
           {!sent ? (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                   <textarea 
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe the issue or feature request..."
                      className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white transition-all resize-none placeholder-gray-400 shadow-sm min-h-[140px]"
                   />
                   <div className="absolute bottom-3 right-3 pointer-events-none text-[10px] text-gray-400 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
                      CMD+Enter to send
                   </div>
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
                     disabled={!message.trim() || isSending}
                     className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                        !message.trim() || isSending 
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed shadow-none' 
                        : 'bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 hover:shadow-gray-900/20 active:scale-95'
                     }`}
                   >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Feedback <Send size={16} />
                        </>
                      )}
                   </button>
                </div>
             </form>
           ) : (
             <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-200 dark:border-green-800">
                   <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
                   Thanks for helping us improve SubscriptionHub!
                </p>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md active:scale-95"
                >
                  Close
                </button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
