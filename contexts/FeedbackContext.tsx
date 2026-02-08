
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import FeedbackModal from '../components/FeedbackModal';
import MicroFeedback from '../components/MicroFeedback';

interface FeedbackContextType {
  openFeedback: (context?: string) => void;
  triggerMicroFeedback: (context: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState('general');
  
  const [isMicroOpen, setIsMicroOpen] = useState(false);
  const [microContext, setMicroContext] = useState('');
  
  // Session tracking to prevent spam
  // We store a simple boolean to ensure we don't nag the user too much in one session
  const [hasPrompted, setHasPrompted] = useState(false);

  const openFeedback = useCallback((context: string = 'general') => {
    setModalContext(context);
    setIsModalOpen(true);
    // If opening full modal, close micro prompt
    setIsMicroOpen(false);
  }, []);

  const triggerMicroFeedback = useCallback((context: string) => {
    if (hasPrompted) return; // Limit to once per session for UX safety
    
    // Small delay to not block UI immediately after action
    setTimeout(() => {
        setMicroContext(context);
        setIsMicroOpen(true);
        setHasPrompted(true);
    }, 1500);
  }, [hasPrompted]);

  const closeMicro = () => setIsMicroOpen(false);

  return (
    <FeedbackContext.Provider value={{ openFeedback, triggerMicroFeedback }}>
      {children}
      
      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        context={modalContext}
      />
      
      <MicroFeedback 
        isVisible={isMicroOpen}
        context={microContext}
        onClose={closeMicro}
        onOpenFullFeedback={() => openFeedback(microContext)}
      />
    </FeedbackContext.Provider>
  );
};

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
