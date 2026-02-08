import React, { useState } from 'react';

interface LogoRendererProps {
    logoUrl: string;
    name: string;
    className?: string; // For sizing (w, h) and positioning
    variant?: 'color' | 'white' | 'auto'; // 'auto' decides based on logo type or parent
    fallback?: React.ReactNode;
}

/* 
  Special handling list for logos that should NOT be inverted even in dark/brand contexts 
  because they are already designed to work on those backgrounds or are multi-colored.
*/
const KEEP_ORIGINAL_COLORS = [
    'netflix', 'youtube', 'google', 'microsoft', 'slack', 'notion', 'spotify',
    'playstation', 'xbox', 'adobe', 'mastercard', 'visa', 'masterpass',
    'duolingo', 'discord', 'twitch', 'dropbox', 'canva'
];

export const LogoRenderer: React.FC<LogoRendererProps> = ({
    logoUrl,
    name,
    className = "",
    variant = 'auto',
    fallback
}) => {
    const [hasError, setHasError] = useState(false);

    // Detailed Logic:
    // 1. If variant is 'white', we want a monochrome white logo.
    //    - Works well for simple paths.
    //    - Fails for complex multi-color SVGs if not carefully handled, but usually CSS filter is enough.
    // 2. If variant is 'color' (or default context), we want the original SVG colors.
    //    - We should NOT apply `brightness-0 invert` here.

    // If image failed to load, show fallback or nothing
    if (hasError) {
        if (fallback) return <>{fallback}</>;
        return null;
    }

    // Start with base class
    let finalClassName = `object-contain ${className} `;

    // Determine if we should force white mode
    const isWhiteMode = variant === 'white';

    if (isWhiteMode) {
        // Force white. Note: This might destroy multi-color logos (like Google G).
        // Ideally, we only use this on dark backgrounds where we WANT a white silhouette.
        // If the logo is already monochrome black, invert makes it white.
        // If it's colored, brightness-0 makes it black, invert makes it white.
        finalClassName += ' brightness-0 invert ';
    } else {
        // Normal color mode.
        // Ensure we DON'T accidentally inherit filters.
        // The previous code had `brightness-0 invert` logic in the Modal.
    }

    return (
        <img
            src={logoUrl}
            alt={`${name} logo`}
            className={finalClassName}
            // Enforce aspect ratio via standard HTML attributes + CSS
            style={{ aspectRatio: 'auto' }}
            loading="lazy"
            onError={() => setHasError(true)}
        />
    );
};
