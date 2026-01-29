
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ParticleCharProps {
  char: string;
  phase: 'enter' | 'active' | 'exit';
  index: number;
}

// Individual Character Particle Component
const ParticleChar: React.FC<ParticleCharProps> = ({ char, phase, index }) => {
  // Memoize random physics so they are stable for this character instance
  const physics = useMemo(() => ({
    x: (Math.random() - 0.5) * 80,   // Spread sideways
    y: -50 - Math.random() * 100,    // Float upwards significantly
    r: (Math.random() - 0.5) * 90,   // Rotation
    s: 0.5 + Math.random() * 0.5,    // Scale reduction
    delay: Math.random() * 0.5,      // Staggered delay for dissolve
    blur: 2 + Math.random() * 4      // Blur amount
  }), []);

  // Determine styles based on phase
  let style: React.CSSProperties = {
    display: 'inline-block',
    minWidth: char === ' ' ? '0.3em' : 'auto',
    backfaceVisibility: 'hidden',
    willChange: 'transform, opacity, filter',
  };

  if (phase === 'enter') {
    style = {
      ...style,
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
      filter: 'blur(0)',
      transition: 'opacity 1s ease-out, transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
      animation: 'fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
    };
  } else if (phase === 'active') {
    style = {
      ...style,
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
      filter: 'blur(0)',
      transition: 'all 0.5s ease-out'
    };
  } else if (phase === 'exit') {
    style = {
      ...style,
      opacity: 0,
      transform: `translate3d(${physics.x}px, ${physics.y}px, 0) rotate(${physics.r}deg) scale(${physics.s})`,
      filter: `blur(${physics.blur}px)`,
      transition: `opacity 1s ease-in, transform 1.5s cubic-bezier(0.4, 0, 0.2, 1), filter 1.5s ease-in`,
      transitionDelay: `${physics.delay}s`
    };
  }

  return <span style={style}>{char}</span>;
};

interface AnimatedWordProps {
  word: string;
  phase: 'enter' | 'active' | 'exit';
  baseIndex: number;
}

// Word Wrapper to handle line breaks correctly
const AnimatedWord: React.FC<AnimatedWordProps> = ({ word, phase, baseIndex }) => (
  <span className="inline-block whitespace-nowrap">
    {word.split('').map((char, i) => (
      <ParticleChar key={i} char={char} phase={phase} index={baseIndex + i} />
    ))}
    {/* Add space after word */}
    <span className="inline-block" style={{ width: '0.25em' }}></span> 
  </span>
);

const DisintegratingText = ({ text, className, phase }: { text: string, className: string, phase: 'enter' | 'active' | 'exit' }) => {
  const words = text.split(' ');
  let charCount = 0;

  return (
    <div className={className} aria-label={text}>
      {words.map((word, i) => {
        const currentBase = charCount;
        charCount += word.length;
        return (
          <AnimatedWord key={`${text}-${i}`} word={word} phase={phase} baseIndex={currentBase} />
        );
      })}
    </div>
  );
};

export default function HeroTextRotator() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'active' | 'exit'>('enter');
  const { t } = useLanguage();

  const messages = useMemo(() => [
    {
      headline: t("msg.headline_1"),
      subtext: t("msg.subtext_1")
    },
    {
      headline: t("msg.headline_2"),
      subtext: t("msg.subtext_2")
    },
    {
      headline: t("msg.headline_3"),
      subtext: t("msg.subtext_3")
    },
    {
      headline: t("msg.headline_4"),
      subtext: t("msg.subtext_4")
    }
  ], [t]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'enter') {
      // Allow 1s for fade in animation to complete
      timeout = setTimeout(() => setPhase('active'), 1000);
    } else if (phase === 'active') {
      // Stay visible for 5s
      timeout = setTimeout(() => setPhase('exit'), 5000);
    } else if (phase === 'exit') {
      // Wait for dissolve (1.5s) + delay (0.5s) = 2s total
      timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setPhase('enter');
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [phase, messages.length]);

  const msg = messages[index] || messages[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[240px] w-full max-w-4xl mx-auto px-4 perspective-[1000px]">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>

      {/* Screen Reader Only Live Region */}
      <div className="sr-only" aria-live="polite">
        {msg.headline}. {msg.subtext}
      </div>

      {/* Visual Animated Text */}
      <div aria-hidden="true" className="w-full">
        <DisintegratingText 
          text={msg.headline} 
          phase={phase}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 text-center leading-[1.1]"
        />
        
        <DisintegratingText 
          text={msg.subtext} 
          phase={phase}
          className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed text-center"
        />
      </div>
    </div>
  );
}
