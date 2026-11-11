// Explore catalog — editorial subscription dataset for the mobile Explore module.
// Content pulled verbatim from the SubSense web app `SUBSCRIPTION_CATALOG`.
// Bundled (no network) so Explore works fully offline; brand logos are the only
// remote-ish asset and they too are bundled via src/core/images.

import type { Category } from '../types';
import { EXPLORE_TR } from './explore.tr';
import { catalogOverrides } from '../store/catalog';

export type ExploreCategory =
  | 'Streaming'
  | 'Music'
  | 'Design'
  | 'AI'
  | 'SaaS'
  | 'Gaming'
  | 'Community'
  | 'Shopping'
  | 'Turkish';

export interface ExploreTier {
  name: string;
  /** Localized tier name (used for the TR block). */
  nameLocalized?: string;
  price: number;
  cycle?: 'Monthly' | 'Yearly';
}

export interface ExploreRegions {
  US?: { tiers: ExploreTier[] };
  TR?: { tiers: ExploreTier[] };
}

export interface ExploreService {
  name: string;
  category: ExploreCategory;
  /** Brand accent color — fills the detail-sheet header. */
  accent: string;
  headquarters?: string;
  foundedYear?: string;
  founders?: string;
  ceo?: string;
  globalUserCount?: string;
  /** Valuation. */
  netWorth?: string;
  parentCompany?: string;
  /** "Starting at" monthly price, in `startingCurrency`. */
  startingAt: number;
  startingCurrency: 'USD' | 'TRY';
  website?: string;
  /** Paragraphs (already split on the source `\n\n` markers). */
  description: string[];
  regions: ExploreRegions;
  milestones: string[];
}

/** Section labels + display order for the grouped Explore grid. */
export const EXPLORE_CATEGORY_ORDER: { key: ExploreCategory; label: string }[] = [
  { key: 'Streaming', label: 'Entertainment & Streaming' },
  { key: 'Music', label: 'Music & Audio' },
  { key: 'Design', label: 'Design & Creativity' },
  { key: 'AI', label: 'AI & Dev Tools' },
  { key: 'SaaS', label: 'Business & Productivity' },
  { key: 'Gaming', label: 'Gaming' },
  { key: 'Community', label: 'Community & Learning' },
  { key: 'Shopping', label: 'Shopping & Local' },
  { key: 'Turkish', label: 'Turkish Services 🇹🇷' },
];

