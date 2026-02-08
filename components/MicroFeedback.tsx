
import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, X, MessageSquare } from 'lucide-react';

interface MicroFeedbackProps {
  isVisible: boolean;
  context: string;
  onClose: () => void;
  onOpenFullFeedback: () => void;
}

export default function MicroFeedback({ isVisible, context, onClose, onOpenFullFeedback }: MicroFeedbackProps) {
  const [rated, setRated] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (!isVisible) {
        setRated(null); // Reset on hide
    }
  }, [isVisible]);

  const handleRate = (type: 'up' | 'down') => {
    setRated(type);
    // In a real app, send this signal immediately to analytics
    console.log(`[MicroFeedback] ${context}: ${type}`);
    
    // Auto close after rating, unless down (then maybe suggest full feedback)
    if (type === 'up') {
        setTimeout(onClose, 2000);
    } else {
        // Keep open for a moment to allow clicking "Tell us more"
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 max-w-xs">
        
        {rated === null ? (
            <>
                <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Was this helpful?</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Help us improve.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleRate('down')}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <ThumbsDown size={16} />
                    </button>
                    <button 
                        onClick={() => handleRate('up')}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                        <ThumbsUp size={16} />
                    </button>
                </div>
            </>
        ) : (
            <>
               <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                        {rated === 'up' ? "Thanks!" : "Got it."}
                    </p>
                    <button 
                        onClick={onOpenFullFeedback}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                        <MessageSquare size={10} /> Tell us more
                    </button>
               </div>
               <div className={`p-2 rounded-full ${rated === 'up' ? 'text-green-500 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                   {rated === 'up' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
               </div>
            </>
        )}

        <button 
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-600 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-600"
        >
            <X size={12} />
        </button>
      </div>
    </div>
  );
}
