
import React, { useState } from 'react';
import { SUBSCRIPTION_CATALOG } from '../utils/data';

interface BrandIconProps {
  type: string;
  className?: string;
  noBackground?: boolean;
}

const BrandIcon: React.FC<BrandIconProps> = React.memo(({ type, className = "w-10 h-10", noBackground = false }) => {
  const baseClasses = `flex items-center justify-center relative overflow-hidden flex-shrink-0 ${noBackground ? '' : 'bg-white'} ${className}`;
  const normalizedType = type?.toLowerCase().replace(/\s+/g, '') || 'default';
  const [imageError, setImageError] = useState(false);
  const [localImageError, setLocalImageError] = useState(false);

  // Check if we have a website url for this type to fetch a logo
  // Lookup first by key, then scan for matching ID/Name if key fails
  let serviceDetail = SUBSCRIPTION_CATALOG[normalizedType];
  
  if (!serviceDetail) {
     const foundKey = Object.keys(SUBSCRIPTION_CATALOG).find(k => 
        k === normalizedType || 
        SUBSCRIPTION_CATALOG[k].name.toLowerCase().replace(/\s+/g, '') === normalizedType
     );
     if (foundKey) serviceDetail = SUBSCRIPTION_CATALOG[foundKey];
  }

  // Priority 1: Local Asset (Specifically for Netflix as requested)
  // We attempt to load from /images/netflix.svg, then png, then jpg via fallback logic or direct check
  if (normalizedType === 'netflix' && !localImageError) {
      return (
        <div className={baseClasses} title={type}>
            <img 
                src="/images/netflix.svg" 
                alt="Netflix Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                    // Try PNG fallback if SVG fails
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith('.svg')) {
                        target.src = '/images/netflix.png';
                    } else if (target.src.endsWith('.png')) {
                        target.src = '/images/netflix.jpg';
                    } else {
                        setLocalImageError(true);
                    }
                }}
            />
        </div>
      );
  }

  // Priority 2: External Clearbit Logo
  const externalLogoUrl = !imageError && serviceDetail?.website 
    ? `https://logo.clearbit.com/${serviceDetail.website}` 
    : null;

  if (externalLogoUrl) {
    return (
      <div className={baseClasses} title={type}>
        <img 
          src={externalLogoUrl} 
          alt={`${type} logo`} 
          className="w-full h-full object-contain p-[10%]"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Priority 3: Internal SVG Fallbacks
  const renderIcon = () => {
    switch (normalizedType) {
      case 'netflix':
        // Improved Netflix N Logo
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 4H11.5V19.5L8.5 20V4Z" fill="#E50914" />
            <path d="M15.5 4H12.5V19.5L15.5 20V4Z" fill="#E50914" />
            <path d="M8.5 4L15.5 20H12.5L8.5 10V4Z" fill="#D81F26" />
            <path d="M8.5 4H5.5V20H8.5V4Z" fill="transparent" /> {/* Spacer */}
          </svg>
        );
      case 'spotify':
        // Authentic Spotify Logo
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="12" cy="12" r="12" fill="#1DB954"/>
             <path d="M17.5 17.2C17.4 17.5 17.0 17.6 16.7 17.4C14.6 16.1 11.9 15.9 7.8 16.8C7.5 16.9 7.1 16.7 7.0 16.4C6.9 16.1 7.1 15.7 7.5 15.6C12.0 14.6 15.0 14.9 17.4 16.3C17.7 16.5 17.8 16.9 17.5 17.2ZM18.9 14.0C18.6 14.4 18.1 14.5 17.7 14.3C14.9 12.6 10.6 12.1 7.1 13.2C6.7 13.3 6.2 13.1 6.1 12.6C5.9 12.2 6.2 11.8 6.6 11.7C10.6 10.5 15.4 11.0 18.6 13.0C19.0 13.3 19.1 13.7 18.9 14.0ZM19.0 10.9C15.6 8.9 9.7 8.7 6.4 9.7C5.9 9.8 5.3 9.5 5.2 9.0C5.0 8.5 5.3 7.9 5.8 7.7C9.7 6.6 16.2 6.8 20.1 9.1C20.6 9.4 20.7 10.0 20.4 10.5C20.1 10.9 19.5 11.1 19.0 10.9Z" fill="white"/>
          </svg>
        );
      case 'amazon':
      case 'amazonprime':
      case 'amazonprimevideo':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8 13.5c.1.9-.3 1.5-1.6 1.5-1.3 0-2.3-.6-2.5-.7l-.4 1.1c.3.2 1.4.9 3.2.9 2.1 0 3.2-1.2 3.2-3.1V6.7h-2.3v1c-.7-.8-1.9-1.2-3.2-1.2-2.8 0-4.4 1.9-4.4 4.5 0 2.5 1.7 4.5 4.3 4.5 1.3 0 2.4-.5 3.1-1.3l.6 1.3zm-3.6-5.8c1.6 0 2.7 1.1 2.7 3.2s-1.1 3.2-2.7 3.2c-1.6 0-2.7-1.1-2.7-3.2s1.1-3.2 2.7-3.2z" fill="#000"/>
            <path d="M17.7 17.8c-.1 0-.3.1-.4.2-.6.5-1.9 1-3.6 1-4.3 0-5.8-3.3-5.8-3.4-.1-.2-.4-.2-.5 0l-.6.7c-.1.2-.1.5.1.7.2.3 2 4 6.7 4 2 0 3.6-.6 4.3-1.2.2-.1.2-.4.1-.6l-.3-1.4z" fill="#FF9900"/>
            <path d="M18.4 15.5c-.5.4-1.2.4-1.2.4-.2 0-.3.2-.2.4l.2.8c.1.2.3.2.5.2 0 0 1.9 0 2.9-1.2.1-.1 0-.3-.1-.4l-2.1-.2z" fill="#FF9900"/>
          </svg>
        );
      case 'youtube':
      case 'youtubepremium':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M21.6 6.2c-.2-.9-.9-1.5-1.8-1.8C18.3 4 12 4 12 4s-6.3 0-7.8.4c-.9.2-1.5.9-1.8 1.8C2 7.7 2 12 2 12s0 4.3.4 5.8c.2.9.9 1.5 1.8 1.8 1.6.4 7.8.4 7.8.4s6.3 0 7.8-.4c.9-.2 1.5-.9 1.8-1.8.4-1.5.4-5.8.4-5.8s0-4.3-.4-5.8z" fill="#FF0000"/>
             <path d="M10 15.5l6-3.5-6-3.5v7z" fill="white"/>
          </svg>
        );
      case 'apple':
      case 'appletv+':
      case 'applemusic':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="black" xmlns="http://www.w3.org/2000/svg">
             <path d="M17.05 18.26c-.3.8-.8 1.7-1.4 2.4-.6.7-1.3.7-1.8.7-.5 0-1-.3-1.9-.3-1 0-1.4.3-1.9.3-.5 0-1.1-.1-1.8-.8-.9-1-1.6-2.8-1.6-4.4 0-2.4 1.5-3.6 3-3.6.6 0 1.2.2 1.6.5.4.3.9.5 1.5.5.6 0 1.5-.3 2.1-.5.7-.3 1.3-.3 1.8 0 .4.2 1.8 1 1.8 1-.1.2-.9 1.1-.9 2.6 0 2.1 1.8 2.8 1.9 2.9-.1.2-.2.5-.3.7zm-2.9-15c.5-.6.9-1.4.9-2.2 0-.1 0-.2 0-.3-.8 0-1.7.5-2.2 1.1-.4.5-.8 1.3-.8 2.1 0 .1 0 .2 0 .3.8.1 1.7-.3 2.1-1z"/>
          </svg>
        );
      case 'adobe':
      case 'adobecreativecloud':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
             <rect width="24" height="24" rx="2" fill="#FF0000"/>
             <path d="M15 6h4v13h-3v-5h-3l2-8zM9 6H5v13h3v-5h3L9 6zM12.5 16l1.5-4h-4l1.5 4h1z" fill="white"/>
          </svg>
        );
      case 'google':
      case 'googleone':
      case 'googleworkspace':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        );
      case 'canva':
      case 'canvapro':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#00C4CC"/>
            <path d="M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z" fill="white" fillOpacity="0.3"/>
            <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" fill="white"/>
          </svg>
        );
      case 'hepsiburada':
      case 'hepsiburadapremium':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="#F68B1E" rx="4"/>
            <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z" fill="white"/>
            <path d="M12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5Z" fill="white"/>
          </svg>
        );
      case 'trendyol':
      case 'trendyolelite':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="#FF6600" rx="4"/>
            <path d="M8 8H16L12 14L8 8Z" fill="white"/>
            <path d="M12 14V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'disney':
      case 'disney+':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="#113CCF" rx="4"/>
            <path d="M12 6C8 6 6 9 6 12C6 15 8 18 12 18C15 18 18 15 18 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 10C16 9 17 8 18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 14C12 14 14 13 16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'gamepass':
      case 'xbox':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#107C10"/>
            <path d="M12 6L16 12L12 18L8 12L12 6Z" fill="white" fillOpacity="0.2"/>
            <path d="M7 7L17 17M17 7L7 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        // Generic Fallback
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-bold text-sm rounded">
             {type.slice(0, 1).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className={baseClasses} title={type}>
      <div className="w-full h-full p-[18%] flex items-center justify-center">
        {renderIcon()}
      </div>
    </div>
  );
});

export default BrandIcon;
