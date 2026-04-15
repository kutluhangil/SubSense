<div align="center">

<br />

<img src="public/logo.png" alt="SubSense Logo" width="72" height="72" />

<h1>SubSense</h1>

<p><strong>The Intelligent Subscription Tracker</strong></p>

<p>
  <a href="https://sub-sense-ashy.vercel.app">🌐 Live App</a> &nbsp;·&nbsp;
  <a href="#-getting-started">Quick Start</a> &nbsp;·&nbsp;
  <a href="#-features">Features</a> &nbsp;·&nbsp;
  <a href="#-tech-stack">Tech Stack</a> &nbsp;·&nbsp;
  <a href="#-deployment">Deploy</a>
</p>

<br />

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-Beta-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" />
</p>

<br />

---

### 🇹🇷 Türkçe Açıklama

**SubSense**, dijital aboneliklerinizi tek ekrandan takip etmenizi, analiz etmenizi ve optimize etmenizi sağlayan akıllı bir abonelik yönetim uygulamasıdır. Google Gemini yapay zekası ile gereksiz harcamaları tespit eder, 20'den fazla döviz birimini anlık olarak çevirir ve aboneliklerinizi global fiyatlarla karşılaştırarak tasarruf fırsatlarını gün yüzüne çıkarır. Tamamen ücretsiz başlayabilir, verileriniz güvende kalır.

---

</div>

<br />

## Overview

Most people have no idea how much they're spending on subscriptions each month. Services pile up silently — a forgotten trial here, a price hike there — and before you know it, hundreds of dollars are quietly leaving your account. **SubSense** puts you back in control.

Track every subscription in one place. Understand your real spending in your own currency. Let AI tell you exactly where you're wasting money. Simple.

<br />

## Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="docs/screenshots/landing.png" alt="Landing Page" width="480" />
        <br /><sub><b>Landing — Hero & Features</b></sub>
      </td>
      <td align="center">
        <img src="docs/screenshots/explore.png" alt="Explore Subscriptions" width="480" />
        <br /><sub><b>Explore — Discover New Services</b></sub>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="480" />
        <br /><sub><b>Dashboard — Subscription Overview</b></sub>
      </td>
      <td align="center">
        <img src="docs/screenshots/analytics.png" alt="Analytics" width="480" />
        <br /><sub><b>Analytics — Spend Breakdown</b></sub>
      </td>
    </tr>
  </table>
</div>

<br />

## Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🧠 Gemini AI Insights</h3>
      Powered by Google Gemini 1.5 Flash. Detects redundant subscriptions, identifies optimization opportunities, and calculates estimated savings — all personalized to your actual usage.
    </td>
    <td width="50%" valign="top">
      <h3>🌍 Multi-Currency Support</h3>
      Track subscriptions in 20+ currencies simultaneously. Real-time conversion ensures your monthly totals are always accurate in your preferred base currency.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>📊 Analytics Dashboard</h3>
      Visualize your spending by category, billing cycle, and over time. Spot trends before they become problems. Monthly and annual breakdowns at a glance.
    </td>
    <td width="50%" valign="top">
      <h3>🔍 Global Price Compare</h3>
      Compare what you pay against global averages and regional pricing for popular services. Find out if you're overpaying — and by how much.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔔 Budget Alerts</h3>
      Set monthly spending limits and get notified when you're approaching them. Never get blindsided by unexpected charges again.
    </td>
    <td width="50%" valign="top">
      <h3>🧭 Explore & Discover</h3>
      Browse a curated catalog of popular subscription services with rich descriptions. Discover alternatives and new tools tailored to your digital lifestyle.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🎨 Premium UI & Dark Mode</h3>
      Glassmorphic design with smooth Framer Motion animations. Full dark mode support. Responsive across all screen sizes.
    </td>
    <td width="50%" valign="top">
      <h3>🔒 Privacy First</h3>
      Your subscription data lives in your Firebase account — not sold, not shared. Auth is handled by Firebase, no passwords stored by us.
    </td>
  </tr>
</table>

