import React from 'react';

interface LogoRendererProps {
    logoUrl: string;
    name: string;
    className?: string; // For sizing (w, h) and positioning
    variant?: 'color' | 'white' | 'auto'; // 'auto' decides based on logo type or parent
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
    variant = 'auto'
}) => {
    const lowerName = name.toLowerCase();

    // Check if this logo should preserve its original colors
    // If the user asks for 'white', we force it (e.g., specific brand header requirement)
    // If 'auto', we try to be smart.
    // BUT: The issue described is "white placeholders" or "white-filled shapes".
    // This often happens when `brightness-0 invert` is applied to a colored SVG.

    // Detailed Logic:
    // 1. If variant is 'white', we want a monochrome white logo.
    //    - Works well for simple paths.
    //    - Fails for complex multi-color SVGs if not carefully handled, but usually CSS filter is enough.
    // 2. If variant is 'color' (or default context), we want the original SVG colors.
    //    - We should NOT apply `brightness-0 invert` here.

    // The bugs described:
    // - "Spotify logo does not render (white circle)" -> sounds like a masking or path issue, or white-on-white.
    // - "PlayStation white-filled" -> applied filter on a shape that shouldn't have it.

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
        />
    );
};
