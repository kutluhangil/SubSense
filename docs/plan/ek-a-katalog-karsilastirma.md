# Abonelik kataloğu karşılaştırması: WEB (SubSense / Aboneyim) ve ANDROID (SubSense-AndroidApp)

Tarih: 2026-11-10 · Salt okuma incelemesi, iki repoda da dosya değiştirilmedi.
Veri, kaynak TS dosyalarının tsx ile çalıştırılıp JSON'a dökülmesiyle çıkarıldı (elle kopyalama yok). Yeniden üretmek için scratchpad'deki `dump.ts` ve `compare.js` dosyalarını çalıştırmak yeter.

## 1. Her proje kataloğu nasıl modelliyor

### WEB (`/Volumes/ProjectClaude/SubSense`)
| Kaynak | Ne tutuyor |
|---|---|
| `utils/data.ts` → `SUBSCRIPTION_CATALOG: Record<id, SubscriptionDetail>` | **Ana katalog, 47 servis.** `price` (string, varsayılan para birimi), `currency`, `type` (logo/renk anahtarı), `regions.US/TR = { currency, tiers: [{ name, nameLocalized?, price, cycle }] }` ve editoryal alanlar (description, ceo, milestones…). |
| `utils/data.ts` → `SUBSCRIPTION_CATEGORIES` / `ALL_SUBSCRIPTIONS` | Arama listesi: 7 kategoride 64 ad. **Kategori yalnızca burada var**, katalog kaydında kategori alanı yok. Buradaki 23 ad katalogda yok. |
| `utils/data.ts` → `BRAND_COLORS` | Renkler; anahtar olarak ad küçük harfe çevrilip boşlukları silinmiş hali kullanılıyor. |
| `utils/subscriptionTemplates.ts` | 38 öneri şablonu: tek fiyat + para birimi + kaba kategori. Hepsi data.ts'teki bir tier fiyatıyla birebir tutuyor (kontrol edildi). |
| `components/SubscriptionSearchPanel.tsx` → `FALLBACK_PRICING` | Katalogda olmayan 23 arama adı için tek "Standard" tier (USD, isteğe bağlı trPrice). Eşleşme olmazsa varsayılan 9.99 $ / 199.90 ₺. |
| `functions/src/priceSync.ts` → `BRANDS` (35) | Haftalık Gemini + Google Search fiyat taraması. Firestore `priceCatalog` koleksiyonuna `{name, tr:{price,plan,tiers}, us:{…}, confidence, changed}` olarak yazıyor. |
| `utils/priceCatalog.ts` | Firestore `priceCatalog`'u okuyup bellekteki `SUBSCRIPTION_CATALOG`'un TR/US tier'larını değiştiriyor (localStorage önbelleği `aboneyim_price_catalog_v2`). Kullanıcının kayıtlı fiyatı katalogdan farklıysa "fiyat güncelle" önerisi gösteriyor. |
| Logolar | Uygulamanın kullandığı harita `utils/logoUtils.ts` (`LOGO_MAP`, `/images/*.svg`, bulanık `includes` eşleşmesi). **`utils/brandImageMap.ts` hiçbir yerden import edilmiyor, ölü kod.** |

Bölgesel fiyat: web'de TR ve US tier'ları ayrı tutuluyor. TR tier'ında `name` İngilizce, `nameLocalized` Türkçe. Diğer para birimleri FX ile çevriliyor.

### ANDROID (`/Volumes/ProjectClaude/SubSense-AndroidApp`, Capacitor + React)
| Kaynak | Ne tutuyor |
|---|---|
| `src/data/explore.ts` → `EXPLORE_CATALOG` (40) | Explore ekranı. Dosyadaki not: "web `SUBSCRIPTION_CATALOG`'dan birebir alındı" (Haziran 2026). Alanlar: `category` (Streaming/Music/Design/AI/SaaS/Gaming/Community/Shopping/Turkish), `accent` rengi, `startingAt` + `startingCurrency`, `regions.US/TR.tiers` (web ile aynı biçim, yalnız `currency` yok). TR tier'ında `name` çoğunlukla zaten Türkçe. |
| `src/data/explore.tr.ts` | Yalnız TR açıklama ve milestone metinleri, fiyat yok. |
| `src/data/catalog.ts` → `CATALOG` (39) | Ekleme akışının servis listesi: `category` (Entertainment/Music/Tools/Productivity/Gaming/Health & Fitness/Shopping), `defaultPlan`, `fromPrice` (USD), `brandColor`. **Adlar Explore'dan farklı**: "Claude" / "Claude Pro", "Canva" / "Canva Pro", "Twitch" / "Twitch Turbo" vb. |
| `src/data/pricing.ts` → `PRICING` (39) | Ekleme akışındaki plan seçici: `Plan { name, usd, cycle?, blurb?, regional: { TRY, EUR, GBP, INR, BRL… } }`. Dosya başlığında "2025" yazıyor. regional değeri yoksa USD fiyat FX ile çevriliyor (`lib/pricing.ts` → `planPriceIn`). |
| `src/lib/pricing.ts` | `plansFor(service)`: canlı override plans → `PRICING` → `CATALOG.defaultPlan/fromPrice`. Kullanıcının kaydettiği fiyat her zaman önde, katalog yalnız ekleme sırasında kullanılıyor. |
| `src/store/catalog.ts` + `src/data/catalog-source.ts` | **Canlı katalog:** `PRICE_CATALOG_URL` adresinden JSON çekiliyor (12 saatlik TTL, localStorage `subsense.catalog.v1`). Şu an `PRICE_CATALOG_URL = ''`, yani kapalı ve paketle gelen fiyatlar kullanılıyor. Beklenen şema aşağıda (§6). |
| `src/data/seed.ts` | Yalnızca demo abonelikleri (Netflix, Adobe CC, New York Times, iCloud+ …). Katalog değil. |
| `src/lib/logos.ts` + `src/images/*.svg` (67) | `import.meta.glob` ile paketlenen SVG'ler. Görünen ad, `ALIASES` ile slug'a çevriliyor. |

**Android kendi içinde de iki ayrı fiyat kaynağı tutuyor:** Explore'da `regions` var, ekleme akışında `PRICING` var. 23 servis/bölge çiftinde bu iki kaynak birbirini tutmuyor (tabloda "A-iç" diye işaretli).

## 2. Servis bazında tam tablo

