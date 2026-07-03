# SubSense — 12-Month Marketing Plan (AARRR)

> fCMO-style growth plan. Stage: **pre-revenue beta, bootstrapped, solo founder**. Category: **B2C consumer subscription tracker, TR-first** (EN/TR). Stack: React/Vite + Firebase + Vercel + Stripe + Gemini AI. Generated 2026-06 — revise as context changes.

## 1. Executive summary

SubSense is a free, privacy-friendly subscription tracker with three assets most competitors lack: (1) a **curated, current TR + global price database** for ~48 services, (2) **AI insights** (Gemini) incl. a hidden-price-hike detector, and (3) a **social layer** (friends, shared subscriptions). The fastest path to growth is **not paid** (no budget) — it's turning the price database into an SEO engine and the product into its own distribution.

**3 big bets (12 months):**
1. **Programmatic SEO off the TR price DB** — Turks constantly search "Netflix fiyat 2026", "Spotify ne kadar". We own the answer. Build a public `/fiyatlar/{servis}` page per brand → organic top-of-funnel that feeds signups. (Acquisition)
2. **Product-led virality** — "SubSense Wrapped" shareable annual recap + referral program on the existing Friends feature. (Referral)
3. **A real launch moment** — Product Hunt + Turkish communities (ekşisözlük, r/turkey, Reddit personal finance). (Acquisition)

**90-day priority:** ship the SEO price pages + sitemap, instrument analytics, and run the launch. **12-month outcome:** a compounding organic channel (price pages ranking) + a repeatable viral loop, with first paid experiments only after a budget unlocks.

## 2. Strategic frame

- **Category claim:** "The free tracker that tells you what every subscription *actually* costs in Turkey — and when it quietly gets more expensive."
- **ICP:** TR consumer, 18–35, 3–10 active subscriptions, price-sensitive (lives through constant zam), mobile-first, googles prices before subscribing. Secondary: global EN users wanting multi-currency tracking.
- **Business-model logic:** Free tracking is the wedge; Pro (AI insights, advanced analytics) monetizes power users. Low ARPC, high volume → growth must be near-zero-CAC (organic + viral), not paid.
- **Brand voice:** plain, useful, slightly anti-corporate ("paranı nereye gidiyor, dürüstçe"). No hype. Numbers over adjectives.

## 3. Current state (scored from materials)

| Area | Score /5 | Note |
|---|---|---|
| Product | 4 | Feature-rich, polished, PWA, i18n, dark mode, AI live |
| Positioning | 2 | No public positioning/landing copy tied to TR price pain yet |
| Acquisition | 1 | No active channel, no launch, no SEO surface |
| Activation | 3 | Onboarding exists; first-run + empty states decent |
| Retention | 3 | Email reminders + price-hike detector live (Resend) |
| Referral | 2 | Friends backend exists; no referral incentive yet |
| Revenue | 2 | Stripe + Pro exist; no paywall optimization/pricing test |
| Analytics | 1 | **CAC/funnel instrumentation unknown — top open decision** |

**Phase of growth:** pre-$10K ARR ("grueling" zone). Binding constraint: **awareness** (nobody knows it exists). Everything else is secondary until there's traffic.

## 4. Acquisition (strangers → aware)

