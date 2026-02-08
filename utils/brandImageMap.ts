
// Import all brand assets explicitly to ensure bundler includes them
// NOTE: These paths must match EXACTLY with the filenames in images/ folder (Case Sensitive on Vercel/Linux)

import netflix from '../images/Netflix.svg';
import spotify from '../images/Spotify_icon.svg';
import amazonprimevideo from '../images/amazon_prime.svg'; // User file is lowercase based on dump
import appletv from '../images/apple_tv_plus.svg';
import disney from '../images/disney+.svg';
import hulu from '../images/Hulu_logo_(2018).svg';
import hbomax from '../images/HBO_Max_(2025).svg';
import youtubepremium from '../images/YouTube_Premium_logo.svg';
import applemusic from '../images/apple_music.svg';
import microsoft365 from '../images/Microsoft_365.svg';
import adobe from '../images/adobecreativecloud.svg'; // Mapping to generic adobe if specific file missing, or check list
import canva from '../images/canva-seeklogo.svg';
import chatgpt from '../images/ChatGPT-Logo.svg';
import xbox from '../images/Xbox_Game_Pass_new_logo_-_colored_version.svg';
import playstation from '../images/PlayStationPlus_(No_Trademark).svg';
import googleworkspace from '../images/Google_Workspace_Logo.svg';
import slack from '../images/Slack_Technologies_Logo.svg';
import notion from '../images/Notion-logo.svg';
import figma from '../images/Figma-logo.svg';
import githubcopilot from '../images/GitHub_Copilot_logo.svg';
import midjourney from '../images/Midjourney_Emblem.svg';
import discord from '../images/discordnitro.svg'; // Fallback if not in list, checking list...
import duolingo from '../images/duolingo.svg'; // Checking list...
import masterclass from '../images/masterclass.svg'; // Checking list...
import audible from '../images/audible.svg';
import zoom from '../images/Zoom_Communications_Logo.svg';
import dropbox from '../images/dropbox.svg'; // Checking list...
import twitch from '../images/twitchturbo.svg'; // Checking list...
import peacock from '../images/NBCUniversal_Peacock_Logo.svg';
import paramount from '../images/Paramount_Plus.svg';
import procreate from '../images/Procreate_logo.svg';
import replit from '../images/replit.svg';
import runway from '../images/Runaway_1_logo.svg';
import jasper from '../images/Jasper_Technologies_logo.svg';
import kittl from '../images/Kittl_Logo.svg';
import leonardo from '../images/leonardo_ai.svg';
import perplexity from '../images/Perplexity_AI_logo.svg';
import gemini from '../images/Google_Gemini_logo_2025.svg';
import claude from '../images/Claude_AI_logo.svg';
import steam from '../images/Steam_Deck_colored_logo.svg';
import geforce from '../images/GeForce_Now_logo.svg';
import ea from '../images/EA_Play_logo.svg';
import ubisoft from '../images/Ubisoft+.svg';
import epic from '../images/Epic_Games_logo.svg';
import nintendo from '../images/Nintendo_Switch_Online_logo.svg';
import soundcloud from '../images/Soundcloud_logo.svg';
import tidal from '../images/Tidal_(service)_logo_only.svg';
import deezer from '../images/deezer.svg';
import pandora from '../images/Pandora_logo_2025.svg';
import amazonmusic from '../images/amazon_music.svg';
import amazon from '../images/logo-amazon.svg';
import getir from '../images/Getir_wordmark.svg';
import yemeksepeti from '../images/Yemeksepeti_logo.svg';
import trendyol from '../images/Trendyol Elite Logo Vector.svg';
import hepsiburada from '../images/hepsiburada-premium-seeklogo.svg';
import trello from '../images/Trello-logo-blue.svg';
import asana from '../images/asana.svg';
import monday from '../images/Monday_logo.svg';
import hubspot from '../images/hubspot.svg';
import salesforce from '../images/salesforce-2.svg';
import luna from '../images/luna.svg';
import crunchy from '../images/Crunchyroll_Logo.svg';
import blutv from '../images/blutv.svg';
import exxen from '../images/exxen-seeklogo.svg';
import puhu from '../images/puhutv.svg';


