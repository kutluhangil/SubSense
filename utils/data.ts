
// Comprehensive datasets for the application

export const SUBSCRIPTION_CATEGORIES = [
  {
    name: "Entertainment & Streaming",
    examples: ["Netflix", "Disney+", "HBO Max", "Hulu", "Amazon Prime Video", "Apple TV+", "Paramount+", "Peacock", "Discovery+", "Crunchyroll", "YouTube Premium", "BluTV", "Exxen", "PuhuTV", "Gain"]
  },
  {
    name: "Music & Audio",
    examples: ["Spotify", "Apple Music", "Tidal", "Deezer", "Pandora", "SoundCloud", "Amazon Music", "Audible"]
  },
  {
    name: "Gaming",
    examples: ["Xbox Game Pass", "PlayStation Plus", "Nintendo Switch Online", "EA Play", "Ubisoft+", "GeForce Now", "Luna", "Steam Deck", "Epic Games"]
  },
  {
    name: "Design & Creativity",
    examples: ["Adobe Creative Cloud", "Canva Pro", "Figma", "Kittl", "Runway", "Leonardo AI", "Procreate"]
  },
  {
    name: "AI & Dev Tools",
    examples: ["ChatGPT Plus", "Claude Pro", "Gemini Advanced", "Perplexity", "GitHub Copilot", "Midjourney", "Replit", "Notion", "Grammarly", "Jasper"]
  },
  {
    name: "Business & SaaS",
    examples: ["Slack", "Zoom", "Google Workspace", "Microsoft 365", "Trello", "Asana", "ClickUp", "Monday.com", "HubSpot", "Salesforce"]
  },
  {
    name: "Shopping & Local",
    examples: ["Amazon Prime", "Hepsiburada Premium", "Trendyol Elite", "Getir", "Yemeksepeti"]
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
  // Streaming
  "netflix": "#E50914",
  "spotify": "#1DB954",
  "youtube": "#FF0000",
  "youtubepremium": "#FF0000",
  "amazon": "#00A8E1",
  "amazonprime": "#00A8E1",
  "amazonprimevideo": "#00A8E1",
  "appletv+": "#000000",
  "disney+": "#113CCF",
  "disney": "#113CCF",
  "hulu": "#1CE783",
  "hbomax": "#5F259F",
  "max": "#002BE7",
  "paramount+": "#0064FF",
  "twitch": "#9146FF",
  "twitchturbo": "#9146FF",
  "peacock": "#000000",

  // Music
  "applemusic": "#FC3C44",
  "soundcloud": "#FF5500",
  "soundcloudgo+": "#FF5500",
  "audible": "#F79A1D",
  "tidal": "#000000",
  "deezer": "#EF5466",

  // Productivity / Tech
  "adobe": "#ED1C24",
  "adobecreativecloud": "#ED1C24",
  "canva": "#00C4CC",
  "canvapro": "#00C4CC",
  "microsoft365": "#0078D4",
  "googleworkspace": "#4285F4",
  "notion": "#000000",
  "notionplus": "#000000",
  "figma": "#F24E1E",
  "slack": "#4A154B",
  "zoom": "#2D8CFF",
  "dropbox": "#0061FF",

  // Gaming
  "gamepass": "#107C10",
  "xboxgamepass": "#107C10",
  "playstation": "#00439C",
  "playstationplus": "#00439C",
  "eaplay": "#FF4747",
  "ubisoft+": "#0091F2",
  "geforcenow": "#76B900",

  // AI
  "chatgpt": "#10A37F",
  "chatgptplus": "#10A37F",
  "githubcopilot": "#181717",
  "midjourney": "#FFFFFF", // Often depicted white on black
  "grammarly": "#15C39A",
  "perplexity": "#22B8CF",

  // Local / E-com
  "hepsiburada": "#F68B1E",
  "hepsiburadapremium": "#F68B1E",
  "trendyol": "#FF6600",
  "trendyolelite": "#FF6600",
  "getir": "#5D3EBC",

  // Added requested brands
  "discord": "#5865F2",
  "discordnitro": "#5865F2",
  "duolingo": "#58CC02",
  "masterclass": "#181818",

  "default": "#4F46E5" // Indigo-600
};

export interface PlanTier {
  name: string;           // English name: "Standard with Ads"
  nameLocalized?: string; // Localized: "Reklamlı"
  price: number;
  cycle: 'Monthly' | 'Yearly';
}

export interface RegionPricing {
  currency: string;
  tiers: PlanTier[];
}

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
  globalUserCount?: string;
  parentCompany?: string;
  milestones?: string[];
  subsidiaries?: string;
  regions?: {
    US?: RegionPricing;
    TR?: RegionPricing;
  };
}

