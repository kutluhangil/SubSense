
// utils/logoGenerator.ts

// HSL Color Interfaces
interface HSL {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
}

/**
 * hashString
 * Generates a consistent numeric hash from a string.
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

/**
 * generateColorPair
 * Generates a primary and accent color based on the input string.
 * Ensures colors are visually pleasing (not too dark, not too bright).
 */
function generateColorPair(seed: string): { primary: string; accent: string } {
    const hash = hashString(seed);

    // Primary Hue: derived directly from hash
    const h = Math.abs(hash) % 360;

    // Saturation: keep it reasonably high for "brand" feel (60-90%)
    const s = 65 + (Math.abs(hash >> 8) % 25);

    // Lightness: keep it middle-dark for good contrast with white text (40-60%)
    const l = 45 + (Math.abs(hash >> 16) % 15);

    const primary: HSL = { h, s, l };

    // Accent: Analogous color (shift hue by 30-40 degrees) and slightly lighter
    const accent: HSL = {
        h: (h + 35) % 360,
        s: s - 10,
        l: l + 15
    };

    return {
        primary: `hsl(${primary.h}, ${primary.s}%, ${primary.l}%)`,
        accent: `hsl(${accent.h}, ${accent.s}%, ${accent.l}%)`
    };
}

/**
 * generatePlaceholderLogo
 * Returns a base64 string of an SVG logo.
 * 
 * Specs:
 * - 128x128
 * - Diagonal gradient background
 * - Rounded rect (handled by component or SVG rect)
 * - Centered uppercase initial
 */
export function generatePlaceholderLogo(name: string): string {
    const cleanName = name.trim();
    const initial = cleanName.charAt(0).toUpperCase() || '?';
    const { primary, accent } = generateColorPair(cleanName);

    // Unique ID for the gradient to prevent conflicts if multiple SVGs are on page
    const gradientId = `grad_${Math.abs(hashString(cleanName))}`;

    const svgString = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="url(#${gradientId})" />
  <text 
    x="50%" 
    y="50%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="sans-serif" 
    font-weight="bold" 
    font-size="64" 
    fill="#ffffff"
  >
    ${initial}
  </text>
</svg>
`.trim();

    // Convert to Base64 Data URI
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
}