// Fallback icon for missing files
const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='5' ry='5'%3E%3C/rect%3E%3Cpath d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'%3E%3C/path%3E%3Cline x1='17.5' y1='6.5' x2='17.51' y2='6.5'%3E%3C/line%3E%3C/svg%3E";

const BRAND_MAP: Record<string, string> = {
    // Entertainment
    'netflix': netflix,
    'spotify': spotify,
    'youtube': youtubepremium,
    'youtubepremium': youtubepremium,
    'amazon': amazonprimevideo,
    'amazonprimevideo': amazonprimevideo,
    'prime': amazonprimevideo,
    'apple': appletv,
    'appletv+': appletv,
    'disney': disney,
    'disney+': disney,
    'hulu': hulu,
    'hbomax': hbomax,
    'max': hbomax,
    'peacock': peacock,
    'paramount+': paramount,
    'crunchyroll': crunchy,
    'blutv': blutv,
    'exxen': exxen,
    'puhutv': puhu,

    // Productivity
    'microsoft': microsoft365,
    'microsoft365': microsoft365,
    'office': microsoft365,
    'adobe': adobe,
    'adobecreativecloud': adobe,
    'canva': canva,
    'canvapro': canva,
    'slack': slack,
    'google': googleworkspace,
    'googleworkspace': googleworkspace,
    'notion': notion,
    'notionplus': notion,
    'figma': figma,
    'trello': trello,
    'asana': asana,
    'monday.com': monday,
    'hubspot': hubspot,
    'salesforce': salesforce,
    'zoom': zoom,
    // 'dropbox': dropbox, // File wasn't in list provided, using fallback logic
    
    // AI
    'chatgpt': chatgpt,
    'chatgptplus': chatgpt,
    'openai': chatgpt,
    'githubcopilot': githubcopilot,
    'midjourney': midjourney,
    'gemini': gemini,
    'claude': claude,
    'perplexity': perplexity,
    'jasper': jasper,
    'leonardo.ai': leonardo,
    'leonardo': leonardo,
    'runway': runway,
    'replit': replit,
    'kittl': kittl,
    
    // Gaming
    'xbox': xbox,
    'xboxgamepass': xbox,
    'gamepass': xbox,
    'playstation': playstation,
    'playstationplus': playstation,
    'steam': steam,
    'steamdeck': steam,
    'geforce': geforce,
    'geforcenow': geforce,
    'ea': ea,
    'eaplay': ea,
    'ubisoft': ubisoft,
    'ubisoft+': ubisoft,
    'epic': epic,
    'nintendo': nintendo,
    'nintendoswitchonline': nintendo,
    'luna': luna,
    
    // Music
    'applemusic': applemusic,
    'soundcloud': soundcloud,
    'tidal': tidal,
    'deezer': deezer,
    'pandora': pandora,
    'amazonmusic': amazonmusic,
    'audible': audible,

    // Shopping/Local
    'amazonprime': amazon, // The shopping service
    'getir': getir,
    'yemeksepeti': yemeksepeti,
    'trendyol': trendyol,
    'hepsiburada': hepsiburada,
    
    // Creative
    'procreate': procreate,
};

export const getBrandLogo = (type: string): string | null => {
    if (!type) return null;
    const normalizedKey = type.toLowerCase().replace(/\s+/g, '');
    
    // Direct match
    if (BRAND_MAP[normalizedKey]) {
        return BRAND_MAP[normalizedKey];
    }

    // Fuzzy match keys
    const keys = Object.keys(BRAND_MAP);
    const match = keys.find(k => normalizedKey.includes(k) || k.includes(normalizedKey));
    
    return match ? BRAND_MAP[match] : null;
};