Açıklamalar:
- **Web sütunu:** `katalog` = SUBSCRIPTION_CATALOG'da tier'larıyla var; `arama+fallback` = yalnızca arama listesinde, fiyatı FALLBACK_PRICING'den geliyor (`Standard*`).
- **Android sütunu:** `explore` = EXPLORE_CATALOG; `pricing` = CATALOG + PRICING (ekleme akışı).
- **TR android / US android:** varsa Explore tier'ları gösteriliyor, yoksa `P:` önekiyle PRICING. `⟂ P:` ifadesi PRICING'in Explore'dan farklı olduğunu gösteriyor.
- **Fark sütunu:** `W x≠A y` fiyat farkı. Tier adları farklıysa Android tier adı parantez içinde. `yalnız web/android` o bölgede tier eksik demek. `ad:` her iki projede kullanılan yazımları listeliyor.
- Tier eşleştirmesi ada göre yapıldı (TR→EN sözlüğü + içerme). Ad eşleşmezse ve her iki tarafta tek bir tier kalmışsa bu iki tier eşleştirildi. Bu eşleştirme birkaç satırda yaklaşık, ör. BluTV "3 Aylık".

| Servis | Web | Android | Kategori W | Kategori A | TR web (₺) | TR android (₺) | US web ($) | US android ($) | Fark |
|---|---|---|---|---|---|---|---|---|---|
| Adobe Creative Cloud | katalog | explore | Design & Creativity | Design | Fotoğrafçılık 382; Tek Uygulama 649.99; Tüm Uygulamalar 956 | Fotoğrafçılık 279.99; Tek Uygulama 649.99; Tüm Uygulamalar 1599.99 | Photography Plan 9.99; Single App 22.99; All Apps 59.99 | Photography Plan 9.99; Single App 22.99; All Apps 59.99 | TR fiyat: Fotoğrafçılık W382≠A279.99, Tüm Uygulamalar W956≠A1599.99 |
| Amazon Music | arama+fallback | — | Music & Audio | — | — | — | Standard* 10.99 | — | **android’de yok** |
| Amazon Prime | katalog | explore+pricing | Shopping & Local | Shopping / Shopping | Aylık 69.9 | Aylık 39.9; Yıllık 399/yıl ⟂ P: Monthly 69.9; Annual 838.8/yıl | Monthly 14.99; Annual 139/yıl | Monthly 14.99; Annual 139/yıl | A-iç TR: Explore≠PRICING (Aylık 39.9/69.9, Yıllık 399/838.8); TR fiyat: Aylık W69.9≠A39.9; TR yalnız android: Yıllık |
| Apple Music | katalog | explore+pricing | Music & Audio | Music / Music | Bireysel 89.99; Aile 149.99; Öğrenci 49.99 | Bireysel 74.99; Aile 109.99; Öğrenci 39.99 ⟂ P: Student 32.99; Individual 59.99; Family 99.99 | Individual 10.99; Family 16.99; Student 5.99 | Individual 10.99; Family 16.99; Student 5.99 | A-iç TR: Explore≠PRICING (Bireysel 74.99/59.99, Aile 109.99/99.99, Öğrenci 39.99/32.99); TR fiyat: Bireysel W89.99≠A74.99, Aile W149.99≠A109.99, Öğrenci W49.99≠A39.99 |
| Apple TV+ | katalog | explore+pricing | Entertainment & Streaming | Streaming / Entertainment | iCloud+ 50GB (Apple TV Dahil) 49.99; Apple TV+ 89.99 | Apple TV+ 89.99 ⟂ P: Monthly 229.99 | Apple TV+ 12.99; Apple TV+ (Annual) 129/yıl | Apple TV+ 12.99; Apple TV+ (Annual) 129/yıl | A-iç TR: Explore≠PRICING (Apple TV+ 89.99/229.99); TR yalnız web: iCloud+ 50GB (Apple TV Dahil) |
| Asana | arama+fallback | — | Business & SaaS | — | — | — | Standard* 10.99 | — | **android’de yok** |
| Audible | katalog | explore+pricing | Music & Audio | Music / Entertainment | Plus (Aylık 1 Kredi) 54.9; Premium (Aylık 2 Kredi) 89.9 | Plus (Aylık 1 Kredi) 54.9; Premium (Aylık 2 Kredi) 89.9 | Plus (1 Credit/mo) 7.95; Premium (2 Credits/mo) 14.95 | Plus (1 Credit/mo) 7.95; Premium (2 Credits/mo) 14.95 | ✓ aynı |
| BluTV | katalog | explore | Entertainment & Streaming | Turkish | Standart Aylık 229.9; Özel (4K) Aylık 299.9; Standart Yıllık 2299/yıl | Aylık 89.9; 3 Aylık 239.9; Yıllık 799.9/yıl | — | — | TR fiyat: Standart Aylık W229.9≠A(Aylık)89.9, Standart Yıllık W2299≠A(Yıllık)799.9, Özel (4K) Aylık W299.9≠A(3 Aylık)239.9 |
| Canva Pro | katalog | explore+pricing | Design & Creativity | Design / Productivity | Pro Bireysel 239.99; Pro Yıllık 1919.99/yıl | Pro 179.99; Ekip 119.99 ⟂ P: Pro 199.99 | Pro 14.99; Teams 10 | Pro 14.99; Teams 10 ⟂ P: Pro 12.99; Teams 10 | ad: W Canva Pro / A Canva Pro / A Canva; A-iç TR: Explore≠PRICING (Pro 179.99/199.99); TR fiyat: Pro Bireysel W239.99≠A(Pro)179.99; TR yalnız web: Pro Yıllık; TR yalnız android: Ekip; A-iç US: Explore≠PRICING (Pro 14.99/12.99) |
| ChatGPT Plus | katalog | explore+pricing | AI & Dev Tools | AI / Tools | ChatGPT Go 249.99; ChatGPT Plus 999.99 | Plus 649.99 ⟂ P: Plus 800 | Plus 20; Pro 200 | Plus 20; Pro 200 | A-iç TR: Explore≠PRICING (Plus 649.99/800); TR fiyat: ChatGPT Plus W999.99≠A(Plus)649.99; TR yalnız web: ChatGPT Go |
| Claude | katalog | explore+pricing | AI & Dev Tools | AI / Tools | Claude Pro 899.99 | Pro 699.99 | Pro 20; Max (5x usage) 100; Team 30 | Pro 20; Max (5x usage) 100; Team 30 | ad: W Claude Pro / A Claude Pro / A Claude; TR fiyat: Claude Pro W899.99≠A(Pro)699.99 |
| ClickUp | arama+fallback | — | Business & SaaS | — | — | — | Standard* 7 | — | **android’de yok** |
| Crunchyroll | katalog | explore+pricing | Entertainment & Streaming | Streaming / Entertainment | Fan 49.99; Mega Fan 69.99 | Fan 29.99; Mega Fan 39.99 | Fan 9.99; Mega Fan 11.99; Ultimate Fan 15.99 | Fan 7.99; Mega Fan 11.99; Ultimate Fan 15.99 ⟂ P: Fan 7.99; Mega Fan 9.99 | TR fiyat: Fan W49.99≠A29.99, Mega Fan W69.99≠A39.99; A-iç US: Explore≠PRICING (Mega Fan 11.99/9.99); US fiyat: Fan W9.99≠A7.99 |
| Deezer | katalog | pricing | Music & Audio | Music | Premium Bireysel 89.99; Aile 149.99 | P: Premium 59.99 | Premium 11.99; Family 19.99 | P: Premium 11.99; Family 17.99 | TR fiyat: Premium Bireysel W89.99≠A(Premium)59.99; TR yalnız web: Aile; US fiyat: Family W19.99≠A17.99 |
| Discord Nitro | katalog | explore+pricing | tpl:Gaming | Community / Gaming | Nitro Temel 104.99; Tam Nitro 269.99 | Nitro Temel 44.99; Nitro 149.99 | Nitro Basic 2.99; Nitro 9.99 | Nitro Basic 2.99; Nitro 9.99 | TR fiyat: Nitro Temel W104.99≠A44.99, Tam Nitro W269.99≠A(Nitro)149.99 |
| Discovery+ | arama+fallback | — | Entertainment & Streaming | — | Standard* 149.9 | — | Standard* 5.99 | — | **android’de yok** |
| Disney+ | katalog | explore+pricing | Entertainment & Streaming | Streaming / Entertainment | Reklamlı 249.9; Reklamsız 449.9; Yıllık Reklamlı 2499/yıl; Yıllık Reklamsız 4499/yıl | Standart (Reklamlı) 249.9; Premium (Reklamsız) 449.9 | Basic (with Ads) 9.99; Premium (No Ads) 15.99 | Basic (with Ads) 9.99; Premium (No Ads) 15.99 | TR yalnız web: Yıllık Reklamlı, Yıllık Reklamsız |
| Dropbox | katalog | explore+pricing | — | SaaS / Productivity | — | — | Plus 11.99; Professional 24.99 | Plus 11.99; Professional 24.99 ⟂ P: Plus 11.99; Essentials 19.99 | ad: W Dropbox Plus / A Dropbox Plus / A Dropbox; A-iç US: Explore≠PRICING (Professional 24.99/19.99) |
| Duolingo | katalog | explore+pricing | tpl:Productivity | Community / Health & Fitness | Super Aylık 169.99; Super Yıllık 999.99/yıl; Aile Yıllık 1499.99/yıl | Super 209.99; Aile 299.99 ⟂ P: Super 99.99 | Super 12.99; Max 29.99; Super Annual 83.99/yıl | Super 6.99; Max 13.99; Family 9.99 ⟂ P: Super 6.99; Max 14 | ad: W Duolingo Super / A Duolingo Super / A Duolingo; A-iç TR: Explore≠PRICING (Super 209.99/99.99); TR fiyat: Super Aylık W169.99≠A(Super)209.99, Aile Yıllık W1499.99≠A(Aile)299.99; TR yalnız web: Super Yıllık; A-iç US: Explore≠PRICING (Max 13.99/14); US fiyat: Super W12.99≠A6.99, Max W29.99≠A13.99; US yalnız web: Super Annual; US yalnız android: Family |
| EA Play | katalog | pricing | Gaming | Gaming | EA Play Aylık 219.99; EA Play Yıllık 1499/yıl | — | EA Play 5.99; EA Play Pro 16.99 | P: Standard 4.99; Pro 14.99 | TR: android’de fiyat yok; US yalnız web: EA Play, EA Play Pro; US yalnız android: Standard, Pro |
| Epic Games | arama+fallback | — | Gaming | — | — | — | Standard* 11.99 | — | **android’de yok** |
| Exxen | katalog | explore | Entertainment & Streaming | Turkish | Reklamlı 219; Reklamsız 309; Spor Reklamsız 499 | Reklamlı 99.99; Reklamsız 169.99; Spor Paketi 299.99 | — | — | TR fiyat: Reklamlı W219≠A99.99, Reklamsız W309≠A169.99, Spor Reklamsız W499≠A(Spor Paketi)299.99 |
| Figma | katalog | explore+pricing | Design & Creativity | Design / Productivity | — | — | Professional 15; Organization 45 | Professional 12; Organization 45 ⟂ P: Professional 16; Organization 45 | A-iç US: Explore≠PRICING (Professional 12/16); US fiyat: Professional W15≠A12 |
| Gain | katalog | — | Entertainment & Streaming | — | Premium Aylık 249 | — | — | — | **android’de yok** |
| GeForce Now | katalog | pricing | Gaming | Gaming | Performance Aylık 599; Ultimate Aylık 1199 | — | Performance 9.99; Ultimate 19.99 | P: Performance 9.99; Ultimate 19.99 | TR: android’de fiyat yok |
| Gemini | katalog | pricing | AI & Dev Tools | Tools | Google AI Pro (2 TB) 719.99 | P: AI Pro 650 | AI Pro (2 TB) 19.99 | P: AI Pro 19.99 | ad: W Gemini Advanced / A Gemini; TR fiyat: Google AI Pro (2 TB) W719.99≠A(AI Pro)650 |
| Getir | arama+fallback | — | Shopping & Local | — | Standard* 49.9 | — | — | — | **android’de yok** |
| GitHub Copilot | katalog | explore+pricing | AI & Dev Tools | AI / Tools | — | — | Individual 10; Business 19 | Individual 10; Business 19 | ✓ aynı |
| Google Workspace | katalog | explore | Business & SaaS | SaaS | İşletme Başlangıç 119.99; İşletme Standart 239.99 | İşletme Başlangıç 119.99; İşletme Standart 239.99 | Business Starter 6; Business Standard 12; Business Plus 18 | Business Starter 6; Business Standard 12; Business Plus 18 | ✓ aynı |
| Grammarly | arama+fallback | pricing | AI & Dev Tools | Productivity | — | — | Standard* 12 | P: Pro 12 | ✓ aynı |
| HBO Max | katalog | explore+pricing | Entertainment & Streaming | Streaming / Entertainment | Standart 229.9; Özel (4K) 299.9 | — | With Ads 9.99; Ad-Free 16.99; Ultimate (4K) 20.99 | With Ads 9.99; Ad-Free 16.99; Ultimate (4K) 20.99 | ad: W HBO Max (Max) / W HBO Max / A HBO Max (Max) / A HBO Max; TR: android’de fiyat yok |
| Hepsiburada Premium | katalog | explore | Shopping & Local | Turkish | Aylık 69.9; Yıllık 538/yıl | Aylık 59.9; Yıllık 479/yıl | — | — | TR fiyat: Aylık W69.9≠A59.9, Yıllık W538≠A479 |
| HubSpot | arama+fallback | — | Business & SaaS | — | — | — | Standard* 20 | — | **android’de yok** |
| Hulu | katalog | explore+pricing | Entertainment & Streaming | Streaming / Entertainment | — | — | Hulu (with Ads) 9.99; Hulu (No Ads) 18.99 | Hulu (with Ads) 9.99; Hulu (No Ads) 18.99 | ✓ aynı |
| Jasper | arama+fallback | — | AI & Dev Tools | — | — | — | Standard* 39 | — | **android’de yok** |
| Kittl | arama+fallback | — | Design & Creativity | — | — | — | Standard* 15 | — | **android’de yok** |
| Leonardo AI | arama+fallback | — | Design & Creativity | — | — | — | Standard* 12 | — | **android’de yok** |
| Luna | arama+fallback | — | Gaming | — | — | — | Standard* 9.99 | — | **android’de yok** |
| MasterClass | katalog | explore+pricing | — | Community / Health & Fitness | — | — | Individual 15; Duo 20; Family 23 | Individual 15; Duo 20; Family 23 ⟂ P: Individual 10/yıl; Duo 15/yıl | ad: W MasterClass / A MasterClass / A Masterclass; A-iç US: Explore≠PRICING (Individual 15/10, Duo 20/15) |
| Microsoft 365 | katalog | explore+pricing | Business & SaaS | SaaS / Productivity | Bireysel 329.99; Aile 409.99; Yıllık Bireysel 3299.99/yıl; Yıllık Aile 4099.99/yıl | Kişisel 179.99; Aile 239.99 ⟂ P: Personal 119.99; Family 169.99 | Personal 9.99; Family 12.99 | Personal 9.99; Family 12.99 ⟂ P: Personal 6.99; Family 9.99 | A-iç TR: Explore≠PRICING (Kişisel 179.99/119.99, Aile 239.99/169.99); TR fiyat: Bireysel W329.99≠A(Kişisel)179.99, Aile W409.99≠A239.99; TR yalnız web: Yıllık Bireysel, Yıllık Aile; A-iç US: Explore≠PRICING (Personal 9.99/6.99, Family 12.99/9.99) |
| Midjourney | katalog | explore+pricing | AI & Dev Tools | AI / Tools | — | — | Basic 10; Standard 30; Pro 60 | Basic 10; Standard 30; Pro 60 | ✓ aynı |
| Monday.com | arama+fallback | — | Business & SaaS | — | — | — | Standard* 9 | — | **android’de yok** |
| Netflix | katalog | explore+pricing | Entertainment & Streaming | Streaming / Entertainment | Temel 259.99; Standart 389.99; Özel (4K) 499.99 | Temel 189.99; Standart 289.99; Premium (4K) 379.99 | Standard with Ads 7.99; Standard 17.99; Premium (4K) 24.99 | Standard with Ads 7.99; Standard 17.99; Premium (4K) 24.99 ⟂ P: Standard with ads 6.99; Standard 15.49; Premium 22.99 | TR fiyat: Temel W259.99≠A189.99, Standart W389.99≠A289.99, Özel (4K) W499.99≠A379.99; A-iç US: Explore≠PRICING (Standard with Ads 7.99/6.99, Standard 17.99/15.49, Premium (4K) 24.99/22.99) |
| Nintendo Switch Online | katalog | explore+pricing | Gaming | Gaming / Gaming | Bireysel 109.99; Aile (Yıllık) 999/yıl | Bireysel 109.99; Aile (Yıllık) 999/yıl | Individual 3.99; Family 34.99/yıl; Expansion Pack 49.99/yıl | Individual 3.99; Family 34.99/yıl; Expansion Pack 49.99/yıl ⟂ P: Individual 3.99; Family 7.99; Expansion Pack 4.99 | A-iç US: Explore≠PRICING (Family 34.99/7.99, Expansion Pack 49.99/4.99) |
| Notion | katalog | explore+pricing | AI & Dev Tools | SaaS / Productivity | — | — | Plus 10; Business 15 | Plus 8; Business 15 ⟂ P: Plus 10; Business 18 | ad: W Notion Plus / W Notion / A Notion Plus / A Notion; kategori AI≠SaaS; A-iç US: Explore≠PRICING (Plus 8/10, Business 15/18); US fiyat: Plus W10≠A8 |
| Pandora | arama+fallback | — | Music & Audio | — | — | — | Standard* 5.99 | — | **android’de yok** |
| Paramount+ | katalog | explore+pricing | Entertainment & Streaming | Streaming / Entertainment | — | — | Essential (with Ads) 7.99; Paramount+ with Showtime 12.99 | Essential (with Ads) 5.99; Showtime Bundle (No Ads) 11.99 ⟂ P: Essential 7.99; Premium 12.99 | A-iç US: Explore≠PRICING (Essential (with Ads) 5.99/7.99, Showtime Bundle (No Ads) 11.99/12.99); US fiyat: Essential (with Ads) W7.99≠A5.99, Paramount+ with Showtime W12.99≠A(Showtime Bundle (No Ads))11.99 |
| Peacock | katalog | explore | Entertainment & Streaming | Streaming | — | — | Premium (with Ads) 7.99; Premium Plus (No Ads) 13.99 | Premium (with Ads) 7.99; Premium Plus (No Ads) 13.99 | ✓ aynı |
| Perplexity | katalog | pricing | AI & Dev Tools | Tools | Perplexity Pro 999.99 | — | Pro 20; Pro Annual 200/yıl | P: Pro 20 | TR: android’de fiyat yok; US yalnız web: Pro Annual |
| PlayStation Plus | katalog | explore+pricing | Gaming | Gaming / Gaming | Essential (Temel) 400; Extra 600; Deluxe 710; Yıllık Essential 2890/yıl | Temel 250; Ekstra 370; Premium 470 ⟂ P: Essential 400; Extra 600; Premium 710 | Essential 9.99; Extra 14.99; Premium 17.99 | Essential 9.99; Extra 14.99; Premium 17.99 | A-iç TR: Explore≠PRICING (Ekstra 370/600, Premium 470/710, Temel 250/400); TR fiyat: Extra W600≠A370, Essential (Temel) W400≠A(Temel)250; TR yalnız web: Deluxe, Yıllık Essential; TR yalnız android: Premium |
| Prime Video | katalog | explore | Entertainment & Streaming | Streaming | Amazon Prime (Video Dahil) 69.9 | Prime Video 39.9 | Prime Video (Standalone) 8.99; Amazon Prime (Bundle) 14.99 | Prime Video (Standalone) 8.99; Amazon Prime (Bundle) 14.99 | ad: W Prime Video / W Amazon Prime Video / A Prime Video; TR fiyat: Amazon Prime (Video Dahil) W69.9≠A(Prime Video)39.9 |
| Procreate | arama+fallback | — | Design & Creativity | — | — | — | Standard* 12.99 | — | **android’de yok** |
| PuhuTV | arama+fallback | — | Entertainment & Streaming | — | Standard* 0 | — | — | — | **android’de yok** |
| Replit | arama+fallback | — | AI & Dev Tools | — | — | — | Standard* 20 | — | **android’de yok** |
| Runway | arama+fallback | — | Design & Creativity | — | — | — | Standard* 15 | — | **android’de yok** |
| Salesforce | arama+fallback | — | Business & SaaS | — | — | — | Standard* 25 | — | **android’de yok** |
| Slack | katalog | explore+pricing | Business & SaaS | SaaS / Productivity | — | — | Pro 7.25; Business+ 12.5 | Pro 7.25; Business+ 12.5 ⟂ P: Pro 8.75; Business+ 15 | A-iç US: Explore≠PRICING (Pro 7.25/8.75, Business+ 12.5/15) |
| SoundCloud | arama+fallback | pricing | Music & Audio | Music | Standard* 89.99 | — | Standard* 10.99 | P: Go 5.99; Go+ 12.99 | TR: android’de fiyat yok; US yalnız web: Standard*; US yalnız android: Go, Go+ |
| Spotify | katalog | explore+pricing | Music & Audio | Music / Music | Bireysel 115; Duo 159; Aile 199; Öğrenci 60 | Bireysel 99.99; Duo 135.99; Aile 169.99; Öğrenci 55.99 | Individual 11.99; Duo 16.99; Family 19.99; Student 5.99 | Individual 11.99; Duo 16.99; Family 19.99; Student 5.99 | TR fiyat: Bireysel W115≠A99.99, Duo W159≠A135.99, Aile W199≠A169.99, Öğrenci W60≠A55.99 |
| Steam Deck | arama+fallback | — | Gaming | — | — | — | Standard* 9.99 | — | **android’de yok** |
| Tabii | katalog | explore | tpl:Entertainment | Turkish | Tabii Premium 99; Ücretsiz (Reklamlı) 0 | Ücretsiz 0 | Premium 4.99 | Free 0 | TR yalnız web: Tabii Premium; US fiyat: Premium W4.99≠A(Free)0 |
| Tidal | katalog | explore+pricing | Music & Audio | Music / Music | — | — | Individual 10.99; Family 16.99; Student 5.49 | Individual 10.99; Family 16.99; Student 5.49 | ✓ aynı |
| Trello | arama+fallback | pricing | Business & SaaS | Productivity | — | — | Standard* 6 | P: Standard 5; Premium 10 | US fiyat: Standard* W6≠A5; US yalnız android: Premium |
| Trendyol Elite | katalog | explore | Shopping & Local | Turkish | Trendyol Plus Aylık 75 | Aylık 49.9; Yıllık 399/yıl | — | — | TR fiyat: Trendyol Plus Aylık W75≠A(Aylık)49.9; TR yalnız android: Yıllık |
| Twitch Turbo | katalog | explore+pricing | tpl:Entertainment | Gaming / Gaming | Kanal Aboneliği (Kademe 1) 43.9; Twitch Turbo 399.99 | Turbo 164.99 | Turbo 11.99 | Turbo 11.99 ⟂ P: Turbo 8.99 | ad: W Twitch Turbo / A Twitch Turbo / A Twitch; TR fiyat: Twitch Turbo W399.99≠A(Turbo)164.99; TR yalnız web: Kanal Aboneliği (Kademe 1); A-iç US: Explore≠PRICING (Turbo 11.99/8.99) |
| Ubisoft+ | katalog | — | Gaming | — | Ubisoft+ Classics 139; Ubisoft+ Premium 299 | — | Classics 7.99; Premium 17.99 | — | **android’de yok** |
| Xbox Game Pass | katalog | explore+pricing | Gaming | Gaming / Gaming | Essential (Temel) 269; PC Game Pass 419; Premium (Standart) 409; Ultimate 529 | Temel 269; PC Game Pass 419; Ultimate 529 | Core 9.99; Standard 14.99; Ultimate 19.99 | Core 9.99; Standard 14.99; Ultimate 19.99 ⟂ P: Core 9.99; PC Game Pass 11.99; Ultimate 19.99 | TR yalnız web: Premium (Standart); A-iç US: Explore≠PRICING (Standard 14.99/11.99) |
| Yemeksepeti | arama+fallback | — | Shopping & Local | — | Standard* 49.9 | — | — | — | **android’de yok** |
| YouTube Premium | katalog | explore+pricing | Entertainment & Streaming | Music / Entertainment | Bireysel 119.99; Aile 239.99; Öğrenci 79.99; Yıllık Bireysel 1199.99/yıl | Bireysel 119.99; Aile 239.99; Öğrenci 79.99 | Individual 13.99; Family 22.99; Student 7.99 | Individual 13.99; Family 22.99; Student 7.99 | kategori Streaming≠Music; TR yalnız web: Yıllık Bireysel |
| Zoom | katalog | explore+pricing | Business & SaaS | SaaS / Productivity | — | — | Pro 15.99; Business 21.99 | Pro 13.33; Business 21.99 ⟂ P: Pro 13.33; Business 18.32 | ad: W Zoom Pro / W Zoom / A Zoom Pro / A Zoom; A-iç US: Explore≠PRICING (Business 21.99/18.32); US fiyat: Pro W15.99≠A13.33 |

