<div align="center">

<img src="docs/media/hero.svg" alt="SubSense — a free subscription tracker for web, Mac and Android" width="100%">

<p>
  <a href="https://sub-sense-ashy.vercel.app"><img alt="Live" src="https://img.shields.io/badge/live-open%20SubSense-3ddc97?style=for-the-badge&labelColor=06100c"></a>
  <a href="https://sub-sense-ashy.vercel.app/fiyatlar"><img alt="Price pages" src="https://img.shields.io/badge/price%20pages-%2Ffiyatlar-ffb547?style=for-the-badge&labelColor=06100c"></a>
  <img alt="Platforms" src="https://img.shields.io/badge/web%20%C2%B7%20mac%20%C2%B7%20android-one%20codebase-7aa7ff?style=for-the-badge&labelColor=06100c">
  <img alt="Price" src="https://img.shields.io/badge/price-free%2C%20forever-3ddc97?style=for-the-badge&labelColor=06100c">
</p>

<p><em>A free subscription tracker: what you pay, when it renews and which price just went up.<br>
No ads, no paid tier, and it works without an account.</em></p>

</div>

<img src="docs/media/divider.svg" width="100%" alt="">

## What it is

SubSense keeps every recurring charge in one place. It shows your real monthly and yearly spend, reminds you before renewals, and flags price increases so they never slip by quietly. The same interface runs on the web, as a macOS menu bar app and as an Android app.

<img src="docs/media/divider.svg" width="100%" alt="">

## What's inside

| | |
|---|---|
| **Overview** | Monthly and yearly totals, upcoming charges and budget alerts at a glance. |
| **Subscriptions** | Search, filter and edit every plan with price, cycle, currency and next charge. |
| **Calendar** | A month view of renewals, day by day. |
| **Insights** | Category breakdowns and overlapping services you might not need. |
| **Discover** | Service profiles with current Turkish and US prices. |
| **Price radar** | Catalogue prices update automatically, and price hikes on your plans are highlighted. |
| **Wrapped** | A year-in-review of your subscriptions, made to share. |
| **/fiyatlar** | Static, SEO-friendly price pages for popular services, generated at build time. |
| **Reminders** | Local notifications on Mac and Android, no server needed. |
| **Sync, if you want it** | Optional Google sign-in with Firebase; skip it and everything stays on your device. |

<img src="docs/media/divider.svg" width="100%" alt="">

## One UI, three shells

```mermaid
flowchart LR
  WEB[apps/web<br/>Vite 6 · React 19 · Tailwind 4 · zustand] --> V[Vercel<br/>web + /fiyatlar pages]
  WEB --> T[apps/desktop<br/>Tauri 2 · menu bar · notifications]
  WEB --> C[apps/android<br/>Capacitor 6 · widget · notifications]
  WEB <--> FB[(Firebase<br/>Auth + Firestore · optional)]
```

There is no server of its own: the web build is static, and data lives on the device or, when you opt in, in Firestore.

<img src="docs/media/divider.svg" width="100%" alt="">

## Türkçe özet

**SubSense**, ücretsiz bir abonelik takipçisi: ne ödediğini, ne zaman yenilendiğini ve hangi fiyatın arttığını gösteriyor. Reklam yok, ücretli sürüm yok, hesap açmadan da çalışıyor. Aynı arayüz web'de, Mac'te menü çubuğu uygulaması olarak ve Android'de çalışıyor. Takvim, harcama analizleri, yıllık "Wrapped" özeti, otomatik güncellenen fiyat kataloğu ve popüler servisler için `/fiyatlar` sayfaları var.

<img src="docs/media/divider.svg" width="100%" alt="">

## Development

```sh
cd apps/web
npm install
npm run dev            # http://localhost:5180
npm test               # vitest
npm run build          # typecheck + build + /fiyatlar pages, sitemap, robots
npm run android:apk    # debug APK
cd ../desktop && npm run build   # macOS app
```

```
apps/web/       the whole interface: pages, core data and store, UI kit
apps/desktop/   macOS shell (Tauri 2)
apps/android/   Android shell (Capacitor 6)
docs/           plan, image prompts, marketing notes
```

Pushing to `main` deploys `apps/web` on Vercel.

<div align="center">
<br>
<a href="https://github.com/kutluhangil"><img src="docs/media/signature.svg" width="100%" alt="Built by kutluhangil"></a>
<sub>Know what you pay. Keep what you save.</sub>
</div>