<br />

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 5.8, Vite 6 |
| **Styling** | TailwindCSS, Framer Motion |
| **Auth & DB** | Firebase Auth, Firestore |
| **Backend** | Firebase Cloud Functions (Node.js + Express) |
| **AI** | Google Gemini 1.5 Flash |
| **Payments** | Stripe (Checkout + Billing Portal + Webhooks) |
| **Email** | SendGrid (via Cloud Functions) |
| **Deployment** | Vercel (frontend) · Docker + Nginx (self-hosted) |
| **Icons** | Lucide React, Google Material Icons |

<br />

## Getting Started

### Prerequisites

- Node.js v18+
- A Firebase project (Auth + Firestore enabled)
- A Gemini API key — [Get one here](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/SubSense.git
cd SubSense

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# → Fill in your keys (see Environment Variables section below)

# 4. Start the dev server
npm run dev
# → Open http://localhost:5173
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# AI
VITE_GEMINI_API_KEY=
```

> **Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

<br />

## Deployment

### Option A — Vercel (Recommended)

The fastest way to get production-ready:

```bash
npm run build   # Verify the build passes locally first
```

Then connect the repo to Vercel and add the environment variables under **Settings → Environment Variables**. Vercel handles the rest.

### Option B — Self-Hosted (Docker + Nginx)

Deploy to your own server using the included Docker setup:

```bash
# On your Ubuntu server
cd SubSense/server

# Build and start all containers
docker compose up -d --build

# Check status
docker compose ps
docker compose logs nginx --tail=20
```

The app will be available on the port configured in `server/docker-compose.yml` (default: `3002`).

<details>
<summary><b>Docker Architecture</b></summary>

```
┌─────────────────────────────────────────┐
│              Host Server                │
│                                         │
│  ┌──────────────┐   ┌────────────────┐  │
│  │  Nginx Proxy │   │ Frontend       │  │
│  │  :3002 → :80 │──▶│ (Vite build)   │  │
│  │              │   │ Nginx :3000    │  │
│  └──────────────┘   └────────────────┘  │
│                                         │
│  subsense_net (Docker bridge network)   │
└─────────────────────────────────────────┘
```

</details>

<br />

## Project Structure

```
SubSense/
├── components/          # All React UI components
│   ├── Dashboard.tsx    # Main app dashboard
│   ├── Analytics.tsx    # Spending analytics & charts
│   ├── AIAssistant.tsx  # Gemini AI chat interface
│   ├── Explore.tsx      # Subscription discovery
│   ├── Friends.tsx      # Social features (coming soon)
│   └── ...
├── firebase/
│   └── firebase.ts      # Firebase initialization & exports
├── functions/           # Firebase Cloud Functions (backend)
│   └── src/
│       ├── index.ts     # Stripe + email functions
│       └── app.ts       # Express API router
├── hooks/               # Custom React hooks
├── utils/               # Services & helpers
│   ├── gemini.ts        # Gemini AI integration
│   ├── currency.ts      # Multi-currency conversion
│   ├── firestore.ts     # Firestore data layer
│   └── stripe.ts        # Stripe client service
├── server/              # Self-hosting configuration
│   ├── Dockerfile       # Multi-stage build (Node → Nginx)
│   ├── docker-compose.yml
│   └── nginx/           # Nginx configs
└── public/              # Static assets & brand logos
```

<br />

## Roadmap

- [x] Core subscription tracking
- [x] Multi-currency conversion
- [x] Gemini AI optimization insights
- [x] Analytics dashboard
- [x] Stripe subscription (Free / Pro)
- [x] Explore & discover catalog
- [x] Self-hosted Docker deployment
- [ ] Friends & social sharing (Beta blocked)
- [ ] Real-time exchange rates
- [ ] Mobile app (React Native)
- [ ] CSV / Apple Wallet import
- [ ] Renewal push notifications

<br />

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please follow the existing code style and keep PRs focused on a single concern.

<br />

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

<br />

---

<div align="center">

<br />

Built with focus, coffee, and a healthy distrust of surprise subscription charges.

<br />

<a href="https://sub-sense-ashy.vercel.app"><strong>subsense.app →</strong></a>

<br /><br />

</div>