## 3. Sayılar

| Ölçüt | Değer |
|---|---|
| Toplam tekil servis (iki projenin birleşimi, normalize edilmiş adla) | **70** |
| WEB'de olan | **70** (47 tam katalog + 23 yalnız arama listesi/fallback) |
| ANDROID'de olan | **48** (40 Explore + 8 yalnız ekleme akışında: Deezer, SoundCloud, Gemini, Perplexity, Trello, Grammarly, EA Play, GeForce Now) |
| Ortak | **48** |
| Yalnız WEB | **22**: Gain, Ubisoft+ (ikisi de tam katalogda) + yalnız arama listesinde olan 20 servis: Amazon Music, Asana, ClickUp, Discovery+, Epic Games, Getir, HubSpot, Jasper, Kittl, Leonardo AI, Luna, Monday.com, Pandora, Procreate, PuhuTV, Replit, Runway, Salesforce, Steam Deck, Yemeksepeti |
| Yalnız ANDROID | **0** |
| Ortak serviste farklı **tier fiyatı** (web ve android) | **50 tier**, **27 serviste** |
| Bir tarafta olup öbür tarafta olmayan tier | **38** |
| Kategori farkı (aynı sözlüğe eşlenince) | **2**: Notion (web AI ≠ android SaaS), YouTube Premium (web Streaming ≠ android Music). Ayrıca Android'de "Turkish" ve "Community" grupları var, web'de bunların karşılığı yok. CATALOG'un kategori sözlüğü (Tools/Health & Fitness…) web ile hiç örtüşmüyor. |
| Ad yazımı farkı | **11**: Prime Video/Amazon Prime Video, HBO Max (Max)/HBO Max, Canva Pro/Canva, Notion Plus/Notion, Claude Pro/Claude, Gemini Advanced/Gemini, Twitch Turbo/Twitch, Duolingo Super/Duolingo, MasterClass/Masterclass, Dropbox Plus/Dropbox, Zoom Pro/Zoom |
| Android iç çelişkisi (Explore ≠ PRICING) | **23** servis/bölge çifti |
| Tamamen aynı olanlar | **8**: Audible, GitHub Copilot, Google Workspace, Grammarly (web'de yalnız fallback), Hulu, Midjourney, Peacock, Tidal |

Gözden kaçabilecek desen: **US fiyatları büyük ölçüde aynı. Farkların çoğu TR fiyatlarında.** Web 2026-11-08'de TR fiyatlarını yükseltti, Android Temmuz'daki değerlerde kaldı. Örnekler: Netflix TR 259.99/389.99/499.99 (web), Android'de 189.99/289.99/379.99. Spotify 115/159/199/60 (web), Android'de 99.99/135.99/169.99/55.99. Exxen 219/309/499 (web), Android'de 99.99/169.99/299.99.

Web'in kendi içindeki tutarsızlıklar (birleştirmeden önce düzeltilmeli):
- `priceSync.ts` BRANDS listesi 13 katalog servisini takip etmiyor: Prime Video, Google Workspace, Slack, Notion Plus, Midjourney, MasterClass, Dropbox Plus, Zoom Pro, Peacock, Paramount+, Audible, Nintendo Switch Online, Tidal. Ayrıca BRANDS'teki "Notion" adı, `priceCatalog.ts` hydrate işleminde `notionplus` id'siyle eşleşmiyor. Bu yüzden Notion'ın canlı fiyatı uygulamaya hiç ulaşmıyor.
- Logo hatası: `logoUtils.ts`'teki bulanık eşleşmede `'ea'` anahtarı "steamdeck" içinde geçtiği için Steam Deck'e **EA Play logosu** çıkıyor. MasterClass ise `masterpass.svg` dosyasına bağlı; doğru dosya olan `Masterclass_logo.svg` kullanılmıyor.

## 4. Logolar ve marka renkleri

- **WEB:** Tüm logolar `public/images/*.svg` altında, hepsi SVG ve dosya adları karışık (`Netflix.svg`, `disney+.svg`, `Trendyol Elite Logo Vector.svg` …). Logo eşleşen servis: **66/70** (logosu olmayanlar: ClickUp, Discovery+, Gain, Tabii). Hiçbir haritada kullanılmayan dosyalar: `Adobe_Creative_Cloud_rainbow_icon.svg`, `Dropbox_logo_2017.svg`, `Masterclass_logo.svg`, `discord-nitro-seeklogo.svg`, `duolingo 2.svg`, `logo-amazon.svg`, `sub.svg`, `twitch_wordmark_extruded_black-ops.svg`.
- **ANDROID:** `src/images/*.svg` altında 67 SVG var, adları kebab-case slug (`disney-plus.svg`), Vite ile paketleniyor (URL değil, bundle). Android'deki servislerden logosu olan: **47/48** (yalnız Tabii'de yok). Android'de yalnız-web olan 17 servisin SVG'si de zaten var: Amazon Music, Asana, Epic Games, Getir, HubSpot, Jasper, Kittl, Leonardo AI, Monday.com, Pandora, Procreate, PuhuTV, Replit, Runway, Salesforce, Ubisoft+, Yemeksepeti.
- **İki projede de logosu olmayanlar:** ClickUp, Discovery+, Gain, Tabii. Luna ve Steam Deck yalnız web'de var (Android'de `amazon-luna.svg` ve `steam.svg` dosyaları var ama alias tanımlı değil).
- **Renk farkı: 11 servis.** Bunların çoğu Android'in kendi içindeki çelişki: Explore `accent` web ile aynı, ama CATALOG `brandColor` farklı (Apple Music, Audible, GitHub Copilot, HBO Max, MasterClass, Microsoft 365, Notion, Tidal). Web ile Android arasındaki gerçek farklar: Midjourney (#FFFFFF / #1A1A2E), Deezer (#EF5466 / #A238FF), Perplexity (#22B8CF / #20B8CD).

