
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { chatWithGemini } from '../utils/gemini';
import { Subscription } from './SubscriptionModal';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../utils/analytics';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  currentPage: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIAssistant({ isOpen, onClose, subscriptions, currentPage }: AIAssistantProps) {
  const { currentCurrency, currentLanguage, t } = useLanguage();

  // Initialize messages with localized welcome
  const [messages, setMessages] = useState<Message[]>([]);

  // Reset welcome message when language changes or on mount
  useEffect(() => {
    setMessages([
      { role: 'model', text: t('ai.welcome_message') }
    ]);
  }, [currentLanguage, t]);

  // Track opening
  useEffect(() => {
    if (isOpen) {
      trackEvent('ai_opened', { from_page: currentPage });
    }
  }, [isOpen, currentPage]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Analytics: Track query length (privacy safe)
    trackEvent('ai_query_submitted', { length: userMsg.length });

    // NOTE: We pass raw subscriptions here, but the utility function `chatWithGemini`
    // is now responsible for strictly validating, sanitizing, and normalizing them.
    // This keeps the UI component dumb and the logic centralized.

    const contextData = {
      subscriptions: subscriptions,
      baseCurrency: currentCurrency,
      currentPage
    };

    // Format history for Gemini SDK, skipping the initial welcome message
    const historyForGemini = messages
      .filter((m, idx) => !(idx === 0 && m.role === 'model'))
      .map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

    // Pass strict language code to the utility
    const responseText = await chatWithGemini(historyForGemini, userMsg, contextData, currentLanguage);

    setMessages(prev => [...prev, { role: 'model', text: responseText || t('ai.error_message') }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Trigger (Mobile / Global fallback) */}
      {!isOpen && (
        <button
          onClick={onClose} // Toggles open in parent
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {t('sidebar.ai_assistant')}
          </span>
        </button>
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-500 ease-spring ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('ai.assistant_title')}</h2>
                <div className="flex items-center gap-1">
                  <Sparkles size={10} className="text-indigo-500" />
                  <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{t('ai.powered_by')}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-black/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                  {msg.role === 'user' ? <User size={14} className="text-gray-600 dark:text-gray-300" /> : <Bot size={14} />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] shadow-sm ${msg.role === 'user'
                      ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-indigo-100 dark:border-indigo-900/30'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <span className="text-xs text-gray-500">{t('ai.thinking')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Privacy Note */}
          <div className="px-6 py-2 bg-gray-50 dark:bg-black/40 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
              <ShieldIcon /> {t('ai.disclaimer')}
            </p>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('ai.ask_placeholder')}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Backdrop for mobile/focus */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-[1px] z-50 transition-opacity"
          onClick={onClose}
        ></div>
      )}
    </>
  );
}

const ShieldIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
