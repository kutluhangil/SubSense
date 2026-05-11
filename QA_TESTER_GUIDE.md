# SubSense — QA Tester Guide

> **Proje:** SubSense · Abonelik yönetim uygulaması  
> **Stack:** React 19 + TypeScript + Firebase + Stripe + Gemini AI  
> **Build:** Vite → `npm run dev` (geliştirme) / `npm run build` (prod)

---

## Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat (http://localhost:5173)
npm run dev
```

---

## Uygulama Mimarisi

```
SubSense/
├── App.tsx                   — Routing, auth gate, email actions
├── contexts/
│   ├── AuthContext.tsx        — Firebase Auth durumu, signup/login/logout
│   ├── LanguageContext.tsx    — Dil (EN/TR), para birimi, tema (light/dark/system)
│   └── FeedbackContext.tsx    — Feedback modalı tetikleme
├── components/               — Tüm UI bileşenleri
├── utils/
│   ├── firestore.ts          — Firestore CRUD + local fallback
│   ├── currency.ts           — Döviz kuru çekme & dönüştürme (open.er-api.com)
│   ├── stripe.ts             — Stripe Checkout / Portal
│   ├── translations.ts       — EN + TR çeviriler
│   ├── analytics.ts          — Firebase Analytics event tracking
│   └── notificationService.ts — Tarayıcı push bildirim yönetimi
├── firebase/firebase.ts      — Firebase init (Auth, Firestore, Functions)
├── functions/src/            — Firebase Cloud Functions (Backend)
│   ├── index.ts              — Stripe webhooks, email gönderimi, user search
│   ├── app.ts                — Express API (subscriptions CRUD)
│   └── routes/subscriptions.ts
└── firestore.rules           — Güvenlik kuralları
```

---

## Sahibinin Yapması Gereken Adımlar

Bunlar kod değişikliği gerektirmeyen, **manuel yapılandırma** gerektiren maddelerdir.

---

### 1. Firebase Kurulumu

#### 1a. Firebase Console'da Email/Password Auth'u Etkinleştir
1. [Firebase Console](https://console.firebase.google.com/) → Proje → **Authentication**
2. **Sign-in method** → **Email/Password** → Etkinleştir → Kaydet

#### 1b. Firestore Veritabanı Oluştur
1. Firebase Console → **Firestore Database** → **Create database**
2. Production mode'da başlat
3. `firestore.rules` dosyası zaten hazır — Firebase Console'dan veya CLI ile deploy et:
   ```bash
   firebase deploy --only firestore:rules
   ```

#### 1c. Firebase Hosting Deploy (Frontend)
```bash
# Firebase CLI ile giriş yap
firebase login

# Projeyi bağla (zaten bağlı: subscriptionhub-85b02)
firebase use --add

# Build et ve deploy et
npm run build
firebase deploy --only hosting
```

> **Not:** `.firebaserc` dosyası `subscriptionhub-85b02` projesine bağlı.

---

### 2. Stripe Kurulumu

#### 2a. Stripe Dashboard'da Ürün/Fiyat Oluştur
1. [Stripe Dashboard](https://dashboard.stripe.com/) → **Products** → **Add Product**
2. Aylık plan: $3.99/ay → Price ID'yi kopyala (örn. `price_1AbCdEf...`)
3. Yıllık plan: $29.99/yıl → Price ID'yi kopyala (örn. `price_1GhIjKl...`)

#### 2b. `functions/src/index.ts` İçindeki Placeholder Price ID'leri Değiştir
Dosyada (satır 17-21):
```ts
const PRICES = {
  month: "price_1Pxxxxx", // ← BU PLACEHOLDER, GERÇEK ID İLE DEĞİŞTİR
  year: "price_1Pyyyyy",  // ← BU PLACEHOLDER, GERÇEK ID İLE DEĞİŞTİR
};
```
Gerçek ID'lerle değiştirdikten sonra `functions/lib/` dizinini yeniden build et:
```bash
cd functions && npm run build && cd ..
```

#### 2c. Firebase Functions'a Stripe Secret Key'i Yükle
```bash
firebase functions:config:set stripe.secret="sk_live_XXX"
firebase functions:config:set stripe.webhook_secret="whsec_XXX"
```

> **Webhook Secret:** Stripe Dashboard → Developers → Webhooks → Endpoint oluştur  
> URL: `https://us-central1-[proje-id].cloudfunctions.net/stripeWebhook`  
> Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

#### 2d. Stripe Customer Portal'ı Yapılandır
Stripe Dashboard → **Settings** → **Billing** → **Customer portal** → Etkinleştir

---

### 3. SendGrid E-posta Kurulumu

Uygulamanın özel doğrulama e-postaları göndermesi için SendGrid gereklidir.

