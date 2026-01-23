import React, { useEffect, useRef, useState } from 'react';
import BrandIcon from './BrandIcon';
import { ALL_SUBSCRIPTIONS, BRAND_COLORS } from '../utils/data';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  brand: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  scale: number;
  color: string;
}

const PARTICLE_COUNT = 30;

export default function FloatingLogoLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>(0);
  const hoveredRef = useRef<number | null>(null);

  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { offsetWidth: width, offsetHeight: height } = containerRef.current;
    
    const initialParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      // Pick a random brand
      const randomBrand = ALL_SUBSCRIPTIONS[Math.floor(Math.random() * ALL_SUBSCRIPTIONS.length)];
      const brandKey = randomBrand.toLowerCase().replace(/\s+/g, '');
      const color = BRAND_COLORS[brandKey] || BRAND_COLORS['default'];

      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8, // Slow velocity
        vy: (Math.random() - 0.5) * 0.8,
        size: 16 + Math.random() * 16, // Varying sizes
        brand: randomBrand,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        opacity: 0.3 + Math.random() * 0.4,
        scale: 1,
        color: color
      };
    });

    setParticles(initialParticles);
  }, []);

  // Animation Loop
  const animate = () => {
    setParticles(prevParticles => {
      const { offsetWidth: width, offsetHeight: height } = containerRef.current || { offsetWidth: 1000, offsetHeight: 1000 };
      
      return prevParticles.map(p => {
        // Skip update if hovered
        if (hoveredRef.current === p.id) {
            return { ...p, scale: 1.5, opacity: 1 };
        }

        let newX = p.x + p.vx;
        let newY = p.y + p.vy;
        let newVx = p.vx;
        let newVy = p.vy;

        // Bounce off edges with soft dampening
        if (newX < 0 || newX > width) newVx = -p.vx;
        if (newY < 0 || newY > height) newVy = -p.vy;

        return {
          ...p,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          rotation: p.rotation + p.rotationSpeed,
          scale: 1, // Reset scale if not hovered
          opacity: 0.3 + (Math.sin(Date.now() / 1000 + p.id) * 0.1) // Subtle breathing opacity
        };
      });
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute flex items-center justify-center pointer-events-auto transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg) scale(${p.scale})`,
            opacity: p.opacity,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          onMouseEnter={() => { hoveredRef.current = p.id; }}
          onMouseLeave={() => { hoveredRef.current = null; }}
        >
          {/* Wing/Trail Effect */}
          <div 
            className="absolute inset-0 rounded-full blur-[2px] opacity-50 animate-pulse"
            style={{ backgroundColor: p.color }}
          ></div>
          
          {/* Icon */}
          <div className="relative z-10 w-full h-full bg-white rounded-lg shadow-sm border border-black/5 overflow-hidden">
             <BrandIcon type={p.brand} className="w-full h-full" noBackground />
          </div>

          {/* Tooltip on Hover */}
          {hoveredRef.current === p.id && (
             <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200">
                {p.brand}
             </div>
          )}
        </div>
      ))}
    </div>
  );
}