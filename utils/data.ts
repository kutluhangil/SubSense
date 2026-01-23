
// Comprehensive datasets for the application

export const SUBSCRIPTION_CATEGORIES = [
  {
    name: "Entertainment & Streaming",
    examples: ["Netflix", "Disney+", "HBO Max", "Hulu", "Amazon Prime Video", "Apple TV+", "Paramount+", "Peacock TV", "Discovery+", "Crunchyroll", "YouTube Premium", "BluTV", "Exxen", "PuhuTV", "Gain"]
  },
  {
    name: "Music & Audio",
    examples: ["Spotify", "Apple Music", "Tidal", "Deezer", "Pandora", "SoundCloud Go+", "Amazon Music Unlimited", "Audible"]
  },
  {
    name: "Gaming & Cloud Gaming",
    examples: ["Xbox Game Pass", "PlayStation Plus", "Nintendo Switch Online", "EA Play", "Ubisoft+", "GeForce Now", "Luna", "Steam Deck Cloud", "Epic Online Services"]
  },
  {
    name: "Design & Creativity",
    examples: ["Adobe Creative Cloud", "Adobe Photoshop", "Adobe Illustrator", "Canva Pro", "Figma Professional", "Kittl Pro", "Runway ML", "Leonardo AI", "Procreate Cloud"]
  },
  {
    name: "AI & Productivity Tools",
    examples: ["ChatGPT Plus", "Claude Pro", "Gemini Advanced", "Perplexity Pro", "Cursor AI", "GitHub Copilot", "Copilot Pro", "Replit Pro", "Notion Plus", "Grammarly Premium", "Hemingway Editor Pro", "Jasper AI", "Writesonic Pro"]
  },
  {
    name: "Business & Collaboration",
    examples: ["Slack Pro", "Zoom Pro", "Google Workspace", "Microsoft 365", "Trello Premium", "Asana Business", "ClickUp Unlimited", "Monday.com Pro", "HubSpot Starter", "Salesforce Essentials"]
  },
  {
    name: "Shopping & Delivery",
    examples: ["Amazon Prime", "Hepsiburada Premium", "Trendyol Elite", "Getir", "Yemeksepeti Club"]
  }
];

// Flattened list for dropdowns
export const ALL_SUBSCRIPTIONS = SUBSCRIPTION_CATEGORIES.flatMap(cat => cat.examples).sort();

export const LANGUAGES = [
  { code: "en", name: "English 🇺🇸" },
  { code: "tr", name: "Türkçe 🇹🇷" }
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "United States Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" }
];

export const BRAND_COLORS: Record<string, string> = {
  "netflix": "#E50914",
  "spotify": "#1DB954",
  "youtube": "#FF0000",
  "youtubepremium": "#FF0000",
  "amazon": "#00A8E1",
  "amazonprime": "#00A8E1",
  "adobe": "#ED1C24",
  "adobecreativecloud": "#ED1C24",
  "apple": "#999999", // Neutral gray/silver
  "appletv+": "#000000",
  "chatgpt": "#10A37F",
  "openai": "#10A37F",
  "canva": "#00C4CC",
  "gamepass": "#107C10",
  "xbox": "#107C10",
  "disney": "#113CCF",
  "disney+": "#113CCF",
  "hulu": "#1CE783",
  "hbo": "#5F259F",
  "hbomax": "#5F259F",
  "max": "#002BE7",
  "twitch": "#9146FF",
  "slack": "#4A154B",
  "notion": "#000000",
  "github": "#181717",
  "linear": "#5E6AD2",
  "figma": "#F24E1E",
  "hepsiburada": "#F68B1E",
  "hepsiburadapremium": "#F68B1E",
  "trendyol": "#FF6600",
  "trendyolelite": "#FF6600",
  "blutv": "#13C0CA",
  "exxen": "#FFCC00",
  "gain": "#D60057",
  "puhutv": "#E60000",
  "default": "#4F46E5" // Indigo-600
};