**Now (0–90d, $0):**
- **Programmatic SEO price pages (#4)** — public `/fiyatlar/{servis}` per catalog brand: TR plans + global comparison + "did you know" facts + JSON-LD Offer + CTA to app. Sitemap + internal linking. *This is the flagship move — build first.* Skills: `programmatic-seo`, `ai-seo`, `schema`.
- **Launch (#78, #38)** — Product Hunt + ekşisözlük entry + r/turkey + Reddit r/personalfinance + Turkish tech Discords. Skill: `launch`.
- **Free tool (#15)** — public "hangi ülkede ucuz" regional price comparator (open version of Compare screen) → backlinks + shares. Skill: `free-tools`.
- **Directory submissions (#123)** — list on AlternativeTo, SaaSHub, Turkish startup directories → backlinks + DR. Skill: `directory-submissions`.

**Q2–Q4 (planned):** content/blog ("2026 abonelik zam takvimi", year-in-review), comparison pages vs. manual tracking / spreadsheets, short-form video (TikTok/Reels: "aboneliklerine ayda ne kadar veriyorsun").

**Skipped (with reason):** Paid ads (no budget pre-revenue); LinkedIn/B2B (wrong audience — this is B2C consumer); conferences/PR firm (scale-stage).

## 5. Activation (aware → first valued experience)

- North-star activation event: **user adds ≥1 subscription within first session.**
- Moves: pre-fill the add flow from the price DB (done — templates); "add your first 3 in 30s" onboarding; empty-state that auto-suggests popular TR services; instant "you'll spend ₺X/year" payoff after first add. Skills: `onboarding`, `signup`.
- Open: measure signup→first-sub conversion (needs analytics).

## 6. Retention (stays & deepens)

- Live: 3-day renewal email reminders (Resend), weekly price-sync + hidden-hike detector. 
- Add: monthly "harcama karnesi" email (you spent ₺X, +%Y vs last month); push for upcoming renewals; win-back for dormant users. Skills: `emails`, `churn-prevention`.
- Retention hook unique to SubSense: **"X servisin zam yaptı"** alerts — high-value, re-engaging, shareable.

## 7. Referral (retained → bring more)

- **Referral program on Friends (#93)** — "arkadaşını davet et → 1 ay Pro." Backend (friends CFs) already exists; add invite link + reward. Skill: `referrals`.
- **SubSense Wrapped (#103)** — year/era recap with a shareable image card ("2026'da aboneliklere ₺X harcadın") → organic WOM. Skill: `image`/`social`.
- Shared-subscription invites (split-the-bill) naturally pull in friends.

## 8. Revenue (monetization)

- Today: Free + Pro (Stripe). 
- Moves: define Pro value crisply (AI insights, unlimited, advanced analytics, Wrapped); add an in-app paywall at the AI-insight moment; test annual vs monthly; TR price localization for Pro (USD pricing kills TR conversion — price Pro in TRY). Skills: `pricing`, `paywalls`.
- Open decision: **Pro price point in TRY** (Van Westendorp / willingness-to-pay test).

## 9. 90-day roadmap (AARRR-tagged, owner = founder)

- **Weeks 1–2 (Unblock):** wire analytics (GA4 or Plausible) + funnel events [Activation]; finalize positioning/landing copy tied to TR price pain [Acquisition].
- **Weeks 3–4 (Foundation):** ship programmatic SEO price pages + sitemap + JSON-LD [Acquisition]; submit to directories.
- **Weeks 5–8 (Velocity):** Product Hunt + TR community launch [Acquisition]; monthly spending-report email [Retention]; referral program on Friends [Referral].
- **Weeks 9–12 (Compound):** SubSense Wrapped MVP [Referral]; paywall + TRY Pro pricing test [Revenue]; first content piece ("2026 abonelik zam takvimi") [Acquisition].

## 10. 12-month outlook (funding-gated)

- **Bootstrapped (now):** organic only — SEO pages compounding, launch traffic, viral loops. Target: first thousands of organic visitors/mo from price pages.
- **Seed close (~$15K/mo unlocks):** first paid tests (Google Ads on "abonelik takip" + retargeting), first contractor (content/SEO). 
- **Seed deployment ($50K/mo):** scale paid + content engine + short-form video production.
- Honest shape: **linear growth punctuated by step-functions** (launch spike, an SEO page hitting page 1, Wrapped season). Not a hockey stick.

## 11. Marketing operations stack (skills + tooling per stage)

| Stage | Skills | Tooling/MCP |
|---|---|---|
| Acquisition | `programmatic-seo`, `ai-seo`, `schema`, `launch`, `free-tools`, `directory-submissions` | Vercel (host pages), Search Console, the agent (builds pages) |
| Activation | `onboarding`, `signup` | GA4/Plausible, Firebase |
| Retention | `emails`, `churn-prevention` | Resend (live), Firebase scheduled fns (live) |
| Referral | `referrals`, `image`, `social` | Friends CFs (live), Stripe (Pro reward) |
| Revenue | `pricing`, `paywalls` | Stripe (live) |

**Leverage:** a solo founder + this skill library + the coding agent can output the work of a small marketing team — the agent *builds* the SEO pages, Wrapped, referral mechanics, and emails, not just advises.

## 12. Tactical idea bank (top picks tagged)

| # | Idea | AARRR | Status |
|---|---|---|---|
| 4 | Programmatic SEO (price pages) | Acq | **Now** |
| 15 | Engineering as marketing (free comparator) | Acq | Now |
| 78 | Product Hunt launch | Acq | Now |
| 38 | Reddit / community marketing | Acq | Now |
| 123 | Directory submissions | Acq | Now |
| 93 | Viral loop / referral | Ref | Now |
| 103 | Year wrap (Wrapped) | Ref | Q2 |
| 11 | Comparison pages (vs spreadsheet) | Acq | Q2 |
| 49 | Monthly report email | Ret | Q2 |
| 91 | In-app upsell / paywall | Rev | Q2 |
| 31 | Google Ads | Acq | Q3+ (budget) |
| 131 | International expansion | Acq | Q4+ |
| 28 | LinkedIn Ads | — | **Skip** (B2C, wrong audience) |
| 72 | Conference sponsorship | — | **Skip** (scale-stage) |

## 13. Measurement, open decisions

- **North-star metric:** weekly active users tracking ≥1 subscription.
- **Leading indicators:** organic sessions (price pages), signup→first-sub rate, D7 retention, referral invites sent, Pro conversion.
- **Open decisions (must resolve):**
  1. **CAC unknown** — no funnel analytics yet. Highest-impact gap; every revenue projection depends on it. → wire analytics week 1.
  2. **Pro price in TRY** — currently USD-billed Pro? Localize to TRY or lose TR conversion.
  3. **Budget/runway** — confirm $/mo available; plan assumes ~$0 paid until a round.
  4. **GA timeline** — when does beta → GA (affects launch timing).

---
*Deeper execution per stage lives in the channel skills (`programmatic-seo`, `launch`, `referrals`, `pricing`, `emails`). This plan sequences them.*