### Logo / renk tablosu (servis başına)

| Servis | Web logo (public/images) | Android logo (src/images) | Web renk | Android renk (explore accent / catalog brandColor) | Renk farkı |
|---|---|---|---|---|---|
| Adobe Creative Cloud | adobe-creative-cloud.svg (svg) | adobe-cc.svg | #ED1C24 | #ED1C24 |  |
| Amazon Music | amazon_music.svg (svg) | amazon-music.svg | — | — |  |
| Amazon Prime | amazon_prime.svg (svg) | amazon-prime.svg | #00A8E1 | #00A8E1 |  |
| Apple Music | apple_music.svg (svg) | apple-music.svg | #FC3C44 | #FC3C44 / #FA243C | farklı |
| Apple TV+ | apple_tv_plus.svg (svg) | apple-tv-plus.svg | #000000 | #000000 |  |
| Asana | asana.svg (svg) | asana.svg | — | — |  |
| Audible | audible.svg (svg) | audible.svg | #F79A1D | #F79A1D / #F8991C | farklı |
| BluTV | blutv.svg (svg) | blutv.svg | #FF5C00 | #FF5C00 |  |
| Canva Pro | canva-seeklogo.svg (svg) | canva.svg | #00C4CC | #00C4CC |  |
| ChatGPT Plus | ChatGPT-Logo.svg (svg) | chatgpt.svg | #10A37F | #10A37F |  |
| Claude | Claude_AI_logo.svg (svg) | claude.svg | #D97757 | #D97757 |  |
| ClickUp | — | — | — | — |  |
| Crunchyroll | Crunchyroll_Logo.svg (svg) | crunchyroll.svg | #F47521 | #F47521 |  |
| Deezer | deezer.svg (svg) | deezer.svg | #EF5466 | #A238FF | farklı |
| Discord Nitro | discord.svg (svg) | discord-nitro.svg | #5865F2 | #5865F2 |  |
| Discovery+ | — | — | — | — |  |
| Disney+ | disney+.svg (svg) | disney-plus.svg | #113CCF | #113CCF |  |
| Dropbox | dropbox.svg (svg) | dropbox.svg | #0061FF | #0061FF |  |
| Duolingo | duolingo.svg (svg) | duolingo.svg | #58CC02 | #58CC02 |  |
| EA Play | EA_Play_logo.svg (svg) | ea-play.svg | #FF4747 | #FF4747 |  |
| Epic Games | Epic_Games_logo.svg (svg) | epic-games.svg | — | — |  |
| Exxen | exxen-seeklogo.svg (svg) | exxen.svg | #FFD500 | #FFD500 |  |
| Figma | Figma-logo.svg (svg) | figma.svg | #F24E1E | #F24E1E |  |
| Gain | — | — | — | — |  |
| GeForce Now | GeForce_Now_logo.svg (svg) | geforce-now.svg | #76B900 | #76B900 |  |
| Gemini | Google_Gemini_logo_2025.svg (svg) | gemini.svg | — | #1A73E8 |  |
| Getir | Getir_wordmark.svg (svg) | getir.svg | #5D3EBC | — |  |
| GitHub Copilot | GitHub_Copilot_logo.svg (svg) | github-copilot.svg | #181717 | #181717 / #ffffff | farklı |
| Google Workspace | Google_Workspace_Logo.svg (svg) | google-workspace.svg | #4285F4 | #4285F4 |  |
| Grammarly | Grammarly_logo.svg (svg) | grammarly.svg | #15C39A | #15C39A |  |
| HBO Max | HBO_Max_(2025).svg (svg) | hbo-max.svg | #5F259F | #5F259F / #7B2BF9 | farklı |
| Hepsiburada Premium | hepsiburada-premium-seeklogo.svg (svg) | hepsiburada.svg | #F68B1E | #F68B1E |  |
| HubSpot | hubspot.svg (svg) | hubspot.svg | — | — |  |
| Hulu | Hulu_logo_(2018).svg (svg) | hulu.svg | #1CE783 | #1CE783 |  |
| Jasper | Jasper_Technologies_logo.svg (svg) | jasper.svg | — | — |  |
| Kittl | Kittl_Logo.svg (svg) | kittl.svg | — | — |  |
| Leonardo AI | leonardo_ai.svg (svg) | leonardo.svg | — | — |  |
| Luna | luna.svg (svg) | — | — | — |  |
| MasterClass | masterpass.svg (svg) | masterclass.svg | #181818 | #181818 / #E5092F | farklı |
| Microsoft 365 | Microsoft_365.svg (svg) | microsoft-365.svg | #0078D4 | #0078D4 / #D83B01 | farklı |
| Midjourney | Midjourney_Emblem.svg (svg) | midjourney.svg | #FFFFFF | #1A1A2E / #4945FF | farklı |
| Monday.com | Monday_logo.svg (svg) | monday.svg | — | — |  |
| Netflix | Netflix.svg (svg) | netflix.svg | #E50914 | #E50914 |  |
| Nintendo Switch Online | Nintendo_Switch_Online_logo.svg (svg) | nintendo-switch-online.svg | #E60012 | #E60012 |  |
| Notion | Notion-logo.svg (svg) | notion.svg | #000000 | #000000 / #ffffff | farklı |
| Pandora | Pandora_logo_2025.svg (svg) | pandora.svg | — | — |  |
| Paramount+ | Paramount_Plus.svg (svg) | paramount-plus.svg | #0064FF | #0064FF |  |
| Peacock | NBCUniversal_Peacock_Logo.svg (svg) | peacock.svg | #000000 | #000000 |  |
| Perplexity | Perplexity_AI_logo.svg (svg) | perplexity.svg | #22B8CF | #20B8CD | farklı |
| PlayStation Plus | PlayStationPlus_(No_Trademark).svg (svg) | playstation-plus.svg | #00439C | #00439C |  |
| Prime Video | amazon_prime.svg (svg) | amazon-prime.svg | #00A8E1 | #00A8E1 |  |
| Procreate | Procreate_logo.svg (svg) | procreate.svg | — | — |  |
| PuhuTV | puhutv.svg (svg) | puhutv.svg | — | — |  |
| Replit | replit.svg (svg) | replit.svg | — | — |  |
| Runway | Runaway_1_logo.svg (svg) | runway.svg | — | — |  |
| Salesforce | salesforce-2.svg (svg) | salesforce.svg | — | — |  |
| Slack | Slack_Technologies_Logo.svg (svg) | slack.svg | #4A154B | #4A154B |  |
| SoundCloud | Soundcloud_logo.svg (svg) | soundcloud.svg | #FF5500 | #FF5500 |  |
| Spotify | spotify.svg (svg) | spotify.svg | #1DB954 | #1DB954 |  |
| Steam Deck | EA_Play_logo.svg (svg) | — | — | — |  |
| Tabii | — | — | #E30613 | #E30613 |  |
| Tidal | Tidal_(service)_logo_only.svg (svg) | tidal.svg | #000000 | #000000 / #00FFFF | farklı |
| Trello | Trello-logo-blue.svg (svg) | trello.svg | — | #0079BF |  |
| Trendyol Elite | Trendyol Elite Logo Vector.svg (svg) | trendyol.svg | #FF6600 | #FF6600 |  |
| Twitch Turbo | twitch.svg (svg) | twitch.svg | #9146FF | #9146FF |  |
| Ubisoft+ | Ubisoft+.svg (svg) | ubisoft-plus.svg | #0091F2 | — |  |
| Xbox Game Pass | Xbox_Game_Pass_new_logo_-_colored_version.svg (svg) | xbox-game-pass.svg | #107C10 | #107C10 |  |
| Yemeksepeti | Yemeksepeti_logo.svg (svg) | yemeksepeti.svg | — | — |  |
| YouTube Premium | YouTube_Premium_logo.svg (svg) | youtube-premium.svg | #FF0000 | #FF0000 |  |
| Zoom | Zoom_Communications_Logo.svg (svg) | zoom.svg | #2D8CFF | #2D8CFF |  |