export const EXPLORE_CATALOG: ExploreService[] = [
  // ── Entertainment & Streaming ──────────────────────────────────────────────
  {
    name: 'Netflix',
    category: 'Streaming',
    accent: '#E50914',
    headquarters: 'Los Gatos, California',
    foundedYear: '1997',
    founders: 'Reed Hastings, Marc Randolph',
    ceo: 'Ted Sarandos, Greg Peters',
    globalUserCount: '283M+',
    netWorth: '$260 Billion',
    startingAt: 17.99,
    startingCurrency: 'USD',
    website: 'https://www.netflix.com/signup',
    description: [
      "Netflix began its journey in 1997 as a DVD-by-mail service, famously conceived after Reed Hastings was charged a $40 late fee for a rental copy of Apollo 13. The company pivoted to streaming media in 2007, a move that would fundamentally disrupt the global entertainment industry and lead to the decline of traditional video rental stores.",
      "Over the years, Netflix evolved from a content distributor to a massive content creator. With the launch of 'House of Cards' in 2013, it pioneered the model of 'binge-watching' by releasing entire seasons at once. Today, it operates in over 190 countries and produces original content in dozens of languages, effectively becoming the world's first global TV network.",
      "Despite increasing competition, Netflix remains the market leader in streaming, known for its powerful recommendation algorithm and massive cultural hits like 'Stranger Things', 'Squid Game', and 'The Crown'. It continues to experiment with new formats, including interactive storytelling and mobile gaming.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Standard with Ads', price: 7.99 },
        { name: 'Standard', price: 17.99 },
        { name: 'Premium (4K)', price: 24.99 },
      ] },
      TR: { tiers: [
        { name: 'Temel', nameLocalized: 'Temel', price: 259.99 },
        { name: 'Standart', nameLocalized: 'Standart', price: 389.99 },
        { name: 'Premium (4K)', nameLocalized: 'Premium (4K)', price: 499.99 },
      ] },
    },
    milestones: [
      '1997: Founded as a DVD-by-mail service',
      '2007: Launched streaming video service',
      "2013: Released first original series 'House of Cards'",
      '2016: Expanded globally to 130 new countries simultaneously',
      '2021: Squid Game becomes most-watched show ever',
      '2022: Launched ad-supported tier',
      '2025: Surpassed 280 million subscribers',
    ],
  },
  {
    name: 'Disney+',
    category: 'Streaming',
    accent: '#113CCF',
    headquarters: 'Burbank, California',
    foundedYear: '2019',
    founders: 'The Walt Disney Company',
    ceo: 'Bob Iger',
    globalUserCount: '150M+',
    netWorth: '$200 Billion',
    parentCompany: 'Disney',
    startingAt: 13.99,
    startingCurrency: 'USD',
    website: 'https://www.disneyplus.com',
    description: [
      "Disney+ launched in November 2019, marking a historic pivot for The Walt Disney Company as it shifted focus from traditional theatrical and cable distribution to direct-to-consumer streaming. Within its first day, it amassed 10 million subscribers, far exceeding industry expectations.",
      "The service is the dedicated home for movies and shows from Disney's core brands: Disney, Pixar, Marvel, Star Wars, and National Geographic. This exclusive library includes cultural juggernauts like 'The Mandalorian', the first live-action Star Wars series, which became an instant global phenomenon.",
      "Today, Disney+ is one of the 'Big Three' global streaming services. It continues to integrate content from its other assets, including Hulu (in the US) and Star (internationally), aiming to offer a comprehensive general entertainment offering alongside its family-friendly staples.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Basic (with Ads)', price: 9.99 },
        { name: 'Premium (No Ads)', price: 15.99 },
      ] },
      TR: { tiers: [
        { name: 'Standart (Reklamlı)', nameLocalized: 'Standart (Reklamlı)', price: 249.90 },
        { name: 'Premium (Reklamsız)', nameLocalized: 'Premium (Reklamsız)', price: 449.90 },
      ] },
    },
    milestones: [
      "2019: Launch with 'The Mandalorian'",
      '2020: Reached 50 million subscribers in 5 months',
      "2020: Released 'Hamilton' and 'Soul' directly to streaming",
      '2022: Launched ad-supported tier',
      '2024: Integrated Hulu content into main app',
    ],
  },
  {
    name: 'Prime Video',
    category: 'Streaming',
    accent: '#00A8E1',
    headquarters: 'Seattle, Washington',
    foundedYear: '2006',
    founders: 'Jeff Bezos',
    ceo: 'Mike Hopkins (SVP)',
    globalUserCount: '200M+ (Prime)',
    netWorth: '$2 Trillion (Amazon)',
    parentCompany: 'Amazon',
    startingAt: 8.99,
    startingCurrency: 'USD',
    website: 'https://www.primevideo.com',
    description: [
      "Amazon Prime Video launched in 2006 as Amazon Unbox, originally a download service. It has since evolved into a major global streaming player, bundled with the Amazon Prime membership which includes free shipping and music. This bundling strategy has made it one of the most widely accessible streaming services in the world.",
      "Amazon has invested heavily in original content, producing critical darlings like 'The Marvelous Mrs. Maisel' and massive budget spectacles like 'The Lord of the Rings: The Rings of Power'. Unlike pure-play streamers, Prime Video serves as a value-add to the broader Amazon ecosystem, driving retail loyalty.",
      "In recent years, Prime Video has aggressively pursued live sports rights, securing exclusive broadcasts for NFL Thursday Night Football. It also offers 'Channels', allowing users to subscribe to other networks like HBO or Starz directly within the Prime interface, acting as an aggregator for the streaming market.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Prime Video (Standalone)', price: 8.99 },
        { name: 'Amazon Prime (Bundle)', price: 14.99 },
      ] },
      TR: { tiers: [
        { name: 'Prime Video', nameLocalized: 'Prime Video', price: 69.90 },
      ] },
    },
    milestones: [
      '2006: Amazon Unbox launched',
      '2011: Included in Prime membership',
      '2013: Amazon Studios launches first original series',
      "2022: 'The Rings of Power' premieres",
      '2024: Introduced ads to base tier',
    ],
  },
  {
    name: 'HBO Max (Max)',
    category: 'Streaming',
    accent: '#5F259F',
    headquarters: 'New York City, New York',
    foundedYear: '2020',
    founders: 'WarnerMedia',
    ceo: 'David Zaslav',
    globalUserCount: '97M+',
    netWorth: '$25 Billion (Warner Bros. Discovery)',
    parentCompany: 'Warner Bros. Discovery',
    startingAt: 16.99,
    startingCurrency: 'USD',
    website: 'https://www.max.com/plans',
    description: [
      "HBO Max launched in May 2020, combining the prestigious library of HBO with the vast content archives of WarnerMedia (Warner Bros., DC, TNT, TBS, Cartoon Network). It was designed to compete directly with Netflix by offering a mix of premium drama, blockbuster movies, and classic TV sitcoms like 'Friends' and 'The Big Bang Theory'.",
      "The service underwent a turbulent evolution, including the controversial 'Project Popcorn' in 2021 where Warner Bros. released all its theatrical movies on HBO Max simultaneously. Following the merger of WarnerMedia and Discovery in 2022, the service was rebranded simply as 'Max' in 2023.",
      "Now integrating unscripted content from Discovery+, Max positions itself as 'The One to Watch', housing everything from 'Game of Thrones' and 'Succession' to '90 Day Fiancé' and 'Shark Week', aiming for the broadest possible demographic appeal.",
    ],
    regions: {
      US: { tiers: [
        { name: 'With Ads', price: 9.99 },
        { name: 'Ad-Free', price: 16.99 },
        { name: 'Ultimate (4K)', price: 20.99 },
      ] },
      TR: { tiers: [
        { name: 'Standart', nameLocalized: 'Standart', price: 229.90 },
        { name: 'Standart (Yıllık)', nameLocalized: 'Standart (Yıllık)', price: 2299, cycle: 'Yearly' },
        { name: 'Özel', nameLocalized: 'Özel', price: 299.90 },
        { name: 'Özel (Yıllık)', nameLocalized: 'Özel (Yıllık)', price: 2999, cycle: 'Yearly' },
      ] },
    },
    milestones: [
      '2020: HBO Max launch',
      '2021: Same-day theatrical releases (Matrix 4, Dune)',
      '2022: Warner Bros. Discovery merger completed',
      "2023: Rebranded to 'Max'",
      '2024: House of the Dragon Season 2',
    ],
  },
  {
    name: 'Hulu',
    category: 'Streaming',
    accent: '#1CE783',
    headquarters: 'Santa Monica, California',
    foundedYear: '2007',
    founders: 'News Corp, NBC Universal, Providence Equity',
    ceo: 'Joe Earley',
    globalUserCount: '48M+',
    netWorth: 'N/A (Disney Owned)',
    parentCompany: 'Disney',
    startingAt: 7.99,
    startingCurrency: 'USD',
    website: 'https://www.hulu.com/welcome',
    description: [
      "Hulu was established in 2007 as a joint venture between News Corporation, NBC Universal, Providence Equity Partners, and later Disney, to stream aggregated TV content online. It was the industry's first major attempt by traditional media companies to tackle the digital shift.",
      "Known for its 'next-day air' model, Hulu allowed users to watch episodes of current TV shows the day after they aired on cable. Over time, it developed a robust slate of original programming, including the Emmy-winning 'The Handmaid's Tale', which put it on the map as a prestige content creator.",
      "Following Disney's acquisition of 21st Century Fox in 2019, Disney assumed full operational control of Hulu. It is now being closely integrated with Disney+ to provide a unified streaming experience, combining Disney's family brands with Hulu's general entertainment library.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Hulu (with Ads)', price: 9.99 },
        { name: 'Hulu (No Ads)', price: 18.99 },
      ] },
    },
    milestones: [
      '2008: Public launch',
      '2011: Launched original programming',
      '2017: Launched Hulu with Live TV',
      "2017: 'The Handmaid's Tale' wins Best Drama Emmy",
      '2019: Disney assumes full operational control',
    ],
  },
  {
    name: 'Apple TV+',
    category: 'Streaming',
    accent: '#000000',
    headquarters: 'Cupertino, California',
    foundedYear: '2019',
    founders: 'Apple Inc.',
    ceo: 'Tim Cook',
    globalUserCount: '25M+ (Est)',
    netWorth: '$3 Trillion (Apple)',
    parentCompany: 'Apple Inc.',
    startingAt: 12.99,
    startingCurrency: 'USD',
    website: 'https://tv.apple.com',
    description: [
      "Apple TV+ launched in November 2019 with a strategy distinct from its competitors: quality over quantity. Instead of buying a massive back catalog, Apple focused exclusively on producing high-budget original content with A-list talent, such as 'The Morning Show' with Jennifer Aniston and Reese Witherspoon.",
      "While it started with a small library, the service gained critical acclaim rapidly. In 2022, it became the first streaming service to win the Academy Award for Best Picture with 'CODA'. The comedy series 'Ted Lasso' also became a cultural phenomenon, earning back-to-back Emmys for Outstanding Comedy Series.",
      "Apple has also expanded into live sports, securing exclusive rights to Major League Soccer (MLS) and Major League Baseball (MLB) games. It remains a key part of the Apple One subscription bundle, driving value for the broader Apple services ecosystem.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Apple TV+', price: 12.99 },
        { name: 'Apple TV+ (Annual)', price: 129.00, cycle: 'Yearly' },
      ] },
      TR: { tiers: [
        { name: 'iCloud+ 50 GB ile', nameLocalized: 'iCloud+ 50 GB ile', price: 49.99 },
      ] },
    },
    milestones: [
      '2019: Launched in over 100 countries',
      "2020: 'Ted Lasso' premieres",
      "2022: 'CODA' wins Best Picture Oscar",
      '2023: Launched MLS Season Pass',
      '2025: Price increased to $12.99/mo',
    ],
  },
  {
    name: 'Peacock',
    category: 'Streaming',
    accent: '#000000',
    headquarters: 'New York City, New York',
    foundedYear: '2020',
    founders: 'NBCUniversal',
    ceo: 'Kelly Campbell',
    globalUserCount: '31M+ Paid',
    netWorth: 'Comcast Owned',
    parentCompany: 'Comcast',
    startingAt: 5.99,
    startingCurrency: 'USD',
    website: 'https://www.peacocktv.com/plans',
    description: [
      "Peacock is an American video streaming service owned and operated by NBCUniversal. Launched in 2020, it features content from NBC studios, including 'The Office', 'Parks and Recreation', and 'Saturday Night Live', along with original programming and live sports like the Premier League and WWE.",
      "Peacock differentiates itself with a tiered model that includes a free ad-supported version (though availability has been reduced), a Premium ad-supported tier, and a Premium Plus ad-free tier. It serves as the streaming home for Universal Pictures films shortly after their theatrical release.",
      "The service has leveraged major live events like the Olympics and NFL games to drive subscriber growth, positioning itself as a hybrid between traditional TV and modern streaming.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Premium (with Ads)', price: 7.99 },
        { name: 'Premium Plus (No Ads)', price: 13.99 },
      ] },
    },
    milestones: [
      '2020: National launch',
      '2021: The Office moves to Peacock',
      '2021: WWE Network integration',
      '2023: First exclusive NFL playoff game stream',
      '2023: Prices increased for the first time',
    ],
  },
  {
    name: 'Paramount+',
    category: 'Streaming',
    accent: '#0064FF',
    headquarters: 'New York City, New York',
    foundedYear: '2014 (as CBS All Access)',
    founders: 'CBS Interactive',
    ceo: 'Bob Bakish (Paramount Global)',
    globalUserCount: '67M+',
    netWorth: '$8 Billion (Est. Valuation)',
    parentCompany: 'Paramount Global',
    startingAt: 5.99,
    startingCurrency: 'USD',
    website: 'https://www.paramountplus.com/plans/',
    description: [
      "Paramount+ is an American video-on-demand service owned by Paramount Global. It offers content from the libraries of CBS, Paramount Pictures, Nickelodeon, MTV, BET, and Comedy Central, along with live sports and original programming like 'Star Trek: Discovery' and 'Yellowstone' spin-offs.",
      "Originally launched as CBS All Access in 2014, the service was rebranded as Paramount+ in 2021 to reflect its expanded library following the merger of CBS and Viacom. It aims to compete globally by leveraging its massive catalog of classic films and television series.",
      "The platform has grown rapidly by bundling with Showtime and securing exclusive rights to major sporting events like the UEFA Champions League and NFL games.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Essential (with Ads)', price: 5.99 },
        { name: 'Showtime Bundle (No Ads)', price: 11.99 },
      ] },
    },
    milestones: [
      '2014: CBS All Access launch',
      '2017: First Star Trek original series',
      '2021: Rebranded to Paramount+',
      '2022: Halo series premiere',
      '2023: Integration with Showtime',
    ],
  },
  {
    name: 'Crunchyroll',
    category: 'Streaming',
    accent: '#F47521',
    headquarters: 'San Francisco, California',
    foundedYear: '2006',
    founders: 'Kun Gao, James Lin',
    ceo: 'Rahul Purini',
    globalUserCount: '15M+ Paid',
    netWorth: '$1.18 Billion (Acquisition)',
    parentCompany: 'Sony',
    startingAt: 7.99,
    startingCurrency: 'USD',
    website: 'https://www.crunchyroll.com/welcome',
    description: [
      "Crunchyroll is the world's largest anime streaming service, offering thousands of anime titles, manga, and Asian dramas. Founded in 2006 as a video sharing site, it pivoted to legally licensed anime streaming in 2009.",
      "Following Sony's acquisition of Funimation in 2021 and the merger of Funimation and Crunchyroll, Crunchyroll became the dominant anime streaming platform globally, available in over 200 countries. It offers simulcasts of new anime episodes hours after their Japanese broadcast.",
      "The service has expanded into anime film distribution, manga publishing, and exclusive original anime productions, becoming an essential platform for anime fans worldwide.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Fan', price: 7.99 },
        { name: 'Mega Fan', price: 11.99 },
        { name: 'Ultimate Fan', price: 15.99 },
      ] },
      TR: { tiers: [
        { name: 'Fan', nameLocalized: 'Fan', price: 29.99 },
        { name: 'Mega Fan', nameLocalized: 'Mega Fan', price: 39.99 },
      ] },
    },
    milestones: [
      '2006: Founded as video site',
      '2009: Licensed streaming launch',
      '2018: Reached 1M subscribers',
      '2021: Sony acquired for $1.18B',
      '2022: Merged with Funimation',
    ],
  },

  // ── Music & Audio ──────────────────────────────────────────────────────────
  {
    name: 'Spotify',
    category: 'Music',
    accent: '#1DB954',
    headquarters: 'Stockholm, Sweden',
    foundedYear: '2006',
    founders: 'Daniel Ek, Martin Lorentzon',
    ceo: 'Daniel Ek',
    globalUserCount: '675M+ (Total)',
    netWorth: '$90 Billion',
    startingAt: 11.99,
    startingCurrency: 'USD',
    website: 'https://www.spotify.com/premium/',
    description: [
      "Spotify was founded in 2006 in Stockholm, Sweden, by Daniel Ek and Martin Lorentzon as a response to the growing piracy problem in the music industry. By offering a legal, superior user experience for streaming music, they aimed to convince users to pay for music again. The service launched in 2008 and quickly gained traction in Europe before expanding to the US in 2011.",
      "The platform revolutionized music consumption by shifting the model from ownership (buying albums/tracks) to access (streaming). Its 'Freemium' model allowed massive user growth, while its personalized playlists like 'Discover Weekly' became a gold standard for algorithmic recommendation.",
      "Today, Spotify is the world's largest music streaming service provider. It has aggressively expanded into podcasts and audiobooks, spending over $1 billion to acquire podcast networks and exclusive rights to shows like 'The Joe Rogan Experience', positioning itself as a comprehensive audio platform rather than just a music player.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Individual', price: 11.99 },
        { name: 'Duo', price: 16.99 },
        { name: 'Family', price: 19.99 },
        { name: 'Student', price: 5.99 },
      ] },
      TR: { tiers: [
        { name: 'Bireysel', nameLocalized: 'Bireysel', price: 115 },
        { name: 'Duo', nameLocalized: 'Duo', price: 159 },
        { name: 'Aile', nameLocalized: 'Aile', price: 199 },
        { name: 'Öğrenci', nameLocalized: 'Öğrenci', price: 60 },
      ] },
    },
    milestones: [
      '2006: Founded in Stockholm',
      '2008: Service launched in Europe',
      '2011: Launched in the United States',
      '2015: Discover Weekly playlist launched',
      '2019: Acquired Gimlet Media (Podcast pivot)',
      '2023: Surpassed 500 million active users',
      '2025: Surpassed 670 million total users',
    ],
  },
  {
    name: 'Apple Music',
    category: 'Music',
    accent: '#FC3C44',
    headquarters: 'Cupertino, California',
    foundedYear: '2015',
    founders: 'Apple Inc.',
    ceo: 'Tim Cook',
    globalUserCount: '88M+',
    netWorth: '$3 Trillion (Apple)',
    parentCompany: 'Apple Inc.',
    startingAt: 10.99,
    startingCurrency: 'USD',
    website: 'https://music.apple.com',
    description: [
      "Apple Music launched in 2015, replacing Beats Music (which Apple acquired) and integrating directly into the iOS ecosystem. It was Apple's long-awaited answer to Spotify, leveraging the massive user base of iTunes and the iPhone to gain immediate market share.",
      "The service differentiates itself with a focus on human curation, including the flagship 'Beats 1' (now Apple Music 1) global radio station anchored by Zane Lowe. Unlike Spotify, Apple Music does not offer a free ad-supported tier, positioning itself as a premium-only product that supports artist value.",
      "Apple has consistently pushed audio technology forward, introducing Lossless Audio and Spatial Audio with Dolby Atmos at no extra cost. In 2023, it launched a dedicated app for Classical music, further solidifying its reputation among audiophiles and serious music fans.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Individual', price: 10.99 },
        { name: 'Family', price: 16.99 },
        { name: 'Student', price: 5.99 },
      ] },
      TR: { tiers: [
        { name: 'Bireysel', nameLocalized: 'Bireysel', price: 89.99 },
        { name: 'Aile', nameLocalized: 'Aile', price: 149.99 },
        { name: 'Öğrenci', nameLocalized: 'Öğrenci', price: 49.99 },
      ] },
    },
    milestones: [
      '2014: Apple acquires Beats Electronics',
      '2015: Apple Music launched at WWDC',
      '2018: Surpassed 50 million subscribers',
      '2021: Added Lossless and Spatial Audio',
      '2023: Apple Music Classical app launched',
    ],
  },
  {
    name: 'YouTube Premium',
    category: 'Music',
    accent: '#FF0000',
    headquarters: 'San Bruno, California',
    foundedYear: '2014 (as Music Key)',
    founders: 'Steve Chen, Chad Hurley, Jawed Karim (YouTube)',
    ceo: 'Neal Mohan',
    globalUserCount: '100M+',
    netWorth: '$2 Trillion (Alphabet)',
    parentCompany: 'Alphabet Inc.',
    startingAt: 13.99,
    startingCurrency: 'USD',
    website: 'https://www.youtube.com/premium',
    description: [
      "YouTube Premium (formerly YouTube Red) is a subscription service offered by the video platform YouTube. It provides ad-free access to content across the service, as well as access to premium YouTube Originals, background play on mobile devices, and the ability to download videos for offline playback.",
      "The service was originally launched in November 2014 as Music Key, offering only ad-free streaming of music videos from participating labels on YouTube and Google Play Music. It was relaunched as YouTube Red in 2015, expanding its scope to offer ad-free access to all YouTube videos, not just music.",
      "In May 2018, YouTube announced the rebranding of the service as YouTube Premium, alongside the launch of a separate YouTube Music subscription. Today, it is a key part of Google's subscription revenue, offering a unique value proposition that combines video streaming, music streaming, and creator support.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Individual', price: 13.99 },
        { name: 'Family', price: 22.99 },
        { name: 'Student', price: 7.99 },
      ] },
      TR: { tiers: [
        { name: 'Bireysel', nameLocalized: 'Bireysel', price: 119.99 },
        { name: 'Aile', nameLocalized: 'Aile', price: 239.99 },
        { name: 'Öğrenci', nameLocalized: 'Öğrenci', price: 79.99 },
      ] },
    },
    milestones: [
      '2005: YouTube founded',
      '2006: Acquired by Google for $1.65B',
      '2015: Launched YouTube Red',
      '2018: Rebranded to YouTube Premium',
      '2024: Surpassed 100 million subscribers',
    ],
  },
  {
    name: 'Tidal',
    category: 'Music',
    accent: '#000000',
    headquarters: 'New York City, New York',
    foundedYear: '2014',
    founders: 'Aspiro AB',
    ceo: 'Jesse Dorogusker',
    globalUserCount: '5M+',
    netWorth: '$300M (Block Acquisition)',
    parentCompany: 'Block, Inc.',
    startingAt: 10.99,
    startingCurrency: 'USD',
    website: 'https://tidal.com/pricing',
    description: [
      "Tidal is a music streaming service launched in 2014, acquired by Jay-Z in 2015 and partially acquired by Block (formerly Square) in 2021. It positions itself as the premium audiophile alternative to Spotify and Apple Music.",
      "The service is known for its HiFi tier offering CD-quality audio, and its HiFi Plus tier providing high-resolution lossless audio, Dolby Atmos, and 360 Reality Audio. Tidal also distinguishes itself by offering higher royalty rates to artists.",
      "With Jay-Z's involvement, Tidal secured exclusive releases from artists like Beyoncé, Kanye West, and Rihanna, building a reputation as an artist-friendly platform with curated content.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Individual', price: 10.99 },
        { name: 'Family', price: 16.99 },
        { name: 'Student', price: 5.49 },
      ] },
    },
    milestones: [
      '2014: Launched by Aspiro',
      '2015: Acquired by Jay-Z',
      '2021: Block (Square) acquisition',
      '2024: Removed free tier',
      '2025: Lossless for all subscribers',
    ],
  },
  {
    name: 'Audible',
    category: 'Music',
    accent: '#F79A1D',
    headquarters: 'Newark, New Jersey',
    foundedYear: '1995',
    founders: 'Don Katz',
    ceo: 'Bob Carrigan',
    globalUserCount: 'Millions (Undisclosed)',
    netWorth: '$1 Billion+ (Amazon Subsid.)',
    parentCompany: 'Amazon',
    startingAt: 14.95,
    startingCurrency: 'USD',
    website: 'https://www.audible.com/ep/membership',
    description: [
      "Audible is an online audiobook and podcast service that allows users to purchase and stream audiobooks and other forms of spoken word content. It is the world's largest producer and retailer of audiobooks.",
      "Founded in 1995, Audible created the first portable digital audio player before the iPod existed. Amazon acquired the company in 2008 for $300 million. Since then, it has expanded into original content production, creating 'Audible Originals' which include exclusive audio dramas and podcasts.",
      "The service operates on a credit-based subscription model, where monthly fees grant credits that can be exchanged for any audiobook regardless of price, making it highly valuable for heavy readers.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Plus (1 Credit/mo)', price: 7.95 },
        { name: 'Premium (2 Credits/mo)', price: 14.95 },
      ] },
      TR: { tiers: [
        { name: 'Plus (Aylık 1 Kredi)', nameLocalized: 'Plus (Aylık 1 Kredi)', price: 54.90 },
        { name: 'Premium (Aylık 2 Kredi)', nameLocalized: 'Premium (Aylık 2 Kredi)', price: 89.90 },
      ] },
    },
    milestones: [
      '1995: Company founded',
      '1997: Released first portable digital audio player',
      '2008: Acquired by Amazon',
      '2020: Audible Plus catalog launched',
      "2023: Exclusive deal with Obama's Higher Ground",
    ],
  },

  // ── Design & Creativity ────────────────────────────────────────────────────
  {
    name: 'Adobe Creative Cloud',
    category: 'Design',
    accent: '#ED1C24',
    headquarters: 'San Jose, California',
    foundedYear: '1982 (Adobe)',
    founders: 'John Warnock, Charles Geschke',
    ceo: 'Shantanu Narayen',
    globalUserCount: '30M+',
    netWorth: '$220 Billion',
    startingAt: 59.99,
    startingCurrency: 'USD',
    website: 'https://www.adobe.com/creativecloud/plans.html',
    description: [
      "Adobe Creative Cloud is a collection of software used for graphic design, video editing, web development, and photography. It replaced the Creative Suite (CS) perpetual license model in 2013, a controversial move that ultimately transformed Adobe's business into a cloud juggernaut.",
      "The suite includes industry-standard applications like Photoshop, Illustrator, Premiere Pro, and After Effects. By moving to a subscription model, Adobe reduced piracy and lowered the barrier to entry for students and freelancers who previously couldn't afford the multi-thousand dollar upfront cost.",
      "Adobe continues to innovate with the addition of Firefly, a family of creative generative AI models designed to be safe for commercial use. This new technology allows users to generate images and text effects directly within apps like Photoshop, keeping Adobe at the cutting edge of digital creativity.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Photography Plan', price: 9.99 },
        { name: 'Single App', price: 22.99 },
        { name: 'All Apps', price: 59.99 },
      ] },
      TR: { tiers: [
        { name: 'Fotoğrafçılık', nameLocalized: 'Fotoğrafçılık', price: 669 },
        { name: 'Tek Uygulama', nameLocalized: 'Tek Uygulama', price: 769 },
        { name: 'Creative Cloud Standard', nameLocalized: 'Creative Cloud Standard', price: 1799 },
        { name: 'Creative Cloud Pro', nameLocalized: 'Creative Cloud Pro', price: 2299 },
      ] },
    },
    milestones: [
      '1982: Adobe founded',
      '1990: Photoshop 1.0 released',
      '2013: Shifted entirely to Creative Cloud subscription',
      '2021: Acquired Frame.io for cloud collaboration',
      '2023: Launched Firefly Generative AI',
    ],
  },
  {
    name: 'Canva Pro',
    category: 'Design',
    accent: '#00C4CC',
    headquarters: 'Sydney, Australia',
    foundedYear: '2013',
    founders: 'Melanie Perkins, Cliff Obrecht, Cameron Adams',
    ceo: 'Melanie Perkins',
    globalUserCount: '135M+ (MAU)',
    netWorth: '$26 Billion',
    startingAt: 14.99,
    startingCurrency: 'USD',
    website: 'https://www.canva.com/pro/',
    description: [
      "Canva was founded in Sydney, Australia, in 2013 by Melanie Perkins, Cliff Obrecht, and Cameron Adams. Their mission was to democratize design, making it accessible to anyone regardless of their technical skill level. It started as a simple drag-and-drop tool and has grown into a comprehensive visual communication platform.",
      "Canva Pro offers advanced features like Brand Kits, background removal, and a massive library of premium stock photos and templates. It has become a staple for social media managers, small business owners, and marketing teams who need to produce high-quality assets quickly without the steep learning curve of professional software.",
      "The company is currently one of the world's most valuable private tech startups. It has recently introduced 'Magic Studio', a suite of AI-powered tools that allow users to generate text, images, and videos, positioning itself as a direct competitor to Adobe in the AI age.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Pro', price: 14.99 },
        { name: 'Teams', price: 10.00 },
      ] },
      TR: { tiers: [
        { name: 'Pro', nameLocalized: 'Pro', price: 179.99 },
        { name: 'Ekip', nameLocalized: 'Ekip', price: 119.99 },
      ] },
    },
    milestones: [
      '2013: Launched in Sydney',
      '2015: Reached 4 million users',
      '2019: Acquired Pexels and Pixabay',
      '2021: Valued at $40 billion',
      '2023: Launched Magic Studio AI',
    ],
  },
  {
    name: 'Figma',
    category: 'Design',
    accent: '#F24E1E',
    headquarters: 'San Francisco, California',
    foundedYear: '2012',
    founders: 'Dylan Field, Evan Wallace',
    ceo: 'Dylan Field',
    globalUserCount: '4M+',
    netWorth: '$10 Billion+',
    startingAt: 12.00,
    startingCurrency: 'USD',
    website: 'https://www.figma.com/pricing/',
    description: [
      "Figma is the leading collaborative interface design tool. Built for the web, it allows designers, developers, and stakeholders to work in the same file at the same time, revolutionizing the design workflow much like Google Docs did for writing. Founded in 2012 by Dylan Field and Evan Wallace, it was the first professional design tool to run entirely in the browser.",
      "Figma's vector networks and component properties allow for complex, responsive design systems. Its introduction of 'FigJam', a collaborative whiteboarding tool, expanded its utility beyond pure UI/UX design into brainstorming and diagramming.",
      "In 2022, Adobe announced intent to acquire Figma for $20 billion, though the deal was later abandoned due to regulatory pressure. Figma remains the industry standard for product design, used by teams at Netflix, Airbnb, and Zoom.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Professional', price: 12.00 },
        { name: 'Organization', price: 45.00 },
      ] },
    },
    milestones: [
      '2015: Closed beta launch',
      '2016: Public launch',
      '2021: Launched FigJam',
      '2022: Failed Adobe acquisition attempt',
      '2023: Dev Mode for developers',
    ],
  },

  // ── AI & Dev Tools ─────────────────────────────────────────────────────────
  {
    name: 'ChatGPT Plus',
    category: 'AI',
    accent: '#10A37F',
    headquarters: 'San Francisco, California',
    foundedYear: '2015 (OpenAI)',
    founders: 'Sam Altman, Elon Musk, Ilya Sutskever, Greg Brockman, Wojciech Zaremba, John Schulman',
    ceo: 'Sam Altman',
    globalUserCount: '180M+ (MAU)',
    netWorth: '$80 Billion (OpenAI Valuation)',
    parentCompany: 'OpenAI',
    startingAt: 20.00,
    startingCurrency: 'USD',
    website: 'https://openai.com/chatgpt/pricing/',
    description: [
      "ChatGPT Plus is the premium subscription tier for ChatGPT, the AI chatbot developed by OpenAI. Launched in February 2023, it offers subscribers priority access during peak times, faster response speeds, and exclusive access to the latest models like GPT-4.",
      "OpenAI was founded in 2015 as a non-profit research lab with the mission to ensure artificial general intelligence benefits all of humanity. The release of ChatGPT in late 2022 marked a watershed moment for AI, becoming the fastest-growing consumer application in history.",
      "Subscribers also get access to advanced features like DALL·E 3 for image generation, browsing capabilities, and data analysis tools. It serves as a productivity multiplier for developers, writers, and professionals across industries.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Plus', price: 20.00 },
        { name: 'Pro', price: 200.00 },
      ] },
      TR: { tiers: [
        { name: 'Plus', nameLocalized: 'Plus', price: 649.99 },
      ] },
    },
    milestones: [
      '2015: OpenAI founded',
      '2020: GPT-3 released',
      '2022: ChatGPT launched (Nov)',
      '2023: ChatGPT Plus & GPT-4 released',
      '2024: Sora video model announced',
    ],
  },
  {
    name: 'Claude Pro',
    category: 'AI',
    accent: '#D97757',
    headquarters: 'San Francisco, California',
    foundedYear: '2021 (Anthropic)',
    founders: 'Dario Amodei, Daniela Amodei',
    ceo: 'Dario Amodei',
    globalUserCount: '20M+ (Est)',
    netWorth: '$60 Billion (Anthropic)',
    parentCompany: 'Anthropic',
    startingAt: 20.00,
    startingCurrency: 'USD',
    website: 'https://claude.ai/upgrade',
    description: [
      "Claude Pro is the premium subscription for Anthropic's Claude AI assistant. Launched in late 2023, it offers higher message limits, priority access during peak times, and access to the latest Claude models including Claude Opus 4 and Sonnet 4.",
      "Anthropic was founded in 2021 by former OpenAI executives Dario and Daniela Amodei, with a focus on AI safety research. Claude is positioned as a thoughtful, principled AI assistant emphasizing helpfulness, harmlessness, and honesty.",
      "Pro subscribers benefit from extended context windows (up to 200K tokens), file uploads, and the ability to use Claude's coding capabilities through Projects. It directly competes with ChatGPT Plus while emphasizing its constitutional AI approach.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Pro', price: 20.00 },
        { name: 'Max (5x usage)', price: 100.00 },
        { name: 'Team', price: 30.00 },
      ] },
      TR: { tiers: [
        { name: 'Pro', nameLocalized: 'Pro', price: 699.99 },
      ] },
    },
    milestones: [
      '2021: Anthropic founded',
      '2023: Claude 2 released',
      '2024: Claude 3 family released',
      '2024: Claude Pro & Team plans launched',
      '2025: Claude 4 Opus released',
    ],
  },
  {
    name: 'GitHub Copilot',
    category: 'AI',
    accent: '#181717',
    headquarters: 'San Francisco, California',
    foundedYear: '2021 (Preview)',
    founders: 'GitHub & OpenAI',
    ceo: 'Thomas Dohmke (GitHub)',
    globalUserCount: '1.3M+ Paid Users',
    netWorth: '$7.5 Billion (GitHub Acq.)',
    parentCompany: 'Microsoft',
    startingAt: 10.00,
    startingCurrency: 'USD',
    website: 'https://github.com/features/copilot',
    description: [
      "GitHub Copilot is an AI-powered code completion tool developed by GitHub and OpenAI. It functions as an 'AI pair programmer', suggesting whole lines or blocks of code as developers type within their integrated development environment (IDE).",
      "Built on the OpenAI Codex model, Copilot was trained on billions of lines of public code. Since its general availability in 2022, it has transformed software development by automating boilerplate code, writing unit tests, and helping developers learn new languages and frameworks faster.",
      "Microsoft, which owns GitHub, has continued to expand Copilot's capabilities with 'Copilot X', integrating chat interfaces, pull request descriptions, and CLI assistance. It represents the forefront of AI-assisted engineering.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Individual', price: 10.00 },
        { name: 'Business', price: 19.00 },
      ] },
    },
    milestones: [
      '2018: Microsoft acquires GitHub',
      '2021: Copilot Technical Preview launched',
      '2022: General Availability',
      '2023: Copilot X announced',
      '2023: Copilot Chat integrated into VS Code',
    ],
  },
  {
    name: 'Midjourney',
    category: 'AI',
    accent: '#1A1A2E',
    headquarters: 'San Francisco, California',
    foundedYear: '2022',
    founders: 'David Holz',
    ceo: 'David Holz',
    globalUserCount: '16M+ Discord Members',
    netWorth: 'Private (Est. $10B+)',
    startingAt: 10.00,
    startingCurrency: 'USD',
    website: 'https://www.midjourney.com/pricing',
    description: [
      "Midjourney is a generative artificial intelligence program and service created and hosted by San Francisco-based independent research lab Midjourney, Inc. It generates images from natural language descriptions, called 'prompts', similar to OpenAI's DALL-E and Stable Diffusion.",
      "The tool is currently only accessible through a Discord bot, which adds a unique community aspect to the creation process. Users can see each other's prompts and results, fostering a collaborative learning environment. Midjourney is known for its artistic style and high-resolution output.",
      "Despite having a small team and no venture capital funding, Midjourney has become one of the most prominent players in the generative AI space, sparking debates about the future of art and copyright.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Basic', price: 10.00 },
        { name: 'Standard', price: 30.00 },
        { name: 'Pro', price: 60.00 },
      ] },
    },
    milestones: [
      '2022: Open Beta launch via Discord',
      '2023: V5 Model released (Photo-realism)',
      '2023: Ended free trials due to high demand',
      '2024: Alpha web interface testing',
    ],
  },

  // ── Business & Productivity (SaaS) ─────────────────────────────────────────
  {
    name: 'Microsoft 365',
    category: 'SaaS',
    accent: '#0078D4',
    headquarters: 'Redmond, Washington',
    foundedYear: '2011 (as Office 365)',
    founders: 'Microsoft',
    ceo: 'Satya Nadella',
    globalUserCount: '345M (Paid Seats)',
    netWorth: '$3 Trillion (Microsoft)',
    parentCompany: 'Microsoft',
    startingAt: 9.99,
    startingCurrency: 'USD',
    website: 'https://www.microsoft.com/microsoft-365/personal-family-office',
    description: [
      "Microsoft 365 (formerly Office 365) represents one of the most successful business pivots in tech history. Launched in 2011, it transitioned Microsoft's dominant Office suite from a one-time software purchase to a cloud-based subscription service, ensuring continuous updates and revenue.",
      "The bundle includes industry-standard tools like Word, Excel, PowerPoint, and Outlook, integrated with cloud services like OneDrive and Microsoft Teams. This integration has made it indispensable for businesses, with Teams becoming a central hub for workplace collaboration during the remote work boom.",
      "Recently, Microsoft has begun integrating 'Copilot', its generative AI technology, across the 365 suite. This allows users to draft emails, summarize meetings, and generate presentations automatically, positioning Microsoft 365 as the foundational operating system for the future of work.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Personal', price: 9.99 },
        { name: 'Family', price: 12.99 },
      ] },
      TR: { tiers: [
        { name: 'Bireysel', nameLocalized: 'Bireysel', price: 329.99 },
        { name: 'Aile', nameLocalized: 'Aile', price: 409.99 },
      ] },
    },
    milestones: [
      '2011: Office 365 for Enterprise launched',
      '2013: Office 365 for Home launched',
      '2017: Microsoft Teams launched',
      '2020: Rebranded to Microsoft 365',
      '2023: Copilot AI integration announced',
    ],
  },
  {
    name: 'Google Workspace',
    category: 'SaaS',
    accent: '#4285F4',
    headquarters: 'Mountain View, California',
    foundedYear: '2006',
    founders: 'Google',
    ceo: 'Sundar Pichai',
    globalUserCount: '3 Billion+',
    netWorth: '$2 Trillion (Alphabet)',
    parentCompany: 'Alphabet Inc.',
    startingAt: 6.00,
    startingCurrency: 'USD',
    website: 'https://workspace.google.com/pricing',
    description: [
      "Google Workspace (formerly G Suite) is a collection of cloud computing, productivity, and collaboration tools developed by Google. It includes Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet, and more. Launched in 2006 as Google Apps for Your Domain, it has become the backbone of modern business communication, rivaling Microsoft's Office suite.",
      "Its cloud-native approach allows for real-time collaboration that was revolutionary at the time of its release. Multiple users can edit a single document simultaneously, eliminating the need for email attachments and version control headaches. It is used by everyone from small startups to massive enterprises like Airbus and Salesforce.",
      "Recently, Google has integrated 'Gemini' (formerly Duet AI) into Workspace, bringing generative AI capabilities to docs, email drafting, and slide creation, ensuring it remains competitive in the AI-driven productivity landscape.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Business Starter', price: 6.00 },
        { name: 'Business Standard', price: 12.00 },
        { name: 'Business Plus', price: 18.00 },
      ] },
      TR: { tiers: [
        { name: 'Business Starter', nameLocalized: 'Business Starter', price: 71.20 },
        { name: 'Business Standard', nameLocalized: 'Business Standard', price: 142.40 },
        { name: 'Business Plus', nameLocalized: 'Business Plus', price: 223.70 },
      ] },
    },
    milestones: [
      '2006: Launched as Google Apps',
      '2012: Google Drive released',
      '2016: Rebranded to G Suite',
      '2020: Rebranded to Google Workspace',
      '2023: Gemini AI integration',
    ],
  },
  {
    name: 'Slack',
    category: 'SaaS',
    accent: '#4A154B',
    headquarters: 'San Francisco, California',
    foundedYear: '2009',
    founders: 'Stewart Butterfield, Eric Costello, Cal Henderson, Serguei Mourachov',
    ceo: 'Lidiane Jones',
    globalUserCount: '35M+ DAU',
    netWorth: '$27 Billion (Acquisition)',
    parentCompany: 'Salesforce',
    startingAt: 7.25,
    startingCurrency: 'USD',
    website: 'https://slack.com/pricing',
    description: [
      "Slack is a messaging app for business that connects people to the information they need. By bringing people together to work as one unified team, Slack transforms the way organizations communicate. It was founded in 2009 by Stewart Butterfield and began as an internal tool for his company while developing a game called Glitch.",
      "Slack's channel-based messaging replaced email for internal communication in many tech companies, becoming synonymous with modern startup culture. Its robust API allows integration with thousands of other tools like Jira, GitHub, and Google Drive, making it a central command center for work.",
      "In 2021, Slack was acquired by Salesforce for $27.7 billion, one of the largest software acquisitions in history. It continues to operate as an independent brand while integrating deeper into the Salesforce Customer 360 ecosystem.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Pro', price: 7.25 },
        { name: 'Business+', price: 12.50 },
      ] },
    },
    milestones: [
      '2013: Public launch',
      '2019: Direct listing on NYSE',
      '2020: IBM chooses Slack for 350k employees',
      '2021: Acquired by Salesforce',
      '2023: Launched Slack Canvas',
    ],
  },
  {
    name: 'Notion Plus',
    category: 'SaaS',
    accent: '#000000',
    headquarters: 'San Francisco, California',
    foundedYear: '2013',
    founders: 'Ivan Zhao, Simon Last',
    ceo: 'Ivan Zhao',
    globalUserCount: '30M+',
    netWorth: '$10 Billion',
    startingAt: 8.00,
    startingCurrency: 'USD',
    website: 'https://www.notion.so/pricing',
    description: [
      "Notion is an all-in-one workspace that blends your everyday work apps into one. It's the 'Lego of productivity software', allowing users to build their own systems for note-taking, project management, wikis, and databases. Founded in 2013, it struggled initially before a 2018 redesign catapulted it to viral status.",
      "Notion's block-based editor is its defining feature, allowing any piece of content to be moved, transformed, or embedded. It gained a massive cult following among students, startups, and productivity enthusiasts, leading to a vibrant community of template creators.",
      "With the launch of Notion AI, the platform has integrated generative text capabilities directly into the editor, allowing users to brainstorm, summarize, and translate content without leaving their workspace.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Plus', price: 8.00 },
        { name: 'Business', price: 15.00 },
      ] },
    },
    milestones: [
      '2016: Notion 1.0 released',
      '2018: Notion 2.0 (Databases) released',
      '2020: Personal plan made free',
      '2021: Valued at $10 Billion',
      '2023: Notion AI launched',
    ],
  },
  {
    name: 'Zoom Pro',
    category: 'SaaS',
    accent: '#2D8CFF',
    headquarters: 'San Jose, California',
    foundedYear: '2011',
    founders: 'Eric Yuan',
    ceo: 'Eric Yuan',
    globalUserCount: '300M+ DAU (Peak)',
    netWorth: '$20 Billion',
    startingAt: 15.99,
    startingCurrency: 'USD',
    website: 'https://zoom.us/pricing',
    description: [
      "Zoom is a videotelephony software program developed by Zoom Video Communications. The Pro plan removes the 40-minute time limit on meetings and adds cloud recording and admin controls. It became a household name during the COVID-19 pandemic as the default tool for remote work and virtual social gatherings.",
      "Founded in 2011 by Eric Yuan, a former Cisco engineer, Zoom focused on making video calls reliable and easy to use. Its 'freemium' model allowed for viral adoption in schools and businesses.",
      "Post-pandemic, Zoom has expanded into a full communications platform with Zoom Phone, Zoom Rooms, and AI Companion features, aiming to be the operating system for the modern hybrid workplace.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Pro', price: 13.33 },
        { name: 'Business', price: 21.99 },
      ] },
    },
    milestones: [
      '2011: Founded',
      '2013: Public launch',
      '2019: IPO',
      '2020: 30x growth during pandemic',
      '2023: Zoom AI Companion launched',
    ],
  },
  {
    name: 'Dropbox Plus',
    category: 'SaaS',
    accent: '#0061FF',
    headquarters: 'San Francisco, California',
    foundedYear: '2007',
    founders: 'Drew Houston, Arash Ferdowsi',
    ceo: 'Drew Houston',
    globalUserCount: '700M+ Users',
    netWorth: '$9 Billion',
    startingAt: 11.99,
    startingCurrency: 'USD',
    website: 'https://www.dropbox.com/plans',
    description: [
      "Dropbox is a file hosting service that offers cloud storage, file synchronization, personal cloud, and client software. Dropbox Plus is the personal paid tier offering 2TB of storage, offline access, and advanced sharing controls.",
      "Founded in 2007 by Drew Houston and Arash Ferdowsi, Dropbox popularized the concept of a 'magic folder' that syncs across devices. It was one of the first major successes of the Y Combinator startup accelerator.",
      "While facing stiff competition from Google Drive and OneDrive, Dropbox has pivoted to focus on 'smart workspace' features, acquiring tools like HelloSign (e-signatures) and DocSend to facilitate document workflows for creative professionals and freelancers.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Plus', price: 11.99 },
        { name: 'Professional', price: 24.99 },
      ] },
    },
    milestones: [
      '2007: Y Combinator launch',
      '2011: Reached 50M users',
      '2018: IPO on NASDAQ',
      '2019: Acquired HelloSign',
      '2023: Dropbox Dash AI launched',
    ],
  },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  {
    name: 'Xbox Game Pass',
    category: 'Gaming',
    accent: '#107C10',
    headquarters: 'Redmond, Washington',
    foundedYear: '2017',
    founders: 'Microsoft (Phil Spencer)',
    ceo: 'Phil Spencer (Microsoft Gaming)',
    globalUserCount: '34M+',
    netWorth: '$3 Trillion (Microsoft)',
    parentCompany: 'Microsoft',
    startingAt: 16.99,
    startingCurrency: 'USD',
    website: 'https://www.xbox.com/xbox-game-pass',
    description: [
      "Xbox Game Pass is widely considered the 'Netflix of video games'. Launched by Microsoft in 2017, it grants users access to a rotating catalog of over 100 high-quality games for a monthly fee. It fundamentally changed the gaming industry's business model from unit sales to recurring subscriptions.",
      "A key differentiator for Game Pass is that all first-party Xbox titles (like Halo, Forza, and Starfield) launch on the service on day one. This aggressive strategy aims to lock users into the Xbox ecosystem across consoles, PC, and mobile via cloud streaming.",
      "The service's value increased significantly with Microsoft's acquisition of ZeniMax Media (Bethesda) and Activision Blizzard. These acquisitions have brought massive franchises like 'Call of Duty', 'Fallout', and 'The Elder Scrolls' under the Game Pass umbrella.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Essential', price: 9.99 },
        { name: 'Premium', price: 14.99 },
        { name: 'Ultimate', price: 19.99 },
      ] },
      TR: { tiers: [
        { name: 'Essential', nameLocalized: 'Essential', price: 269 },
        { name: 'Premium', nameLocalized: 'Premium', price: 409 },
        { name: 'PC Game Pass', nameLocalized: 'PC Game Pass', price: 419 },
        { name: 'Ultimate', nameLocalized: 'Ultimate', price: 529 },
      ] },
    },
    milestones: [
      '2017: Service launched',
      '2019: Game Pass for PC launched',
      '2020: xCloud streaming added to Ultimate',
      '2021: Bethesda games added',
      '2023: Activision Blizzard acquisition completed',
    ],
  },
  {
    name: 'PlayStation Plus',
    category: 'Gaming',
    accent: '#00439C',
    headquarters: 'San Mateo, California',
    foundedYear: '2010',
    founders: 'Sony',
    ceo: 'Jim Ryan',
    globalUserCount: '47M+',
    netWorth: '$100 Billion (Sony)',
    parentCompany: 'Sony',
    startingAt: 9.99,
    startingCurrency: 'USD',
    website: 'https://www.playstation.com/ps-plus/',
    description: [
      "PlayStation Plus is a subscription service by Sony Interactive Entertainment for PlayStation consoles. Originally launched in 2010 to provide free games and discounts, it is now required for online multiplayer gaming on PS4 and PS5.",
      "In 2022, Sony revamped the service into three tiers: Essential, Extra, and Premium. The higher tiers offer a vast library of PS4 and PS5 games, as well as a catalog of classic titles from previous PlayStation generations, directly competing with Xbox Game Pass.",
      "The service is integral to the PlayStation ecosystem, offering exclusive 'PS Plus Collection' titles to PS5 owners and cloud streaming capabilities for older games, ensuring backward compatibility through the cloud.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Essential', price: 9.99 },
        { name: 'Extra', price: 14.99 },
        { name: 'Premium', price: 17.99 },
      ] },
      TR: { tiers: [
        { name: 'Essential', nameLocalized: 'Essential', price: 400 },
        { name: 'Extra', nameLocalized: 'Extra', price: 600 },
        { name: 'Deluxe', nameLocalized: 'Deluxe', price: 710 },
      ] },
    },
    milestones: [
      '2010: Launched on PS3',
      '2013: Required for PS4 online multiplayer',
      '2020: PS Plus Collection for PS5',
      '2022: Relaunch with Extra/Premium tiers',
      '2023: Cloud streaming for PS5 games',
    ],
  },
  {
    name: 'Nintendo Switch Online',
    category: 'Gaming',
    accent: '#E60012',
    headquarters: 'Kyoto, Japan',
    foundedYear: '2018',
    founders: 'Nintendo',
    ceo: 'Shuntaro Furukawa',
    globalUserCount: '38M+',
    netWorth: '$80 Billion (Nintendo)',
    parentCompany: 'Nintendo',
    startingAt: 3.99,
    startingCurrency: 'USD',
    website: 'https://www.nintendo.com/switch/online',
    description: [
      "Nintendo Switch Online is Nintendo's subscription service for the Switch console, launched in 2018. It enables online multiplayer for Nintendo games, provides a library of classic NES, SNES, N64, and Game Boy titles, and offers cloud save functionality.",
      "The Expansion Pack tier adds Nintendo 64, Sega Genesis, and Game Boy Advance classics, plus DLC for select first-party games like Mario Kart 8 Deluxe and Splatoon. It's positioned as essential for the full Switch online experience.",
      "With over 38 million subscribers, it's one of the most popular gaming subscriptions globally, capitalizing on Nintendo's massive library of beloved franchises like Mario, Zelda, and Pokémon.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Individual', price: 3.99 },
        { name: 'Family', price: 34.99, cycle: 'Yearly' },
        { name: 'Expansion Pack', price: 49.99, cycle: 'Yearly' },
      ] },
      TR: { tiers: [
        { name: 'Bireysel', nameLocalized: 'Bireysel', price: 109.99 },
        { name: 'Aile (Yıllık)', nameLocalized: 'Aile (Yıllık)', price: 999, cycle: 'Yearly' },
      ] },
    },
    milestones: [
      '2018: Service launched',
      '2019: SNES library added',
      '2021: Expansion Pack launched',
      '2022: Game Boy & GBA added',
      '2024: 38M subscribers',
    ],
  },
  {
    name: 'Twitch Turbo',
    category: 'Gaming',
    accent: '#9146FF',
    headquarters: 'San Francisco, California',
    foundedYear: '2011',
    founders: 'Justin Kan, Emmett Shear',
    ceo: 'Dan Clancy',
    globalUserCount: '140M MAU',
    netWorth: '$15 Billion (Est)',
    parentCompany: 'Amazon',
    startingAt: 11.99,
    startingCurrency: 'USD',
    website: 'https://www.twitch.tv/turbo',
    description: [
      "Twitch Turbo is a monthly subscription program offered exclusively on Twitch.tv. It provides an ad-free viewing experience across the entire site, which is a major selling point for heavy users who watch multiple streamers.",
      "In addition to ad-free viewing, Turbo subscribers get a custom set of emoticons, expanded chat color options, and a priority badge in chat. It allows users to support the platform directly rather than subscribing to individual channels, although it does not provide the specific channel emotes that a channel sub does.",
      "Founded in 2011 as a spin-off of Justin.tv, Twitch was acquired by Amazon in 2014 for $970 million. It dominates the live-streaming market, particularly for video games and esports.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Turbo', price: 11.99 },
      ] },
      TR: { tiers: [
        { name: 'Turbo', nameLocalized: 'Turbo', price: 164.99 },
      ] },
    },
    milestones: [
      '2011: Launched as Justin.tv spin-off',
      '2013: Twitch Turbo launched',
      '2014: Acquired by Amazon',
      '2016: Twitch Prime (now Prime Gaming) launched',
      '2023: Turbo price increased in some regions',
    ],
  },

  // ── Community & Learning ───────────────────────────────────────────────────
  {
    name: 'Discord Nitro',
    category: 'Community',
    accent: '#5865F2',
    headquarters: 'San Francisco, California',
    foundedYear: '2015',
    founders: 'Jason Citron, Stan Vishnevskiy',
    ceo: 'Jason Citron',
    globalUserCount: '196M MAU',
    netWorth: '$15 Billion',
    startingAt: 9.99,
    startingCurrency: 'USD',
    website: 'https://discord.com/nitro',
    description: [
      "Discord Nitro is the premium subscription service for the popular chat app Discord. Unlike other social platforms that sell user data or serve ads, Discord's revenue model relies entirely on Nitro subscriptions. It offers users enhanced features like higher quality video streaming, larger file uploads, and custom emojis across all servers.",
      "Discord was founded in 2015 as a VoIP tool for gamers but has since evolved into a general-purpose community platform used by crypto enthusiasts, study groups, and hobbyists. Nitro allows users to personalize their profiles with animated avatars and banners, serving as a status symbol within the community.",
      "The service has two tiers: Nitro Basic and full Nitro. Full Nitro includes 2 Server Boosts, which help communities unlock perks for everyone in a specific server, fostering a communal support model.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Nitro Basic', price: 2.99 },
        { name: 'Nitro', price: 9.99 },
      ] },
      TR: { tiers: [
        { name: 'Nitro Temel', nameLocalized: 'Nitro Temel', price: 44.99 },
        { name: 'Nitro', nameLocalized: 'Nitro', price: 149.99 },
      ] },
    },
    milestones: [
      '2015: Discord launch',
      '2017: Nitro subscription launched',
      "2020: Rebranding to 'Your Place to Talk'",
      '2021: Rejected $12B Microsoft acquisition offer',
      '2022: Nitro Basic tier introduced',
    ],
  },
  {
    name: 'Duolingo Super',
    category: 'Community',
    accent: '#58CC02',
    headquarters: 'Pittsburgh, Pennsylvania',
    foundedYear: '2011',
    founders: 'Luis von Ahn, Severin Hacker',
    ceo: 'Luis von Ahn',
    globalUserCount: '83M MAU',
    netWorth: '$9 Billion',
    startingAt: 6.99,
    startingCurrency: 'USD',
    website: 'https://www.duolingo.com/plus',
    description: [
      "Duolingo is the world's most popular language-learning platform. 'Super Duolingo' (formerly Duolingo Plus) is the premium subscription that removes ads, provides unlimited hearts (mistakes), and offers personalized practice sessions to review errors.",
      "Founded in 2011 by Luis von Ahn (inventor of CAPTCHA) and Severin Hacker, the app uses gamification elements like streaks, leaderboards, and leagues to keep users engaged. Its mascot, Duo the Owl, has become a viral meme for its aggressive reminders to practice.",
      "Duolingo has expanded beyond languages to include Math and Music courses, all within the same app. The company went public in 2021 and continues to use AI to customize lessons for each learner's proficiency level.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Super', price: 6.99 },
        { name: 'Max', price: 13.99 },
        { name: 'Family', price: 9.99 },
      ] },
      TR: { tiers: [
        { name: 'Super', nameLocalized: 'Super', price: 209.99 },
        { name: 'Aile', nameLocalized: 'Aile', price: 299.99 },
      ] },
    },
    milestones: [
      '2011: Public beta launch',
      '2013: Apple App of the Year',
      '2017: Duolingo Plus launched',
      '2021: IPO on NASDAQ',
      '2023: Rebranded Plus to Super Duolingo',
    ],
  },
  {
    name: 'MasterClass',
    category: 'Community',
    accent: '#181818',
    headquarters: 'San Francisco, California',
    foundedYear: '2014',
    founders: 'David Rogier, Aaron Rasmussen',
    ceo: 'David Rogier',
    globalUserCount: '2M+ (Est)',
    netWorth: '$2.75 Billion',
    startingAt: 15.00,
    startingCurrency: 'USD',
    website: 'https://www.masterclass.com/subscribe',
    description: [
      "MasterClass is an online education subscription platform on which students can access tutorials and lectures pre-recorded by experts in various fields. From cooking with Gordon Ramsay to acting with Natalie Portman, it offers 'edutainment' with cinema-quality production values.",
      "Founded in 2014, the platform differentiates itself through the celebrity status of its instructors. It sells an annual membership that unlocks access to the entire library of 180+ classes. It appeals to lifelong learners who want inspiration rather than just technical certification.",
      "MasterClass has expanded into enterprise offerings, allowing companies to offer the service as a perk to employees. It represents a shift in online learning towards high-end, storytelling-driven content.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Individual', price: 15.00 },
        { name: 'Duo', price: 20.00 },
        { name: 'Family', price: 23.00 },
      ] },
    },
    milestones: [
      '2015: Launched with 3 instructors',
      '2018: Raised $80M Series D',
      '2020: Usage surged during pandemic',
      '2021: Valuation tripled to $2.75B',
      "2023: Launched 'Sessions' for hands-on learning",
    ],
  },

  // ── Shopping & Local ───────────────────────────────────────────────────────
  {
    name: 'Amazon Prime',
    category: 'Shopping',
    accent: '#00A8E1',
    headquarters: 'Seattle, Washington',
    foundedYear: '2005',
    founders: 'Jeff Bezos',
    ceo: 'Andy Jassy (Amazon)',
    globalUserCount: '200M+',
    netWorth: '$2 Trillion (Amazon)',
    parentCompany: 'Amazon',
    startingAt: 14.99,
    startingCurrency: 'USD',
    website: 'https://www.amazon.com/prime',
    description: [
      "Amazon Prime is a paid subscription service from Amazon that gives users access to a wide range of benefits, most notably free two-day (or faster) delivery on eligible items. It has become the gold standard for e-commerce loyalty programs.",
      "Beyond shipping, Prime includes access to Prime Video, Amazon Music Prime, Prime Gaming, and exclusive deals during events like Prime Day. It serves as an ecosystem lock-in, encouraging members to shop almost exclusively on Amazon.",
      "With over 200 million subscribers globally, Prime is a massive revenue driver for Amazon and a key part of its strategy to dominate retail and entertainment simultaneously.",
    ],
    regions: {
      US: { tiers: [
        { name: 'Monthly', price: 14.99 },
        { name: 'Annual', price: 139.00, cycle: 'Yearly' },
      ] },
      TR: { tiers: [
        { name: 'Aylık', nameLocalized: 'Aylık', price: 69.90 },
      ] },
    },
    milestones: [
      '2005: Prime launched ($79/year)',
      '2011: Prime Video added',
      '2014: Price increased to $99',
      '2015: First Prime Day',
      '2021: Reached 200 million members',
    ],
  },

  // ── Turkish Services (TR-only) ─────────────────────────────────────────────
  {
    name: 'Exxen',
    category: 'Turkish',
    accent: '#FFD500',
    headquarters: 'İstanbul, Türkiye',
    foundedYear: '2021',
    founders: 'Acun Ilıcalı',
    ceo: 'Acun Ilıcalı',
    globalUserCount: '2M+ (Türkiye)',
    startingAt: 275,
    startingCurrency: 'TRY',
    website: 'https://www.exxen.com/uyelik',
    description: [
      "Exxen, Acun Ilıcalı tarafından 2021 yılında kurulan Türkiye'nin popüler dijital yayın platformudur. Özel diziler, futbol maçları (Premier Lig, Avrupa kupaları), eğlence programları ve film içerikleri sunar. Kuruluş günü 33 bin abone ile rekor kırarak hızlı bir başlangıç yaptı.",
      "Platform 'Survivor', 'O Ses Türkiye' gibi popüler programlarla Türk izleyici kitlesine güçlü bir alternatif olarak konumlandı. Yerli dizi yatırımlarıyla orijinal içerik üretiminde de Netflix Türkiye'ye rakip.",
    ],
    regions: {
      TR: { tiers: [
        { name: 'Reklamlı', nameLocalized: 'Reklamlı', price: 275 },
        { name: 'Reklamsız', nameLocalized: 'Reklamsız', price: 388 },
        { name: 'Spor (Reklamlı)', nameLocalized: 'Spor (Reklamlı)', price: 486 },
        { name: 'Spor (Reklamsız)', nameLocalized: 'Spor (Reklamsız)', price: 599 },
      ] },
    },
    milestones: [
      '2021: Platform lansmanı',
      '2021: İlk gün 33 bin abone',
      '2022: Premier Lig yayın hakları',
      '2023: Orijinal dizilerle büyüme',
      '2025: 2 milyon aktif abone',
    ],
  },
  {
    name: 'BluTV',
    category: 'Turkish',
    accent: '#FF5C00',
    headquarters: 'İstanbul, Türkiye',
    foundedYear: '2016',
    founders: 'Doğan Holding',
    ceo: 'Aydın Doğan Yalçındağ',
    globalUserCount: '1.5M+ (Türkiye)',
    startingAt: 229.90,
    startingCurrency: 'TRY',
    website: 'https://www.blutv.com/uyelik',
    description: [
      "BluTV, 2016 yılında Doğan Holding tarafından kurulan Türkiye'nin ilk yerli dijital yayın platformudur. Yerli ve yabancı diziler, filmler, belgeseller ve çocuk içerikleri sunan kapsamlı bir kütüphaneye sahiptir.",
      "Platform 'Masum', 'Yeşilçam', 'Saygı' gibi başarılı orijinal yapımlarla bilinir. 2021 yılında Discovery Inc. tarafından satın alındı ve uluslararası içerik kütüphanesine de erişim sağladı.",
    ],
    regions: {
      TR: { tiers: [
        { name: 'Standart', nameLocalized: 'Standart', price: 229.90 },
        { name: 'Standart (Yıllık)', nameLocalized: 'Standart (Yıllık)', price: 2299, cycle: 'Yearly' },
        { name: 'Özel', nameLocalized: 'Özel', price: 299.90 },
        { name: 'Özel (Yıllık)', nameLocalized: 'Özel (Yıllık)', price: 2999, cycle: 'Yearly' },
      ] },
    },
    milestones: [
      '2016: Platform lansmanı',
      "2017: 'Masum' dizisi yayını",
      '2019: HBO işbirliği',
      '2021: Discovery tarafından satın alındı',
      '2024: 1.5 milyon abone',
    ],
  },
  {
    name: 'Tabii',
    category: 'Turkish',
    accent: '#E30613',
    headquarters: 'Ankara, Türkiye',
    foundedYear: '2023',
    founders: 'TRT',
    ceo: 'Mehmet Zahid Sobacı (TRT)',
    globalUserCount: 'Küresel',
    startingAt: 0,
    startingCurrency: 'TRY',
    website: 'https://www.tabii.com',
    description: [
      "Tabii, TRT'nin 2023 yılında küresel pazarı hedefleyerek başlattığı dijital yayın platformudur. Türk yapımı diziler, filmler, belgeseller ve haber içeriklerini dünya çapında 27 dilde sunar.",
      "Platform 'Kuruluş Osman', 'Diriliş Ertuğrul' gibi büyük TRT yapımlarına yer veriyor. Devlet destekli olması nedeniyle uygun fiyatlı bir alternatif sunmaya odaklanır.",
    ],
    regions: {
      TR: { tiers: [
        { name: 'Ücretsiz', nameLocalized: 'Ücretsiz', price: 0 },
        { name: 'Premium', nameLocalized: 'Premium', price: 99 },
      ] },
      US: { tiers: [
        { name: 'Free', price: 0 },
      ] },
    },
    milestones: [
      '2023: Küresel lansman',
      '2024: 27 dil desteği',
      '2025: 100+ orijinal yapım',
    ],
  },
  {
    name: 'Trendyol Elite',
    category: 'Turkish',
    accent: '#FF6600',
    headquarters: 'İstanbul, Türkiye',
    foundedYear: '2021 (Elite)',
    founders: 'Demet Mutlu (Trendyol)',
    ceo: 'Çağlayan Çetin (Trendyol)',
    globalUserCount: '30M+ (Trendyol)',
    startingAt: 49.90,
    startingCurrency: 'TRY',
    website: 'https://elite.trendyol.com',
    description: [
      "Trendyol Elite, Türkiye'nin en büyük e-ticaret platformu Trendyol'un premium üyelik programıdır. Üyeler için ücretsiz hızlı teslimat, özel kampanyalar, Trendyol GO içeren bir abonelik servisidir.",
      "2010 yılında Demet Mutlu tarafından kurulan Trendyol, Alibaba'nın stratejik ortaklığıyla büyüdü ve Türkiye'nin tek decacorn (10+ milyar $ değerli) şirketi oldu. Elite üyelik, sadık müşterilere ek avantajlar sunar.",
    ],
    regions: {
      TR: { tiers: [
        { name: 'Aylık', nameLocalized: 'Aylık', price: 49.90 },
        { name: 'Yıllık', nameLocalized: 'Yıllık', price: 399, cycle: 'Yearly' },
      ] },
    },
    milestones: [
      '2010: Trendyol kuruluşu',
      '2018: Alibaba yatırımı',
      '2021: Trendyol Elite lansmanı',
      '2022: Trendyol GO entegrasyonu',
      '2024: 30 milyon aktif kullanıcı',
    ],
  },
  {
    name: 'Hepsiburada Premium',
    category: 'Turkish',
    accent: '#F68B1E',
    headquarters: 'İstanbul, Türkiye',
    foundedYear: '2000 (HB), 2020 (Premium)',
    founders: 'Hanzade Doğan Boyner',
    ceo: 'Nilhan Onal Gökçetekin (Hepsiburada)',
    globalUserCount: '12M+ (HB)',
    startingAt: 59.90,
    startingCurrency: 'TRY',
    website: 'https://www.hepsiburada.com/premium',
    description: [
      "Hepsiburada Premium, Türkiye'nin önde gelen e-ticaret platformu Hepsiburada'nın sadakat programıdır. Üyeler için ücretsiz kargo, hızlı teslimat ve özel indirimler sunan abonelik tabanlı bir hizmettir.",
      "2000 yılında Hanzade Doğan Boyner tarafından kurulan Hepsiburada, 2021'de NASDAQ'ta halka arz edilen ilk Türk teknoloji şirketi oldu. Premium, sadık müşteri tabanını güçlendirmek için tasarlandı.",
    ],
    regions: {
      TR: { tiers: [
        { name: 'Aylık', nameLocalized: 'Aylık', price: 59.90 },
        { name: 'Yıllık', nameLocalized: 'Yıllık', price: 479, cycle: 'Yearly' },
      ] },
    },
    milestones: [
      '2000: Hepsiburada kuruluşu',
      '2020: Premium programının lansmanı',
      '2021: NASDAQ halka arzı',
      '2023: HepsiJet ile entegrasyon',
    ],
  },
];

