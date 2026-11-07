# Aboneyim (SubSense) — Tam Oturum Özeti (8 Kasım 2026)

Bu belge, **SubSense** projesinin yerel geliştirme ortamının ayağa kaldırılmasından **%100 Ücretsiz (Free)** dönüşümüne, 16 eksik/yarım işin faz faz tamamlanmasından **Aboneyim** marka dönüşümüne ve ev sunucusu (`macmini-server`) üzerinde Docker (`aboneyim_web` + `aboneyim_api`) + `tailscale serve` ile canlıya alınmasına kadar bu oturumda yapılan tüm çalışmaları özetler.

---

## 1. Yerel Ortam Onarımı ve İlk İnceleme

- **Sorun:** Yerel geliştirme sunucusunda (`npm run dev`) `.env` dosyası bulunmadığı için Firebase başlatılamıyor ve boş ekran hatası alınıyordu; ayrıca `framer-motion` / `motion-dom` ve `@firebase/auth` paketlerinde eksik dosyalar vardı.
- **Çözüm:**
  - Kök dizinde `.env` oluşturuldu ve `firebase/firebase.ts` içerisine güvenli yapılandırma kontrolü eklendi.
  - Bozuk `node_modules` paketleri (`framer-motion`, `motion-dom`, `@firebase/auth`) onarıldı.
  - Ana sayfa için çeşitli tasarım mockup denemeleri (`Apple`, `Claude`, `Google`, `Amazon`, `Samsung` ve 5 sanatsal konsept) hazırlandı; mevcut **Quiet Luxury / Horlogerie** tasarımının korunmasına karar verildi.
  - Tüm kod tabanı taranarak eksik ve yarım kalan 16 iş maddesi tespit edildi ve 4 fazlı uygulama planı çıkarıldı.

---

## 2. %100 Ücretsiz (Free) Dönüşümü

Kullanıcı kararı doğrultusunda projedeki tüm ücretli planlar, fiyatlandırma tabloları, Pro kilitleri ve Stripe entegrasyonu kaldırılarak uygulama tamamen **Ücretsiz (Free)** hale getirildi:

- **Silinen Dosyalar:**
  - `components/PricingSection.tsx`
  - `components/UpgradeModal.tsx`
  - `utils/stripe.ts`
  - `utils/api.ts`
- **Bağımlılık Temizliği:**
  - Kök `package.json` ve `functions/package.json` dosyalarından `stripe` paketi kaldırıldı.
- **Arayüz (Frontend) Temizliği:**
  - `components/Hero.tsx` içinden Fiyatlandırma (Pricing) bölümü ve navigasyon linkleri kaldırıldı.
  - `components/Sidebar.tsx` içinden "Upgrade to Pro" kartı kaldırıldı.
  - `components/Profile.tsx`, `components/Settings.tsx` ve `components/Friends.tsx` içinden Free/Pro rozetleri, Stripe müşteri portalı butonları ve "+30 gün Pro" referans ödülü kutuları kaldırıldı.
  - `components/AIInsightsCard.tsx` içindeki bulanıklaştırma (blur) ve Pro yükseltme kilidi kaldırıldı; AI analizleri tüm giriş yapmış kullanıcılara açıldı.
- **Backend Temizliği:**
  - `functions/src/index.ts` içinden `createCheckoutSession`, `createPortalSession`, `stripeWebhook` ve `verifyProAccess` kaldırıldı.
  - `geminiProxy` ve `geminiChatProxy` uçları giriş yapmış tüm kullanıcılara açıldı (kötüye kullanımı önlemek için istek boyutu sınırları korundu: `prompt <= 20000`, `userMessage <= 8000`, `history <= 40`, `systemInstruction <= 20000`).

---

## 3. Eksik ve Yarım Kalan 16 İşin Tamamlanması (Faz 1 – Faz 4)

