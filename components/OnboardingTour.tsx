
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Compass, Globe, PieChart, Settings, Plus, LayoutGrid } from 'lucide-react';

interface Step {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightSelector?: string;
  icon?: any;
}

const STEPS: Step[] = [
  {
    target: 'center',
    title: "Welcome to SubscriptionHub",
    content: "Let's get your finances in order. This quick tour will show you how to track, manage, and optimize your global subscriptions.",
    position: 'center',
    icon: Compass
  },
  {
    target: 'stats-cards',
    title: "Dashboard Overview",
    content: "Here's your financial heartbeat. See your monthly total, active subscriptions count, and an annual forecast based on your current spending.",
    position: 'bottom',
    highlightSelector: '[data-tour="stats-cards"]',
    icon: LayoutGrid
  },
  {
    target: 'add-btn',
    title: "Add Subscription",
    content: "Click here to add Netflix, Spotify, or any recurring expense. You can manually enter prices in any currency.",
    position: 'bottom',
    highlightSelector: '[data-tour="add-btn"]',
    icon: Plus
  },
  {
    target: 'nav-settings',
    title: "Regional Preferences",
    content: "Currency conversions depend on your region. You can change your base currency and country preferences here in Settings at any time.",
    position: 'right',
    highlightSelector: '[data-tour="nav-settings"]',
    icon: Globe
  },
  {
    target: 'nav-analytics',
    title: "Analytics",
    content: "Visualize your spending habits with charts. Use the date filter to see how your budget changes over time.",
    position: 'right',
    highlightSelector: '[data-tour="nav-analytics"]',
    icon: PieChart
  },
  {
    target: 'nav-compare',
    title: "Global Comparison",
    content: "See how much you're paying compared to other countries. Note: This tool is informational and uses reference pricing data.",
    position: 'right',
    highlightSelector: '[data-tour="nav-compare"]',
    icon: Globe
  },
  {
    target: 'nav-settings',
    title: "Settings & Data",
    content: "Manage your theme (Light/Dark), export your data to CSV, or clear your local storage here.",
    position: 'right',
    highlightSelector: '[data-tour="nav-settings"]',
    icon: Settings
  },
  {
    target: 'center',
    title: "You're All Set",
    content: "Start tracking with confidence. Your data stays on this device.",
    position: 'center',
    icon: Check
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
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          position: 'fixed',
          borderRadius: '16px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
          zIndex: 90,
          pointerEvents: 'none',
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
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
      transition: 'all 0.4s ease-in-out'
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
    
    if (step.highlightSelector) {
       const element = document.querySelector(step.highlightSelector);
       if(element) {
           const rect = element.getBoundingClientRect();
           const margin = 20;
           if(step.position === 'bottom') return { top: rect.bottom + margin, left: rect.left + rect.width/2 - 160 };
           if(step.position === 'top') return { bottom: window.innerHeight - rect.top + margin, left: rect.left + rect.width/2 - 160 };
           if(step.position === 'right') return { top: rect.top, left: rect.right + margin };
           if(step.position === 'left') return { top: rect.top, right: window.innerWidth - rect.left + margin };
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
        className="fixed z-[100] w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300"
        style={getModalStyle()}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={16} />
        </button>

        <div className="mb-4">
           <div className="flex items-center gap-2 mb-3">
              {step.icon && <step.icon size={18} className="text-blue-600 dark:text-blue-400" />}
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Step {currentStep + 1} of {STEPS.length}
              </span>
           </div>
           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.content}</p>
        </div>

        <div className="flex items-center justify-between mt-6">
           <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-blue-600 w-4' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
           </div>
           <div className="flex gap-2">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                   <ChevronLeft size={18} />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex items-center gap-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-900/10 dark:shadow-none"
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
