/** Canonical brand color + glyph (icon or letter) by service name. */
interface BrandGlyph {
  color: string;
  icon?: string;
  letter?: string;
}

const BRANDS: Record<string, BrandGlyph> = {
  netflix: { color: '#E50914', letter: 'N' },
  'youtube premium': { color: '#FF0000', icon: 'smart_display' },
  youtube: { color: '#FF0000', icon: 'smart_display' },
  'chatgpt plus': { color: '#10A37F', icon: 'smart_toy' },
  chatgpt: { color: '#10A37F', icon: 'smart_toy' },
  figma: { color: '#F24E1E', icon: 'draw' },
  'adobe cc': { color: '#FF0000', letter: 'A' },
  'creative cloud': { color: '#FF0000', letter: 'A' },
  spotify: { color: '#1DB954', icon: 'graphic_eq' },
  'new york times': { color: '#c7c4d7', letter: 'T' },
  'github copilot': { color: '#ffffff', icon: 'code' },
  'icloud+': { color: '#3693F3', icon: 'cloud' },
  icloud: { color: '#3693F3', icon: 'cloud' },
  'amazon prime': { color: '#00A8E1', icon: 'shopping_bag' },
  'disney+': { color: '#113CCF', letter: 'D+' },
  duolingo: { color: '#58CC02', icon: 'translate' },
  'apple one': { color: '#ffffff', icon: 'apps' },
  notion: { color: '#ffffff', letter: 'N' },
  twitch: { color: '#9146FF', icon: 'sports_esports' },
  'playstation plus': { color: '#00439C', icon: 'stadia_controller' },
  'discord nitro': { color: '#5865F2', icon: 'forum' },
  discord: { color: '#5865F2', icon: 'forum' },
  'hbo max': { color: '#7B2BF9' },
  hulu: { color: '#1CE783' },
  crunchyroll: { color: '#F47521' },
  'paramount+': { color: '#0064FF' },
  'apple tv+': { color: '#000000' },
  audible: { color: '#F8991C' },
  'apple music': { color: '#FA243C' },
  'amazon music': { color: '#46C3D0' },
  tidal: { color: '#111111' },
  deezer: { color: '#A238FF' },
  soundcloud: { color: '#FF5500' },
  claude: { color: '#D97757' },
  gemini: { color: '#1A73E8' },
  perplexity: { color: '#20B8CD' },
  midjourney: { color: '#4945FF' },
  canva: { color: '#00C4CC' },
  slack: { color: '#4A154B' },
  zoom: { color: '#2D8CFF' },
  dropbox: { color: '#0061FF' },
  trello: { color: '#0079BF' },
  'microsoft 365': { color: '#D83B01' },
  grammarly: { color: '#15C39A' },
  'xbox game pass': { color: '#107C10' },
  'nintendo switch online': { color: '#E60012' },
  'ea play': { color: '#FF4747' },
  'geforce now': { color: '#76B900' },
  masterclass: { color: '#E5092F' },
};

export function brandGlyph(name: string, fallbackColor?: string): BrandGlyph {
  const b = BRANDS[name.trim().toLowerCase()];
  if (b) return b;
  return { color: fallbackColor ?? '#c0c1ff', letter: name.charAt(0).toUpperCase() };
}