const norm = (s: string) => s.trim().toLowerCase();

/** Lookup an Explore service by display name (case-insensitive). */
export function exploreService(name: string): ExploreService | undefined {
  const key = norm(name);
  return EXPLORE_CATALOG.find((s) => norm(s.name) === key);
}

export interface EffectivePricing {
  startingAt: number;
  startingCurrency: 'USD' | 'TRY';
  regions: ExploreRegions;
}

/** Live-or-bundled pricing for a service: the hosted catalog override wins, else the
 *  bundled snapshot. Components must subscribe to `useCatalog(s => s.version)` so they
 *  re-render when the live catalog loads/updates. */
export function effectivePricing(svc: ExploreService): EffectivePricing {
  const o = catalogOverrides()[svc.name];
  return {
    startingAt: o?.startingAt ?? svc.startingAt,
    startingCurrency: o?.startingCurrency ?? svc.startingCurrency,
    regions: o?.regions ?? svc.regions,
  };
}

/** Cheapest "starting at" price shown on Explore cards, resolved for the app's base
 *  currency. When the user is on TRY we surface the real cheapest Turkish list price
 *  (regions.TR tiers) instead of an FX-converted USD figure, which vastly overstates
 *  local prices. Other currencies keep the authored USD start (fmt FX-converts it). */
