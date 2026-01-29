
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

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

  // Focus textarea on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      // Reset state when closed
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

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSent(true);
      // Optional: Auto close after success
      // setTimeout(onClose, 2000); 
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Ctrl+Enter to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
               Contact Support
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
               Describe your issue and we'll get back to you via email.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors -mr-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50/50">
           {!sent ? (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                   <textarea 
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe the issue you're experiencing..."
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all resize-none placeholder-gray-400 shadow-sm min-h-[140px]"
                   />
                   <div className="absolute bottom-3 right-3 pointer-events-none text-[10px] text-gray-400 bg-white/80 px-1 rounded">
                      Markdown supported
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
                     className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={!message.trim() || isSending}
                     className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                        !message.trim() || isSending 
                        ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                        : 'bg-gray-900 hover:bg-gray-800 hover:shadow-gray-900/20 active:scale-95'
                     }`}
                   >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send size={16} />
                        </>
                      )}
                   </button>
                </div>
             </form>
           ) : (
             <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-200">
                   <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent</h3>
                <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
                   Thank you for reaching out. Our support team has received your message and will respond shortly.
                </p>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95"
                >
                  Done
                </button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
