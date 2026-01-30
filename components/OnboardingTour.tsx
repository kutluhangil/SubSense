
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface Step {
  target: string; // ID or description of where to point (visually managed via fixed positions for MVP)
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightSelector?: string; // CSS selector to highlight
}

const STEPS: Step[] = [
  {
    target: 'center',
    title: "Welcome to SubscriptionHub",
    content: "Let's get your finances in order. This quick tour will show you how to track and optimize your subscriptions.",
    position: 'center'
  },
  {
    target: 'stats-cards',
    title: "At a Glance",
    content: "See your monthly spend, active subscriptions, and annual forecast updated in real-time.",
    position: 'bottom',
    highlightSelector: '[data-tour="stats-cards"]'
  },
  {
    target: 'add-btn',
    title: "Add Your First Subscription",
    content: "Click here to add Netflix, Spotify, or any other recurring expense to your dashboard.",
    position: 'bottom',
    highlightSelector: '[data-tour="add-btn"]'
  },
  {
    target: 'analytics-nav',
    title: "Deep Dive Analytics",
    content: "Visit the Analytics page to see spending trends and AI-powered savings insights.",
    position: 'right',
    highlightSelector: '[data-tour="nav-analytics"]'
  },
  {
    target: 'compare-nav',
    title: "Global Comparison",
    content: "Check if you're paying too much by comparing prices across different regions.",
    position: 'right',
    highlightSelector: '[data-tour="nav-compare"]'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const step = STEPS[currentStep];
    if (step.highlightSelector) {
      const element = document.querySelector(step.highlightSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightStyle({
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          position: 'fixed',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
          zIndex: 90,
          pointerEvents: 'none',
          transition: 'all 0.3s ease-in-out'
        });
        return;
      }
    }
    // Default for center/no highlight
    setHighlightStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 90,
      pointerEvents: 'none',
      transition: 'all 0.3s ease-in-out'
    });
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  // Calculate modal position
  const getModalStyle = (): React.CSSProperties => {
    if (step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    
    // For MVP, we'll use simple offsets relative to the viewport center or fixed positions
    // In a real app, use popper.js or similar
    if (step.highlightSelector) {
       const element = document.querySelector(step.highlightSelector);
       if(element) {
           const rect = element.getBoundingClientRect();
           if(step.position === 'bottom') return { top: rect.bottom + 20, left: rect.left + rect.width/2 - 160 };
           if(step.position === 'top') return { bottom: window.innerHeight - rect.top + 20, left: rect.left + rect.width/2 - 160 };
           if(step.position === 'right') return { top: rect.top, left: rect.right + 20 };
       }
    }
    
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  };

  return (
    <>
      {/* Highlight Mask */}
      <div style={highlightStyle} />

      {/* Tooltip Card */}
      <div 
        className="fixed z-[100] w-80 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-300"
        style={getModalStyle()}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>

        <div className="mb-4">
           <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-2 inline-block">
             Step {currentStep + 1} of {STEPS.length}
           </span>
           <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
           <p className="text-sm text-gray-500 leading-relaxed">{step.content}</p>
        </div>

        <div className="flex items-center justify-between mt-6">
           <div className="flex gap-1">
              {STEPS.map((_, i) => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStep ? 'bg-gray-900' : 'bg-gray-200'}`} />
              ))}
           </div>
           <div className="flex gap-2">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                   <ChevronLeft size={18} />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex items-center gap-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
              >
                 {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
                 {currentStep === STEPS.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
              </button>
           </div>
        </div>
      </div>
    </>
  );
}