#### 3a. SendGrid Hesabı ve API Key
1. [SendGrid](https://sendgrid.com) → Hesap Oluştur → API Keys → API Key oluştur
2. Firebase Functions'a ekle:
   ```bash
   firebase functions:config:set sendgrid.key="SG.XXXXXXXX"
   ```

#### 3b. Gönderici E-posta Adresini Doğrula
`functions/src/index.ts` satır 309'da:
```ts
from: { email: 'noreply@subsense.app', name: 'SubSense Team' },
```
Bu e-posta adresi SendGrid'de **Single Sender Verification** ile doğrulanmalıdır.  
→ SendGrid Dashboard → Settings → Sender Authentication → Single Sender

> **Alternatif:** SendGrid yoksa, uygulamanın fallback mekanizması devreye girer  
> (`sendEmailVerification` Firebase varsayılan e-postasını gönderir).

---

### 4. Firebase Functions'a Uygulama URL'sini Ekle

Doğrulama e-postasındaki redirect URL'nin doğru olması için:
```bash
firebase functions:config:set app.url="https://senin-domainin.com"
```

> Eğer bu yapılandırılmassa, uygulama `https://subsense.app` adresini kullanır.

---

### 5. Firebase Functions Deploy

> **Önemli:** Firebase Functions Blaze (pay-as-you-go) planı gerektirir.

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

---

### 6. Firebase Functions Lokal Test (Opsiyonel)

```bash
# Functions emülatörü
firebase emulators:start --only functions,firestore
```

`.env` dosyasına şunu ekle:
```
FIREBASE_EMULATOR_HOST=localhost
```

---

### 7. Google Gemini AI

Gemini API Key zaten `.env` dosyasında mevcut:
```
VITE_GEMINI_API_KEY=AIzaSy...
```

Eğer key geçersizse [Google AI Studio](https://aistudio.google.com/apikey)'dan yeni key alınabilir.

---

## Test Senaryoları (QA)

### Auth Akışı

| Test | Beklenen Sonuç |
|------|---------------|
| Yeni kullanıcı kayıt | Doğrulama e-postası gönderilmeli |
| Doğrulanmamış hesapla giriş | `VerifyEmailPage` ekranı gösterilmeli, dashboard erişimi engellenmeli |
| E-posta doğrulama linki tıklama | Dashboard'a yönlendirilmeli |
| "Şifremi unuttum" akışı | Eposta gönderilmeli (hesap yoksa da hata gösterilmemeli — güvenlik) |
| Çıkış yap | Tüm kullanıcı state'i temizlenmeli |

### Abonelik Yönetimi

| Test | Beklenen Sonuç |
|------|---------------|
| Yeni abonelik ekleme | Firestore'a kaydedilmeli, dashboard güncellenmeli |
| Abonelik güncelleme | Değişiklikler anında yansımalı |
| Abonelik silme | `totalSaved` güncellenmeli |
| "Ödendi" işaretleme | `nextDate` bir dönem ileri alınmalı |
| Duplicate abonelik | Hata mesajı gösterilmeli (409 hatası) |

### Para Birimi & Dil

| Test | Beklenen Sonuç |
|------|---------------|
| Para birimi değişikliği | Tüm fiyatlar anında dönüştürülmeli |
| Türkçe dil seçimi | Tüm UI metinleri Türkçe olmalı |
| Karanlık tema | Tüm bileşenler dark mode'u desteklemeli |
| Preview Currency modu | Orijinal para birimleri değişmeden sadece görüntü değişmeli |

### Analytics

| Test | Beklenen Sonuç |
|------|---------------|
| 30g/3a/6a/12a zaman aralığı | Grafik verileri güncellenmeli |
| CSV export | Geçerli CSV indirilmeli |
| Budget editor | `$` yerine seçilen para birimi sembolü görünmeli |
| Subscription Lifetime barları | Yeniden render'da bar genişlikleri sabit kalmalı (flickering yok) |

### Stripe Ödeme

| Test | Beklenen Sonuç |
|------|---------------|
| "Upgrade to Pro" butonu | Stripe Checkout'a yönlendirmeli |
| Başarılı ödeme sonrası | Plan "Pro" olarak güncellenmeli |
| "Manage Subscription" | Stripe Customer Portal açılmalı |
| Webhook testi (Stripe CLI) | `stripe trigger checkout.session.completed` ile plan güncellenmeli |

### Offline Mod

| Test | Beklenen Sonuç |
|------|---------------|
| İnternet bağlantısını kes | Kırmızı offline banner görünmeli |
| Offline'da abonelik listesi | localStorage fallback'i göstermeli |

---

## Bilinen Kısıtlamalar

| Özellik | Durum |
|---------|-------|
| Hesap silme | UI'da buton var ancak backend implementasyonu yok — sadece uyarı gösteriyor |
| Arkadaşlar özelliği | `SOCIAL_FRIENDS: false` flag ile devre dışı |
| Subscription Lifetime grafik | Gerçek start tarihi yerine ID-tabanlı hesaplama kullanıyor |
| "Logout from all devices" | Sadece UI uyarısı var, gerçek session revocation yok |
| Uygulama URL'si | `functions/src/index.ts`'de `app.url` config ile override edilmezse `https://subsense.app` default kullanılır |

---

## Düzeltilen Hatalar (Bu Build)

| Hata | Düzeltme |
|------|----------|
| `handlePreferenceUpdate` çift `preferences` nesting | `{ [key]: value }` şeklinde düzeltildi |
| Subscription Lifetime bar genişlikleri her render'da random değişiyordu | ID-tabanlı deterministik değer kullanıldı |
| Budget editor `$` simgesi hardcoded | Seçili para birimi sembolü dinamik gösteriliyor |
| "You are offline" Türkçe çevirisi yoktu | `app.offline` çeviri anahtarı eklendi |
| Toast mesajları İngilizce hardcoded | `t()` ile çeviri sistemi kullanıldı |
| `functions/src/index.ts` eski Firebase proje URL'si | `app.url` config veya `https://subsense.app` kullanılıyor |

---

## Ortam Değişkenleri

`.env` dosyası root'ta mevcuttur. Sıfırdan kurulum için `.env.example`'ı kopyala:
```bash
cp .env.example .env
# Değerleri doldur
```

| Değişken | Nerede Alınır |
|----------|--------------|
| `VITE_FIREBASE_*` | Firebase Console → Project Settings |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |

Firebase Functions için `.env` DEĞİL, `firebase functions:config:set` kullanılır.

---

*Bu dosya QA test süreci için hazırlanmıştır. Üretim ortamına geçmeden önce yukarıdaki tüm "Sahibinin Yapması Gereken Adımlar" bölümündeki maddeler tamamlanmalıdır.*
