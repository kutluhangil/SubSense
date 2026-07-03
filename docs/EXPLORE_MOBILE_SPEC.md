# SubSense Mobile App (iOS) — Explore Module Specification

> **Purpose of this document**
> This is the build spec for the **Explore** feature of the SubSense iOS app. It mirrors the
> "Explore" page that already exists on the SubSense web app (left sidebar → *Explore*) and
> brings the same editorial subscription content to mobile, while staying faithful to the
> existing iOS visual language (pure-black theme, indigo/violet accent, bottom tab bar,
> currency toggle in the header).
>
> Hand this file to Claude (or any engineer) as the single source of truth. Everything the
> Explore screens need — layout, components, behavior, and the full per-service dataset — is
> contained below. Do **not** invent new copy; all editorial text is pulled verbatim from the
> web app's `SUBSCRIPTION_CATALOG` (`utils/data.ts`).

---

## 1. What Explore is

Explore is a **browse-and-discover catalog** of popular subscription services. The user is not
managing *their own* subscriptions here (that's the *Subs* tab); instead they browse a curated,
magazine-style grid of services, tap any card, and read a rich profile: history, founders, CEO,
valuation, global users, regional pricing, and key milestones.

On web this is a **bento grid** (mixed-size cards) with a centered **detail modal**. On mobile we
keep the same two surfaces:

1. **Explore screen** — a vertically scrolling, mobile-adapted bento grid.
2. **Service Detail sheet** — a bottom sheet that slides up when a card is tapped (the mobile
   equivalent of the web modal shown in the Prime Video reference).

---

## 2. Where Explore lives in the mobile app (navigation)

The current bottom tab bar has 5 items: **Home · Subs · ⊕ Add · Insights · Profile**. Adding a 6th
permanent tab would crowd the bar and break the design, so Explore is surfaced **without changing
the 5-tab layout**:

**Recommended (primary):**
- A **"Discover" entry point on the Home screen** — a section header `Explore Subscriptions` with a
  horizontally scrolling row of featured service cards and a **"See all →"** affordance. "See all"
  pushes the full **Explore screen**.
- A **compass icon** (`compass` / SF Symbol `safari`) in the **top app bar** of Home, left of the
  notification bell, that also opens the full Explore screen. This matches the web sidebar's compass
  "Explore" icon.

**Secondary entry point:**
- From the **⊕ Add** flow: a **"Browse catalog"** button. When the user can't remember a service's
  exact price/plan, they browse Explore, open a service, and tap **"Add to my subscriptions"**
  (see §5.4) to prefill the Add form with that service + its regional tier.

> Design fidelity note: no new bottom-tab item, no change to the existing 5 icons. Explore reuses
> the same black canvas, card radii, and violet accent already used across Home/Profile.

---

## 3. Visual language (reuse existing tokens)

| Token | Value | Notes |
|---|---|---|
| App background | `#000000` | Pure black, same as Home/Profile screens |
| Surface / card (neutral) | `#0E0E10` – `#1C1C1E` | Dark zinc cards |
| Primary accent | Indigo/Violet `#6C5CE7`–`#7C6FF0` | Same as SubSense wordmark, PRO badge, "See all" links |
| Text primary | `#FFFFFF` | |
| Text secondary | `#9CA3AF` (gray-400) | Card descriptions, meta rows |
| Card radius | `16px` (`rounded-2xl`) | Matches web Explore cards |
| Section gap | `16px` | Matches web `gap-4` |
| Currency toggle | Header pill `USD ▾` | Already present in iOS header; drives price display (see §6) |
| Dark mode | Always dark on iOS | Web supports light+dark; mobile ships dark-only to match the reference |

Each brand card uses its **brand accent color** (full list in the appendix, §7). The Service Detail
sheet header is filled with that brand color and overlaid with a top-down black gradient, exactly
like the web modal.

---

## 4. Screen 1 — Explore (mobile bento grid)

### 4.1 Header
- Title: **"Explore Subscriptions"** (`discover.title`)
- Subtitle: **"Discover new services tailored to your digital life."** (`discover.subtitle`)
- Localized TR: **"Abonelikleri Keşfet"** / **"Dijital hayatınıza özel yeni servisleri keşfedin."**

### 4.2 Grid
Mobile uses a **2-column** grid (the web `grid-cols-2` base) with variable row spans for a
magazine feel. Recommended card sizing rhythm (top → bottom), reusing the web `EXPLORE_CARDS` order:

| Card | Span | Style treatment |
|---|---|---|
| Netflix | 2 cols × 2 rows (hero) | Cinematic: full-bleed dark image, logo + 3-line description bottom-aligned |
| Spotify | 1 × 1 | Flat brand green, white logo |
| YouTube Premium | 1 × 1 | Clean white/dark card, color logo |
| Disney+ | 2 × 1 | Brand-blue gradient, centered white logo |
| Prime Video | 1 × 1 | Dark branded, white logo |
| HBO Max | 1 × 2 (tall) | Dark branded, white logo |
| Apple TV+ | 1 × 1 | Black card, white logo |
| Hulu | 1 × 2 (tall) | Dark branded, white logo |
| Microsoft 365 | 1 × 1 | Clean light/dark card |
| Canva Pro | 1 × 1 | Gradient card, white logo |
| ChatGPT Plus | 1 × 1 | Clean card |
| Adobe Creative Cloud | 1 × 1 | Clean card |
| Xbox Game Pass | 2 × 1 | Dark branded |
| …remaining services | 1 × 1 | Default dark card, color/white logo per brand |

Card interior (all styles):
- **Logo** top-left (or centered for Disney-style), rendered white on colored/dark cards, color on
  light cards.
- **Description**: `line-clamp-2` (hero card `line-clamp-3`) of the service `description`, gray-400.
- **Tap target**: whole card. Subtle press state (scale `0.98`). The web hover tilt/glow is
  **dropped on mobile** (touch devices); use a simple press scale instead.

### 4.3 Behavior
- Tap a card → open **Service Detail sheet** (§5) for that service.
- Lazy-load logos; show a brand-colored placeholder block while loading.
- Pull-to-refresh is optional (catalog is static/bundled).

---

## 5. Screen 2 — Service Detail (bottom sheet)

This is the mobile version of the web modal (the Prime Video reference card). On iOS it is a
**bottom sheet** that slides up to ~92% height, with a grab handle and a swipe-down / **✕** to
dismiss. Background dims + blurs (`bg-gray-900/60 backdrop-blur`).

Element order, top → bottom (each maps to a `SUBSCRIPTION_CATALOG` field):

### 5.1 Colored header (height ≈ 160pt)
- Background: solid **brand accent color** + top-down black gradient overlay.
- **✕ close** button top-right, frosted circle.
- **Centered large logo** (white variant), drop-shadowed, slightly overlapping the content below.

### 5.2 Title block
- **Service name** — large bold (`service.name`).
- Meta row, centered, gray-400:
  - 📍 `headquarters` (hidden if `Unknown`)
  - 📅 **"Est."** `foundedYear` (`discover.est`; hidden if `Unknown`)

### 5.3 Price + Website row
- **"STARTING AT"** (`discover.starting_at`) + **price** + **"/mo"** (`discover.per_month`).
  Show `$` prefix when display currency is USD (see §6 for currency handling).
- **"Visit Website"** (`discover.visit_website`) button → opens `service.website` in in-app browser
  (Safari View Controller). Hidden if no `website`.

### 5.4 Add CTA (mobile-only, new vs. web)
- A primary **"Add to my subscriptions"** button (violet accent). Tapping prefills the **Add**
  form with this service name, brand icon, and the user's region tier (US or TR per §6), then routes
  to the Add flow. This is the bridge between Explore and the user's real Subs list.

### 5.5 Description
- Full multi-paragraph `description`, centered, max readable width, gray-300. Paragraphs are split
  on the `\n\n` markers in the data.

### 5.6 Stat grid (2 columns)
Render only the cards whose data exists (web hides `Unknown` / empty):

| Icon | Label (en / tr) | Field |
|---|---|---|
| 💼 Briefcase | CEO / CEO | `ceo` |
| 👥 Users | Founders / Kurucular | `founders` |
| 🌐 Globe | Global Users / Küresel Kullanıcı | `globalUserCount` |
| 📈 TrendingUp | Valuation / Değerleme | `netWorth` |

(`discover.ceo`, `discover.founders`, `discover.users`, `discover.valuation`.)

### 5.7 Regional pricing (expand the web data on mobile)
The web modal shows a single "starting at" price; on mobile we surface the **full `regions` data**
because the header already has a currency context. Show two labeled blocks when available:
- 🇺🇸 **United States** (`discover.us_pricing`) → list each `regions.US.tiers` row: tier name + `$price` + cycle.
- 🇹🇷 **Türkiye** (`discover.tr_pricing`) → list each `regions.TR.tiers` row: localized tier name (`nameLocalized`) + `₺price` + cycle.
- If neither exists: **"No regional pricing available."** (`discover.no_region`).

### 5.8 Key Milestones
- Section title **"Key Milestones"** (`discover.milestones`, 🕑 History icon).
- Vertical timeline: each `milestones[]` entry as a bulleted row (indigo dot + text).

---

## 6. Currency handling

The iOS header has a **USD ▾ / TRY** toggle. Explore respects it:
- **USD** selected → §5.3 "Starting at" shows `$` + `price`; §5.7 highlights the 🇺🇸 US block first.
- **TRY** selected → "Starting at" shows the TR tier's `₺` price; §5.7 highlights the 🇹🇷 TR block first.
- Services with **no TR pricing** still show their USD data; do not fabricate TR prices.
- Turkish-only services (Exxen, BluTV, Tabii, Trendyol Elite, Hepsiburada Premium) are priced in
  **₺ only**.

---

## 7. Service dataset (verbatim from `SUBSCRIPTION_CATALOG`)

> All 40 services below. Each block is the exact content the Service Detail sheet renders. Prices
> are monthly unless the cycle says *Yearly*. Brand accent = the header fill color.

---

### Entertainment & Streaming

#### Netflix
- **Accent:** `#E50914` · **HQ:** Los Gatos, California · **Est.** 1997
- **Founders:** Reed Hastings, Marc Randolph · **CEO:** Ted Sarandos, Greg Peters
- **Global users:** 283M+ · **Valuation:** $260 Billion · **Starting at:** $17.99/mo
- **Website:** https://www.netflix.com/signup

Netflix began its journey in 1997 as a DVD-by-mail service, famously conceived after Reed Hastings was charged a $40 late fee for a rental copy of Apollo 13. The company pivoted to streaming media in 2007, a move that would fundamentally disrupt the global entertainment industry and lead to the decline of traditional video rental stores.

Over the years, Netflix evolved from a content distributor to a massive content creator. With the launch of 'House of Cards' in 2013, it pioneered the model of 'binge-watching' by releasing entire seasons at once. Today, it operates in over 190 countries and produces original content in dozens of languages, effectively becoming the world's first global TV network.

Despite increasing competition, Netflix remains the market leader in streaming, known for its powerful recommendation algorithm and massive cultural hits like 'Stranger Things', 'Squid Game', and 'The Crown'. It continues to experiment with new formats, including interactive storytelling and mobile gaming.

- **🇺🇸 US:** Standard with Ads $7.99 · Standard $17.99 · Premium (4K) $24.99
- **🇹🇷 TR:** Temel ₺189.99 · Standart ₺289.99 · Premium (4K) ₺379.99
- **Milestones:**
  - 1997: Founded as a DVD-by-mail service
  - 2007: Launched streaming video service
  - 2013: Released first original series 'House of Cards'
  - 2016: Expanded globally to 130 new countries simultaneously
  - 2021: Squid Game becomes most-watched show ever
  - 2022: Launched ad-supported tier
  - 2025: Surpassed 280 million subscribers

#### Disney+
- **Accent:** `#113CCF` · **HQ:** Burbank, California · **Est.** 2019
- **Founders:** The Walt Disney Company · **CEO:** Bob Iger
- **Global users:** 150M+ · **Valuation:** $200 Billion · **Starting at:** $13.99/mo · **Parent:** Disney
- **Website:** https://www.disneyplus.com

Disney+ launched in November 2019, marking a historic pivot for The Walt Disney Company as it shifted focus from traditional theatrical and cable distribution to direct-to-consumer streaming. Within its first day, it amassed 10 million subscribers, far exceeding industry expectations.

The service is the dedicated home for movies and shows from Disney's core brands: Disney, Pixar, Marvel, Star Wars, and National Geographic. This exclusive library includes cultural juggernauts like 'The Mandalorian', the first live-action Star Wars series, which became an instant global phenomenon.

Today, Disney+ is one of the 'Big Three' global streaming services. It continues to integrate content from its other assets, including Hulu (in the US) and Star (internationally), aiming to offer a comprehensive general entertainment offering alongside its family-friendly staples.

- **🇺🇸 US:** Basic (with Ads) $9.99 · Premium (No Ads) $15.99
- **🇹🇷 TR:** Standart ₺279.90 · Premium ₺549.90
- **Milestones:**
  - 2019: Launch with 'The Mandalorian'
  - 2020: Reached 50 million subscribers in 5 months
  - 2020: Released 'Hamilton' and 'Soul' directly to streaming
  - 2022: Launched ad-supported tier
  - 2024: Integrated Hulu content into main app

#### Prime Video
- **Accent:** `#00A8E1` · **HQ:** Seattle, Washington · **Est.** 2006
- **Founders:** Jeff Bezos · **CEO:** Mike Hopkins (SVP)
- **Global users:** 200M+ (Prime) · **Valuation:** $2 Trillion (Amazon) · **Starting at:** $8.99/mo · **Parent:** Amazon
- **Website:** https://www.primevideo.com

Amazon Prime Video launched in 2006 as Amazon Unbox, originally a download service. It has since evolved into a major global streaming player, bundled with the Amazon Prime membership which includes free shipping and music. This bundling strategy has made it one of the most widely accessible streaming services in the world.

Amazon has invested heavily in original content, producing critical darlings like 'The Marvelous Mrs. Maisel' and massive budget spectacles like 'The Lord of the Rings: The Rings of Power'. Unlike pure-play streamers, Prime Video serves as a value-add to the broader Amazon ecosystem, driving retail loyalty.

In recent years, Prime Video has aggressively pursued live sports rights, securing exclusive broadcasts for NFL Thursday Night Football. It also offers 'Channels', allowing users to subscribe to other networks like HBO or Starz directly within the Prime interface, acting as an aggregator for the streaming market.

- **🇺🇸 US:** Prime Video (Standalone) $8.99 · Amazon Prime (Bundle) $14.99
- **🇹🇷 TR:** Prime Video ₺39.90
- **Milestones:**
  - 2006: Amazon Unbox launched
  - 2011: Included in Prime membership
  - 2013: Amazon Studios launches first original series
  - 2022: 'The Rings of Power' premieres
  - 2024: Introduced ads to base tier

#### HBO Max (Max)
- **Accent:** `#5F259F` · **HQ:** New York City, New York · **Est.** 2020
- **Founders:** WarnerMedia · **CEO:** David Zaslav
- **Global users:** 97M+ · **Valuation:** $25 Billion (Warner Bros. Discovery) · **Starting at:** $16.99/mo · **Parent:** Warner Bros. Discovery
- **Website:** https://www.max.com/plans

HBO Max launched in May 2020, combining the prestigious library of HBO with the vast content archives of WarnerMedia (Warner Bros., DC, TNT, TBS, Cartoon Network). It was designed to compete directly with Netflix by offering a mix of premium drama, blockbuster movies, and classic TV sitcoms like 'Friends' and 'The Big Bang Theory'.

The service underwent a turbulent evolution, including the controversial 'Project Popcorn' in 2021 where Warner Bros. released all its theatrical movies on HBO Max simultaneously. Following the merger of WarnerMedia and Discovery in 2022, the service was rebranded simply as 'Max' in 2023.

Now integrating unscripted content from Discovery+, Max positions itself as 'The One to Watch', housing everything from 'Game of Thrones' and 'Succession' to '90 Day Fiancé' and 'Shark Week', aiming for the broadest possible demographic appeal.

- **🇺🇸 US:** With Ads $9.99 · Ad-Free $16.99 · Ultimate (4K) $20.99
- **Milestones:**
  - 2020: HBO Max launch
  - 2021: Same-day theatrical releases (Matrix 4, Dune)
  - 2022: Warner Bros. Discovery merger completed
  - 2023: Rebranded to 'Max'
  - 2024: House of the Dragon Season 2

#### Hulu
- **Accent:** `#1CE783` · **HQ:** Santa Monica, California · **Est.** 2007
- **Founders:** News Corp, NBC Universal, Providence Equity · **CEO:** Joe Earley
- **Global users:** 48M+ · **Valuation:** N/A (Disney Owned) · **Starting at:** $7.99/mo · **Parent:** Disney
- **Website:** https://www.hulu.com/welcome

Hulu was established in 2007 as a joint venture between News Corporation, NBC Universal, Providence Equity Partners, and later Disney, to stream aggregated TV content online. It was the industry's first major attempt by traditional media companies to tackle the digital shift.

Known for its 'next-day air' model, Hulu allowed users to watch episodes of current TV shows the day after they aired on cable. Over time, it developed a robust slate of original programming, including the Emmy-winning 'The Handmaid's Tale', which put it on the map as a prestige content creator.

Following Disney's acquisition of 21st Century Fox in 2019, Disney assumed full operational control of Hulu. It is now being closely integrated with Disney+ to provide a unified streaming experience, combining Disney's family brands with Hulu's general entertainment library.

- **🇺🇸 US:** Hulu (with Ads) $9.99 · Hulu (No Ads) $18.99
- **Milestones:**
  - 2008: Public launch
  - 2011: Launched original programming
  - 2017: Launched Hulu with Live TV
  - 2017: 'The Handmaid's Tale' wins Best Drama Emmy
  - 2019: Disney assumes full operational control

#### Apple TV+
- **Accent:** `#000000` · **HQ:** Cupertino, California · **Est.** 2019
- **Founders:** Apple Inc. · **CEO:** Tim Cook
- **Global users:** 25M+ (Est) · **Valuation:** $3 Trillion (Apple) · **Starting at:** $12.99/mo · **Parent:** Apple Inc.
- **Website:** https://tv.apple.com

Apple TV+ launched in November 2019 with a strategy distinct from its competitors: quality over quantity. Instead of buying a massive back catalog, Apple focused exclusively on producing high-budget original content with A-list talent, such as 'The Morning Show' with Jennifer Aniston and Reese Witherspoon.

While it started with a small library, the service gained critical acclaim rapidly. In 2022, it became the first streaming service to win the Academy Award for Best Picture with 'CODA'. The comedy series 'Ted Lasso' also became a cultural phenomenon, earning back-to-back Emmys for Outstanding Comedy Series.

Apple has also expanded into live sports, securing exclusive rights to Major League Soccer (MLS) and Major League Baseball (MLB) games. It remains a key part of the Apple One subscription bundle, driving value for the broader Apple services ecosystem.

- **🇺🇸 US:** Apple TV+ $12.99 · Apple TV+ (Annual) $129.00 *(Yearly)*
- **🇹🇷 TR:** Apple TV+ ₺89.99
- **Milestones:**
  - 2019: Launched in over 100 countries
  - 2020: 'Ted Lasso' premieres
  - 2022: 'CODA' wins Best Picture Oscar
  - 2023: Launched MLS Season Pass
  - 2025: Price increased to $12.99/mo

#### Peacock
- **Accent:** `#000000` · **HQ:** New York City, New York · **Est.** 2020
- **Founders:** NBCUniversal · **CEO:** Kelly Campbell
- **Global users:** 31M+ Paid · **Valuation:** Comcast Owned · **Starting at:** $5.99/mo · **Parent:** Comcast
- **Website:** https://www.peacocktv.com/plans

Peacock is an American video streaming service owned and operated by NBCUniversal. Launched in 2020, it features content from NBC studios, including 'The Office', 'Parks and Recreation', and 'Saturday Night Live', along with original programming and live sports like the Premier League and WWE.

Peacock differentiates itself with a tiered model that includes a free ad-supported version (though availability has been reduced), a Premium ad-supported tier, and a Premium Plus ad-free tier. It serves as the streaming home for Universal Pictures films shortly after their theatrical release.

The service has leveraged major live events like the Olympics and NFL games to drive subscriber growth, positioning itself as a hybrid between traditional TV and modern streaming.

- **🇺🇸 US:** Premium (with Ads) $7.99 · Premium Plus (No Ads) $13.99
- **Milestones:**
  - 2020: National launch
  - 2021: The Office moves to Peacock
  - 2021: WWE Network integration
  - 2023: First exclusive NFL playoff game stream
  - 2023: Prices increased for the first time

#### Paramount+
- **Accent:** `#0064FF` · **HQ:** New York City, New York · **Est.** 2014 (as CBS All Access)
- **Founders:** CBS Interactive · **CEO:** Bob Bakish (Paramount Global)
- **Global users:** 67M+ · **Valuation:** $8 Billion (Est. Valuation) · **Starting at:** $5.99/mo · **Parent:** Paramount Global
- **Website:** https://www.paramountplus.com/plans/

Paramount+ is an American video-on-demand service owned by Paramount Global. It offers content from the libraries of CBS, Paramount Pictures, Nickelodeon, MTV, BET, and Comedy Central, along with live sports and original programming like 'Star Trek: Discovery' and 'Yellowstone' spin-offs.

Originally launched as CBS All Access in 2014, the service was rebranded as Paramount+ in 2021 to reflect its expanded library following the merger of CBS and Viacom. It aims to compete globally by leveraging its massive catalog of classic films and television series.

The platform has grown rapidly by bundling with Showtime and securing exclusive rights to major sporting events like the UEFA Champions League and NFL games.

- **🇺🇸 US:** Essential (with Ads) $5.99 · Showtime Bundle (No Ads) $11.99
- **Milestones:**
  - 2014: CBS All Access launch
  - 2017: First Star Trek original series
  - 2021: Rebranded to Paramount+
  - 2022: Halo series premiere
  - 2023: Integration with Showtime

#### Crunchyroll
- **Accent:** `#F47521` · **HQ:** San Francisco, California · **Est.** 2006
- **Founders:** Kun Gao, James Lin · **CEO:** Rahul Purini
- **Global users:** 15M+ Paid · **Valuation:** $1.18 Billion (Acquisition) · **Starting at:** $7.99/mo · **Parent:** Sony
- **Website:** https://www.crunchyroll.com/welcome

Crunchyroll is the world's largest anime streaming service, offering thousands of anime titles, manga, and Asian dramas. Founded in 2006 as a video sharing site, it pivoted to legally licensed anime streaming in 2009.

Following Sony's acquisition of Funimation in 2021 and the merger of Funimation and Crunchyroll, Crunchyroll became the dominant anime streaming platform globally, available in over 200 countries. It offers simulcasts of new anime episodes hours after their Japanese broadcast.

The service has expanded into anime film distribution, manga publishing, and exclusive original anime productions, becoming an essential platform for anime fans worldwide.

- **🇺🇸 US:** Fan $7.99 · Mega Fan $11.99 · Ultimate Fan $15.99
- **🇹🇷 TR:** Fan ₺169.99 · Mega Fan ₺249.99
- **Milestones:**
  - 2006: Founded as video site
  - 2009: Licensed streaming launch
  - 2018: Reached 1M subscribers
  - 2021: Sony acquired for $1.18B
  - 2022: Merged with Funimation

---

### Music & Audio

#### Spotify
- **Accent:** `#1DB954` · **HQ:** Stockholm, Sweden · **Est.** 2006
- **Founders:** Daniel Ek, Martin Lorentzon · **CEO:** Daniel Ek
- **Global users:** 675M+ (Total) · **Valuation:** $90 Billion · **Starting at:** $11.99/mo
- **Website:** https://www.spotify.com/premium/

Spotify was founded in 2006 in Stockholm, Sweden, by Daniel Ek and Martin Lorentzon as a response to the growing piracy problem in the music industry. By offering a legal, superior user experience for streaming music, they aimed to convince users to pay for music again. The service launched in 2008 and quickly gained traction in Europe before expanding to the US in 2011.

The platform revolutionized music consumption by shifting the model from ownership (buying albums/tracks) to access (streaming). Its 'Freemium' model allowed massive user growth, while its personalized playlists like 'Discover Weekly' became a gold standard for algorithmic recommendation.

Today, Spotify is the world's largest music streaming service provider. It has aggressively expanded into podcasts and audiobooks, spending over $1 billion to acquire podcast networks and exclusive rights to shows like 'The Joe Rogan Experience', positioning itself as a comprehensive audio platform rather than just a music player.

- **🇺🇸 US:** Individual $11.99 · Duo $16.99 · Family $19.99 · Student $5.99
- **🇹🇷 TR:** Bireysel ₺64.99 · Duo ₺84.99 · Aile ₺109.99 · Öğrenci ₺34.99
- **Milestones:**
  - 2006: Founded in Stockholm
  - 2008: Service launched in Europe
  - 2011: Launched in the United States
  - 2015: Discover Weekly playlist launched
  - 2019: Acquired Gimlet Media (Podcast pivot)
  - 2023: Surpassed 500 million active users
  - 2025: Surpassed 670 million total users

#### Apple Music
- **Accent:** `#FC3C44` · **HQ:** Cupertino, California · **Est.** 2015
- **Founders:** Apple Inc. · **CEO:** Tim Cook
- **Global users:** 88M+ · **Valuation:** $3 Trillion (Apple) · **Starting at:** $10.99/mo · **Parent:** Apple Inc.
- **Website:** https://music.apple.com

Apple Music launched in 2015, replacing Beats Music (which Apple acquired) and integrating directly into the iOS ecosystem. It was Apple's long-awaited answer to Spotify, leveraging the massive user base of iTunes and the iPhone to gain immediate market share.

The service differentiates itself with a focus on human curation, including the flagship 'Beats 1' (now Apple Music 1) global radio station anchored by Zane Lowe. Unlike Spotify, Apple Music does not offer a free ad-supported tier, positioning itself as a premium-only product that supports artist value.

Apple has consistently pushed audio technology forward, introducing Lossless Audio and Spatial Audio with Dolby Atmos at no extra cost. In 2023, it launched a dedicated app for Classical music, further solidifying its reputation among audiophiles and serious music fans.

- **🇺🇸 US:** Individual $10.99 · Family $16.99 · Student $5.99
- **🇹🇷 TR:** Bireysel ₺74.99 · Aile ₺109.99 · Öğrenci ₺39.99
- **Milestones:**
  - 2014: Apple acquires Beats Electronics
  - 2015: Apple Music launched at WWDC
  - 2018: Surpassed 50 million subscribers
  - 2021: Added Lossless and Spatial Audio
  - 2023: Apple Music Classical app launched

#### YouTube Premium
- **Accent:** `#FF0000` · **HQ:** San Bruno, California · **Est.** 2014 (as Music Key)
- **Founders:** Steve Chen, Chad Hurley, Jawed Karim (YouTube) · **CEO:** Neal Mohan
- **Global users:** 100M+ · **Valuation:** $2 Trillion (Alphabet) · **Starting at:** $13.99/mo · **Parent:** Alphabet Inc.
- **Website:** https://www.youtube.com/premium

YouTube Premium (formerly YouTube Red) is a subscription service offered by the video platform YouTube. It provides ad-free access to content across the service, as well as access to premium YouTube Originals, background play on mobile devices, and the ability to download videos for offline playback.

The service was originally launched in November 2014 as Music Key, offering only ad-free streaming of music videos from participating labels on YouTube and Google Play Music. It was relaunched as YouTube Red in 2015, expanding its scope to offer ad-free access to all YouTube videos, not just music.

In May 2018, YouTube announced the rebranding of the service as YouTube Premium, alongside the launch of a separate YouTube Music subscription. Today, it is a key part of Google's subscription revenue, offering a unique value proposition that combines video streaming, music streaming, and creator support.

- **🇺🇸 US:** Individual $13.99 · Family $22.99 · Student $7.99
- **🇹🇷 TR:** Bireysel ₺139.99 · Aile ₺259.99 · Öğrenci ₺79.99
- **Milestones:**
  - 2005: YouTube founded
  - 2006: Acquired by Google for $1.65B
  - 2015: Launched YouTube Red
  - 2018: Rebranded to YouTube Premium
  - 2024: Surpassed 100 million subscribers

#### Tidal
- **Accent:** `#000000` · **HQ:** New York City, New York · **Est.** 2014
- **Founders:** Aspiro AB · **CEO:** Jesse Dorogusker
- **Global users:** 5M+ · **Valuation:** $300M (Block Acquisition) · **Starting at:** $10.99/mo · **Parent:** Block, Inc.
- **Website:** https://tidal.com/pricing

Tidal is a music streaming service launched in 2014, acquired by Jay-Z in 2015 and partially acquired by Block (formerly Square) in 2021. It positions itself as the premium audiophile alternative to Spotify and Apple Music.

The service is known for its HiFi tier offering CD-quality audio, and its HiFi Plus tier providing high-resolution lossless audio, Dolby Atmos, and 360 Reality Audio. Tidal also distinguishes itself by offering higher royalty rates to artists.

With Jay-Z's involvement, Tidal secured exclusive releases from artists like Beyoncé, Kanye West, and Rihanna, building a reputation as an artist-friendly platform with curated content.

- **🇺🇸 US:** Individual $10.99 · Family $16.99 · Student $5.49
- **Milestones:**
  - 2014: Launched by Aspiro
  - 2015: Acquired by Jay-Z
  - 2021: Block (Square) acquisition
  - 2024: Removed free tier
  - 2025: Lossless for all subscribers

#### Audible
- **Accent:** `#F79A1D` · **HQ:** Newark, New Jersey · **Est.** 1995
- **Founders:** Don Katz · **CEO:** Bob Carrigan
- **Global users:** Millions (Undisclosed) · **Valuation:** $1 Billion+ (Amazon Subsid.) · **Starting at:** $14.95/mo · **Parent:** Amazon
- **Website:** https://www.audible.com/ep/membership

Audible is an online audiobook and podcast service that allows users to purchase and stream audiobooks and other forms of spoken word content. It is the world's largest producer and retailer of audiobooks.

Founded in 1995, Audible created the first portable digital audio player before the iPod existed. Amazon acquired the company in 2008 for $300 million. Since then, it has expanded into original content production, creating 'Audible Originals' which include exclusive audio dramas and podcasts.

The service operates on a credit-based subscription model, where monthly fees grant credits that can be exchanged for any audiobook regardless of price, making it highly valuable for heavy readers.

- **🇺🇸 US:** Plus (1 Credit/mo) $7.95 · Premium (2 Credits/mo) $14.95
- **🇹🇷 TR:** Plus (Aylık 1 Kredi) ₺54.90 · Premium (Aylık 2 Kredi) ₺89.90
- **Milestones:**
  - 1995: Company founded
  - 1997: Released first portable digital audio player
  - 2008: Acquired by Amazon
  - 2020: Audible Plus catalog launched
  - 2023: Exclusive deal with Obama's Higher Ground

---

### Design & Creativity

#### Adobe Creative Cloud
- **Accent:** `#ED1C24` · **HQ:** San Jose, California · **Est.** 1982 (Adobe)
- **Founders:** John Warnock, Charles Geschke · **CEO:** Shantanu Narayen
- **Global users:** 30M+ · **Valuation:** $220 Billion · **Starting at:** $59.99/mo
- **Website:** https://www.adobe.com/creativecloud/plans.html

Adobe Creative Cloud is a collection of software used for graphic design, video editing, web development, and photography. It replaced the Creative Suite (CS) perpetual license model in 2013, a controversial move that ultimately transformed Adobe's business into a cloud juggernaut.

The suite includes industry-standard applications like Photoshop, Illustrator, Premiere Pro, and After Effects. By moving to a subscription model, Adobe reduced piracy and lowered the barrier to entry for students and freelancers who previously couldn't afford the multi-thousand dollar upfront cost.

Adobe continues to innovate with the addition of Firefly, a family of creative generative AI models designed to be safe for commercial use. This new technology allows users to generate images and text effects directly within apps like Photoshop, keeping Adobe at the cutting edge of digital creativity.

- **🇺🇸 US:** Photography Plan $9.99 · Single App $22.99 · All Apps $59.99
- **🇹🇷 TR:** Fotoğrafçılık ₺279.99 · Tek Uygulama ₺649.99 · Tüm Uygulamalar ₺1599.99
- **Milestones:**
  - 1982: Adobe founded
  - 1990: Photoshop 1.0 released
  - 2013: Shifted entirely to Creative Cloud subscription
  - 2021: Acquired Frame.io for cloud collaboration
  - 2023: Launched Firefly Generative AI

#### Canva Pro
- **Accent:** `#00C4CC` · **HQ:** Sydney, Australia · **Est.** 2013
- **Founders:** Melanie Perkins, Cliff Obrecht, Cameron Adams · **CEO:** Melanie Perkins
- **Global users:** 135M+ (MAU) · **Valuation:** $26 Billion · **Starting at:** $14.99/mo
- **Website:** https://www.canva.com/pro/

Canva was founded in Sydney, Australia, in 2013 by Melanie Perkins, Cliff Obrecht, and Cameron Adams. Their mission was to democratize design, making it accessible to anyone regardless of their technical skill level. It started as a simple drag-and-drop tool and has grown into a comprehensive visual communication platform.

Canva Pro offers advanced features like Brand Kits, background removal, and a massive library of premium stock photos and templates. It has become a staple for social media managers, small business owners, and marketing teams who need to produce high-quality assets quickly without the steep learning curve of professional software.

The company is currently one of the world's most valuable private tech startups. It has recently introduced 'Magic Studio', a suite of AI-powered tools that allow users to generate text, images, and videos, positioning itself as a direct competitor to Adobe in the AI age.

- **🇺🇸 US:** Pro $14.99 · Teams $10.00
- **🇹🇷 TR:** Pro ₺179.99 · Ekip ₺119.99
- **Milestones:**
  - 2013: Launched in Sydney
  - 2015: Reached 4 million users
  - 2019: Acquired Pexels and Pixabay
  - 2021: Valued at $40 billion
  - 2023: Launched Magic Studio AI

#### Figma
- **Accent:** `#F24E1E` · **HQ:** San Francisco, California · **Est.** 2012
- **Founders:** Dylan Field, Evan Wallace · **CEO:** Dylan Field
- **Global users:** 4M+ · **Valuation:** $10 Billion+ · **Starting at:** $12.00/mo
- **Website:** https://www.figma.com/pricing/

Figma is the leading collaborative interface design tool. Built for the web, it allows designers, developers, and stakeholders to work in the same file at the same time, revolutionizing the design workflow much like Google Docs did for writing. Founded in 2012 by Dylan Field and Evan Wallace, it was the first professional design tool to run entirely in the browser.

Figma's vector networks and component properties allow for complex, responsive design systems. Its introduction of 'FigJam', a collaborative whiteboarding tool, expanded its utility beyond pure UI/UX design into brainstorming and diagramming.

In 2022, Adobe announced intent to acquire Figma for $20 billion, though the deal was later abandoned due to regulatory pressure. Figma remains the industry standard for product design, used by teams at Netflix, Airbnb, and Zoom.

- **🇺🇸 US:** Professional $12.00 · Organization $45.00
- **Milestones:**
  - 2015: Closed beta launch
  - 2016: Public launch
  - 2021: Launched FigJam
  - 2022: Failed Adobe acquisition attempt
  - 2023: Dev Mode for developers

---

### AI & Dev Tools

#### ChatGPT Plus
- **Accent:** `#10A37F` · **HQ:** San Francisco, California · **Est.** 2015 (OpenAI)
- **Founders:** Sam Altman, Elon Musk, Ilya Sutskever, Greg Brockman, Wojciech Zaremba, John Schulman · **CEO:** Sam Altman
- **Global users:** 180M+ (MAU) · **Valuation:** $80 Billion (OpenAI Valuation) · **Starting at:** $20.00/mo · **Parent:** OpenAI
- **Website:** https://openai.com/chatgpt/pricing/

ChatGPT Plus is the premium subscription tier for ChatGPT, the AI chatbot developed by OpenAI. Launched in February 2023, it offers subscribers priority access during peak times, faster response speeds, and exclusive access to the latest models like GPT-4.

OpenAI was founded in 2015 as a non-profit research lab with the mission to ensure artificial general intelligence benefits all of humanity. The release of ChatGPT in late 2022 marked a watershed moment for AI, becoming the fastest-growing consumer application in history.

Subscribers also get access to advanced features like DALL·E 3 for image generation, browsing capabilities, and data analysis tools. It serves as a productivity multiplier for developers, writers, and professionals across industries.

- **🇺🇸 US:** Plus $20.00 · Pro $200.00
- **🇹🇷 TR:** Plus ₺649.99
- **Milestones:**
  - 2015: OpenAI founded
  - 2020: GPT-3 released
  - 2022: ChatGPT launched (Nov)
  - 2023: ChatGPT Plus & GPT-4 released
  - 2024: Sora video model announced

#### Claude Pro
- **Accent:** `#D97757` · **HQ:** San Francisco, California · **Est.** 2021 (Anthropic)
- **Founders:** Dario Amodei, Daniela Amodei · **CEO:** Dario Amodei
- **Global users:** 20M+ (Est) · **Valuation:** $60 Billion (Anthropic) · **Starting at:** $20.00/mo · **Parent:** Anthropic
- **Website:** https://claude.ai/upgrade

Claude Pro is the premium subscription for Anthropic's Claude AI assistant. Launched in late 2023, it offers higher message limits, priority access during peak times, and access to the latest Claude models including Claude Opus 4 and Sonnet 4.

Anthropic was founded in 2021 by former OpenAI executives Dario and Daniela Amodei, with a focus on AI safety research. Claude is positioned as a thoughtful, principled AI assistant emphasizing helpfulness, harmlessness, and honesty.

Pro subscribers benefit from extended context windows (up to 200K tokens), file uploads, and the ability to use Claude's coding capabilities through Projects. It directly competes with ChatGPT Plus while emphasizing its constitutional AI approach.

- **🇺🇸 US:** Pro $20.00 · Max (5x usage) $100.00 · Team $30.00
- **🇹🇷 TR:** Pro ₺699.99
- **Milestones:**
  - 2021: Anthropic founded
  - 2023: Claude 2 released
  - 2024: Claude 3 family released
  - 2024: Claude Pro & Team plans launched
  - 2025: Claude 4 Opus released

#### GitHub Copilot
- **Accent:** `#181717` · **HQ:** San Francisco, California · **Est.** 2021 (Preview)
- **Founders:** GitHub & OpenAI · **CEO:** Thomas Dohmke (GitHub)
- **Global users:** 1.3M+ Paid Users · **Valuation:** $7.5 Billion (GitHub Acq.) · **Starting at:** $10.00/mo · **Parent:** Microsoft
- **Website:** https://github.com/features/copilot

GitHub Copilot is an AI-powered code completion tool developed by GitHub and OpenAI. It functions as an 'AI pair programmer', suggesting whole lines or blocks of code as developers type within their integrated development environment (IDE).

Built on the OpenAI Codex model, Copilot was trained on billions of lines of public code. Since its general availability in 2022, it has transformed software development by automating boilerplate code, writing unit tests, and helping developers learn new languages and frameworks faster.

Microsoft, which owns GitHub, has continued to expand Copilot's capabilities with 'Copilot X', integrating chat interfaces, pull request descriptions, and CLI assistance. It represents the forefront of AI-assisted engineering.

- **🇺🇸 US:** Individual $10.00 · Business $19.00
- **Milestones:**
  - 2018: Microsoft acquires GitHub
  - 2021: Copilot Technical Preview launched
  - 2022: General Availability
  - 2023: Copilot X announced
  - 2023: Copilot Chat integrated into VS Code

#### Midjourney
- **Accent:** `#FFFFFF` (render logo dark-on-light or white-on-black) · **HQ:** San Francisco, California · **Est.** 2022
- **Founders:** David Holz · **CEO:** David Holz
- **Global users:** 16M+ Discord Members · **Valuation:** Private (Est. $10B+) · **Starting at:** $10.00/mo
- **Website:** https://www.midjourney.com/pricing

Midjourney is a generative artificial intelligence program and service created and hosted by San Francisco-based independent research lab Midjourney, Inc. It generates images from natural language descriptions, called 'prompts', similar to OpenAI's DALL-E and Stable Diffusion.

The tool is currently only accessible through a Discord bot, which adds a unique community aspect to the creation process. Users can see each other's prompts and results, fostering a collaborative learning environment. Midjourney is known for its artistic style and high-resolution output.

Despite having a small team and no venture capital funding, Midjourney has become one of the most prominent players in the generative AI space, sparking debates about the future of art and copyright.

- **🇺🇸 US:** Basic $10.00 · Standard $30.00 · Pro $60.00
- **Milestones:**
  - 2022: Open Beta launch via Discord
  - 2023: V5 Model released (Photo-realism)
  - 2023: Ended free trials due to high demand
  - 2024: Alpha web interface testing

---

### Business & Productivity (SaaS)

#### Microsoft 365
- **Accent:** `#0078D4` · **HQ:** Redmond, Washington · **Est.** 2011 (as Office 365)
- **Founders:** Microsoft · **CEO:** Satya Nadella
- **Global users:** 345M (Paid Seats) · **Valuation:** $3 Trillion (Microsoft) · **Starting at:** $9.99/mo · **Parent:** Microsoft
- **Website:** https://www.microsoft.com/microsoft-365/personal-family-office

Microsoft 365 (formerly Office 365) represents one of the most successful business pivots in tech history. Launched in 2011, it transitioned Microsoft's dominant Office suite from a one-time software purchase to a cloud-based subscription service, ensuring continuous updates and revenue.

The bundle includes industry-standard tools like Word, Excel, PowerPoint, and Outlook, integrated with cloud services like OneDrive and Microsoft Teams. This integration has made it indispensable for businesses, with Teams becoming a central hub for workplace collaboration during the remote work boom.

Recently, Microsoft has begun integrating 'Copilot', its generative AI technology, across the 365 suite. This allows users to draft emails, summarize meetings, and generate presentations automatically, positioning Microsoft 365 as the foundational operating system for the future of work.

- **🇺🇸 US:** Personal $9.99 · Family $12.99
- **🇹🇷 TR:** Kişisel ₺179.99 · Aile ₺239.99
- **Milestones:**
  - 2011: Office 365 for Enterprise launched
  - 2013: Office 365 for Home launched
  - 2017: Microsoft Teams launched
  - 2020: Rebranded to Microsoft 365
  - 2023: Copilot AI integration announced

#### Google Workspace
- **Accent:** `#4285F4` · **HQ:** Mountain View, California · **Est.** 2006
- **Founders:** Google · **CEO:** Sundar Pichai
- **Global users:** 3 Billion+ · **Valuation:** $2 Trillion (Alphabet) · **Starting at:** $6.00/mo · **Parent:** Alphabet Inc.
- **Website:** https://workspace.google.com/pricing

Google Workspace (formerly G Suite) is a collection of cloud computing, productivity, and collaboration tools developed by Google. It includes Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet, and more. Launched in 2006 as Google Apps for Your Domain, it has become the backbone of modern business communication, rivaling Microsoft's Office suite.

Its cloud-native approach allows for real-time collaboration that was revolutionary at the time of its release. Multiple users can edit a single document simultaneously, eliminating the need for email attachments and version control headaches. It is used by everyone from small startups to massive enterprises like Airbus and Salesforce.

Recently, Google has integrated 'Gemini' (formerly Duet AI) into Workspace, bringing generative AI capabilities to docs, email drafting, and slide creation, ensuring it remains competitive in the AI-driven productivity landscape.

- **🇺🇸 US:** Business Starter $6.00 · Business Standard $12.00 · Business Plus $18.00
- **🇹🇷 TR:** İşletme Başlangıç ₺119.99 · İşletme Standart ₺239.99
- **Milestones:**
  - 2006: Launched as Google Apps
  - 2012: Google Drive released
  - 2016: Rebranded to G Suite
  - 2020: Rebranded to Google Workspace
  - 2023: Gemini AI integration

#### Slack
- **Accent:** `#4A154B` · **HQ:** San Francisco, California · **Est.** 2009
- **Founders:** Stewart Butterfield, Eric Costello, Cal Henderson, Serguei Mourachov · **CEO:** Lidiane Jones
- **Global users:** 35M+ DAU · **Valuation:** $27 Billion (Acquisition) · **Starting at:** $7.25/mo · **Parent:** Salesforce
- **Website:** https://slack.com/pricing

Slack is a messaging app for business that connects people to the information they need. By bringing people together to work as one unified team, Slack transforms the way organizations communicate. It was founded in 2009 by Stewart Butterfield and began as an internal tool for his company while developing a game called Glitch.

Slack's channel-based messaging replaced email for internal communication in many tech companies, becoming synonymous with modern startup culture. Its robust API allows integration with thousands of other tools like Jira, GitHub, and Google Drive, making it a central command center for work.

In 2021, Slack was acquired by Salesforce for $27.7 billion, one of the largest software acquisitions in history. It continues to operate as an independent brand while integrating deeper into the Salesforce Customer 360 ecosystem.

- **🇺🇸 US:** Pro $7.25 · Business+ $12.50
- **Milestones:**
  - 2013: Public launch
  - 2019: Direct listing on NYSE
  - 2020: IBM chooses Slack for 350k employees
  - 2021: Acquired by Salesforce
  - 2023: Launched Slack Canvas

#### Notion Plus
- **Accent:** `#000000` · **HQ:** San Francisco, California · **Est.** 2013
- **Founders:** Ivan Zhao, Simon Last · **CEO:** Ivan Zhao
- **Global users:** 30M+ · **Valuation:** $10 Billion · **Starting at:** $8.00/mo
- **Website:** https://www.notion.so/pricing

Notion is an all-in-one workspace that blends your everyday work apps into one. It's the 'Lego of productivity software', allowing users to build their own systems for note-taking, project management, wikis, and databases. Founded in 2013, it struggled initially before a 2018 redesign catapulted it to viral status.

Notion's block-based editor is its defining feature, allowing any piece of content to be moved, transformed, or embedded. It gained a massive cult following among students, startups, and productivity enthusiasts, leading to a vibrant community of template creators.

With the launch of Notion AI, the platform has integrated generative text capabilities directly into the editor, allowing users to brainstorm, summarize, and translate content without leaving their workspace.

- **🇺🇸 US:** Plus $8.00 · Business $15.00
- **Milestones:**
  - 2016: Notion 1.0 released
  - 2018: Notion 2.0 (Databases) released
  - 2020: Personal plan made free
  - 2021: Valued at $10 Billion
  - 2023: Notion AI launched

#### Zoom Pro
- **Accent:** `#2D8CFF` · **HQ:** San Jose, California · **Est.** 2011
- **Founders:** Eric Yuan · **CEO:** Eric Yuan
- **Global users:** 300M+ DAU (Peak) · **Valuation:** $20 Billion · **Starting at:** $15.99/mo
- **Website:** https://zoom.us/pricing

Zoom is a videotelephony software program developed by Zoom Video Communications. The Pro plan removes the 40-minute time limit on meetings and adds cloud recording and admin controls. It became a household name during the COVID-19 pandemic as the default tool for remote work and virtual social gatherings.

Founded in 2011 by Eric Yuan, a former Cisco engineer, Zoom focused on making video calls reliable and easy to use. Its 'freemium' model allowed for viral adoption in schools and businesses.

Post-pandemic, Zoom has expanded into a full communications platform with Zoom Phone, Zoom Rooms, and AI Companion features, aiming to be the operating system for the modern hybrid workplace.

- **🇺🇸 US:** Pro $13.33 · Business $21.99
- **Milestones:**
  - 2011: Founded
  - 2013: Public launch
  - 2019: IPO
  - 2020: 30x growth during pandemic
  - 2023: Zoom AI Companion launched

#### Dropbox Plus
- **Accent:** `#0061FF` · **HQ:** San Francisco, California · **Est.** 2007
- **Founders:** Drew Houston, Arash Ferdowsi · **CEO:** Drew Houston
- **Global users:** 700M+ Users · **Valuation:** $9 Billion · **Starting at:** $11.99/mo
- **Website:** https://www.dropbox.com/plans

Dropbox is a file hosting service that offers cloud storage, file synchronization, personal cloud, and client software. Dropbox Plus is the personal paid tier offering 2TB of storage, offline access, and advanced sharing controls.

Founded in 2007 by Drew Houston and Arash Ferdowsi, Dropbox popularized the concept of a 'magic folder' that syncs across devices. It was one of the first major successes of the Y Combinator startup accelerator.

While facing stiff competition from Google Drive and OneDrive, Dropbox has pivoted to focus on 'smart workspace' features, acquiring tools like HelloSign (e-signatures) and DocSend to facilitate document workflows for creative professionals and freelancers.

- **🇺🇸 US:** Plus $11.99 · Professional $24.99
- **Milestones:**
  - 2007: Y Combinator launch
  - 2011: Reached 50M users
  - 2018: IPO on NASDAQ
  - 2019: Acquired HelloSign
  - 2023: Dropbox Dash AI launched

---

### Gaming

#### Xbox Game Pass
- **Accent:** `#107C10` · **HQ:** Redmond, Washington · **Est.** 2017
- **Founders:** Microsoft (Phil Spencer) · **CEO:** Phil Spencer (Microsoft Gaming)
- **Global users:** 34M+ · **Valuation:** $3 Trillion (Microsoft) · **Starting at:** $16.99/mo · **Parent:** Microsoft
- **Website:** https://www.xbox.com/xbox-game-pass

Xbox Game Pass is widely considered the 'Netflix of video games'. Launched by Microsoft in 2017, it grants users access to a rotating catalog of over 100 high-quality games for a monthly fee. It fundamentally changed the gaming industry's business model from unit sales to recurring subscriptions.

A key differentiator for Game Pass is that all first-party Xbox titles (like Halo, Forza, and Starfield) launch on the service on day one. This aggressive strategy aims to lock users into the Xbox ecosystem across consoles, PC, and mobile via cloud streaming.

The service's value increased significantly with Microsoft's acquisition of ZeniMax Media (Bethesda) and Activision Blizzard. These acquisitions have brought massive franchises like 'Call of Duty', 'Fallout', and 'The Elder Scrolls' under the Game Pass umbrella.

- **🇺🇸 US:** Core $9.99 · Standard $14.99 · Ultimate $19.99
- **🇹🇷 TR:** Temel ₺179 · Standart ₺279 · Ultimate ₺449
- **Milestones:**
  - 2017: Service launched
  - 2019: Game Pass for PC launched
  - 2020: xCloud streaming added to Ultimate
  - 2021: Bethesda games added
  - 2023: Activision Blizzard acquisition completed

#### PlayStation Plus
- **Accent:** `#00439C` · **HQ:** San Mateo, California · **Est.** 2010
- **Founders:** Sony · **CEO:** Jim Ryan
- **Global users:** 47M+ · **Valuation:** $100 Billion (Sony) · **Starting at:** $9.99/mo · **Parent:** Sony
- **Website:** https://www.playstation.com/ps-plus/

PlayStation Plus is a subscription service by Sony Interactive Entertainment for PlayStation consoles. Originally launched in 2010 to provide free games and discounts, it is now required for online multiplayer gaming on PS4 and PS5.

In 2022, Sony revamped the service into three tiers: Essential, Extra, and Premium. The higher tiers offer a vast library of PS4 and PS5 games, as well as a catalog of classic titles from previous PlayStation generations, directly competing with Xbox Game Pass.

The service is integral to the PlayStation ecosystem, offering exclusive "PS Plus Collection" titles to PS5 owners and cloud streaming capabilities for older games, ensuring backward compatibility through the cloud.

- **🇺🇸 US:** Essential $9.99 · Extra $14.99 · Premium $17.99
- **🇹🇷 TR:** Temel ₺250 · Ekstra ₺370 · Premium ₺470
- **Milestones:**
  - 2010: Launched on PS3
  - 2013: Required for PS4 online multiplayer
  - 2020: PS Plus Collection for PS5
  - 2022: Relaunch with Extra/Premium tiers
  - 2023: Cloud streaming for PS5 games

#### Nintendo Switch Online
- **Accent:** `#E60012` · **HQ:** Kyoto, Japan · **Est.** 2018
- **Founders:** Nintendo · **CEO:** Shuntaro Furukawa
- **Global users:** 38M+ · **Valuation:** $80 Billion (Nintendo) · **Starting at:** $3.99/mo · **Parent:** Nintendo
- **Website:** https://www.nintendo.com/switch/online

Nintendo Switch Online is Nintendo's subscription service for the Switch console, launched in 2018. It enables online multiplayer for Nintendo games, provides a library of classic NES, SNES, N64, and Game Boy titles, and offers cloud save functionality.

The Expansion Pack tier adds Nintendo 64, Sega Genesis, and Game Boy Advance classics, plus DLC for select first-party games like Mario Kart 8 Deluxe and Splatoon. It's positioned as essential for the full Switch online experience.

With over 38 million subscribers, it's one of the most popular gaming subscriptions globally, capitalizing on Nintendo's massive library of beloved franchises like Mario, Zelda, and Pokémon.

- **🇺🇸 US:** Individual $3.99 · Family $34.99 *(Yearly)* · Expansion Pack $49.99 *(Yearly)*
- **🇹🇷 TR:** Bireysel ₺109.99 · Aile (Yıllık) ₺999 *(Yearly)*
- **Milestones:**
  - 2018: Service launched
  - 2019: SNES library added
  - 2021: Expansion Pack launched
  - 2022: Game Boy & GBA added
  - 2024: 38M subscribers

#### Twitch Turbo
- **Accent:** `#9146FF` · **HQ:** San Francisco, California · **Est.** 2011
- **Founders:** Justin Kan, Emmett Shear · **CEO:** Dan Clancy
- **Global users:** 140M MAU · **Valuation:** $15 Billion (Est) · **Starting at:** $11.99/mo · **Parent:** Amazon
- **Website:** https://www.twitch.tv/turbo

Twitch Turbo is a monthly subscription program offered exclusively on Twitch.tv. It provides an ad-free viewing experience across the entire site, which is a major selling point for heavy users who watch multiple streamers.

In addition to ad-free viewing, Turbo subscribers get a custom set of emoticons, expanded chat color options, and a priority badge in chat. It allows users to support the platform directly rather than subscribing to individual channels, although it does not provide the specific channel emotes that a channel sub does.

Founded in 2011 as a spin-off of Justin.tv, Twitch was acquired by Amazon in 2014 for $970 million. It dominates the live-streaming market, particularly for video games and esports.

- **🇺🇸 US:** Turbo $11.99
- **🇹🇷 TR:** Turbo ₺164.99
- **Milestones:**
  - 2011: Launched as Justin.tv spin-off
  - 2013: Twitch Turbo launched
  - 2014: Acquired by Amazon
  - 2016: Twitch Prime (now Prime Gaming) launched
  - 2023: Turbo price increased in some regions

---

### Community & Learning

#### Discord Nitro
- **Accent:** `#5865F2` · **HQ:** San Francisco, California · **Est.** 2015
- **Founders:** Jason Citron, Stan Vishnevskiy · **CEO:** Jason Citron
- **Global users:** 196M MAU · **Valuation:** $15 Billion · **Starting at:** $9.99/mo
- **Website:** https://discord.com/nitro

Discord Nitro is the premium subscription service for the popular chat app Discord. Unlike other social platforms that sell user data or serve ads, Discord's revenue model relies entirely on Nitro subscriptions. It offers users enhanced features like higher quality video streaming, larger file uploads, and custom emojis across all servers.

Discord was founded in 2015 as a VoIP tool for gamers but has since evolved into a general-purpose community platform used by crypto enthusiasts, study groups, and hobbyists. Nitro allows users to personalize their profiles with animated avatars and banners, serving as a status symbol within the community.

The service has two tiers: Nitro Basic and full Nitro. Full Nitro includes 2 Server Boosts, which help communities unlock perks for everyone in a specific server, fostering a communal support model.

- **🇺🇸 US:** Nitro Basic $2.99 · Nitro $9.99
- **🇹🇷 TR:** Nitro Temel ₺44.99 · Nitro ₺149.99
- **Milestones:**
  - 2015: Discord launch
  - 2017: Nitro subscription launched
  - 2020: Rebranding to 'Your Place to Talk'
  - 2021: Rejected $12B Microsoft acquisition offer
  - 2022: Nitro Basic tier introduced

#### Duolingo Super
- **Accent:** `#58CC02` · **HQ:** Pittsburgh, Pennsylvania · **Est.** 2011
- **Founders:** Luis von Ahn, Severin Hacker · **CEO:** Luis von Ahn
- **Global users:** 83M MAU · **Valuation:** $9 Billion · **Starting at:** $6.99/mo
- **Website:** https://www.duolingo.com/plus

Duolingo is the world's most popular language-learning platform. 'Super Duolingo' (formerly Duolingo Plus) is the premium subscription that removes ads, provides unlimited hearts (mistakes), and offers personalized practice sessions to review errors.

Founded in 2011 by Luis von Ahn (inventor of CAPTCHA) and Severin Hacker, the app uses gamification elements like streaks, leaderboards, and leagues to keep users engaged. Its mascot, Duo the Owl, has become a viral meme for its aggressive reminders to practice.

Duolingo has expanded beyond languages to include Math and Music courses, all within the same app. The company went public in 2021 and continues to use AI to customize lessons for each learner's proficiency level.

- **🇺🇸 US:** Super $6.99 · Max $13.99 · Family $9.99
- **🇹🇷 TR:** Super ₺209.99 · Aile ₺299.99
- **Milestones:**
  - 2011: Public beta launch
  - 2013: Apple App of the Year
  - 2017: Duolingo Plus launched
  - 2021: IPO on NASDAQ
  - 2023: Rebranded Plus to Super Duolingo

#### MasterClass
- **Accent:** `#181818` · **HQ:** San Francisco, California · **Est.** 2014
- **Founders:** David Rogier, Aaron Rasmussen · **CEO:** David Rogier
- **Global users:** 2M+ (Est) · **Valuation:** $2.75 Billion · **Starting at:** $15.00/mo
- **Website:** https://www.masterclass.com/subscribe

MasterClass is an online education subscription platform on which students can access tutorials and lectures pre-recorded by experts in various fields. From cooking with Gordon Ramsay to acting with Natalie Portman, it offers 'edutainment' with cinema-quality production values.

Founded in 2014, the platform differentiates itself through the celebrity status of its instructors. It sells an annual membership that unlocks access to the entire library of 180+ classes. It appeals to lifelong learners who want inspiration rather than just technical certification.

MasterClass has expanded into enterprise offerings, allowing companies to offer the service as a perk to employees. It represents a shift in online learning towards high-end, storytelling-driven content.

- **🇺🇸 US:** Individual $15.00 · Duo $20.00 · Family $23.00
- **Milestones:**
  - 2015: Launched with 3 instructors
  - 2018: Raised $80M Series D
  - 2020: Usage surged during pandemic
  - 2021: Valuation tripled to $2.75B
  - 2023: Launched 'Sessions' for hands-on learning

---

### Shopping & Local (Amazon Prime)

#### Amazon Prime
- **Accent:** `#00A8E1` · **HQ:** Seattle, Washington · **Est.** 2005
- **Founders:** Jeff Bezos · **CEO:** Andy Jassy (Amazon)
- **Global users:** 200M+ · **Valuation:** $2 Trillion (Amazon) · **Starting at:** $14.99/mo · **Parent:** Amazon
- **Website:** https://www.amazon.com/prime

Amazon Prime is a paid subscription service from Amazon that gives users access to a wide range of benefits, most notably free two-day (or faster) delivery on eligible items. It has become the gold standard for e-commerce loyalty programs.

Beyond shipping, Prime includes access to Prime Video, Amazon Music Prime, Prime Gaming, and exclusive deals during events like Prime Day. It serves as an ecosystem lock-in, encouraging members to shop almost exclusively on Amazon.

With over 200 million subscribers globally, Prime is a massive revenue driver for Amazon and a key part of its strategy to dominate retail and entertainment simultaneously.

- **🇺🇸 US:** Monthly $14.99 · Annual $139.00 *(Yearly)*
- **🇹🇷 TR:** Aylık ₺39.90 · Yıllık ₺399 *(Yearly)*
- **Milestones:**
  - 2005: Prime launched ($79/year)
  - 2011: Prime Video added
  - 2014: Price increased to $99
  - 2015: First Prime Day
  - 2021: Reached 200 million members

---

### Turkish Services (TR-only) 🇹🇷

> Priced in Turkish Lira only. Descriptions remain in Turkish as authored in the catalog.

#### Exxen
- **Accent:** `#FFD500` · **HQ:** İstanbul, Türkiye · **Est.** 2021
- **Founders:** Acun Ilıcalı · **CEO:** Acun Ilıcalı
- **Global users:** 2M+ (Türkiye) · **Starting at:** ₺99.99/ay
- **Website:** https://www.exxen.com/uyelik

Exxen, Acun Ilıcalı tarafından 2021 yılında kurulan Türkiye'nin popüler dijital yayın platformudur. Özel diziler, futbol maçları (Premier Lig, Avrupa kupaları), eğlence programları ve film içerikleri sunar. Kuruluş günü 33 bin abone ile rekor kırarak hızlı bir başlangıç yaptı.

Platform 'Survivor', 'O Ses Türkiye' gibi popüler programlarla Türk izleyici kitlesine güçlü bir alternatif olarak konumlandı. Yerli dizi yatırımlarıyla orijinal içerik üretiminde de Netflix Türkiye'ye rakip.

- **🇹🇷 TR:** Reklamlı ₺99.99 · Reklamsız ₺169.99 · Spor Paketi ₺299.99
- **Milestones:**
  - 2021: Platform lansmanı
  - 2021: İlk gün 33 bin abone
  - 2022: Premier Lig yayın hakları
  - 2023: Orijinal dizilerle büyüme
  - 2025: 2 milyon aktif abone

#### BluTV
- **Accent:** `#FF5C00` · **HQ:** İstanbul, Türkiye · **Est.** 2016
- **Founders:** Doğan Holding · **CEO:** Aydın Doğan Yalçındağ
- **Global users:** 1.5M+ (Türkiye) · **Starting at:** ₺89.90/ay
- **Website:** https://www.blutv.com/uyelik

BluTV, 2016 yılında Doğan Holding tarafından kurulan Türkiye'nin ilk yerli dijital yayın platformudur. Yerli ve yabancı diziler, filmler, belgeseller ve çocuk içerikleri sunan kapsamlı bir kütüphaneye sahiptir.

Platform 'Masum', 'Yeşilçam', 'Saygı' gibi başarılı orijinal yapımlarla bilinir. 2021 yılında Discovery Inc. tarafından satın alındı ve uluslararası içerik kütüphanesine de erişim sağladı.

- **🇹🇷 TR:** Aylık ₺89.90 · 3 Aylık ₺239.90 · Yıllık ₺799.90 *(Yearly)*
- **Milestones:**
  - 2016: Platform lansmanı
  - 2017: 'Masum' dizisi yayını
  - 2019: HBO işbirliği
  - 2021: Discovery tarafından satın alındı
  - 2024: 1.5 milyon abone

#### Tabii
- **Accent:** `#E30613` · **HQ:** Ankara, Türkiye · **Est.** 2023
- **Founders:** TRT · **CEO:** Mehmet Zahid Sobacı (TRT)
- **Global users:** Küresel · **Starting at:** Ücretsiz (Free)
- **Website:** https://www.tabii.com

Tabii, TRT'nin 2023 yılında küresel pazarı hedefleyerek başlattığı dijital yayın platformudur. Türk yapımı diziler, filmler, belgeseller ve haber içeriklerini dünya çapında 27 dilde sunar.

Platform 'Kuruluş Osman', 'Diriliş Ertuğrul' gibi büyük TRT yapımlarına yer veriyor. Devlet destekli olması nedeniyle uygun fiyatlı bir alternatif sunmaya odaklanır.

- **🇹🇷 TR:** Ücretsiz ₺0 · **🇺🇸 US:** Free $0
- **Milestones:**
  - 2023: Küresel lansman
  - 2024: 27 dil desteği
  - 2025: 100+ orijinal yapım

#### Trendyol Elite
- **Accent:** `#FF6600` · **HQ:** İstanbul, Türkiye · **Est.** 2021 (Elite)
- **Founders:** Demet Mutlu (Trendyol) · **CEO:** Çağlayan Çetin (Trendyol)
- **Global users:** 30M+ (Trendyol) · **Starting at:** ₺49.90/ay
- **Website:** https://elite.trendyol.com

Trendyol Elite, Türkiye'nin en büyük e-ticaret platformu Trendyol'un premium üyelik programıdır. Üyeler için ücretsiz hızlı teslimat, özel kampanyalar, Trendyol GO içeren bir abonelik servisidir.

2010 yılında Demet Mutlu tarafından kurulan Trendyol, Alibaba'nın stratejik ortaklığıyla büyüdü ve Türkiye'nin tek decacorn (10+ milyar $ değerli) şirketi oldu. Elite üyelik, sadık müşterilere ek avantajlar sunar.

- **🇹🇷 TR:** Aylık ₺49.90 · Yıllık ₺399 *(Yearly)*
- **Milestones:**
  - 2010: Trendyol kuruluşu
  - 2018: Alibaba yatırımı
  - 2021: Trendyol Elite lansmanı
  - 2022: Trendyol GO entegrasyonu
  - 2024: 30 milyon aktif kullanıcı

#### Hepsiburada Premium
- **Accent:** `#F68B1E` · **HQ:** İstanbul, Türkiye · **Est.** 2000 (HB), 2020 (Premium)
- **Founders:** Hanzade Doğan Boyner · **CEO:** Nilhan Onal Gökçetekin (Hepsiburada)
- **Global users:** 12M+ (HB) · **Starting at:** ₺59.90/ay
- **Website:** https://www.hepsiburada.com/premium

Hepsiburada Premium, Türkiye'nin önde gelen e-ticaret platformu Hepsiburada'nın sadakat programıdır. Üyeler için ücretsiz kargo, hızlı teslimat ve özel indirimler sunan abonelik tabanlı bir hizmettir.

2000 yılında Hanzade Doğan Boyner tarafından kurulan Hepsiburada, 2021'de NASDAQ'ta halka arz edilen ilk Türk teknoloji şirketi oldu. Premium, sadık müşteri tabanını güçlendirmek için tasarlandı.

- **🇹🇷 TR:** Aylık ₺59.90 · Yıllık ₺479 *(Yearly)*
- **Milestones:**
  - 2000: Hepsiburada kuruluşu
  - 2020: Premium programının lansmanı
  - 2021: NASDAQ halka arzı
  - 2023: HepsiJet ile entegrasyon

---

## 8. Implementation notes

- **Data source:** mirror `utils/data.ts → SUBSCRIPTION_CATALOG`. On native, ship it as a bundled
  JSON (`explore_catalog.json`) so the screen works offline; no network call needed for catalog
  content. Logos are the only remote asset.
- **Field mapping (per service):** `name`, `description`, `foundedYear`, `founders`, `ceo`,
  `headquarters`, `price`, `currency`, `type` (brand icon key), `netWorth`, `globalUserCount`,
  `parentCompany`, `website`, `milestones[]`, `regions.US.tiers[]`, `regions.TR.tiers[]`.
- **Hide-if-empty rule:** any field equal to `"Unknown"` or undefined is not rendered (matches web
  `SubscriptionProfileModal`).
- **Localization keys** (already exist in `utils/translations.ts`): `discover.title`,
  `discover.subtitle`, `discover.starting_at`, `discover.per_month`, `discover.ceo`,
  `discover.founders`, `discover.users`, `discover.valuation`, `discover.milestones`,
  `discover.visit_website`, `discover.est`, `discover.no_region`, `discover.us_pricing`,
  `discover.tr_pricing`, `discover.default_desc`. Reuse them on mobile — do not duplicate strings.
- **Brand icon / logo:** reuse the same logo resolution used on web (`getBrandLogo` by id) and the
  white/color variant logic from §4.2.
- **Accessibility:** cards are buttons with the service name as the accessibility label; the detail
  sheet supports VoiceOver reading order title → meta → price → description → stats → pricing →
  milestones.

---

*Catalog snapshot: 40 services. Editorial content and pricing pulled verbatim from the SubSense web
app `SUBSCRIPTION_CATALOG`. Keep this file in sync if the web catalog changes.*
