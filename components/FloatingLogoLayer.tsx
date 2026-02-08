import React, { useEffect, useState, useMemo } from 'react';
import { LogoRenderer } from './LogoRenderer';
import { getBrandLogo } from '../utils/logoUtils';
import { ALL_SUBSCRIPTIONS, BRAND_COLORS } from '../utils/data';

interface StarLogo {
  id: number;
  brand: string;
  logoUrl: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  scale: number;
}

const MAX_STARS = 25; // Desktop limit
const MIN_STARS = 12; // Mobile limit

export default function FloatingLogoLayer() {
  const [stars, setStars] = useState<StarLogo[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isMobile, setIsMobile] = useState(false);

  // 1. Filter only brands with valid SVGs
  const validBrands = useMemo(() => {
    return ALL_SUBSCRIPTIONS.filter(brand => getBrandLogo(brand) !== null);
  }, []);

  // 2. Handle Resizing & Device Check
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
    };

    // Initial call
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Initialize / Regenerate Stars
  useEffect(() => {
    const count = isMobile ? MIN_STARS : MAX_STARS;
    const newStars: StarLogo[] = [];

    for (let i = 0; i < count; i++) {
      const brand = validBrands[Math.floor(Math.random() * validBrands.length)];
      const logoUrl = getBrandLogo(brand)!; // Validated in filter

      // Randomize Position (Avoid Center)
      // We want a "shooting star" feel, usually moving diagonally from Top-Left or Top-Right.
      // Let's make them drift slowly across the screen in various directions or a unified flow.
      // Unified flow (Top-Right to Bottom-Left) looks premium.

      // Logic:
      // Start randomly off-screen or on-screen.
      // We will use CSS animations for the movement to ensure smoothness (GPU).
      // Here we just set initial stable properties.

      // To avoid center:
      // We can't easily perform "avoid center" with pure CSS animation loops without complex keyframes.
      // Instead, we'll use a wide dispersion and low opacity so if they cross, it's subtle.

      newStars.push({
        id: i,
        brand,
        logoUrl,
        x: Math.random() * 100, // %
        y: Math.random() * 100, // %
        size: isMobile ? 30 + Math.random() * 20 : 40 + Math.random() * 30,
        duration: 15 + Math.random() * 20, // 15s to 35s (Slow)
        delay: Math.random() * -30, // Negative delay to start mid-animation
        opacity: 0.1 + Math.random() * 0.2, // 0.1 to 0.3 (Very subtle)
        scale: 0.8 + Math.random() * 0.4,
      });
    }
    setStars(newStars);
  }, [dimensions.width, isMobile, validBrands]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background Gradient Mesh (Subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0)_0%,rgba(240,240,255,0.5)_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0)_0%,rgba(15,23,42,0.8)_100%)] opacity-40"></div>

      {stars.map((star) => {
        // Safe brand key for colors
        const brandKey = star.brand.toLowerCase().replace(/\s+/g, '');
        const brandColor = BRAND_COLORS[brandKey] || '#6366f1';

        return (
          <div
            key={star.id}
            className="absolute will-change-transform"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `float-diagonal ${star.duration}s linear infinite`,
              animationDelay: `${star.delay}s`,
            }}
          >
            {/* The Logo Container */}
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform hover:scale-110 duration-500"
              style={{ transform: `scale(${star.scale})` }}
            >
              {/* Soft Trail / Glow */}
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ background: brandColor }}
              ></div>

              {/* Crisp Logo */}
              <LogoRenderer
                logoUrl={star.logoUrl}
                name={star.brand}
                className="w-full h-full object-contain drop-shadow-lg"
                variant="auto" // Let colors pop, but low opacity parent handles subtlety
              />
            </div>
          </div>
        );
      })}

      {/* CSS Injection for Animation */}
      <style>{`
        @keyframes float-diagonal {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, 20px) rotate(2deg);
          }
          50% {
             transform: translate(0, 40px) rotate(-1deg);
          }
          75% {
             transform: translate(-20px, 20px) rotate(1deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
        /* More complex motion path if needed, but subtle floating is often better than "shooting" across screen which is distracting */
      `}</style>
    </div>
  );
}