## 5. Hangi projenin fiyatları daha güncel

| Dosya | Son değişiklik |
|---|---|
| WEB `utils/data.ts`, `subscriptionTemplates.ts`, `SubscriptionSearchPanel.tsx` | **2026-11-08** `5c2a259 chore: update all TR and US subscription prices to 2026 rates` |
| WEB `priceSync.ts`, `priceCatalog.ts` | 2026-11-08 `6c7632f` (canlı Gemini fiyat radarı) |
| ANDROID `src/data/explore.ts`, `pricing.ts` | 2026-07-02 `7585ab7` "refresh current (Jul 2026) TR prices", yalnız 10 servis: Netflix, Spotify, YouTube, Disney+, Crunchyroll, Apple Music, Apple TV+, Xbox, PlayStation, Amazon Prime |
| ANDROID `src/data/catalog.ts` | 2026-06-05 |
| ANDROID `pricing.ts` başlık yorumu | "Curated real-world current prices (**2025**)" |
| ANDROID `public/price-catalog.example.json` | updatedAt `2026-06-07`, kendi notunda "NOT guaranteed current" yazıyor |

**Sonuç: WEB daha güncel** (4 ay sonra, 47 servisin TR+US fiyatlarının hepsi aynı committe güncellendi). Ayrıca web'in haftalık Gemini senkronu var, Android'in canlı kaynağı kapalı. Dikkat: bu fiyatlar canlı kaynaklarla karşılaştırılmadı. Birkaç yerde Android değeri daha yüksek (ör. Duolingo Super TR 209.99 > web 169.99, Paramount+ US web 7.99/12.99 ile Android 5.99/11.99 tutmuyor). Birleştirmeden önce bu tek tük noktalar gözle kontrol edilmeli.

