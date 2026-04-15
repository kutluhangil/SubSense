<div align="center">

<br />

<img src="https://img.shields.io/badge/SubSense-v1.0_Beta-6366f1?style=for-the-badge&logoColor=white" alt="version" />
<img src="https://img.shields.io/badge/Built_with-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
<img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="react" />
<img src="https://img.shields.io/badge/Firebase-12-ffca28?style=for-the-badge&logo=firebase&logoColor=black" alt="firebase" />
<img src="https://img.shields.io/badge/Gemini-1.5_Flash-4285f4?style=for-the-badge&logo=google&logoColor=white" alt="gemini" />
<img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="vercel" />

<br /><br />

```
  ███████╗██╗   ██╗██████╗ ███████╗███████╗███╗   ██╗███████╗███████╗
  ██╔════╝██║   ██║██╔══██╗██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝
  ███████╗██║   ██║██████╔╝███████╗█████╗  ██╔██╗ ██║███████╗█████╗
  ╚════██║██║   ██║██╔══██╗╚════██║██╔══╝  ██║╚██╗██║╚════██║██╔══╝
  ███████║╚██████╔╝██████╔╝███████║███████╗██║ ╚████║███████║███████╗
  ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝
```

### **The intelligent subscription tracker** — AI-powered insights that actually save you money.