### Faz 1 & 2: Backend ve Servis Fonksiyonları (`functions/src/*`)
1. **Gerçek Oturum İptali (`revokeAllSessions`):** `admin.auth().revokeRefreshTokens(uid)` kullanılarak kullanıcının tüm cihazlardaki oturumlarını gerçek anlamda sonlandıran fonksiyon eklendi.
2. **Tek E-posta Sağlayıcısı (Resend):** `functions/src/index.ts` içindeki eski SendGrid kodu kaldırılıp tüm e-posta gönderimleri **Resend** üzerinde birleştirildi; özel doğrulama e-postası şablonu (`sendCustomVerificationEmail`) aktif hale getirildi.
3. **Aylık Rapor (`sendMonthlyReports`) FX & Dil Desteği (`functions/src/emails.ts`):** `priceConfig/fxRates` üzerinden güncel döviz kurlarıyla kullanıcının ana para birimine dönüşüm, ortak aboneliklerde yalnızca kullanıcının kendi payının (`myShare`) hesaba katılması ve TR/EN dil desteği eklendi.
4. **Yenileme Hatırlatıcısı (`sendRenewalReminders`):** Kullanıcının `notifyPayment`, `notifyEmail` ve abonelik bazlı `reminderEnabled` ayarlarına uyum, `Trial` (deneme) bitiş tarihi (`trialEndDate`) desteği ve TR/EN e-posta şablonu eklendi.
5. **Admin Yetki Kontrolü (`functions/src/priceSync.ts`):** `triggerPriceSync` fonksiyonuna yalnızca admin claim'ine veya `ADMIN_EMAILS` listesindeki e-posta adresine sahip kullanıcıların erişebilmesi sağlandı.
6. **Arkadaşlıktan Çıkarma (`functions/src/friends.ts`):** İki kullanıcının karşılıklı arkadaşlık kaydını atomik `batch` işlemiyle silen `removeFriendFn` eklendi.
7. **ICS Takvim Akışı (`functions/src/calendar.ts`):** `calendarFeed` uç noktasına `RRULE:FREQ=MONTHLY` / `RRULE:FREQ=YEARLY` tekrarlama kuralları, ortak aboneliklerde `myShare` tutarı ve `Trial` bitiş tarihi etkinlikleri eklendi.

### Faz 3 & 4: Frontend, Firestore Senkronizasyonu, Modallar ve Dil Eşliği
8. **Tercih ve Bütçe Senkronizasyonu (`Dashboard.tsx` & `utils/firestore.ts`):** Sadece `localStorage`'da tutulan `budgetLimits`, `savingsGoal`, `totalSaved` ve bildirim tercihleri (`notifyEmail`, `notifyPush`, `notifyPayment`) Firestore kullanıcı belgesiyle çift yönlü senkronize edildi.
9. **Özel Doğrulama E-postası ve Tüm Cihazlardan Çıkış (`AuthContext.tsx` & `Settings.tsx`):** Kayıt ve doğrulama tekrarında `sendCustomVerificationEmail` (hata durumunda Firebase varsayılan e-postasına otomatik fallback ile) ve Ayarlar'da `logoutAllDevices` bağlantısı tamamlandı.
10. **Abonelik Ekleme/Düzenleme Modalı (`SubscriptionModal.tsx`):** Sabit döviz kurları canlı `useFxRates` kancasına bağlandı; `billingDay` ve `cycle` (`Monthly` / `Yearly`) değiştiğinde sonraki ödeme tarihinin otomatik hesaplanması sağlandı; düzenleme moduna `category` ve ortak abonelik (`isShared` / `myShare`) alanları eklendi.
11. **Takvim Modalı (`CalendarModal.tsx`):** Yalnızca aylık abonelikleri gösteren takvim mantığına `Yearly` (yıllık), `Trial` (deneme bitiş günü) ve kısa aylarda (ör. Şubat) ay sonu gün sabitlemesi (`clamp`) eklendi.
12. **Arkadaşlıktan Çıkarma Arayüzü (`Friends.tsx` & `utils/friends.ts`):** Arkadaş listesine onay adımlı arkadaşlıktan çıkarma butonu eklendi.
13. **Yardım Merkezi Kullanım Rehberi (`HelpCenter.tsx` & `KnownLimitationsModal.tsx`):** Tıklandığında tepki vermeyen "Kullanım Rehberi" kartı için 5 adımlı etkileşimli rehber modalı oluşturuldu; Bilinen Sınırlamalar listesi güncellendi.
14. **Tam TR / EN Çeviri Eşliği (`utils/translations.ts`):** Eksik tüm çeviri anahtarları tamamlanarak **811 İngilizce / 811 Türkçe** anahtar birebir eşitlendi (`missingInEn: 0`, `missingInTr: 0`).

---

## 4. Marka ve İsim Dönüşümü: "Aboneyim"

Kullanıcı seçimiyle projenin adı **SubSense** yerine **Aboneyim** olarak değiştirildi:

- `components/Logo.tsx`, `index.html`, `vite.config.ts` (PWA manifest `name` ve `short_name`), `package.json`, `README.md` ve tüm uygulama bileşenlerindeki marka referansları **Aboneyim** olarak güncellendi.
- `scripts/generate-price-pages.ts` çalıştırılarak `public/prices/` altındaki 48 statik SEO sayfası ve `sitemap.xml` **Aboneyim** markasıyla yeniden üretildi.
- `localStorage` anahtarlarında eski kullanıcı verilerinin kaybolmaması için `aboneyim_*` anahtarlarına otomatik geçiş (fallback) eklendi.

