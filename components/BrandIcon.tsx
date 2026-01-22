import React from 'react';

interface BrandIconProps {
  type: string;
  className?: string;
  noBackground?: boolean;
}

const BrandIcon: React.FC<BrandIconProps> = ({ type, className = "w-10 h-10", noBackground = false }) => {
  const baseClasses = `flex items-center justify-center overflow-hidden flex-shrink-0 ${noBackground ? '' : 'bg-white'} ${className}`;
  const normalizedType = type.toLowerCase().replace(/\s+/g, '');
  
  // Helper to generate a consistent color based on string
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const renderIcon = () => {
    switch (normalizedType) {
      case 'netflix':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 2L14.5 2V22L16.5 22V2Z" fill="#E50914"/>
            <path d="M7.5 2L9.5 2V22L7.5 22V2Z" fill="#E50914"/>
            <path d="M7.5 2L16.5 22H14.5L5.5 2H7.5Z" fill="#B81D24"/>
          </svg>
        );
      case 'spotify':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#1DB954"/>
            <path d="M16.5 16.5C16.3 16.8 15.8 16.9 15.5 16.7C13.8 15.7 11.6 15.5 9.7 15.9C9.3 16 9 15.7 8.9 15.4C8.8 15 9.1 14.7 9.4 14.6C11.6 14.1 14.1 14.4 16 15.6C16.3 15.8 16.4 16.2 16.5 16.5ZM17.6 13.6C17.3 14 16.8 14.1 16.4 13.9C14.3 12.6 11.1 12.2 8.7 13C8.2 13.1 7.8 12.8 7.7 12.4C7.6 11.9 7.8 11.5 8.2 11.4C11.1 10.5 14.7 10.9 17.2 12.5C17.6 12.7 17.7 13.2 17.6 13.6ZM17.7 10.6C15.1 9.1 10.8 8.9 8.2 9.7C7.8 9.8 7.3 9.6 7.2 9.2C7 8.8 7.3 8.3 7.7 8.2C10.7 7.3 15.5 7.5 18.5 9.3C18.9 9.5 19 10 18.8 10.4C18.5 10.7 18 10.8 17.7 10.6Z" fill="white"/>
          </svg>
        );
      case 'amazon':
      case 'amazonprime':
      case 'amazonprimevideo':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 13.5C19.5 13.5 18 17 12 17C6 17 4.5 13.5 4.5 13.5" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/>
            <rect x="2" y="2" width="20" height="20" rx="4" fill="#232F3E"/>
            <path d="M16 9C16 9 14.5 7 12 7C9.5 7 8 9 8 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M19.5 13.5L18.5 12" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case 'youtube':
      case 'youtubepremium':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="4" fill="#FF0000"/>
            <path d="M10 9L15 12L10 15V9Z" fill="white"/>
          </svg>
        );
      case 'apple':
      case 'appletv+':
      case 'applemusic':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.3 18.2C16.8 18.9 16.2 19.8 15.3 19.8C14.5 19.8 14.2 19.3 13.2 19.3C12.2 19.3 11.9 19.8 11.1 19.8C10.3 19.8 9.6 18.9 9.1 18.1C8.2 16.6 7.5 14.3 8.4 12.6C8.8 11.8 9.6 11.2 10.5 11.2C11.3 11.2 11.9 11.7 12.4 11.7C12.9 11.7 13.6 11.1 14.5 11.1C14.8 11.1 15.8 11.2 16.4 12.1C16.3 12.2 15.7 12.5 15.7 13.3C15.7 14.3 16.6 14.7 16.6 14.7C16.6 14.8 16.4 15.5 16.1 16C15.9 16.4 15.6 16.9 15.1 17.6L17.3 18.2ZM13.8 9.7C14.2 9.2 14.5 8.5 14.4 7.8C13.7 7.9 12.9 8.3 12.4 8.9C12 9.4 11.6 10.1 11.7 10.8C12.5 10.9 13.3 10.4 13.8 9.7Z" />
          </svg>
        );
      case 'adobe':
      case 'adobecreativecloud':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#FF0000"/>
            <path d="M15 6H19V18L15 6Z" fill="white"/>
            <path d="M9 6H5V18L9 6Z" fill="white"/>
            <path d="M12 6L9.5 18H14.5L12 6Z" fill="white"/>
          </svg>
        );
      case 'google':
      case 'googleone':
      case 'googleworkspace':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        );
      default:
        // Generic Fallback for the huge list
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-bold text-sm">
             {type.charAt(0).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className={baseClasses} title={type}>
      {renderIcon()}
    </div>
  );
};

export default BrandIcon;