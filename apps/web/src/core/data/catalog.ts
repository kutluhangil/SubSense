import type { CatalogService, Achievement } from '../types';

export const CATALOG: CatalogService[] = [
  // Entertainment
  { name: 'Netflix', category: 'Entertainment', defaultPlan: 'Premium', fromPrice: 15.49, brandColor: '#E50914', popular: true, tagline: 'Stream thousands of movies and TV shows.' },
  { name: 'YouTube Premium', category: 'Entertainment', defaultPlan: 'Individual', fromPrice: 13.99, brandColor: '#FF0000', popular: true, tagline: 'Ad-free YouTube and Music.' },
  { name: 'Disney+', category: 'Entertainment', defaultPlan: 'Standard', fromPrice: 7.99, brandColor: '#113CCF', popular: true, tagline: 'Disney, Pixar, Marvel and Star Wars.' },
  { name: 'HBO Max', category: 'Entertainment', defaultPlan: 'Standard', fromPrice: 9.99, brandColor: '#7B2BF9', tagline: 'HBO originals and blockbusters.' },
  { name: 'Hulu', category: 'Entertainment', defaultPlan: 'Ad-Supported', fromPrice: 7.99, brandColor: '#1CE783', tagline: 'TV, movies and originals.' },
  { name: 'Crunchyroll', category: 'Entertainment', defaultPlan: 'Mega Fan', fromPrice: 9.99, brandColor: '#F47521', tagline: 'Anime, anywhere.' },
  { name: 'Paramount+', category: 'Entertainment', defaultPlan: 'Premium', fromPrice: 11.99, brandColor: '#0064FF', tagline: 'Movies, shows and live sport.' },
  { name: 'Apple TV+', category: 'Entertainment', defaultPlan: 'Monthly', fromPrice: 9.99, brandColor: '#000000', tagline: 'Apple Originals.' },
  { name: 'Audible', category: 'Entertainment', defaultPlan: 'Premium Plus', fromPrice: 14.95, brandColor: '#F8991C', tagline: 'Audiobooks and podcasts.' },

  // Music
  { name: 'Spotify', category: 'Music', defaultPlan: 'Premium', fromPrice: 10.99, brandColor: '#1DB954', popular: true, tagline: 'Music and podcasts, ad-free.' },
  { name: 'Apple Music', category: 'Music', defaultPlan: 'Individual', fromPrice: 10.99, brandColor: '#FA243C', tagline: '100 million songs.' },
  { name: 'Tidal', category: 'Music', defaultPlan: 'HiFi', fromPrice: 10.99, brandColor: '#00FFFF', tagline: 'Hi-Fi lossless audio.' },
  { name: 'Deezer', category: 'Music', defaultPlan: 'Premium', fromPrice: 11.99, brandColor: '#A238FF', tagline: 'Music streaming.' },
  { name: 'SoundCloud', category: 'Music', defaultPlan: 'Go+', fromPrice: 9.99, brandColor: '#FF5500', tagline: 'Discover new tracks.' },

  // Tools / AI
  { name: 'ChatGPT Plus', category: 'Tools', defaultPlan: 'Plus', fromPrice: 20.0, brandColor: '#10A37F', popular: true, tagline: 'Advanced AI assistant.' },
  { name: 'Claude', category: 'Tools', defaultPlan: 'Pro', fromPrice: 20.0, brandColor: '#D97757', tagline: 'AI assistant by Anthropic.' },
  { name: 'Gemini', category: 'Tools', defaultPlan: 'Advanced', fromPrice: 19.99, brandColor: '#1A73E8', tagline: 'Google AI, supercharged.' },
  { name: 'Perplexity', category: 'Tools', defaultPlan: 'Pro', fromPrice: 20.0, brandColor: '#20B8CD', tagline: 'AI-powered answers.' },
  { name: 'Midjourney', category: 'Tools', defaultPlan: 'Standard', fromPrice: 30.0, brandColor: '#4945FF', tagline: 'AI image generation.' },
  { name: 'GitHub Copilot', category: 'Tools', defaultPlan: 'Individual', fromPrice: 10.0, brandColor: '#ffffff', tagline: 'AI pair programmer.' },

  // Productivity
  { name: 'Figma', category: 'Productivity', defaultPlan: 'Professional', fromPrice: 15.0, brandColor: '#F24E1E', tagline: 'Collaborative design.' },
  { name: 'Canva', category: 'Productivity', defaultPlan: 'Pro', fromPrice: 12.99, brandColor: '#00C4CC', popular: true, tagline: 'Design anything.' },
  { name: 'Notion', category: 'Productivity', defaultPlan: 'Plus', fromPrice: 10.0, brandColor: '#ffffff', tagline: 'Notes, docs and wiki.' },
  { name: 'Slack', category: 'Productivity', defaultPlan: 'Pro', fromPrice: 8.75, brandColor: '#4A154B', tagline: 'Team messaging.' },
  { name: 'Zoom', category: 'Productivity', defaultPlan: 'Pro', fromPrice: 13.33, brandColor: '#2D8CFF', tagline: 'Video meetings.' },
  { name: 'Dropbox', category: 'Productivity', defaultPlan: 'Plus', fromPrice: 11.99, brandColor: '#0061FF', tagline: 'Cloud storage.' },
  { name: 'Trello', category: 'Productivity', defaultPlan: 'Premium', fromPrice: 10.0, brandColor: '#0079BF', tagline: 'Boards, lists and cards.' },
  { name: 'Microsoft 365', category: 'Productivity', defaultPlan: 'Personal', fromPrice: 6.99, brandColor: '#D83B01', tagline: 'Office apps and cloud.' },
  { name: 'Grammarly', category: 'Productivity', defaultPlan: 'Premium', fromPrice: 12.0, brandColor: '#15C39A', tagline: 'Writing assistant.' },

  // Gaming
  { name: 'Xbox Game Pass', category: 'Gaming', defaultPlan: 'Ultimate', fromPrice: 16.99, brandColor: '#107C10', popular: true, tagline: 'Hundreds of games.' },
  { name: 'PlayStation Plus', category: 'Gaming', defaultPlan: 'Essential', fromPrice: 9.99, brandColor: '#00439C', tagline: 'Online play and games.' },
  { name: 'Nintendo Switch Online', category: 'Gaming', defaultPlan: 'Individual', fromPrice: 3.99, brandColor: '#E60012', tagline: 'Online play and classics.' },
  { name: 'Discord Nitro', category: 'Gaming', defaultPlan: 'Nitro', fromPrice: 9.99, brandColor: '#5865F2', tagline: 'Better chat perks.' },
  { name: 'Twitch', category: 'Gaming', defaultPlan: 'Turbo', fromPrice: 8.99, brandColor: '#9146FF', tagline: 'Live streaming.' },
  { name: 'EA Play', category: 'Gaming', defaultPlan: 'Standard', fromPrice: 4.99, brandColor: '#FF4747', tagline: 'EA game library.' },
  { name: 'GeForce Now', category: 'Gaming', defaultPlan: 'Priority', fromPrice: 9.99, brandColor: '#76B900', tagline: 'Cloud gaming.' },

  // Health & learning
  { name: 'Duolingo', category: 'Health & Fitness', defaultPlan: 'Super', fromPrice: 6.99, brandColor: '#58CC02', tagline: 'Learn a language.' },
  { name: 'Masterclass', category: 'Health & Fitness', defaultPlan: 'Standard', fromPrice: 10.0, brandColor: '#E5092F', tagline: 'Learn from the best.' },

  // Shopping
  { name: 'Amazon Prime', category: 'Shopping', defaultPlan: 'Annual', fromPrice: 14.99, brandColor: '#00A8E1', tagline: 'Shipping, video and more.' },
];

export const CATEGORIES: { name: string; icon: string }[] = [
  { name: 'Entertainment', icon: 'movie' },
  { name: 'Productivity', icon: 'cloud' },
  { name: 'Tools', icon: 'build' },
  { name: 'Music', icon: 'graphic_eq' },
  { name: 'Gaming', icon: 'sports_esports' },
  { name: 'Health & Fitness', icon: 'fitness_center' },
  { name: 'Shopping', icon: 'shopping_bag' },
];

export function baseAchievements(): Achievement[] {
  return [
    { id: 'first-step', title: 'First Step', description: 'Added first sub', icon: 'directions_walk', unlocked: false },
    { id: 'power-user', title: 'Power User', description: '10+ active subs', icon: 'bolt', unlocked: false },
    { id: 'savvy-saver', title: 'Savvy Saver', description: 'Saved $100', icon: 'savings', unlocked: false },
    { id: 'long-term', title: 'Long-Term Thinker', description: '1 year streak', icon: 'calendar_month', unlocked: false },
    { id: 'streamer', title: 'Streamer', description: '5 video subs', icon: 'live_tv', unlocked: false },
  ];
}