---

## 5. Ev Sunucusu (`macmini-server`) Kurulumu ve Canlı Yayın

Firebase Blaze (ücretli) planına ihtiyaç duymamak için hem ön yüz (`aboneyim_web`) hem de sunucu fonksiyonları (`aboneyim_api`) evdeki **Mac mini 2012 (`macmini-server`, Ubuntu Server 24.04 LTS)** üzerine Docker konteynerleri olarak taşındı:

| Bileşen | Konteyner Adı | Port / Ağ | Açıklama |
|---|---|---|---|
| **Frontend + Ters Proxy** | `aboneyim_web` | `127.0.0.1:3002 -> 80/tcp` | React/Vite SPA + Nginx (`server/nginx/spa.conf`). `/api/` isteklerini iç Docker ağındaki `aboneyim_api:4000` servisine iletir. |
| **Self-Hosted Backend API** | `aboneyim_api` | İç Docker ağı (`4000/tcp`) | `functions/src/server.ts` — 14 callable fonksiyonu (`/api/fn/:name`), ICS takvim akışını (`/api/calendar.ics`) ve zamanlanmış görevleri (her gün 09:00 hatırlatma, her ayın 1'i 10:00 aylık rapor, her Pazartesi 06:00 fiyat senkronizasyonu) çalıştırır. |
| **Tailscale HTTPS Yayını** | `tailscale serve` | `https://macmini-server.taild883a6.ts.net/` | Yalnızca Tailnet içinden güvenli HTTPS erişimi sağlar (`127.0.0.1:3002` adresine yönlendirir). |

### Yapılan Sunucu İşlemleri
- Eski çift-Nginx ve `ufw` üzerinde dış port açan betikler silindi; tek ve temiz `server/Dockerfile`, `functions/Dockerfile`, `server/docker-compose.yml` ve `server/scripts/deploy.sh` yapısı kuruldu.
- `firebase/firebase.ts` içerisine Firebase SDK'nın ücretli Cloud Functions uçları yerine kendi sunucumuzdaki `/api/fn/:name` adresine Bearer ID token ile istek atan özel `httpsCallable` katmanı yazıldı.
- `macmini-server` üzerinde `sudo tailscale serve --bg http://127.0.0.1:3002` ve `sudo tailscale set --operator=$USER` ayarlandı.
- `macmini-server.taild883a6.ts.net` adresi **Firebase Console → Authentication → Settings → Authorized domains** listesine eklendi ve canlı ortamda (`https://macmini-server.taild883a6.ts.net/`) çalıştığı doğrulandı.

---

## 6. 2026 Güncel Abonelik Fiyatları Güncellemesi (TR & US)

- `utils/subscriptionTemplates.ts` ve `utils/data.ts` (`SUBSCRIPTION_CATALOG`) içindeki tüm abonelik servislerinin Türkiye (`TRY`) ve Küresel (`USD`) fiyatları 2026 resmi tarifeleriyle güncellendi (Netflix TR `₺259,99 / ₺389,99 / ₺499,99`, Spotify TR `₺60 / ₺115 / ₺159 / ₺199`, YouTube Premium TR `₺79,99 / ₺119,99 / ₺239,99`, Disney+ TR `₺249,90 / ₺449,90`, Amazon Prime TR `₺69,90`, Max/BluTV `₺229,90 / ₺299,90`, Exxen `₺219 / ₺309 / ₺499`, Apple Music `₺89,99`, Xbox Game Pass `₺269–₺529`, PS Plus `₺400–₺710`, ChatGPT Plus `₺999,99 / $20`, Claude Pro `₺899,99 / $20`, Adobe CC `₺956 / $59.99`, Microsoft 365 `₺329,99 / ₺409,99`, Canva Pro `₺239,99`, Trendyol Plus `₺75`, Hepsiburada Premium `₺69,90` vb.).
- Eksik olan popüler servisler (**Gain, Tabii, Canva Pro, Gemini Advanced, Perplexity, GeForce Now / GAME+, EA Play, Ubisoft+, Deezer**) hem şablonlara hem de katalog ve `functions/src/priceSync.ts` listesine eklendi.
- `components/SubscriptionSearchPanel.tsx` içine katalog dışı ikincil servislerin `$0.00` görünmesini önleyen `FALLBACK_PRICING` eklendi; `components/Comparison.tsx` gerçek katalog bölge fiyatlarını (`regions.TR` ve `regions.US`) kullanacak şekilde güncellendi.
- 47 statik SEO fiyat sayfası yeniden üretildi ve güncel imaj `macmini-server` üzerine dağıtıldı.


