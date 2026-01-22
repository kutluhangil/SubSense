import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-8", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon: Abstract Circular Hub */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto aspect-square"
      >
        <defs>
          <linearGradient id="hubGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B3A6D" />
            <stop offset="100%" stopColor="#3ABEFF" />
          </linearGradient>
        </defs>
        
        {/* Outer Swirls */}
        <path 
          d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36" 
          stroke="url(#hubGradient)" 
          strokeWidth="3.5" 
          strokeLinecap="round"
          className="opacity-100"
        />
        <path 
          d="M36 20C36 11.1634 28.8366 4 20 4" 
          stroke="url(#hubGradient)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeOpacity="0.8"
        />
        <path 
          d="M20 36C28.8366 36 36 28.8366 36 20" 
          stroke="url(#hubGradient)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeOpacity="0.6"
        />
        
        {/* Inner Hub Dots/Connection */}
        <circle cx="20" cy="20" r="4" fill="url(#hubGradient)" />
        <circle cx="20" cy="12" r="2" fill="#3ABEFF" />
        <circle cx="28" cy="20" r="2" fill="#3ABEFF" />
        <circle cx="20" cy="28" r="2" fill="#1B3A6D" />
        <circle cx="12" cy="20" r="2" fill="#1B3A6D" />
      </svg>

      {/* Text */}
      {showText && (
        <span className="font-bold text-xl tracking-tight text-gray-900">
          Subscription<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B3A6D] to-[#3ABEFF]">Hub</span>
        </span>
      )}
    </div>
  );
}