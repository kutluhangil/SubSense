import { SubscriptionDetail } from './data';

/* 
  Maps normalized subscription IDs (lowercase, no spaces) to their SVG paths.
  This allows fuzzy matching logic if needed, but a direct map is most performant.
*/

const LOGO_MAP: Record<string, string> = {
  // Streaming
  'netflix': '/images/Netflix.svg',
  'spotify': '/images/Spotify_icon.svg',
  'youtube': '/images/YouTube_Premium_logo.svg',
  'youtubepremium': '/images/YouTube_Premium_logo.svg',
  'disney+': '/images/disney+.svg',
  'disney': '/images/disney+.svg',
  'amazonprimevideo': '/images/amazon_prime.svg',
  'amazonprime': '/images/amazon_prime.svg',
  'hbomax': '/images/HBO_Max_(2025).svg',
  'max': '/images/HBO_Max_(2025).svg',
  'hulu': '/images/Hulu_logo_(2018).svg',
  'appletv+': '/images/apple_tv_plus.svg',
  'peacock': '/images/NBCUniversal_Peacock_Logo.svg',
  'paramount+': '/images/Paramount_Plus.svg',
  'crunchyroll': '/images/Crunchyroll_Logo.svg',

  // New / Updated Mappings (Explicit)
  'adobecreativecloud': '/images/adobe-creative-cloud.svg',
  'adobe': '/images/adobe-creative-cloud.svg',
  'discordnitro': '/images/discord.svg',
  'discord': '/images/discord.svg',
  'duolingo': '/images/duolingo.svg',
  'twitchturbo': '/images/twitch.svg',
  'twitch': '/images/twitch.svg',
  'dropbox': '/images/dropbox.svg',
  'masterclass': '/images/masterpass.svg', // User added "masterpass.svg" likely intending MasterClass

  // Music
  'applemusic': '/images/apple_music.svg',
  'soundcloud': '/images/Soundcloud_logo.svg',
  'tidal': '/images/Tidal_(service)_logo_only.svg',
  'deezer': '/images/deezer.svg',
  'pandora': '/images/Pandora_logo_2025.svg',
  'audible': '/images/audible.svg',
  'amazonmusic': '/images/amazon_music.svg',

  // Productivity
  'microsoft365': '/images/Microsoft_365.svg',
  'canvapro': '/images/canva-seeklogo.svg',
  'canva': '/images/canva-seeklogo.svg',
  'chatgptplus': '/images/ChatGPT-Logo.svg',
  'chatgpt': '/images/ChatGPT-Logo.svg',
  'xboxgamepass': '/images/Xbox_Game_Pass_new_logo_-_colored_version.svg',
  'playstationplus': '/images/PlayStationPlus_(No_Trademark).svg',
  'googleworkspace': '/images/Google_Workspace_Logo.svg',
  'slack': '/images/Slack_Technologies_Logo.svg',
  'notionplus': '/images/Notion-logo.svg',
  'notion': '/images/Notion-logo.svg',
  'figma': '/images/Figma-logo.svg',
  'githubcopilot': '/images/GitHub_Copilot_logo.svg',
  'zoom': '/images/Zoom_Communications_Logo.svg',

  // Others found in list
  'claude': '/images/Claude_AI_logo.svg',
  'ea': '/images/EA_Play_logo.svg',
  'epic': '/images/Epic_Games_logo.svg',
  'geforcenow': '/images/GeForce_Now_logo.svg',
  'getir': '/images/Getir_wordmark.svg',
  'gemini': '/images/Google_Gemini_logo_2025.svg',
  'grammarly': '/images/Grammarly_logo.svg',
  'jasper': '/images/Jasper_Technologies_logo.svg',
  'kittl': '/images/Kittl_Logo.svg',
  'monday': '/images/Monday_logo.svg',
  'nintendo': '/images/Nintendo_Switch_Online_logo.svg',
  'perplexity': '/images/Perplexity_AI_logo.svg',
  'runway': '/images/Runaway_1_logo.svg',
  'steam': '/images/Steam_Deck_colored_logo.svg',
  'trello': '/images/Trello-logo-blue.svg',
  'trendyol': '/images/Trendyol Elite Logo Vector.svg',
  'ubisoft': '/images/Ubisoft+.svg',
  'yemeksepeti': '/images/Yemeksepeti_logo.svg',
  'blutv': '/images/blutv.svg',
  'exxen': '/images/exxen-seeklogo.svg',
  'hepsiburada': '/images/hepsiburada-premium-seeklogo.svg',
  'hubspot': '/images/hubspot.svg',
  'leonardo': '/images/leonardo_ai.svg',
  'luna': '/images/luna.svg',
  'puhutv': '/images/puhutv.svg',
  'replit': '/images/replit.svg',
  'salesforce': '/images/salesforce-2.svg',
  'masterpass': '/images/masterpass.svg',
};

// Helper for normalize: lowercase, remove non-alphanumeric
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export const getBrandLogo = (subscriptionId: string): string | null => {
  if (!subscriptionId) return null;
  const cleanId = normalize(subscriptionId);

  // 1. Direct key match (Fastest)
  if (LOGO_MAP[cleanId]) return LOGO_MAP[cleanId];

  // 2. Exact match in keys (fuzzy fallback)
  // Scan keys to see if the cleanId is contained, or key is contained in cleanId
  const foundKey = Object.keys(LOGO_MAP).find(k => cleanId.includes(k) || k.includes(cleanId));
  if (foundKey) return LOGO_MAP[foundKey];

  return null;
};
