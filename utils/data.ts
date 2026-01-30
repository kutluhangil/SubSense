
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

// Popular services for Onboarding
export const POPULAR_SERVICES = [
  "Netflix", "Spotify", "YouTube Premium", "Amazon Prime", 
  "Apple Music", "Disney+", "Adobe Creative Cloud", "Xbox Game Pass",
  "PlayStation Plus", "ChatGPT Plus", "Canva Pro", "Google Workspace"
];

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
  "applemusic": "#FC3C44",
  "chatgpt": "#10A37F",
  "chatgptplus": "#10A37F",
  "openai": "#10A37F",
  "canva": "#00C4CC",
  "canvapro": "#00C4CC",
  "gamepass": "#107C10",
  "xbox": "#107C10",
  "xboxgamepass": "#107C10",
  "playstation": "#00439C",
  "playstationplus": "#00439C",
  "disney": "#113CCF",
  "disney+": "#113CCF",
  "googleworkspace": "#4285F4",
  "google": "#4285F4",
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
  // New fields for Explorer
  globalUserCount?: string;
  parentCompany?: string;
  milestones?: string[];
  subsidiaries?: string;
}

export const SUBSCRIPTION_CATALOG: Record<string, SubscriptionDetail> = {
  "netflix": {
    id: "netflix",
    name: "Netflix",
    description: "Netflix is the world's leading streaming entertainment service with millions of paid memberships in over 190 countries enjoying TV series, documentaries, feature films and mobile games across a wide variety of genres and languages.",
    foundedYear: "1997",
    founders: "Reed Hastings, Marc Randolph",
    ceo: "Ted Sarandos, Greg Peters",
    headquarters: "Los Gatos, California, USA",
    price: "15.49",
    currency: "USD",
    type: "netflix",
    netWorth: "260 Billion",
    globalUserCount: "260 Million+",
    website: "netflix.com",
    milestones: ["1997: Founded as DVD rental service", "2007: Introduced streaming", "2013: Launched first original series House of Cards", "2016: Expanded globally to 190 countries"],
    coordinates: { lat: 37.2266, lng: -121.9746 }
  },
  "spotify": {
    id: "spotify",
    name: "Spotify",
    description: "Spotify is a digital music, podcast, and video service that gives you access to millions of songs and other content from creators all over the world. It reinvented the music industry by offering a legal alternative to piracy.",
    foundedYear: "2006",
    founders: "Daniel Ek, Martin Lorentzon",
    ceo: "Daniel Ek",
    headquarters: "Stockholm, Sweden",
    price: "10.99",
    currency: "USD",
    type: "spotify",
    netWorth: "65 Billion",
    globalUserCount: "600 Million+",
    website: "spotify.com",
    milestones: ["2006: Founded in Stockholm", "2008: Launched in Europe", "2011: Launched in US", "2019: Reached 100M paid subscribers"],
    coordinates: { lat: 59.3346, lng: 18.0632 }
  },
  "youtube premium": {
    id: "youtube",
    name: "YouTube Premium",
    description: "YouTube Premium is a subscription service offered by YouTube that provides ad-free access to content across the service, as well as access to premium YouTube Originals.",
    foundedYear: "2005",
    founders: "Chad Hurley, Steve Chen, Jawed Karim",
    ceo: "Neal Mohan",
    headquarters: "San Bruno, California, USA",
    price: "13.99",
    currency: "USD",
    type: "youtube",
    netWorth: "2 Trillion (Alphabet)",
    globalUserCount: "100 Million+",
    parentCompany: "Alphabet Inc.",
    website: "youtube.com",
    milestones: ["2005: First video uploaded", "2006: Acquired by Google", "2015: Launched YouTube Red (now Premium)", "2024: Surpassed 100M subscribers"],
    coordinates: { lat: 37.6275, lng: -122.4274 }
  },
  "amazon prime": {
    id: "amazon",
    name: "Amazon Prime",
    description: "Amazon Prime provides free fast delivery, video streaming, music, and more. It is one of the most successful subscription bundles in history.",
    foundedYear: "2005",
    founders: "Jeff Bezos",
    ceo: "Andy Jassy",
    headquarters: "Seattle, Washington, USA",
    price: "14.99",
    currency: "USD",
    type: "amazon",
    netWorth: "2 Trillion",
    globalUserCount: "200 Million+",
    parentCompany: "Amazon.com Inc.",
    website: "amazon.com",
    milestones: ["2005: Prime launched", "2011: Prime Video added", "2014: Prime Music added", "2021: Reached 200M subscribers"],
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
    netWorth: "220 Billion",
    globalUserCount: "30 Million+",
    website: "adobe.com",
    milestones: ["1982: Founded", "1990: Photoshop launched", "2013: Shifted entirely to subscription model", "2023: Integrated Firefly AI"],
    coordinates: { lat: 37.3307, lng: -121.8941 }
  },
  "apple tv+": {
    id: "appletv",
    name: "Apple TV+",
    description: "Apple TV+ is an American subscription streaming service owned and operated by Apple Inc. It features original shows and films.",
    foundedYear: "2019",
    founders: "Apple Inc.",
    ceo: "Tim Cook",
    headquarters: "Cupertino, California, USA",
    price: "9.99",
    currency: "USD",
    type: "apple",
    netWorth: "3 Trillion (Apple)",
    globalUserCount: "25 Million+ (Est.)",
    parentCompany: "Apple Inc.",
    website: "apple.com",
    milestones: ["2019: Service launched", "2022: Won Best Picture Oscar for CODA", "2023: Expanded live sports with MLS"],
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
    netWorth: "26 Billion",
    globalUserCount: "135 Million (MAU)",
    website: "canva.com",
    milestones: ["2013: Launched", "2015: Reached 4M users", "2021: Valued at $40B", "2023: Magic Studio AI launch"],
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
    netWorth: "300 Million",
    globalUserCount: "12 Million+",
    website: "hepsiburada.com",
    milestones: ["2000: Founded", "2021: IPO on NASDAQ", "2022: Premium launched"],
    coordinates: { lat: 41.0082, lng: 28.9784 }
  },
  "xbox game pass": {
    id: "gamepass",
    name: "Xbox Game Pass",
    description: "Microsoft's video game subscription service offering a rotating catalog of games from a range of publishers and premium services like EA Play.",
    foundedYear: "2017",
    founders: "Microsoft",
    ceo: "Phil Spencer (Xbox)",
    headquarters: "Redmond, Washington, USA",
    price: "16.99",
    currency: "USD",
    type: "gamepass",
    netWorth: "3 Trillion (Microsoft)",
    globalUserCount: "34 Million+",
    parentCompany: "Microsoft",
    website: "xbox.com",
    milestones: ["2017: Launched", "2019: Game Pass for PC", "2020: Included xCloud streaming", "2022: Acquired Activision Blizzard"],
    coordinates: { lat: 47.6740, lng: -122.1215 }
  },
  "disney+": {
    id: "disney",
    name: "Disney+",
    description: "The dedicated streaming home for movies and shows from Disney, Pixar, Marvel, Star Wars, and National Geographic.",
    foundedYear: "2019",
    founders: "The Walt Disney Company",
    ceo: "Bob Iger",
    headquarters: "Burbank, California, USA",
    price: "13.99",
    currency: "USD",
    type: "disney",
    netWorth: "200 Billion",
    globalUserCount: "150 Million+",
    parentCompany: "The Walt Disney Company",
    website: "disneyplus.com",
    milestones: ["2019: Launched", "2020: 50M subscribers in 5 months", "2024: Integrated Hulu content"],
    coordinates: { lat: 34.1561, lng: -118.3243 }
  },
  "chatgpt plus": {
    id: "chatgpt",
    name: "ChatGPT Plus",
    description: "A subscription plan for ChatGPT that offers faster response times, priority access to new features like GPT-4, and higher usage limits.",
    foundedYear: "2015 (OpenAI)",
    founders: "Sam Altman, Elon Musk, et al.",
    ceo: "Sam Altman",
    headquarters: "San Francisco, California, USA",
    price: "20.00",
    currency: "USD",
    type: "chatgpt",
    netWorth: "80 Billion (OpenAI)",
    globalUserCount: "180 Million (MAU)",
    parentCompany: "OpenAI",
    website: "openai.com",
    milestones: ["2015: OpenAI Founded", "2022: ChatGPT Released", "2023: GPT-4 Launched", "2024: Sora announced"],
    coordinates: { lat: 37.7648, lng: -122.4194 }
  }
};