## 6. Tek kaynak (source of truth) önerisi

### Android'in şu anda okuyabildiği şema (`src/store/catalog.ts` → `sanitizeServices`)
```jsonc
{
  "version": 1,
  "updatedAt": "2026-11-10",
  "services": {
    "<TAM görünen ad>": {                       // key büyük-küçük harfe duyarlı, birebir eşleşme
      "startingAt": 17.99, "startingCurrency": "USD",   // yalnız "USD" | "TRY"
      "regions": {                              // Explore ekranı
        "US": { "tiers": [{ "name": "Standard", "price": 17.99, "cycle": "Monthly" }] },
        "TR": { "tiers": [{ "name": "Standard", "nameLocalized": "Standart", "price": 389.99 }] }
      },
      "plans": [                                // Ekleme akışı / PlanPicker
        { "name": "Standard", "usd": 17.99, "cycle": "Monthly", "regional": { "TRY": 389.99 } }
      ]
    }
  }
}
```
- `fetch(PRICE_CATALOG_URL, {cache:'no-store'})` çağrılıyor, 12 saat önbellekte tutuluyor. CSP `connect-src 'self' https:` olduğu için herhangi bir https adresine izin var.
- Tier'da yalnız `name` (string) ve `price` (sonlu, ≥0) doğrulanıyor. `nameLocalized` ve `cycle` olduğu gibi geçiyor ve ekranda kullanılıyor (`ServiceProfile.tsx` TRY'de `nameLocalized ?? name` gösteriyor). Yani **web'in `regions` biçimi Android'e doğrudan uyuyor**. Web'deki fazladan `currency` alanı zararsız.
- Kısıtlar: (a) Override yalnız paketteki servislerde çalışıyor. JSON'a yeni bir servis eklense Explore'da görünmüyor; bunun için uygulama sürümü gerekiyor. (b) Explore `svc.name` ile ("Claude Pro"), ekleme akışı ise CATALOG adıyla ("Claude") arama yapıyor. Bugün aynı servis için iki ayrı key gerekiyor.

