import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Lightbulb, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function HintCardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  const hints = useMemo(() => [
    t("hint.1"),
    t("hint.2"),
    t("hint.3"),
    t("hint.4"),
    t("hint.5"),
    t("hint.6"),
    t("hint.7"),
    t("hint.8"),
    t("hint.9"),
    t("hint.10")
  ], [t]);

  const nextHint = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % hints.length);
      setIsAnimating(false);
    }, 300); // Wait for exit animation
  }, [hints.length]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPaused) {
      interval = setInterval(() => {
        nextHint();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPaused, nextHint]);

  return (
    <div 
      className="relative group/card cursor-pointer select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={nextHint}
      role="button"
      aria-label={`Hint tip: ${hints[currentIndex]}`}
    >
      {/* Card Container with Gradient Border Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1B3A6D] via-[#3ABEFF] to-[#1B3A6D] rounded-2xl opacity-20 group-hover/card:opacity-40 transition duration-500 blur-[1px]"></div>
      
      <div className="relative overflow-hidden p-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-32 flex flex-col justify-center">
        
        {/* Decorative Side Bar */}
        <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-1.5 h-full bg-gradient-to-b from-[#1B3A6D] to-[#3ABEFF] transition-all duration-300"></div>
        
        {/* Content */}
        <div className="flex items-start gap-4 px-2">
          <div className="flex-shrink-0 mt-1 rtl:ml-2">
            {currentIndex % 2 === 0 ? (
               <Sparkles className="w-5 h-5 text-[#3ABEFF] animate-pulse" />
            ) : (
               <Lightbulb className="w-5 h-5 text-yellow-500 animate-pulse" />
            )}
          </div>

          <div className="flex-1 relative h-full overflow-hidden">
             <p 
               key={currentIndex}
               className={`text-gray-700 text-lg font-medium leading-relaxed transition-all duration-500 ease-in-out transform
                 ${isAnimating ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}
                 animate-in fade-in slide-in-from-bottom-2
               `}
             >
               {hints[currentIndex]}
             </p>
          </div>

          <div className="flex-shrink-0 self-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 -mr-2 rtl:mr-0 rtl:-ml-2">
            <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180" />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
           <div 
             className="h-full bg-gradient-to-r from-[#1B3A6D] to-[#3ABEFF] transition-all duration-[5000ms] ease-linear"
             style={{ width: isPaused ? `${((currentIndex + 1) / hints.length) * 100}%` : '100%', opacity: isPaused ? 0.5 : 0.2, transitionDuration: isPaused ? '0ms' : '5000ms' }}
             key={currentIndex} // Resets animation on index change
           ></div>
        </div>

      </div>
    </div>
  );
}