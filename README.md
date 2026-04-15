<div align="center">

<br />

# SubSense

**The Intelligent Subscription Tracker**

<p>
AI-powered subscription management that actually saves you money.<br />
Track everything, see your real total, cancel what's wasting you.
</p>

<br />

<p>
  <a href="https://sub-sense-ashy.vercel.app"><b>→ Try the Live Demo</b></a>
</p>

<br />

<p>
  <img src="https://img.shields.io/badge/React-19-000?style=flat&labelColor=000&color=222" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-000?style=flat&labelColor=000&color=222" />
  <img src="https://img.shields.io/badge/Vite-6-000?style=flat&labelColor=000&color=222" />
  <img src="https://img.shields.io/badge/Firebase-12-000?style=flat&labelColor=000&color=222" />
  <img src="https://img.shields.io/badge/Gemini-1.5_Flash-000?style=flat&labelColor=000&color=222" />
  <img src="https://img.shields.io/badge/Stripe-enabled-000?style=flat&labelColor=000&color=222" />
</p>

<br />

<img src="docs/screenshots/landing.png" alt="SubSense Landing" width="100%" />

<br /><br />

</div>

---

<br />

## Türkçe Açıklama

> **SubSense**, dijital aboneliklerinizi tek bir akıllı panelden yönetmenizi sağlayan modern bir takip uygulamasıdır. Google Gemini yapay zekası ile gereksiz harcamalarınızı tespit eder, 20'den fazla döviz birimini anlık olarak çevirir ve aboneliklerinizi global fiyatlarla karşılaştırarak size özel tasarruf fırsatları sunar. Kurulumu dakikalar içinde tamamlanır, verileriniz her zaman size aittir.

<br />

## The Problem

Most people genuinely don't know how much they spend on subscriptions each month.

Trials get forgotten. Prices silently creep up. Two services do the same thing and nobody notices. By the time you check your statement, hundreds of dollars have slipped away quietly.

**SubSense solves this.** One dashboard. Real totals in your currency. AI that tells you exactly what to cancel and how much you'll save.

<br />

## Preview

<div align="center">

| | |
|:---:|:---:|
| <img src="docs/screenshots/explore.png" width="100%" /> | <img src="docs/screenshots/dashboard.png" width="100%" /> |
| **Explore** — Discover subscriptions | **Dashboard** — Manage everything |
| <img src="docs/screenshots/analytics.png" width="100%" /> | <img src="docs/screenshots/landing.png" width="100%" /> |
| **Analytics** — Spending insights | **Landing** — Clean, fast, focused |

</div>

<br />

## Features

|  | Feature | What it does |
|---|---|---|
| ◆ | **Gemini AI Insights** | Detects redundant subs and estimates real monthly savings |
| ◆ | **20+ Currencies** | Real-time conversion to your preferred base currency |
| ◆ | **Smart Analytics** | Spend by category, cycle, and timeline — at a glance |
| ◆ | **Global Price Compare** | See if you're overpaying vs. worldwide averages |
| ◆ | **Budget Alerts** | Notifications before you hit your monthly limit |
| ◆ | **Explore Catalog** | Curated list of popular services with rich details |
| ◆ | **Premium UI** | Glassmorphic, dark-mode first, fluid animations |
| ◆ | **Privacy First** | Your data lives in your Firebase — never sold, never shared |

<br />

## Tech Stack

|  | |
|---|---|
| **Frontend** | React 19 · TypeScript 5.8 · Vite 6 · TailwindCSS · Framer Motion |
| **Backend** | Firebase Auth · Firestore · Cloud Functions (Node + Express) |
| **AI** | Google Gemini 1.5 Flash (REST) |
| **Payments** | Stripe (Checkout · Billing Portal · Webhooks) |
| **Email** | SendGrid via Cloud Functions |
| **Hosting** | Vercel · Docker · Nginx · Ubuntu Server |

<br />

## Quick Start

Get the app running locally in under two minutes.

```bash
# Clone
git clone https://github.com/your-username/SubSense.git
cd SubSense

# Install
npm install

# Configure environment
cp .env.example .env.local
# Fill in keys — see below

# Launch
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

<br />

### Environment

Required keys in `.env.local`:

```env
# Firebase — from Project Settings → General
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Gemini — https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=
```

> Never commit `.env.local`. Already ignored by git.

<br />

## Deployment

<table>
<tr>
<td width="50%" valign="top">

### Vercel

Recommended for most users. Zero-config after the first setup.

```bash
npm run build
```

Push the repo to GitHub → connect it in Vercel → add env vars under **Settings → Environment Variables** → deploy.

Instant global CDN, automatic HTTPS, preview deployments on every PR.

</td>
<td width="50%" valign="top">

### Self-Hosted

Included Docker setup for Ubuntu / any Linux host.

```bash
cd server
docker compose up -d --build
```

Serves on port `3002` by default, configurable in `docker-compose.yml`. Multi-stage build keeps the image lean.

Full control, unlimited scale, fixed monthly cost.

</td>
</tr>
</table>

<details>
<summary><b>Architecture diagram</b></summary>

<br />

```
┌─────────────────────────────────────────────┐
│                 Host Server                 │
│                                             │
│   ┌──────────────┐      ┌────────────────┐  │
│   │ Nginx Proxy  │      │  Frontend      │  │
│   │ :3002 → :80  │ ───▶ │  (Vite build)  │  │
│   │              │      │  Nginx :3000   │  │
│   └──────────────┘      └────────────────┘  │
│                                             │
│      subsense_net (Docker bridge)           │
└─────────────────────────────────────────────┘
```

Outer Nginx handles TLS and routing. Inner container serves the static Vite build with SPA fallback.

</details>

<br />

## Project Structure

```
SubSense/
├── components/        React UI components (Dashboard, Analytics, AI, …)
├── firebase/          Firebase initialization & exports
├── functions/         Cloud Functions — Stripe, email, Express API
├── hooks/             Custom React hooks
├── utils/             Services — Gemini, currency, Firestore, Stripe
├── server/            Docker + Nginx self-hosting config
└── public/            Static assets & brand logos
```

<br />

## Roadmap

|  | Feature |
|:-:|---|
| ✅ | Core subscription tracking |
| ✅ | Multi-currency conversion (20+) |
| ✅ | Gemini AI optimization insights |
| ✅ | Analytics dashboard |
| ✅ | Stripe billing — Free & Pro tiers |
| ✅ | Explore & discover catalog |
| ✅ | Self-hosted Docker deployment |
| 🔄 | Friends & social sharing |
| 🔄 | Real-time exchange rates |
| ○ | React Native mobile app |
| ○ | CSV & Apple Wallet import |
| ○ | Renewal push notifications |

<sub>✅ Shipped &nbsp; · &nbsp; 🔄 In progress &nbsp; · &nbsp; ○ Planned</sub>

<br />

## Contributing

PRs are welcome. Keep them focused on a single concern.

```bash
git checkout -b feature/your-feature
git commit -m "feat: short description"
git push origin feature/your-feature
```

Then open a pull request.

<br />

## License

**MIT.** See [`LICENSE`](LICENSE).

<br />

---

<div align="center">

<br />

<sub>Built with focus, coffee, and a healthy distrust of surprise subscription charges.</sub>

<br /><br />

<a href="https://sub-sense-ashy.vercel.app"><b>subsense.app</b></a>

<br /><br />

</div>