### Önerilen pratik yol (en az değişiklik)
1. **Tek dosya: web reposunda `public/price-catalog.json`.** Vercel bunu `https://sub-sense-ashy.vercel.app/price-catalog.json` adresinden statik yayınlıyor. Kontrol edildi: Vercel statik dosyalarda `access-control-allow-origin: *` gönderiyor ve SPA rewrite'ı statik dosyayı ezmiyor.
2. Dosya **`data.ts` → `SUBSCRIPTION_CATALOG`'dan bir build script'iyle üretilsin**, elle yazılmasın. Örneğin `scripts/build-price-catalog.ts`, `npm run build` öncesinde çalışır. Her servis için:
   - `regions` = `SUBSCRIPTION_CATALOG[x].regions`
   - `startingAt`/`startingCurrency` = `price`/`currency`
   - `plans` = US tier'ları. Her biri `usd` + `regional.TRY` taşıyor; değer aynı adlı TR tier'ından geliyor.
   - `category`, `brandColor`, `logo` (slug) alanları da eklensin. Android bugün bunları yok sayıyor, ama ileride kataloğu tamamen JSON'dan kurmak için hazır dururlar.
3. **Android:** `src/data/catalog-source.ts` içinde `PRICE_CATALOG_URL = 'https://sub-sense-ashy.vercel.app/price-catalog.json'` yapılsın. Bu tek satırlık değişiklikle canlı katalog açılıyor.
4. **Ad birliği:** JSON key'i olarak web adı kullanılsın. Android'deki `CATALOG`/`PRICING` adları Explore adlarına çekilsin ("Claude" → "Claude Pro" …, 11 ad). Bu yapılana kadar script her servis için alias key'leri de yazabilir (aynı nesne iki key altında).
5. Web'in Gemini radarı (Firestore `priceCatalog`) Android'e ulaşmıyor. Bu ikinci aşama olabilir: functions içinde `GET /price-catalog.json` endpoint'i, Firestore'daki `changed && confidence:'high'` kayıtlarını statik dosyanın üstüne Android şemasında birleştirip döner. O zaman `PRICE_CATALOG_URL` bu endpoint'e çevrilir.
6. Ayrıca yapılması gerekenler: web'deki 23 yalnız-arama servisi için tier verisi ya kataloga eklensin ya da bilinçli olarak "fallback" diye işaretlensin. Android'deki 8 yalnız-PRICING servisi için Explore kaydı gerekiyor. `brandImageMap.ts` silinsin. Steam Deck ve MasterClass logo eşlemeleri düzeltilsin. Android'de `PRICING` ile `regions` aynı JSON'dan beslendiğinde 23 iç çelişki kendiliğinden kalkar.