export interface SubscriptionDetail {
  id: string;
  name: string;
  description: string;
  foundedYear: string;
  founders: string;
  ceo: string;
  headquarters: string;
  price: string;
  currency: string; // Default display currency
  type: string; // matches brand icon types
  netWorth?: string; // Estimated valuation
  coordinates?: { lat: number; lng: number }; // For map
  website?: string; // For fetching logo
}

export const SUBSCRIPTION_CATALOG: Record<string, SubscriptionDetail> = {
  "netflix": {
    id: "netflix",
    name: "Netflix",
    description: "Netflix is a global streaming service offering a wide variety of award-winning TV shows, movies, anime, documentaries, and more.",
    foundedYear: "1997",
    founders: "Reed Hastings, Marc Randolph",
    ceo: "Ted Sarandos, Greg Peters",
    headquarters: "Los Gatos, California, USA",
    price: "15.49",
    currency: "USD",
    type: "netflix",
    netWorth: "260000000000", // ~$260B
    website: "netflix.com",
    coordinates: { lat: 37.2266, lng: -121.9746 }
  },
  "spotify": {
    id: "spotify",
    name: "Spotify",
    description: "Spotify is a digital music, podcast, and video service that gives you access to millions of songs and other content from creators all over the world.",
    foundedYear: "2006",
    founders: "Daniel Ek, Martin Lorentzon",
    ceo: "Daniel Ek",
    headquarters: "Stockholm, Sweden",
    price: "10.99",
    currency: "USD",
    type: "spotify",
    netWorth: "65000000000", // ~$65B
    website: "spotify.com",
    coordinates: { lat: 59.3346, lng: 18.0632 }
  },
  "youtube premium": {
    id: "youtube",
    name: "YouTube Premium",
    description: "YouTube Premium is a subscription service offered by YouTube that provides ad-free access to content across the service.",
    foundedYear: "2005",
    founders: "Chad Hurley, Steve Chen, Jawed Karim",
    ceo: "Neal Mohan",
    headquarters: "San Bruno, California, USA",
    price: "13.99",
    currency: "USD",
    type: "youtube",
    netWorth: "2000000000000", // Alphabet ~$2T
    website: "youtube.com",
    coordinates: { lat: 37.6275, lng: -122.4274 }
  },
  "amazon prime": {
    id: "amazon",
    name: "Amazon Prime",
    description: "Amazon Prime provides free fast delivery, video streaming, music, and more.",
    foundedYear: "2005",
    founders: "Jeff Bezos",
    ceo: "Andy Jassy",
    headquarters: "Seattle, Washington, USA",
    price: "14.99",
    currency: "USD",
    type: "amazon",
    netWorth: "2000000000000", // Amazon ~$2T
    website: "amazon.com",
    coordinates: { lat: 47.6152, lng: -122.3382 }
  },
  "adobe creative cloud": {
    id: "adobe",
    name: "Adobe Creative Cloud",
    description: "A set of applications and services from Adobe Inc. that gives subscribers access to a collection of software used for graphic design, video editing, web development, and photography.",
    foundedYear: "1982",
    founders: "John Warnock, Charles Geschke",
    ceo: "Shantanu Narayen",
    headquarters: "San Jose, California, USA",
    price: "54.99",
    currency: "USD",
    type: "adobe",
    netWorth: "220000000000", // ~$220B
    website: "adobe.com",
    coordinates: { lat: 37.3307, lng: -121.8941 }
  },
  "apple tv+": {
    id: "appletv",
    name: "Apple TV+",
    description: "Apple TV+ is an American subscription streaming service owned and operated by Apple Inc.",
    foundedYear: "2019",
    founders: "Apple Inc.",
    ceo: "Tim Cook",
    headquarters: "Cupertino, California, USA",
    price: "9.99",
    currency: "USD",
    type: "apple",
    netWorth: "3000000000000", // Apple ~$3T
    website: "apple.com",
    coordinates: { lat: 37.3346, lng: -122.0090 }
  },
  "canva pro": {
    id: "canva",
    name: "Canva Pro",
    description: "Canva is an online design and publishing tool that empowers everyone in the world to design anything and publish anywhere.",
    foundedYear: "2013",
    founders: "Melanie Perkins, Cliff Obrecht, Cameron Adams",
    ceo: "Melanie Perkins",
    headquarters: "Sydney, Australia",
    price: "14.99",
    currency: "USD",
    type: "canva",
    netWorth: "26000000000", // ~$26B
    website: "canva.com",
    coordinates: { lat: -33.8838, lng: 151.2108 }
  },
  "hepsiburada premium": {
    id: "hepsiburada",
    name: "Hepsiburada Premium",
    description: "Turkey's leading e-commerce platform offering premium benefits like free delivery, BluTV subscription, and cashback.",
    foundedYear: "2000",
    founders: "Hanzade Doğan Boyner",
    ceo: "Nilhan Onal Gökçetekin",
    headquarters: "Istanbul, Turkey",
    price: "29.90",
    currency: "TRY",
    type: "hepsiburada",
    netWorth: "300000000", // ~$300M (Market Cap)
    website: "hepsiburada.com",
    coordinates: { lat: 41.0082, lng: 28.9784 }
  },
  "trendyol elite": {
    id: "trendyol",
    name: "Trendyol Elite",
    description: "Trendyol is one of the largest e-commerce platforms in Turkey. Elite status offers special perks and delivery options.",
    foundedYear: "2010",
    founders: "Demet Mutlu",
    ceo: "Çağlayan Çetin",
    headquarters: "Istanbul, Turkey",
    price: "0.00",
    currency: "TRY",
    type: "trendyol",
    netWorth: "16500000000", // ~$16.5B
    website: "trendyol.com",
    coordinates: { lat: 41.1099, lng: 29.0253 }
  },
  "blutv": {
    id: "blutv",
    name: "BluTV",
    description: "BluTV is a Turkish subscription video-on-demand service offering local and international series, movies, and live TV.",
    foundedYear: "2015",
    founders: "Aydın Doğan Yalçındağ",
    ceo: "Deniz Şaşmaz Oflaz",
    headquarters: "Istanbul, Turkey",
    price: "99.90",
    currency: "TRY",
    type: "blutv",
    netWorth: "Unknown", // Private/Subsidiary
    website: "blutv.com",
    coordinates: { lat: 41.0082, lng: 28.9784 }
  },
  "exxen": {
    id: "exxen",
    name: "Exxen",
    description: "Exxen is a Turkish digital streaming platform founded by Acun Ilıcalı, featuring original content and sports.",
    foundedYear: "2021",
    founders: "Acun Ilıcalı",
    ceo: "Acun Ilıcalı",
    headquarters: "Istanbul, Turkey",
    price: "129.90",
    currency: "TRY",
    type: "exxen",
    netWorth: "Unknown", // Private
    website: "exxen.com",
    coordinates: { lat: 41.1120, lng: 29.0200 }
  },
  "xbox game pass": {
    id: "gamepass",
    name: "Xbox Game Pass",
    description: "Microsoft's video game subscription service offering a rotating catalog of games from a range of publishers.",
    foundedYear: "2017",
    founders: "Microsoft",
    ceo: "Phil Spencer (Xbox)",
    headquarters: "Redmond, Washington, USA",
    price: "16.99",
    currency: "USD",
    type: "gamepass",
    netWorth: "3000000000000", // Microsoft ~$3T
    website: "xbox.com",
    coordinates: { lat: 47.6740, lng: -122.1215 }
  },
  "disney+": {
    id: "disney",
    name: "Disney+",
    description: "The streaming home for Disney, Pixar, Marvel, Star Wars, National Geographic, and more.",
    foundedYear: "2019",
    founders: "The Walt Disney Company",
    ceo: "Bob Iger",
    headquarters: "Burbank, California, USA",
    price: "13.99",
    currency: "USD",
    type: "disney",
    netWorth: "200000000000", // Disney ~$200B
    website: "disneyplus.com",
    coordinates: { lat: 34.1561, lng: -118.3243 }
  }
};