export function exploreStartPrice(
  svc: ExploreService,
  baseCurrency: string,
): { amount: number; currency: 'USD' | 'TRY' } {
  const eff = effectivePricing(svc);
  if (baseCurrency === 'TRY' && eff.regions.TR?.tiers?.length) {
    return { amount: Math.min(...eff.regions.TR.tiers.map((tr) => tr.price)), currency: 'TRY' };
  }
  return { amount: eff.startingAt, currency: eff.startingCurrency };
}

/** Localized editorial content (description + milestones) for the chosen language.
 *  TR uses the override when present, else falls back to the authored (EN/native) text. */
export function localizedExplore(
  svc: ExploreService,
  lang: string,
): { description: string[]; milestones: string[] } {
  if (lang === 'tr') {
    const o = EXPLORE_TR[svc.name];
    return {
      description: o?.description ?? svc.description,
      milestones: o?.milestones ?? svc.milestones,
    };
  }
  return { description: svc.description, milestones: svc.milestones };
}

/** Services grouped by category in display order (skips empty groups). */
export function exploreGrouped(): { key: ExploreCategory; label: string; items: ExploreService[] }[] {
  return EXPLORE_CATEGORY_ORDER.map(({ key, label }) => ({
    key,
    label,
    items: EXPLORE_CATALOG.filter((s) => s.category === key),
  })).filter((g) => g.items.length > 0);
}

/** Map an Explore category to the app's Subscription `Category` (for the Add bridge). */
const APP_CATEGORY: Record<ExploreCategory, Category> = {
  Streaming: 'Entertainment',
  Music: 'Music',
  Design: 'Productivity',
  AI: 'Tools',
  SaaS: 'Productivity',
  Gaming: 'Gaming',
  Community: 'Health & Fitness',
  Shopping: 'Shopping',
  Turkish: 'Entertainment',
};

export function appCategoryFor(cat: ExploreCategory): Category {
  return APP_CATEGORY[cat];
}

/** Curated featured services for the Home "Explore" carousel. */
export const EXPLORE_FEATURED = [
  'Netflix', 'Spotify', 'ChatGPT Plus', 'Disney+', 'YouTube Premium',
  'Xbox Game Pass', 'Figma', 'Notion Plus', 'Crunchyroll', 'Canva Pro',
]
  .map((n) => exploreService(n))
  .filter((s): s is ExploreService => Boolean(s));