// THE CENTRAL DATASET
// Editorial content for the Explore page
export const SUBSCRIPTION_CATALOG: Record<string, SubscriptionDetail> = {
  // --- STREAMING ---
  "netflix": {
    id: "netflix",
    name: "Netflix",
    description: "Netflix began its journey in 1997 as a DVD-by-mail service, famously conceived after Reed Hastings was charged a $40 late fee for a rental copy of Apollo 13. The company pivoted to streaming media in 2007, a move that would fundamentally disrupt the global entertainment industry and lead to the decline of traditional video rental stores.\n\nOver the years, Netflix evolved from a content distributor to a massive content creator. With the launch of 'House of Cards' in 2013, it pioneered the model of 'binge-watching' by releasing entire seasons at once. Today, it operates in over 190 countries and produces original content in dozens of languages, effectively becoming the world's first global TV network.\n\nDespite increasing competition, Netflix remains the market leader in streaming, known for its powerful recommendation algorithm and massive cultural hits like 'Stranger Things', 'Squid Game', and 'The Crown'. It continues to experiment with new formats, including interactive storytelling and mobile gaming.",
    foundedYear: "1997",
    founders: "Reed Hastings, Marc Randolph",
    ceo: "Ted Sarandos, Greg Peters",
    headquarters: "Los Gatos, California",
    price: "17.99",
    currency: "USD",
    type: "netflix",
    netWorth: "$260 Billion",
    globalUserCount: "283M+",
    website: "netflix.com",
    milestones: [
      "1997: Founded as a DVD-by-mail service",
      "2007: Launched streaming video service",
      "2013: Released first original series 'House of Cards'",
      "2016: Expanded globally to 130 new countries simultaneously",
      "2021: Squid Game becomes most-watched show ever",
      "2022: Launched ad-supported tier",
      "2025: Surpassed 280 million subscribers"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Standard with Ads", price: 7.99, cycle: "Monthly" },
          { name: "Standard", price: 17.99, cycle: "Monthly" },
          { name: "Premium (4K)", price: 24.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Basic", nameLocalized: "Temel", price: 189.99, cycle: "Monthly" },
          { name: "Standard", nameLocalized: "Standart", price: 289.99, cycle: "Monthly" },
          { name: "Premium (4K)", nameLocalized: "Premium (4K)", price: 379.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "spotify": {
    id: "spotify",
    name: "Spotify",
    description: "Spotify was founded in 2006 in Stockholm, Sweden, by Daniel Ek and Martin Lorentzon as a response to the growing piracy problem in the music industry. By offering a legal, superior user experience for streaming music, they aimed to convince users to pay for music again. The service launched in 2008 and quickly gained traction in Europe before expanding to the US in 2011.\n\nThe platform revolutionized music consumption by shifting the model from ownership (buying albums/tracks) to access (streaming). Its 'Freemium' model allowed massive user growth, while its personalized playlists like 'Discover Weekly' became a gold standard for algorithmic recommendation.\n\nToday, Spotify is the world's largest music streaming service provider. It has aggressively expanded into podcasts and audiobooks, spending over $1 billion to acquire podcast networks and exclusive rights to shows like 'The Joe Rogan Experience', positioning itself as a comprehensive audio platform rather than just a music player.",
    foundedYear: "2006",
    founders: "Daniel Ek, Martin Lorentzon",
    ceo: "Daniel Ek",
    headquarters: "Stockholm, Sweden",
    price: "11.99",
    currency: "USD",
    type: "spotify",
    netWorth: "$90 Billion",
    globalUserCount: "675M+ (Total)",
    website: "spotify.com",
    milestones: [
      "2006: Founded in Stockholm",
      "2008: Service launched in Europe",
      "2011: Launched in the United States",
      "2015: Discover Weekly playlist launched",
      "2019: Acquired Gimlet Media (Podcast pivot)",
      "2023: Surpassed 500 million active users",
      "2025: Surpassed 670 million total users"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Individual", price: 11.99, cycle: "Monthly" },
          { name: "Duo", price: 16.99, cycle: "Monthly" },
          { name: "Family", price: 19.99, cycle: "Monthly" },
          { name: "Student", price: 5.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Individual", nameLocalized: "Bireysel", price: 99, cycle: "Monthly" },
          { name: "Duo", nameLocalized: "Duo", price: 135, cycle: "Monthly" },
          { name: "Family", nameLocalized: "Aile", price: 165, cycle: "Monthly" },
          { name: "Student", nameLocalized: "Öğrenci", price: 55, cycle: "Monthly" }
        ]
      }
    }
  },
  "youtubepremium": {
    id: "youtubepremium",
    name: "YouTube Premium",
    description: "YouTube Premium (formerly YouTube Red) is a subscription service offered by the video platform YouTube. It provides ad-free access to content across the service, as well as access to premium YouTube Originals, background play on mobile devices, and the ability to download videos for offline playback.\n\nThe service was originally launched in November 2014 as Music Key, offering only ad-free streaming of music videos from participating labels on YouTube and Google Play Music. It was relaunched as YouTube Red in 2015, expanding its scope to offer ad-free access to all YouTube videos, not just music.\n\nIn May 2018, YouTube announced the rebranding of the service as YouTube Premium, alongside the launch of a separate YouTube Music subscription. Today, it is a key part of Google's subscription revenue, offering a unique value proposition that combines video streaming, music streaming, and creator support.",
    foundedYear: "2014 (as Music Key)",
    founders: "Steve Chen, Chad Hurley, Jawed Karim (YouTube)",
    ceo: "Neal Mohan",
    headquarters: "San Bruno, California",
    price: "13.99",
    currency: "USD",
    type: "youtube",
    netWorth: "$2 Trillion (Alphabet)",
    globalUserCount: "100M+",
    parentCompany: "Alphabet Inc.",
    website: "youtube.com",
    milestones: [
      "2005: YouTube founded",
      "2006: Acquired by Google for $1.65B",
      "2015: Launched YouTube Red",
      "2018: Rebranded to YouTube Premium",
      "2024: Surpassed 100 million subscribers"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Individual", price: 13.99, cycle: "Monthly" },
          { name: "Family", price: 22.99, cycle: "Monthly" },
          { name: "Student", price: 7.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Individual", nameLocalized: "Bireysel", price: 139.99, cycle: "Monthly" },
          { name: "Family", nameLocalized: "Aile", price: 259.99, cycle: "Monthly" },
          { name: "Student", nameLocalized: "Öğrenci", price: 79.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "amazonprimevideo": {
    id: "amazonprimevideo",
    name: "Prime Video",
    description: "Amazon Prime Video launched in 2006 as Amazon Unbox, originally a download service. It has since evolved into a major global streaming player, bundled with the Amazon Prime membership which includes free shipping and music. This bundling strategy has made it one of the most widely accessible streaming services in the world.\n\nAmazon has invested heavily in original content, producing critical darlings like 'The Marvelous Mrs. Maisel' and massive budget spectacles like 'The Lord of the Rings: The Rings of Power'. Unlike pure-play streamers, Prime Video serves as a value-add to the broader Amazon ecosystem, driving retail loyalty.\n\nIn recent years, Prime Video has aggressively pursued live sports rights, securing exclusive broadcasts for NFL Thursday Night Football. It also offers 'Channels', allowing users to subscribe to other networks like HBO or Starz directly within the Prime interface, acting as an aggregator for the streaming market.",
    foundedYear: "2006",
    founders: "Jeff Bezos",
    ceo: "Mike Hopkins (SVP)",
    headquarters: "Seattle, Washington",
    price: "8.99",
    currency: "USD",
    type: "amazon",
    netWorth: "$2 Trillion (Amazon)",
    globalUserCount: "200M+ (Prime)",
    parentCompany: "Amazon",
    website: "primevideo.com",
    milestones: [
      "2006: Amazon Unbox launched",
      "2011: Included in Prime membership",
      "2013: Amazon Studios launches first original series",
      "2022: 'The Rings of Power' premieres",
      "2024: Introduced ads to base tier"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Prime Video (Standalone)", price: 8.99, cycle: "Monthly" },
          { name: "Amazon Prime (Bundle)", price: 14.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Prime Video", nameLocalized: "Prime Video", price: 39.90, cycle: "Monthly" }
        ]
      }
    }
  },
  "disney+": {
    id: "disney+",
    name: "Disney+",
    description: "Disney+ launched in November 2019, marking a historic pivot for The Walt Disney Company as it shifted focus from traditional theatrical and cable distribution to direct-to-consumer streaming. Within its first day, it amassed 10 million subscribers, far exceeding industry expectations.\n\nThe service is the dedicated home for movies and shows from Disney's core brands: Disney, Pixar, Marvel, Star Wars, and National Geographic. This exclusive library includes cultural juggernauts like 'The Mandalorian', the first live-action Star Wars series, which became an instant global phenomenon.\n\nToday, Disney+ is one of the 'Big Three' global streaming services. It continues to integrate content from its other assets, including Hulu (in the US) and Star (internationally), aiming to offer a comprehensive general entertainment offering alongside its family-friendly staples.",
    foundedYear: "2019",
    founders: "The Walt Disney Company",
    ceo: "Bob Iger",
    headquarters: "Burbank, California",
    price: "13.99",
    currency: "USD",
    type: "disney",
    netWorth: "$200 Billion",
    globalUserCount: "150M+",
    parentCompany: "Disney",
    website: "disneyplus.com",
    milestones: [
      "2019: Launch with 'The Mandalorian'",
      "2020: Reached 50 million subscribers in 5 months",
      "2020: Released 'Hamilton' and 'Soul' directly to streaming",
      "2022: Launched ad-supported tier",
      "2024: Integrated Hulu content into main app"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Basic (with Ads)", price: 9.99, cycle: "Monthly" },
          { name: "Premium (No Ads)", price: 15.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Standard", nameLocalized: "Standart", price: 249.90, cycle: "Monthly" },
          { name: "Premium", nameLocalized: "Premium", price: 449.90, cycle: "Monthly" }
        ]
      }
    }
  },
  "hulu": {
    id: "hulu",
    name: "Hulu",
    description: "Hulu was established in 2007 as a joint venture between News Corporation, NBC Universal, Providence Equity Partners, and later Disney, to stream aggregated TV content online. It was the industry's first major attempt by traditional media companies to tackle the digital shift.\n\nKnown for its 'next-day air' model, Hulu allowed users to watch episodes of current TV shows the day after they aired on cable. Over time, it developed a robust slate of original programming, including the Emmy-winning 'The Handmaid's Tale', which put it on the map as a prestige content creator.\n\nFollowing Disney's acquisition of 21st Century Fox in 2019, Disney assumed full operational control of Hulu. It is now being closely integrated with Disney+ to provide a unified streaming experience, combining Disney's family brands with Hulu's general entertainment library.",
    foundedYear: "2007",
    founders: "News Corp, NBC Universal, Providence Equity",
    ceo: "Joe Earley",
    headquarters: "Santa Monica, California",
    price: "7.99",
    currency: "USD",
    type: "hulu",
    netWorth: "N/A (Disney Owned)",
    globalUserCount: "48M+",
    parentCompany: "Disney",
    website: "hulu.com",
    milestones: [
      "2008: Public launch",
      "2011: Launched original programming",
      "2017: Launched Hulu with Live TV",
      "2017: 'The Handmaid’s Tale' wins Best Drama Emmy",
      "2019: Disney assumes full operational control"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Hulu (with Ads)", price: 7.99, cycle: "Monthly" },
          { name: "Hulu (No Ads)", price: 17.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "hbomax": {
    id: "hbomax",
    name: "HBO Max (Max)",
    description: "HBO Max launched in May 2020, combining the prestigious library of HBO with the vast content archives of WarnerMedia (Warner Bros., DC, TNT, TBS, Cartoon Network). It was designed to compete directly with Netflix by offering a mix of premium drama, blockbuster movies, and classic TV sitcoms like 'Friends' and 'The Big Bang Theory'.\n\nThe service underwent a turbulent evolution, including the controversial 'Project Popcorn' in 2021 where Warner Bros. released all its theatrical movies on HBO Max simultaneously. Following the merger of WarnerMedia and Discovery in 2022, the service was rebranded simply as 'Max' in 2023.\n\nNow integrating unscripted content from Discovery+, Max positions itself as 'The One to Watch', housing everything from 'Game of Thrones' and 'Succession' to '90 Day Fiancé' and 'Shark Week', aiming for the broadest possible demographic appeal.",
    foundedYear: "2020",
    founders: "WarnerMedia",
    ceo: "David Zaslav",
    headquarters: "New York City, New York",
    price: "15.99",
    currency: "USD",
    type: "hbomax",
    netWorth: "$25 Billion (Warner Bros. Discovery)",
    globalUserCount: "97M+",
    parentCompany: "Warner Bros. Discovery",
    website: "max.com",
    milestones: [
      "2020: HBO Max launch",
      "2021: Same-day theatrical releases (Matrix 4, Dune)",
      "2022: Warner Bros. Discovery merger completed",
      "2023: Rebranded to 'Max'",
      "2024: House of the Dragon Season 2"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "With Ads", price: 9.99, cycle: "Monthly" },
          { name: "Ad-Free", price: 15.99, cycle: "Monthly" },
          { name: "Ultimate (4K)", price: 19.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "appletv+": {
    id: "appletv+",
    name: "Apple TV+",
    description: "Apple TV+ launched in November 2019 with a strategy distinct from its competitors: quality over quantity. Instead of buying a massive back catalog, Apple focused exclusively on producing high-budget original content with A-list talent, such as 'The Morning Show' with Jennifer Aniston and Reese Witherspoon.\n\nWhile it started with a small library, the service gained critical acclaim rapidly. In 2022, it became the first streaming service to win the Academy Award for Best Picture with 'CODA'. The comedy series 'Ted Lasso' also became a cultural phenomenon, earning back-to-back Emmys for Outstanding Comedy Series.\n\nApple has also expanded into live sports, securing exclusive rights to Major League Soccer (MLS) and Major League Baseball (MLB) games. It remains a key part of the Apple One subscription bundle, driving value for the broader Apple services ecosystem.",
    foundedYear: "2019",
    founders: "Apple Inc.",
    ceo: "Tim Cook",
    headquarters: "Cupertino, California",
    price: "9.99",
    currency: "USD",
    type: "apple",
    netWorth: "$3 Trillion (Apple)",
    globalUserCount: "25M+ (Est)",
    parentCompany: "Apple Inc.",
    website: "tv.apple.com",
    milestones: [
      "2019: Launched in over 100 countries",
      "2020: 'Ted Lasso' premieres",
      "2022: 'CODA' wins Best Picture Oscar",
      "2023: Launched MLS Season Pass",
      "2023: Released 'Killers of the Flower Moon'"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Apple TV+", price: 9.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Apple TV+", nameLocalized: "Apple TV+", price: 64.99, cycle: "Monthly" }
        ]
      }
    }
  },

  // --- MUSIC ---
  "applemusic": {
    id: "applemusic",
    name: "Apple Music",
    description: "Apple Music launched in 2015, replacing Beats Music (which Apple acquired) and integrating directly into the iOS ecosystem. It was Apple's long-awaited answer to Spotify, leveraging the massive user base of iTunes and the iPhone to gain immediate market share.\n\nThe service differentiates itself with a focus on human curation, including the flagship 'Beats 1' (now Apple Music 1) global radio station anchored by Zane Lowe. Unlike Spotify, Apple Music does not offer a free ad-supported tier, positioning itself as a premium-only product that supports artist value.\n\nApple has consistently pushed audio technology forward, introducing Lossless Audio and Spatial Audio with Dolby Atmos at no extra cost. In 2023, it launched a dedicated app for Classical music, further solidifying its reputation among audiophiles and serious music fans.",
    foundedYear: "2015",
    founders: "Apple Inc.",
    ceo: "Tim Cook",
    headquarters: "Cupertino, California",
    price: "10.99",
    currency: "USD",
    type: "apple",
    netWorth: "$3 Trillion (Apple)",
    globalUserCount: "88M+",
    parentCompany: "Apple Inc.",
    website: "music.apple.com",
    milestones: [
      "2014: Apple acquires Beats Electronics",
      "2015: Apple Music launched at WWDC",
      "2018: Surpassed 50 million subscribers",
      "2021: Added Lossless and Spatial Audio",
      "2023: Apple Music Classical app launched"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Individual", price: 10.99, cycle: "Monthly" },
          { name: "Family", price: 16.99, cycle: "Monthly" },
          { name: "Student", price: 5.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Individual", nameLocalized: "Bireysel", price: 54.99, cycle: "Monthly" },
          { name: "Family", nameLocalized: "Aile", price: 84.99, cycle: "Monthly" },
          { name: "Student", nameLocalized: "Öğrenci", price: 29.99, cycle: "Monthly" }
        ]
      }
    }
  },

  // --- PRODUCTIVITY ---
  "microsoft365": {
    id: "microsoft365",
    name: "Microsoft 365",
    description: "Microsoft 365 (formerly Office 365) represents one of the most successful business pivots in tech history. Launched in 2011, it transitioned Microsoft's dominant Office suite from a one-time software purchase to a cloud-based subscription service, ensuring continuous updates and revenue.\n\nThe bundle includes industry-standard tools like Word, Excel, PowerPoint, and Outlook, integrated with cloud services like OneDrive and Microsoft Teams. This integration has made it indispensable for businesses, with Teams becoming a central hub for workplace collaboration during the remote work boom.\n\nRecently, Microsoft has begun integrating 'Copilot', its generative AI technology, across the 365 suite. This allows users to draft emails, summarize meetings, and generate presentations automatically, positioning Microsoft 365 as the foundational operating system for the future of work.",
    foundedYear: "2011 (as Office 365)",
    founders: "Microsoft",
    ceo: "Satya Nadella",
    headquarters: "Redmond, Washington",
    price: "6.99",
    currency: "USD",
    type: "microsoft365",
    netWorth: "$3 Trillion (Microsoft)",
    globalUserCount: "345M (Paid Seats)",
    parentCompany: "Microsoft",
    website: "microsoft.com",
    milestones: [
      "2011: Office 365 for Enterprise launched",
      "2013: Office 365 for Home launched",
      "2017: Microsoft Teams launched",
      "2020: Rebranded to Microsoft 365",
      "2023: Copilot AI integration announced"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Personal", price: 6.99, cycle: "Monthly" },
          { name: "Family", price: 9.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Personal", nameLocalized: "Kişisel", price: 179.99, cycle: "Monthly" },
          { name: "Family", nameLocalized: "Aile", price: 239.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "adobecreativecloud": {
    id: "adobecreativecloud",
    name: "Adobe Creative Cloud",
    description: "Adobe Creative Cloud is a collection of software used for graphic design, video editing, web development, and photography. It replaced the Creative Suite (CS) perpetual license model in 2013, a controversial move that ultimately transformed Adobe's business into a cloud juggernaut.\n\nThe suite includes industry-standard applications like Photoshop, Illustrator, Premiere Pro, and After Effects. By moving to a subscription model, Adobe reduced piracy and lowered the barrier to entry for students and freelancers who previously couldn't afford the multi-thousand dollar upfront cost.\n\nAdobe continues to innovate with the addition of Firefly, a family of creative generative AI models designed to be safe for commercial use. This new technology allows users to generate images and text effects directly within apps like Photoshop, keeping Adobe at the cutting edge of digital creativity.",
    foundedYear: "1982 (Adobe)",
    founders: "John Warnock, Charles Geschke",
    ceo: "Shantanu Narayen",
    headquarters: "San Jose, California",
    price: "54.99",
    currency: "USD",
    type: "adobe",
    netWorth: "$220 Billion",
    globalUserCount: "30M+",
    website: "adobe.com",
    milestones: [
      "1982: Adobe founded",
      "1990: Photoshop 1.0 released",
      "2013: Shifted entirely to Creative Cloud subscription",
      "2021: Acquired Frame.io for cloud collaboration",
      "2023: Launched Firefly Generative AI"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Photography Plan", price: 9.99, cycle: "Monthly" },
          { name: "Single App", price: 22.99, cycle: "Monthly" },
          { name: "All Apps", price: 54.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Photography Plan", nameLocalized: "Fotoğrafçılık", price: 249.99, cycle: "Monthly" },
          { name: "All Apps", nameLocalized: "Tüm Uygulamalar", price: 1399.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "canvapro": {
    id: "canvapro",
    name: "Canva Pro",
    description: "Canva was founded in Sydney, Australia, in 2013 by Melanie Perkins, Cliff Obrecht, and Cameron Adams. Their mission was to democratize design, making it accessible to anyone regardless of their technical skill level. It started as a simple drag-and-drop tool and has grown into a comprehensive visual communication platform.\n\nCanva Pro offers advanced features like Brand Kits, background removal, and a massive library of premium stock photos and templates. It has become a staple for social media managers, small business owners, and marketing teams who need to produce high-quality assets quickly without the steep learning curve of professional software.\n\nThe company is currently one of the world's most valuable private tech startups. It has recently introduced 'Magic Studio', a suite of AI-powered tools that allow users to generate text, images, and videos, positioning itself as a direct competitor to Adobe in the AI age.",
    foundedYear: "2013",
    founders: "Melanie Perkins, Cliff Obrecht, Cameron Adams",
    ceo: "Melanie Perkins",
    headquarters: "Sydney, Australia",
    price: "14.99",
    currency: "USD",
    type: "canva",
    netWorth: "$26 Billion",
    globalUserCount: "135M+ (MAU)",
    website: "canva.com",
    milestones: [
      "2013: Launched in Sydney",
      "2015: Reached 4 million users",
      "2019: Acquired Pexels and Pixabay",
      "2021: Valued at $40 billion",
      "2023: Launched Magic Studio AI"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Pro", price: 14.99, cycle: "Monthly" },
          { name: "Teams", price: 10.00, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Pro", nameLocalized: "Pro", price: 179.99, cycle: "Monthly" },
          { name: "Teams", nameLocalized: "Ekip", price: 119.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "googleworkspace": {
    id: "googleworkspace",
    name: "Google Workspace",
    description: "Google Workspace (formerly G Suite) is a collection of cloud computing, productivity, and collaboration tools developed by Google. It includes Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet, and more. Launched in 2006 as Google Apps for Your Domain, it has become the backbone of modern business communication, rivaling Microsoft's Office suite.\n\nIts cloud-native approach allows for real-time collaboration that was revolutionary at the time of its release. Multiple users can edit a single document simultaneously, eliminating the need for email attachments and version control headaches. It is used by everyone from small startups to massive enterprises like Airbus and Salesforce.\n\nRecently, Google has integrated 'Gemini' (formerly Duet AI) into Workspace, bringing generative AI capabilities to docs, email drafting, and slide creation, ensuring it remains competitive in the AI-driven productivity landscape.",
    foundedYear: "2006",
    founders: "Google",
    ceo: "Sundar Pichai",
    headquarters: "Mountain View, California",
    price: "6.00",
    currency: "USD",
    type: "google",
    netWorth: "$2 Trillion (Alphabet)",
    globalUserCount: "3 Billion+",
    parentCompany: "Alphabet Inc.",
    website: "workspace.google.com",
    milestones: [
      "2006: Launched as Google Apps",
      "2012: Google Drive released",
      "2016: Rebranded to G Suite",
      "2020: Rebranded to Google Workspace",
      "2023: Gemini AI integration"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Business Starter", price: 6.00, cycle: "Monthly" },
          { name: "Business Standard", price: 12.00, cycle: "Monthly" },
          { name: "Business Plus", price: 18.00, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Business Starter", nameLocalized: "İşletme Başlangıç", price: 119.99, cycle: "Monthly" },
          { name: "Business Standard", nameLocalized: "İşletme Standart", price: 239.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "slack": {
    id: "slack",
    name: "Slack",
    description: "Slack is a messaging app for business that connects people to the information they need. By bringing people together to work as one unified team, Slack transforms the way organizations communicate. It was founded in 2009 by Stewart Butterfield and began as an internal tool for his company while developing a game called Glitch.\n\nSlack's channel-based messaging replaced email for internal communication in many tech companies, becoming synonymous with modern startup culture. Its robust API allows integration with thousands of other tools like Jira, GitHub, and Google Drive, making it a central command center for work.\n\nIn 2021, Slack was acquired by Salesforce for $27.7 billion, one of the largest software acquisitions in history. It continues to operate as an independent brand while integrating deeper into the Salesforce Customer 360 ecosystem.",
    foundedYear: "2009",
    founders: "Stewart Butterfield, Eric Costello, Cal Henderson, Serguei Mourachov",
    ceo: "Lidiane Jones",
    headquarters: "San Francisco, California",
    price: "7.25",
    currency: "USD",
    type: "slack",
    netWorth: "$27 Billion (Acquisition)",
    globalUserCount: "35M+ DAU",
    parentCompany: "Salesforce",
    website: "slack.com",
    milestones: [
      "2013: Public launch",
      "2019: Direct listing on NYSE",
      "2020: IBM chooses Slack for 350k employees",
      "2021: Acquired by Salesforce",
      "2023: Launched Slack Canvas"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Pro", price: 7.25, cycle: "Monthly" },
          { name: "Business+", price: 12.50, cycle: "Monthly" }
        ]
      }
    }
  },
  "notionplus": {
    id: "notionplus",
    name: "Notion Plus",
    description: "Notion is an all-in-one workspace that blends your everyday work apps into one. It's the 'Lego of productivity software', allowing users to build their own systems for note-taking, project management, wikis, and databases. Founded in 2013, it struggled initially before a 2018 redesign catapulted it to viral status.\n\nNotion's block-based editor is its defining feature, allowing any piece of content to be moved, transformed, or embedded. It gained a massive cult following among students, startups, and productivity enthusiasts, leading to a vibrant community of template creators.\n\nWith the launch of Notion AI, the platform has integrated generative text capabilities directly into the editor, allowing users to brainstorm, summarize, and translate content without leaving their workspace.",
    foundedYear: "2013",
    founders: "Ivan Zhao, Simon Last",
    ceo: "Ivan Zhao",
    headquarters: "San Francisco, California",
    price: "8.00",
    currency: "USD",
    type: "notion",
    netWorth: "$10 Billion",
    globalUserCount: "30M+",
    website: "notion.so",
    milestones: [
      "2016: Notion 1.0 released",
      "2018: Notion 2.0 (Databases) released",
      "2020: Personal plan made free",
      "2021: Valued at $10 Billion",
      "2023: Notion AI launched"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Plus", price: 8.00, cycle: "Monthly" },
          { name: "Business", price: 15.00, cycle: "Monthly" }
        ]
      }
    }
  },
  "figma": {
    id: "figma",
    name: "Figma",
    description: "Figma is the leading collaborative interface design tool. Built for the web, it allows designers, developers, and stakeholders to work in the same file at the same time, revolutionizing the design workflow much like Google Docs did for writing. Founded in 2012 by Dylan Field and Evan Wallace, it was the first professional design tool to run entirely in the browser.\n\nFigma's vector networks and component properties allow for complex, responsive design systems. Its introduction of 'FigJam', a collaborative whiteboarding tool, expanded its utility beyond pure UI/UX design into brainstorming and diagramming.\n\nIn 2022, Adobe announced intent to acquire Figma for $20 billion, though the deal was later abandoned due to regulatory pressure. Figma remains the industry standard for product design, used by teams at Netflix, Airbnb, and Zoom.",
    foundedYear: "2012",
    founders: "Dylan Field, Evan Wallace",
    ceo: "Dylan Field",
    headquarters: "San Francisco, California",
    price: "12.00",
    currency: "USD",
    type: "figma",
    netWorth: "$10 Billion+",
    globalUserCount: "4M+",
    website: "figma.com",
    milestones: [
      "2015: Closed beta launch",
      "2016: Public launch",
      "2021: Launched FigJam",
      "2022: Failed Adobe acquisition attempt",
      "2023: Dev Mode for developers"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Professional", price: 12.00, cycle: "Monthly" },
          { name: "Organization", price: 45.00, cycle: "Monthly" }
        ]
      }
    }
  },

  // --- AI & DEV ---
  "chatgptplus": {
    id: "chatgptplus",
    name: "ChatGPT Plus",
    description: "ChatGPT Plus is the premium subscription tier for ChatGPT, the AI chatbot developed by OpenAI. Launched in February 2023, it offers subscribers priority access during peak times, faster response speeds, and exclusive access to the latest models like GPT-4.\n\nOpenAI was founded in 2015 as a non-profit research lab with the mission to ensure artificial general intelligence benefits all of humanity. The release of ChatGPT in late 2022 marked a watershed moment for AI, becoming the fastest-growing consumer application in history.\n\nSubscribers also get access to advanced features like DALL·E 3 for image generation, browsing capabilities, and data analysis tools. It serves as a productivity multiplier for developers, writers, and professionals across industries.",
    foundedYear: "2015 (OpenAI)",
    founders: "Sam Altman, Elon Musk, Ilya Sutskever, Greg Brockman, Wojciech Zaremba, John Schulman",
    ceo: "Sam Altman",
    headquarters: "San Francisco, California",
    price: "20.00",
    currency: "USD",
    type: "chatgpt",
    netWorth: "$80 Billion (OpenAI Valuation)",
    globalUserCount: "180M+ (MAU)",
    parentCompany: "OpenAI",
    website: "openai.com",
    milestones: [
      "2015: OpenAI founded",
      "2020: GPT-3 released",
      "2022: ChatGPT launched (Nov)",
      "2023: ChatGPT Plus & GPT-4 released",
      "2024: Sora video model announced"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Plus", price: 20.00, cycle: "Monthly" },
          { name: "Pro", price: 200.00, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Plus", nameLocalized: "Plus", price: 649.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "githubcopilot": {
    id: "githubcopilot",
    name: "GitHub Copilot",
    description: "GitHub Copilot is an AI-powered code completion tool developed by GitHub and OpenAI. It functions as an 'AI pair programmer', suggesting whole lines or blocks of code as developers type within their integrated development environment (IDE).\n\nBuilt on the OpenAI Codex model, Copilot was trained on billions of lines of public code. Since its general availability in 2022, it has transformed software development by automating boilerplate code, writing unit tests, and helping developers learn new languages and frameworks faster.\n\nMicrosoft, which owns GitHub, has continued to expand Copilot's capabilities with 'Copilot X', integrating chat interfaces, pull request descriptions, and CLI assistance. It represents the forefront of AI-assisted engineering.",
    foundedYear: "2021 (Preview)",
    founders: "GitHub & OpenAI",
    ceo: "Thomas Dohmke (GitHub)",
    headquarters: "San Francisco, California",
    price: "10.00",
    currency: "USD",
    type: "githubcopilot",
    netWorth: "$7.5 Billion (GitHub Acq.)",
    globalUserCount: "1.3M+ Paid Users",
    parentCompany: "Microsoft",
    website: "github.com",
    milestones: [
      "2018: Microsoft acquires GitHub",
      "2021: Copilot Technical Preview launched",
      "2022: General Availability",
      "2023: Copilot X announced",
      "2023: Copilot Chat integrated into VS Code"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Individual", price: 10.00, cycle: "Monthly" },
          { name: "Business", price: 19.00, cycle: "Monthly" }
        ]
      }
    }
  },
  "midjourney": {
    id: "midjourney",
    name: "Midjourney",
    description: "Midjourney is a generative artificial intelligence program and service created and hosted by San Francisco-based independent research lab Midjourney, Inc. It generates images from natural language descriptions, called 'prompts', similar to OpenAI's DALL-E and Stable Diffusion.\n\nThe tool is currently only accessible through a Discord bot, which adds a unique community aspect to the creation process. Users can see each other's prompts and results, fostering a collaborative learning environment. Midjourney is known for its artistic style and high-resolution output.\n\nDespite having a small team and no venture capital funding, Midjourney has become one of the most prominent players in the generative AI space, sparking debates about the future of art and copyright.",
    foundedYear: "2022",
    founders: "David Holz",
    ceo: "David Holz",
    headquarters: "San Francisco, California",
    price: "10.00",
    currency: "USD",
    type: "midjourney",
    netWorth: "Private (Est. $10B+)",
    globalUserCount: "16M+ Discord Members",
    website: "midjourney.com",
    milestones: [
      "2022: Open Beta launch via Discord",
      "2023: V5 Model released (Photo-realism)",
      "2023: Ended free trials due to high demand",
      "2024: Alpha web interface testing"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Basic", price: 10.00, cycle: "Monthly" },
          { name: "Standard", price: 30.00, cycle: "Monthly" },
          { name: "Pro", price: 60.00, cycle: "Monthly" }
        ]
      }
    }
  },

  // --- GAMING ---
  "xboxgamepass": {
    id: "xboxgamepass",
    name: "Xbox Game Pass",
    description: "Xbox Game Pass is widely considered the 'Netflix of video games'. Launched by Microsoft in 2017, it grants users access to a rotating catalog of over 100 high-quality games for a monthly fee. It fundamentally changed the gaming industry's business model from unit sales to recurring subscriptions.\n\nA key differentiator for Game Pass is that all first-party Xbox titles (like Halo, Forza, and Starfield) launch on the service on day one. This aggressive strategy aims to lock users into the Xbox ecosystem across consoles, PC, and mobile via cloud streaming.\n\nThe service's value increased significantly with Microsoft's acquisition of ZeniMax Media (Bethesda) and Activision Blizzard. These acquisitions have brought massive franchises like 'Call of Duty', 'Fallout', and 'The Elder Scrolls' under the Game Pass umbrella.",
    foundedYear: "2017",
    founders: "Microsoft (Phil Spencer)",
    ceo: "Phil Spencer (Microsoft Gaming)",
    headquarters: "Redmond, Washington",
    price: "16.99",
    currency: "USD",
    type: "gamepass",
    netWorth: "$3 Trillion (Microsoft)",
    globalUserCount: "34M+",
    parentCompany: "Microsoft",
    website: "xbox.com",
    milestones: [
      "2017: Service launched",
      "2019: Game Pass for PC launched",
      "2020: xCloud streaming added to Ultimate",
      "2021: Bethesda games added",
      "2023: Activision Blizzard acquisition completed"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Core", price: 9.99, cycle: "Monthly" },
          { name: "Standard", price: 14.99, cycle: "Monthly" },
          { name: "Ultimate", price: 19.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Core", nameLocalized: "Temel", price: 179, cycle: "Monthly" },
          { name: "Standard", nameLocalized: "Standart", price: 279, cycle: "Monthly" },
          { name: "Ultimate", nameLocalized: "Ultimate", price: 449, cycle: "Monthly" }
        ]
      }
    }
  },
  "playstationplus": {
    id: "playstationplus",
    name: "PlayStation Plus",
    description: "PlayStation Plus is a subscription service by Sony Interactive Entertainment for PlayStation consoles. Originally launched in 2010 to provide free games and discounts, it is now required for online multiplayer gaming on PS4 and PS5.\n\nIn 2022, Sony revamped the service into three tiers: Essential, Extra, and Premium. The higher tiers offer a vast library of PS4 and PS5 games, as well as a catalog of classic titles from previous PlayStation generations, directly competing with Xbox Game Pass.\n\nThe service is integral to the PlayStation ecosystem, offering exclusive \"PS Plus Collection\" titles to PS5 owners and cloud streaming capabilities for older games, ensuring backward compatibility through the cloud.",
    foundedYear: "2010",
    founders: "Sony",
    ceo: "Jim Ryan",
    headquarters: "San Mateo, California",
    price: "9.99",
    currency: "USD",
    type: "playstation",
    netWorth: "$100 Billion (Sony)",
    globalUserCount: "47M+",
    parentCompany: "Sony",
    website: "playstation.com",
    milestones: [
      "2010: Launched on PS3",
      "2013: Required for PS4 online multiplayer",
      "2020: PS Plus Collection for PS5",
      "2022: Relaunch with Extra/Premium tiers",
      "2023: Cloud streaming for PS5 games"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Essential", price: 9.99, cycle: "Monthly" },
          { name: "Extra", price: 14.99, cycle: "Monthly" },
          { name: "Premium", price: 17.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Essential", nameLocalized: "Temel", price: 250, cycle: "Monthly" },
          { name: "Extra", nameLocalized: "Ekstra", price: 370, cycle: "Monthly" },
          { name: "Premium", nameLocalized: "Premium", price: 470, cycle: "Monthly" }
        ]
      }
    }
  },
  "twitchturbo": {
    id: "twitchturbo",
    name: "Twitch Turbo",
    description: "Twitch Turbo is a monthly subscription program offered exclusively on Twitch.tv. It provides an ad-free viewing experience across the entire site, which is a major selling point for heavy users who watch multiple streamers.\n\nIn addition to ad-free viewing, Turbo subscribers get a custom set of emoticons, expanded chat color options, and a priority badge in chat. It allows users to support the platform directly rather than subscribing to individual channels, although it does not provide the specific channel emotes that a channel sub does.\n\nFounded in 2011 as a spin-off of Justin.tv, Twitch was acquired by Amazon in 2014 for $970 million. It dominates the live-streaming market, particularly for video games and esports.",
    foundedYear: "2011",
    founders: "Justin Kan, Emmett Shear",
    ceo: "Dan Clancy",
    headquarters: "San Francisco, California",
    price: "11.99",
    currency: "USD",
    type: "twitch",
    netWorth: "$15 Billion (Est)",
    globalUserCount: "140M MAU",
    parentCompany: "Amazon",
    website: "twitch.tv",
    milestones: [
      "2011: Launched as Justin.tv spin-off",
      "2013: Twitch Turbo launched",
      "2014: Acquired by Amazon",
      "2016: Twitch Prime (now Prime Gaming) launched",
      "2023: Turbo price increased in some regions"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Turbo", price: 11.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "discordnitro": {
    id: "discordnitro",
    name: "Discord Nitro",
    description: "Discord Nitro is the premium subscription service for the popular chat app Discord. Unlike other social platforms that sell user data or serve ads, Discord's revenue model relies entirely on Nitro subscriptions. It offers users enhanced features like higher quality video streaming, larger file uploads, and custom emojis across all servers.\n\nDiscord was founded in 2015 as a VoIP tool for gamers but has since evolved into a general-purpose community platform used by crypto enthusiasts, study groups, and hobbyists. Nitro allows users to personalize their profiles with animated avatars and banners, serving as a status symbol within the community.\n\nThe service has two tiers: Nitro Basic and full Nitro. Full Nitro includes 2 Server Boosts, which help communities unlock perks for everyone in a specific server, fostering a communal support model.",
    foundedYear: "2015",
    founders: "Jason Citron, Stan Vishnevskiy",
    ceo: "Jason Citron",
    headquarters: "San Francisco, California",
    price: "9.99",
    currency: "USD",
    type: "discord",
    netWorth: "$15 Billion",
    globalUserCount: "196M MAU",
    website: "discord.com",
    milestones: [
      "2015: Discord launch",
      "2017: Nitro subscription launched",
      "2020: Rebranding to 'Your Place to Talk'",
      "2021: Rejected $12B Microsoft acquisition offer",
      "2022: Nitro Basic tier introduced"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Nitro Basic", price: 2.99, cycle: "Monthly" },
          { name: "Nitro", price: 9.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Nitro Basic", nameLocalized: "Nitro Temel", price: 44.99, cycle: "Monthly" },
          { name: "Nitro", nameLocalized: "Nitro", price: 149.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "duolingo": {
    id: "duolingo",
    name: "Duolingo Super",
    description: "Duolingo is the world's most popular language-learning platform. 'Super Duolingo' (formerly Duolingo Plus) is the premium subscription that removes ads, provides unlimited hearts (mistakes), and offers personalized practice sessions to review errors.\n\nFounded in 2011 by Luis von Ahn (inventor of CAPTCHA) and Severin Hacker, the app uses gamification elements like streaks, leaderboards, and leagues to keep users engaged. Its mascot, Duo the Owl, has become a viral meme for its aggressive reminders to practice.\n\nDuolingo has expanded beyond languages to include Math and Music courses, all within the same app. The company went public in 2021 and continues to use AI to customize lessons for each learner's proficiency level.",
    foundedYear: "2011",
    founders: "Luis von Ahn, Severin Hacker",
    ceo: "Luis von Ahn",
    headquarters: "Pittsburgh, Pennsylvania",
    price: "6.99",
    currency: "USD",
    type: "duolingo",
    netWorth: "$9 Billion",
    globalUserCount: "83M MAU",
    website: "duolingo.com",
    milestones: [
      "2011: Public beta launch",
      "2013: Apple App of the Year",
      "2017: Duolingo Plus launched",
      "2021: IPO on NASDAQ",
      "2023: Rebranded Plus to Super Duolingo"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Super", price: 6.99, cycle: "Monthly" },
          { name: "Max", price: 13.99, cycle: "Monthly" },
          { name: "Family", price: 9.99, cycle: "Monthly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Super", nameLocalized: "Super", price: 209.99, cycle: "Monthly" },
          { name: "Family", nameLocalized: "Aile", price: 299.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "masterclass": {
    id: "masterclass",
    name: "MasterClass",
    description: "MasterClass is an online education subscription platform on which students can access tutorials and lectures pre-recorded by experts in various fields. From cooking with Gordon Ramsay to acting with Natalie Portman, it offers 'edutainment' with cinema-quality production values.\n\nFounded in 2014, the platform differentiates itself through the celebrity status of its instructors. It sells an annual membership that unlocks access to the entire library of 180+ classes. It appeals to lifelong learners who want inspiration rather than just technical certification.\n\nMasterClass has expanded into enterprise offerings, allowing companies to offer the service as a perk to employees. It represents a shift in online learning towards high-end, storytelling-driven content.",
    foundedYear: "2014",
    founders: "David Rogier, Aaron Rasmussen",
    ceo: "David Rogier",
    headquarters: "San Francisco, California",
    price: "15.00",
    currency: "USD",
    type: "masterclass",
    netWorth: "$2.75 Billion",
    globalUserCount: "2M+ (Est)",
    website: "masterclass.com",
    milestones: [
      "2015: Launched with 3 instructors",
      "2018: Raised $80M Series D",
      "2020: Usage surged during pandemic",
      "2021: Valuation tripled to $2.75B",
      "2023: Launched 'Sessions' for hands-on learning"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Individual", price: 15.00, cycle: "Monthly" },
          { name: "Duo", price: 20.00, cycle: "Monthly" },
          { name: "Family", price: 23.00, cycle: "Monthly" }
        ]
      }
    }
  },
  "dropbox": {
    id: "dropbox",
    name: "Dropbox Plus",
    description: "Dropbox is a file hosting service that offers cloud storage, file synchronization, personal cloud, and client software. Dropbox Plus is the personal paid tier offering 2TB of storage, offline access, and advanced sharing controls.\n\nFounded in 2007 by Drew Houston and Arash Ferdowsi, Dropbox popularized the concept of a 'magic folder' that syncs across devices. It was one of the first major successes of the Y Combinator startup accelerator.\n\nWhile facing stiff competition from Google Drive and OneDrive, Dropbox has pivoted to focus on 'smart workspace' features, acquiring tools like HelloSign (e-signatures) and DocSend to facilitate document workflows for creative professionals and freelancers.",
    foundedYear: "2007",
    founders: "Drew Houston, Arash Ferdowsi",
    ceo: "Drew Houston",
    headquarters: "San Francisco, California",
    price: "11.99",
    currency: "USD",
    type: "dropbox",
    netWorth: "$9 Billion",
    globalUserCount: "700M+ Users",
    website: "dropbox.com",
    milestones: [
      "2007: Y Combinator launch",
      "2011: Reached 50M users",
      "2018: IPO on NASDAQ",
      "2019: Acquired HelloSign",
      "2023: Dropbox Dash AI launched"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Plus", price: 11.99, cycle: "Monthly" },
          { name: "Professional", price: 24.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "zoom": {
    id: "zoom",
    name: "Zoom Pro",
    description: "Zoom is a videotelephony software program developed by Zoom Video Communications. The Pro plan removes the 40-minute time limit on meetings and adds cloud recording and admin controls. It became a household name during the COVID-19 pandemic as the default tool for remote work and virtual social gatherings.\n\nFounded in 2011 by Eric Yuan, a former Cisco engineer, Zoom focused on making video calls reliable and easy to use. Its 'freemium' model allowed for viral adoption in schools and businesses.\n\nPost-pandemic, Zoom has expanded into a full communications platform with Zoom Phone, Zoom Rooms, and AI Companion features, aiming to be the operating system for the modern hybrid workplace.",
    foundedYear: "2011",
    founders: "Eric Yuan",
    ceo: "Eric Yuan",
    headquarters: "San Jose, California",
    price: "15.99",
    currency: "USD",
    type: "zoom",
    netWorth: "$20 Billion",
    globalUserCount: "300M+ DAU (Peak)",
    website: "zoom.us",
    milestones: [
      "2011: Founded",
      "2013: Public launch",
      "2019: IPO",
      "2020: 30x growth during pandemic",
      "2023: Zoom AI Companion launched"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Pro", price: 13.33, cycle: "Monthly" },
          { name: "Business", price: 21.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "peacock": {
    id: "peacock",
    name: "Peacock",
    description: "Peacock is an American video streaming service owned and operated by NBCUniversal. Launched in 2020, it features content from NBC studios, including 'The Office', 'Parks and Recreation', and 'Saturday Night Live', along with original programming and live sports like the Premier League and WWE.\n\nPeacock differentiates itself with a tiered model that includes a free ad-supported version (though availability has been reduced), a Premium ad-supported tier, and a Premium Plus ad-free tier. It serves as the streaming home for Universal Pictures films shortly after their theatrical release.\n\nThe service has leveraged major live events like the Olympics and NFL games to drive subscriber growth, positioning itself as a hybrid between traditional TV and modern streaming.",
    foundedYear: "2020",
    founders: "NBCUniversal",
    ceo: "Kelly Campbell",
    headquarters: "New York City, New York",
    price: "5.99",
    currency: "USD",
    type: "peacock",
    netWorth: "Comcast Owned",
    globalUserCount: "31M+ Paid",
    parentCompany: "Comcast",
    website: "peacocktv.com",
    milestones: [
      "2020: National launch",
      "2021: The Office moves to Peacock",
      "2021: WWE Network integration",
      "2023: First exclusive NFL playoff game stream",
      "2023: Prices increased for the first time"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Premium (with Ads)", price: 7.99, cycle: "Monthly" },
          { name: "Premium Plus (No Ads)", price: 13.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "paramount+": {
    id: "paramount+",
    name: "Paramount+",
    description: "Paramount+ is an American video-on-demand service owned by Paramount Global. It offers content from the libraries of CBS, Paramount Pictures, Nickelodeon, MTV, BET, and Comedy Central, along with live sports and original programming like 'Star Trek: Discovery' and 'Yellowstone' spin-offs.\n\nOriginally launched as CBS All Access in 2014, the service was rebranded as Paramount+ in 2021 to reflect its expanded library following the merger of CBS and Viacom. It aims to compete globally by leveraging its massive catalog of classic films and television series.\n\nThe platform has grown rapidly by bundling with Showtime and securing exclusive rights to major sporting events like the UEFA Champions League and NFL games.",
    foundedYear: "2014 (as CBS All Access)",
    founders: "CBS Interactive",
    ceo: "Bob Bakish (Paramount Global)",
    headquarters: "New York City, New York",
    price: "5.99",
    currency: "USD",
    type: "paramount+",
    netWorth: "$8 Billion (Est. Valuation)",
    globalUserCount: "67M+",
    parentCompany: "Paramount Global",
    website: "paramountplus.com",
    milestones: [
      "2014: CBS All Access launch",
      "2017: First Star Trek original series",
      "2021: Rebranded to Paramount+",
      "2022: Halo series premiere",
      "2023: Integration with Showtime"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Essential (with Ads)", price: 5.99, cycle: "Monthly" },
          { name: "Showtime Bundle (No Ads)", price: 11.99, cycle: "Monthly" }
        ]
      }
    }
  },
  "audible": {
    id: "audible",
    name: "Audible",
    description: "Audible is an online audiobook and podcast service that allows users to purchase and stream audiobooks and other forms of spoken word content. It is the world's largest producer and retailer of audiobooks.\n\nFounded in 1995, Audible created the first portable digital audio player before the iPod existed. Amazon acquired the company in 2008 for $300 million. Since then, it has expanded into original content production, creating 'Audible Originals' which include exclusive audio dramas and podcasts.\n\nThe service operates on a credit-based subscription model, where monthly fees grant credits that can be exchanged for any audiobook regardless of price, making it highly valuable for heavy readers.",
    foundedYear: "1995",
    founders: "Don Katz",
    ceo: "Bob Carrigan",
    headquarters: "Newark, New Jersey",
    price: "14.95",
    currency: "USD",
    type: "audible",
    netWorth: "$1 Billion+ (Amazon Subsid.)",
    globalUserCount: "Millions (Undisclosed)",
    parentCompany: "Amazon",
    website: "audible.com",
    milestones: [
      "1995: Company founded",
      "1997: Released first portable digital audio player",
      "2008: Acquired by Amazon",
      "2020: Audible Plus catalog launched",
      "2023: Exclusive deal with Obama's Higher Ground"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Plus (1 Credit/mo)", price: 7.95, cycle: "Monthly" },
          { name: "Premium (2 Credits/mo)", price: 14.95, cycle: "Monthly" }
        ]
      }
    }
  },
  "amazonprime": {
    id: "amazonprime",
    name: "Amazon Prime",
    description: "Amazon Prime is a paid subscription service from Amazon that gives users access to a wide range of benefits, most notably free two-day (or faster) delivery on eligible items. It has become the gold standard for e-commerce loyalty programs.\n\nBeyond shipping, Prime includes access to Prime Video, Amazon Music Prime, Prime Gaming, and exclusive deals during events like Prime Day. It serves as an ecosystem lock-in, encouraging members to shop almost exclusively on Amazon.\n\nWith over 200 million subscribers globally, Prime is a massive revenue driver for Amazon and a key part of its strategy to dominate retail and entertainment simultaneously.",
    foundedYear: "2005",
    founders: "Jeff Bezos",
    ceo: "Andy Jassy (Amazon)",
    headquarters: "Seattle, Washington",
    price: "14.99",
    currency: "USD",
    type: "amazonprime",
    netWorth: "$2 Trillion (Amazon)",
    globalUserCount: "200M+",
    parentCompany: "Amazon",
    website: "amazon.com",
    milestones: [
      "2005: Prime launched ($79/year)",
      "2011: Prime Video added",
      "2014: Price increased to $99",
      "2015: First Prime Day",
      "2021: Reached 200 million members"
    ],
    regions: {
      US: {
        currency: "USD",
        tiers: [
          { name: "Monthly", price: 14.99, cycle: "Monthly" },
          { name: "Annual", price: 139.00, cycle: "Yearly" }
        ]
      },
      TR: {
        currency: "TRY",
        tiers: [
          { name: "Monthly", nameLocalized: "Aylık", price: 99, cycle: "Monthly" },
          { name: "Annual", nameLocalized: "Yıllık", price: 799, cycle: "Yearly" }
        ]
      }
    }
  }
};
