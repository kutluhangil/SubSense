// Comprehensive datasets for the application

export const SUBSCRIPTION_CATEGORIES = [
  {
    name: "Entertainment & Streaming",
    examples: ["Netflix", "Disney+", "HBO Max", "Hulu", "Amazon Prime Video", "Apple TV+", "Paramount+", "Peacock TV", "Discovery+", "Crunchyroll", "YouTube Premium"]
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
    name: "Cloud & Storage",
    examples: ["Google One", "iCloud+", "Dropbox Plus", "OneDrive 365", "Mega.nz", "Box Premium"]
  },
  {
    name: "Security & VPN",
    examples: ["NordVPN", "ExpressVPN", "Surfshark", "1Password", "Bitwarden Premium", "LastPass", "ProtonMail Plus", "Dashlane Premium"]
  },
  {
    name: "Education & Learning",
    examples: ["Coursera Plus", "Udemy Personal Plan", "Skillshare Premium", "MasterClass", "Duolingo Plus", "Babbel", "Rosetta Stone"]
  },
  {
    name: "Health & Lifestyle",
    examples: ["Calm Premium", "Headspace", "Strava", "Nike Training Club", "Fitbod", "MyFitnessPal Premium"]
  },
  {
    name: "Social & Creator Platforms",
    examples: ["LinkedIn Premium", "Medium Membership", "Patreon", "OnlyFans", "Substack", "X Premium (Twitter Blue)"]
  },
  {
    name: "Developer & Hosting Tools",
    examples: ["Vercel Pro", "Render Premium", "Heroku", "DigitalOcean", "Netlify Pro", "GitHub Advanced Security"]
  },
  {
    name: "E-Commerce & Website Builders",
    examples: ["Shopify", "Wix Premium", "Webflow Pro", "Squarespace", "Domain.com", "Namecheap Hosting"]
  }
];

// Flattened list for dropdowns
export const ALL_SUBSCRIPTIONS = SUBSCRIPTION_CATEGORIES.flatMap(cat => cat.examples).sort();

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "tr", name: "Türkçe" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文 (Simplified)" },
  { code: "ar", name: "العربية" },
  { code: "hi", name: "हिन्दी" },
  { code: "nl", name: "Nederlands" },
  { code: "sv", name: "Svenska" },
  { code: "no", name: "Norsk" },
  { code: "pl", name: "Polski" },
  { code: "da", name: "Dansk" },
  { code: "fi", name: "Suomi" },
  { code: "th", name: "ไทย" }
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "United States Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" }
];