[Live Demo](https://sub-sense-ashy.vercel.app) · [Report Bug](https://github.com/kutluhangil/SubSense/issues) · [Request Feature](https://github.com/kutluhangil/SubSense/issues)

</div>

---

## 🇹🇷 Türkçe Açıklama

**SubSense**, dijital aboneliklerinizi tek bir akıllı panelden yönetmenizi sağlayan modern bir takip uygulamasıdır. Google Gemini yapay zekası ile gereksiz harcamalarınızı tespit eder, 20'den fazla döviz birimini anlık olarak çevirir ve aboneliklerinizi global fiyatlarla karşılaştırarak size özel tasarruf fırsatları sunar. Kurulumu dakikalar içinde tamamlanır, verileriniz her zaman size aittir.

---

## ✦ What is SubSense?

**SubSense** is an AI-powered subscription manager that gives you a complete picture of every service draining your wallet — instantly. Add a subscription, get deep insights.

No spreadsheets. No guessing. Just real numbers, in your real currency, with AI telling you exactly what to cancel.

---

## ⚡ Features

| Feature | Description |
|--------|-------------|
| 🧠 **Gemini AI Insights** | Detects redundant subscriptions, estimates monthly savings, personalized suggestions |
| 🌍 **20+ Currencies** | Real-time conversion to your base currency — always accurate totals |
| 📊 **Smart Analytics** | Category breakdowns, billing cycle views, and spending timelines |
| 🔍 **Global Price Compare** | See if you're overpaying vs. worldwide averages for top services |
| 🔔 **Budget Alerts** | Notifications before you cross your monthly limit |
| 🧭 **Explore Catalog** | Curated catalog of popular services with rich descriptions |
| 💳 **Stripe Billing** | Built-in Free / Pro tiers with Stripe Checkout & Billing Portal |
| 🎨 **Premium UI** | Glassmorphic, dark-mode first, Framer Motion animations |
| 🔒 **Privacy First** | Your data stays in your Firebase — never sold, never shared |

---

## 🖼️ Screenshots

<div align="center">

| | |
|:---:|:---:|
| <img src="docs/screenshots/landing.png" width="100%" /> | <img src="docs/screenshots/explore.png" width="100%" /> |
| **Landing** — Hero & feature preview | **Explore** — Discover new services |
| <img src="docs/screenshots/dashboard.png" width="100%" /> | <img src="docs/screenshots/analytics.png" width="100%" /> |
| **Dashboard** — Manage every subscription | **Analytics** — Real spending insights |

</div>

---

## 🛠️ Tech Stack

```
Frontend          →  React 19 · TypeScript · Vite 6 · TailwindCSS · Framer Motion
Backend           →  Firebase Auth · Firestore · Cloud Functions (Node + Express)
AI                →  Google Gemini 1.5 Flash (REST API)
Payments          →  Stripe — Checkout · Billing Portal · Webhooks
Email             →  SendGrid via Cloud Functions
Icons             →  Lucide React · Google Material Icons
Deployment        →  Vercel · Docker · Nginx · Ubuntu Server
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- A Firebase project with **Auth** and **Firestore** enabled
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)

### Local Development

```bash
# Clone the repository
git clone https://github.com/kutluhangil/SubSense.git
cd SubSense

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# → Fill in your keys (see below)

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | ✅ |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key — enables AI insights | ✅ |

Create a `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_key_here
# ... rest of the Firebase vars
```

> Never commit `.env.local`. Already in `.gitignore`.

---

## ☁️ Deployment

The project supports two deployment paths out of the box.

### Option A — Vercel (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add all `VITE_*` environment variables under **Settings → Environment Variables**
4. Click **Deploy** — that's it.

Instant global CDN, automatic HTTPS, preview deployments on every PR.

### Option B — Self-Hosted (Docker + Nginx)

Full control on your own Ubuntu server. Docker Compose setup included.

```bash
# On your server
cd SubSense/server

# Build and launch
docker compose up -d --build

# Verify
docker compose ps
docker compose logs nginx --tail=20
```

Serves on port `3002` by default — configurable in `server/docker-compose.yml`.

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

The outer Nginx handles TLS termination and routing. The inner container serves the static Vite build with SPA fallback.

</details>

---

## 📐 Project Structure

```
SubSense/
├── components/           # React UI (Dashboard, Analytics, AI Assistant, …)
├── firebase/
│   └── firebase.ts       # Firebase initialization & singletons
├── functions/            # Cloud Functions (Node + Express)
│   └── src/
│       ├── index.ts      # Stripe + email handlers
│       └── app.ts        # Express API router
├── hooks/                # Custom React hooks (useAchievements, …)
├── utils/                # Core services
│   ├── gemini.ts         # Gemini AI integration
│   ├── currency.ts       # Multi-currency conversion
│   ├── firestore.ts      # Firestore data layer
│   └── stripe.ts         # Stripe client service
├── server/               # Self-hosting config
│   ├── Dockerfile        # Multi-stage build (Node → Nginx)
│   ├── docker-compose.yml
│   └── nginx/            # Nginx configs (SPA + proxy)
├── public/               # Static assets, brand logos
└── docs/
    └── screenshots/      # README screenshots
```

---

## 🔌 Core Services

| Service | Purpose |
|---------|---------|
| **`utils/gemini.ts`** | Builds sanitized payloads and calls the Gemini REST API for AI insights |
| **`utils/currency.ts`** | 20+ currency metadata and conversion logic |
| **`utils/firestore.ts`** | All Firestore reads/writes for subscriptions and profiles |
| **`utils/stripe.ts`** | Client-side Stripe session creation via Firebase Callable Functions |
| **`functions/src/index.ts`** | Server-side Stripe webhook handler, email sender, user search |

---

## 📊 How It Works

### AI Optimization Flow
1. User subscriptions are **validated** and **sanitized** (PII removed)
2. All prices **converted** to base currency for fair comparison
3. Sent to **Gemini 1.5 Flash** with a strict prompt schema
4. Response is parsed into typed `AIInsight` objects
5. Cached in memory for the session — no re-fetching

### Multi-Currency Engine
Every subscription keeps its original currency. Totals are computed on-the-fly using the user's selected base currency. Conversion rates are cached per session for performance.

### Privacy Model
All user data lives in **your own Firebase project** under Firestore rules. SubSense never sees, stores, or transmits subscription data outside your Firebase — except sanitized payloads sent to Gemini for AI analysis.

---

## 🗺️ Roadmap

| Status | Feature |
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

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

<br />

Built with ❤️ by [**Kutluhan Gil**](https://github.com/kutluhangil)

<br />

*If you find this useful, consider giving it a ⭐*

<br />

</div>
