import React from 'react';

interface BrandIconProps {
  type: string;
  className?: string;
  noBackground?: boolean;
}

const BrandIcon: React.FC<BrandIconProps> = ({ type, className = "w-10 h-10", noBackground = false }) => {
  const baseClasses = `flex items-center justify-center relative overflow-hidden flex-shrink-0 ${noBackground ? '' : 'bg-white'} ${className}`;
  const normalizedType = type.toLowerCase().replace(/\s+/g, '');

  const renderIcon = () => {
    switch (normalizedType) {
      case 'netflix':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.0002 4H18.0002V20H14.0002V4Z" fill="#E50914"/>
            <path d="M6.00018 4H10.0002V20H6.00018V4Z" fill="#E50914"/>
            <path d="M6.00018 4L17.9998 20.0001H13.9998L6.00018 4Z" fill="#B81D24"/>
          </svg>
        );
      case 'spotify':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="12" cy="12" r="10" fill="#1DB954"/>
             <path d="M16.8 16.7C16.7 17 16.3 17.1 16 16.9C13.8 15.6 11.1 15.3 7 16.2C6.7 16.3 6.4 16.1 6.3 15.8C6.2 15.5 6.4 15.2 6.8 15.1C11.2 14.1 14.2 14.4 16.7 15.9C16.9 16.1 17 16.4 16.8 16.7ZM18.2 13.6C17.9 14 17.4 14.1 17.1 13.9C14.3 12.2 10 11.7 6.5 12.8C6.1 12.9 5.7 12.6 5.5 12.2C5.4 11.8 5.7 11.4 6.1 11.3C10.1 10.1 14.8 10.6 18 12.6C18.4 12.8 18.5 13.3 18.2 13.6ZM18.3 10.5C14.9 8.5 9.1 8.3 5.8 9.3C5.3 9.4 4.7 9.1 4.5 8.6C4.3 8.1 4.6 7.5 5.2 7.3C9.1 6.2 15.5 6.4 19.4 8.7C19.9 9 20 9.6 19.8 10.1C19.5 10.5 18.8 10.7 18.3 10.5Z" fill="white"/>
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
};

export default BrandIcon;