
// Brand logo URL map — all images served from /public/images/ as static assets
// Use URL strings (NOT ES module imports) for public/ directory files in Vite.
// Files must be present in /public/images/ and committed to git.

const BRAND_MAP: Record<string, string> = {
    // --- Entertainment ---
    'netflix':              '/images/Netflix.svg',
    'spotify':              '/images/spotify.svg',
    'youtube':              '/images/YouTube_Premium_logo.svg',
    'youtubepremium':       '/images/YouTube_Premium_logo.svg',
    'amazon':               '/images/amazon_prime.svg',
    'amazonprimevideo':     '/images/amazon_prime.svg',
    'prime':                '/images/amazon_prime.svg',
    'apple':                '/images/apple_tv_plus.svg',
    'appletv+':             '/images/apple_tv_plus.svg',
    'disney':               '/images/disney+.svg',
    'disney+':              '/images/disney+.svg',
    'hulu':                 '/images/Hulu_logo_(2018).svg',
    'hbomax':               '/images/HBO_Max_(2025).svg',
    'max':                  '/images/HBO_Max_(2025).svg',
    'peacock':              '/images/NBCUniversal_Peacock_Logo.svg',
    'paramount+':           '/images/Paramount_Plus.svg',
    'crunchyroll':          '/images/Crunchyroll_Logo.svg',
    'blutv':                '/images/blutv.svg',
    'exxen':                '/images/exxen-seeklogo.svg',
    'puhutv':               '/images/puhutv.svg',

    // --- Productivity ---
    'microsoft':            '/images/Microsoft_365.svg',
    'microsoft365':         '/images/Microsoft_365.svg',
    'office':               '/images/Microsoft_365.svg',
    'adobe':                '/images/adobe-creative-cloud.svg',
    'adobecreativecloud':   '/images/adobe-creative-cloud.svg',
    'canva':                '/images/canva-seeklogo.svg',
    'canvapro':             '/images/canva-seeklogo.svg',
    'slack':                '/images/Slack_Technologies_Logo.svg',
    'google':               '/images/Google_Workspace_Logo.svg',
    'googleworkspace':      '/images/Google_Workspace_Logo.svg',
    'notion':               '/images/Notion-logo.svg',
    'notionplus':           '/images/Notion-logo.svg',
    'figma':                '/images/Figma-logo.svg',
    'trello':               '/images/Trello-logo-blue.svg',
    'asana':                '/images/asana.svg',
    'monday.com':           '/images/Monday_logo.svg',
    'hubspot':              '/images/hubspot.svg',
    'salesforce':           '/images/salesforce-2.svg',
    'zoom':                 '/images/Zoom_Communications_Logo.svg',
    'dropbox':              '/images/dropbox.svg',

    // --- AI ---
    'chatgpt':              '/images/ChatGPT-Logo.svg',
    'chatgptplus':          '/images/ChatGPT-Logo.svg',
    'openai':               '/images/ChatGPT-Logo.svg',
    'githubcopilot':        '/images/GitHub_Copilot_logo.svg',
    'midjourney':           '/images/Midjourney_Emblem.svg',
    'gemini':               '/images/Google_Gemini_logo_2025.svg',
    'claude':               '/images/Claude_AI_logo.svg',
    'perplexity':           '/images/Perplexity_AI_logo.svg',
    'jasper':               '/images/Jasper_Technologies_logo.svg',
    'leonardo.ai':          '/images/leonardo_ai.svg',
    'leonardo':             '/images/leonardo_ai.svg',
    'runway':               '/images/Runaway_1_logo.svg',
    'replit':               '/images/replit.svg',
    'kittl':                '/images/Kittl_Logo.svg',

    // --- Gaming ---
    'xbox':                 '/images/Xbox_Game_Pass_new_logo_-_colored_version.svg',
    'xboxgamepass':         '/images/Xbox_Game_Pass_new_logo_-_colored_version.svg',
    'gamepass':             '/images/Xbox_Game_Pass_new_logo_-_colored_version.svg',
    'playstation':          '/images/PlayStationPlus_(No_Trademark).svg',
    'playstationplus':      '/images/PlayStationPlus_(No_Trademark).svg',
    'steam':                '/images/Steam_Deck_colored_logo.svg',
    'steamdeck':            '/images/Steam_Deck_colored_logo.svg',
    'geforce':              '/images/GeForce_Now_logo.svg',
    'geforcenow':           '/images/GeForce_Now_logo.svg',
    'ea':                   '/images/EA_Play_logo.svg',
    'eaplay':               '/images/EA_Play_logo.svg',
    'ubisoft':              '/images/Ubisoft+.svg',
    'ubisoft+':             '/images/Ubisoft+.svg',
    'epic':                 '/images/Epic_Games_logo.svg',
    'nintendo':             '/images/Nintendo_Switch_Online_logo.svg',
    'nintendoswitchonline': '/images/Nintendo_Switch_Online_logo.svg',
    'luna':                 '/images/luna.svg',

    // --- Music ---
    'applemusic':           '/images/apple_music.svg',
    'soundcloud':           '/images/Soundcloud_logo.svg',
    'tidal':                '/images/Tidal_(service)_logo_only.svg',
    'deezer':               '/images/deezer.svg',
    'pandora':              '/images/Pandora_logo_2025.svg',
    'amazonmusic':          '/images/amazon_music.svg',
    'audible':              '/images/audible.svg',

    // --- Shopping / Local ---
    'amazonprime':          '/images/logo-amazon.svg',
    'getir':                '/images/Getir_wordmark.svg',
    'yemeksepeti':          '/images/Yemeksepeti_logo.svg',
    'trendyol':             '/images/Trendyol Elite Logo Vector.svg',
    'hepsiburada':          '/images/hepsiburada-premium-seeklogo.svg',

    // --- Social / Streaming ---
    'discord':              '/images/discord.svg',
    'discordnitro':         '/images/discord-nitro-seeklogo.svg',
    'twitch':               '/images/twitch.svg',
    'twitchturbo':          '/images/twitch.svg',
    'duolingo':             '/images/duolingo.svg',
    'masterclass':          '/images/Masterclass_logo.svg',

    // --- Creative ---
    'procreate':            '/images/Procreate_logo.svg',
};

export const getBrandLogo = (type: string): string | null => {
    if (!type) return null;
    const normalizedKey = type.toLowerCase().replace(/\s+/g, '');

    // Direct match
    if (BRAND_MAP[normalizedKey]) {
        return BRAND_MAP[normalizedKey];
    }

    // Fuzzy match — useful for "Netflix Premium", "Spotify Family" etc.
    const keys = Object.keys(BRAND_MAP);
    const match = keys.find(k => normalizedKey.includes(k) || k.includes(normalizedKey));

    return match ? BRAND_MAP[match] : null;
};
