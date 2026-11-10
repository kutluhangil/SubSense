// Brand logo registry — bundles every SVG in src/images as a URL and resolves
// a brand display-name to its logo. Falls back to undefined when no logo exists.

const modules = import.meta.glob('../images/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** slug (filename without extension) -> bundled URL */
export const LOGOS: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const slug = path.split('/').pop()!.replace(/\.svg$/, '');
  LOGOS[slug] = url;
}

/** Brands whose logo is white/very light → need a dark tile to be visible. */
export const DARK_TILE = new Set(['apple-music', 'tidal', 'trendyol', 'getir', 'hbo-max']);

/** Display-name (lowercased) -> logo slug, for names that don't map 1:1. */
const ALIASES: Record<string, string> = {
  'netflix': 'netflix',
  'youtube premium': 'youtube-premium',
  'chatgpt plus': 'chatgpt',
  'chatgpt': 'chatgpt',
  'figma': 'figma',
  'adobe cc': 'adobe-cc',
  'adobe creative cloud': 'adobe-cc',
  'creative cloud': 'adobe-cc',
  'spotify': 'spotify',
  'github copilot': 'github-copilot',
  'new york times': '',
  'amazon prime': 'amazon-prime',
  'amazon prime video': 'amazon-prime',
  'disney+': 'disney-plus',
  'disney plus': 'disney-plus',
  'duolingo': 'duolingo',
  'notion': 'notion',
  'twitch': 'twitch',
  'playstation plus': 'playstation-plus',
  'discord nitro': 'discord-nitro',
  'discord': 'discord',
  'apple music': 'apple-music',
  'apple tv+': 'apple-tv-plus',
  'apple tv plus': 'apple-tv-plus',
  'amazon music': 'amazon-music',
  'amazon': 'amazon',
  'amazon luna': 'amazon-luna',
  'canva': 'canva',
  'audible': 'audible',
  'crunchyroll': 'crunchyroll',
  'hbo max': 'hbo-max',
  'max': 'hbo-max',
  'hulu': 'hulu',
  'peacock': 'peacock',
  'paramount+': 'paramount-plus',
  'paramount plus': 'paramount-plus',
  'tidal': 'tidal',
  'deezer': 'deezer',
  'soundcloud': 'soundcloud',
  'pandora': 'pandora',
  'slack': 'slack',
  'trello': 'trello',
  'asana': 'asana',
  'monday.com': 'monday',
  'monday': 'monday',
  'zoom': 'zoom',
  'dropbox': 'dropbox',
  'microsoft 365': 'microsoft-365',
  'office 365': 'microsoft-365',
  'google workspace': 'google-workspace',
  'grammarly': 'grammarly',
  'gemini': 'gemini',
  'google gemini': 'gemini',
  'claude': 'claude',
  'claude ai': 'claude',
  'perplexity': 'perplexity',
  'midjourney': 'midjourney',
  'leonardo ai': 'leonardo',
  'leonardo': 'leonardo',
  'jasper': 'jasper',
  'runway': 'runway',
  'replit': 'replit',
  'xbox game pass': 'xbox-game-pass',
  'ea play': 'ea-play',
  'ubisoft+': 'ubisoft-plus',
  'geforce now': 'geforce-now',
  'nintendo switch online': 'nintendo-switch-online',
  'epic games': 'epic-games',
  'steam': 'steam',
  'procreate': 'procreate',
  'kittl': 'kittl',
  'masterclass': 'masterclass',
  'salesforce': 'salesforce',
  'hubspot': 'hubspot',
  'blutv': 'blutv',
  'exxen': 'exxen',
  'puhutv': 'puhutv',
  'getir': 'getir',
  'yemeksepeti': 'yemeksepeti',
  'trendyol': 'trendyol',
  'hepsiburada': 'hepsiburada',
  // Explore module display names → existing logo slugs
  'prime video': 'amazon-prime',
  'hbo max (max)': 'hbo-max',
  'canva pro': 'canva',
  'claude pro': 'claude',
  'notion plus': 'notion',
  'zoom pro': 'zoom',
  'dropbox plus': 'dropbox',
  'twitch turbo': 'twitch',
  'duolingo super': 'duolingo',
  'trendyol elite': 'trendyol',
  'hepsiburada premium': 'hepsiburada',
};

export interface LogoInfo {
  url: string;
  slug: string;
  dark: boolean;
}

/** Resolve a brand display name to a logo, if one is bundled. */
export function logoFor(name: string): LogoInfo | undefined {
  const key = name.trim().toLowerCase();
  const slug = ALIASES[key] ?? key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) return undefined;
  const url = LOGOS[slug];
  if (!url) return undefined;
  return { url, slug, dark: DARK_TILE.has(slug) };
}

/** A curated set of strong logos for the splash / landing animations. */
export const LOGO_CLOUD: { slug: string; url: string; dark: boolean }[] = [
  'netflix', 'spotify', 'youtube-premium', 'disney-plus', 'chatgpt', 'figma',
  'notion', 'github-copilot', 'amazon-prime', 'twitch', 'discord', 'canva',
  'claude', 'gemini', 'hbo-max', 'crunchyroll', 'hulu', 'xbox-game-pass',
  'playstation-plus', 'audible', 'slack', 'zoom', 'apple-music', 'perplexity',
  'midjourney', 'adobe-cc', 'dropbox', 'trello', 'paramount-plus', 'deezer',
  'soundcloud', 'tidal',
]
  .filter((slug) => LOGOS[slug])
  .map((slug) => ({ slug, url: LOGOS[slug], dark: DARK_TILE.has(slug) }));
