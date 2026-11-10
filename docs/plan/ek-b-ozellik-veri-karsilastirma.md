# Aboneyim (web) ↔ SubSense Android: ortak backend karşılaştırması

Tarih: 2026-11-10 · Salt okuma incelemesi, iki repoda da dosya değişmedi.

- WEB = `/Volumes/ProjectClaude/SubSense` (Firebase `subscriptionhub-85b02` + `functions/src/server.ts` Express `/api/fn/*`)
- AND = `/Volumes/ProjectClaude/SubSense-AndroidApp` (Capacitor 6 + React, `com.subsense.apps`, v2.4.1 / versionCode 4)

**Android'in Firebase projesi:** repoda bulunamadı. `.env.local`, `google-services.json` ve `GoogleService-Info.plist` gitignore'da ve diskte yok. Git geçmişinde yalnız `.env.example` yer tutucusu (`your-project`) var. Yayın rehberi (commit 4d11136 / a232dd1) gitignore'lu bir dosyadaymış, içeriği gitte yok. Proje kimliği Firebase konsolundan ya da Play'deki AAB'den (`strings.xml` içinde `project_id`/`google_app_id`) okunmalı. Neural-Vault'ta da iz yok.

---

## 1. Özellik matrisi

| Özellik | Web | Android | Not |
|---|---|---|---|
| Dashboard / Ana sayfa | ✅ `Dashboard.tsx`, `StatsCards` | ✅ `screens/Home.tsx` | Android: bütçe aşımı uyarısı + çakışma (overlap) içgörüsü |
| Abonelik listesi | ✅ `SubscriptionsPage`, `SubscriptionTable` | ✅ `Subscriptions.tsx` | |
| Ekle / düzenle | ✅ `AddSubscriptionModal`, `SubscriptionModal` | ✅ `AddEditSubscription.tsx` | Şablonlar ikisinde de var |
| Detay | ✅ `SubscriptionModal`, `SubscriptionProfileModal` | ✅ `SubscriptionDetail.tsx`, `ServiceProfile.tsx` | İkisi de fiyat geçmişini (`history`) grafikle gösteriyor |
| "Ödendi" / tarih ilerletme | ✅ (Dashboard, `history`'ye ekliyor) | ✅ `markPaid` (`history`'ye EKLEMİYOR) | |
| Takvim | ✅ `CalendarModal` + ICS feed (`calendar.ts`, `calendarToken`) | ✅ `Calendar.tsx` | ICS abonelik linki yalnız web'de |
| Analitik / içgörüler | ✅ `Analytics`, `AnalyticsCharts`, `AIInsightsCard` | ✅ `Insights.tsx` (donut, 12 ay tahmini, rapor dışa aktarma) | |
| Keşfet | ✅ `Discover.tsx` | ✅ `Discover.tsx` + `data/explore*.ts` (TR/US kademeleri) | |
| Fiyat karşılaştırma | ✅ `Comparison.tsx` | ~ `ServiceProfile` bölgesel kademeler, AI'da "compare" | |
| Fiyat değişimi radarı | ✅ `PriceSyncBanner` + Firestore `priceCatalog` (haftalık `syncPricesWeekly`) | ✅ `lib/priceWatch.ts` (uzak JSON katalog, yerel `priceSnapshot`) | Kaynaklar farklı |
| AI asistan | ✅ Gemini proxy (`geminiProxy`, `geminiChatProxy`) | ✅ `lib/assistant/*` yerel kural motoru, ağ yok | |
| Arkadaşlar | ✅ `Friends.tsx` + `friends.ts` callable'ları | ❌ | |
| Referans | ✅ `getReferralCode` / `redeemReferral` (Pro süresi) | ~ yalnız "uygulamayı paylaş" (`Profile.tsx:122`) | |
| Başarımlar | ✅ `utils/achievements.ts` → `users/{uid}.achievements: string[]` | ✅ 4 sabit rozet, yerel (`store/app.ts:162-182`) | |
| Wrapped | ✅ `Wrapped.tsx` | ❌ | |
| Bütçe limitleri | ✅ `preferences.budgetLimits` (+localStorage) | ✅ `settings.budgetLimits` yerel | |
| Tasarruf hedefi | ✅ `preferences.savingsGoal`, `totalSaved` | ❌ | |
| Ortak abonelik (`isShared` / `myShare`) | ✅ | ❌ | |
| E-posta bildirimi | ✅ `emails.ts` (günlük 3 gün önce hatırlatma + aylık rapor) | ❌ | |
| Push / yerel bildirim | ~ tarayıcı `Notification` (`notificationService.ts`) | ✅ `@capacitor/local-notifications`, saat 10:00 | FCM ikisinde de yok |
| Widget | ❌ | ✅ Android `SubSenseWidget.java`; iOS kodu var ama bağlı değil | |
| Biyometrik kilit | ❌ | ✅ `AppLockGate`, `capacitor-native-biometric` | |
| Yedek / dışa / içe aktarma | ✅ CSV dışa ve içe aktarma (`Settings.tsx:99-128`, `230+`) | ✅ JSON yedek (`lib/backup.ts`) | Formatlar uyumsuz |
| Para birimi / kur | ✅ 8 kod, open.er-api | ✅ 20 kod, open.er-api | Bkz. §3-C3 |
| Diller | en, tr | en, tr | |
| Temalar | light / dark / system (varsayılan light) | light / dark / system (varsayılan dark) | |
| Karşılama | ✅ `OnboardingTour` | ✅ `Onboarding.tsx` | |
| Hesap silme | ✅ `deleteUserAccount` callable (admin, tüm alt koleksiyonlar) | ✅ istemci tarafı `cloud.ts:111-152` | Android'deki kural gereği bozuk, bkz. §3-C6 |
| Giriş yöntemleri | yalnız e-posta + şifre (doğrulama zorunlu) | yalnız Google; ya da hesapsız yerel "isim" profili | **ORTAK YÖNTEM YOK** |
| Çevrimdışı | ~ izin reddinde localStorage yedeği | ✅ local-first + Firestore `persistentLocalCache` | |
| Pro / plan | `plan` alanı (artık %100 ücretsiz) | `isPro: true` yerel | |
| Geri bildirim / yardım | ✅ `feedback`, `beta_feedback`, `HelpCenter` | ~ dış linkler (`docs/help.html`) | |
| Profil kartı / gizlilik ayarları | ✅ `preferences.profile`, `privacy` | ❌ | |

**Yalnız web'de:** Arkadaşlar, referans kodu, Wrapped, tasarruf hedefi, ortak abonelik/myShare, e-posta hatırlatma + aylık rapor, ICS takvim feed'i, Gemini AI, CSV içe/dışa aktarma, Firestore fiyat kataloğu radarı, profil kartı + gizlilik, analitik opt-out, oturumları kapatma, geri bildirim, e-posta/şifre girişi.

**Yalnız Android'de:** Widget, biyometrik kilit, yerel bildirimler, yerel AI kural motoru, JSON yedek, hesapsız local-first kullanım, Google girişi, 20 para birimi, örnek veri yükleme, `trialPrice`, `paymentMethod`, `brandColor`.

**İkisinde de:** Dashboard, liste, ekle/düzenle, detay + geçmiş grafiği, takvim, içgörüler, keşfet, fiyat artışı uyarısı, başarımlar (farklı modeller), bütçe limitleri, en/tr, 3 tema, karşılama, hesap silme.

---

## 2. Veri modeli farkları

### 2a. `users/{uid}/subscriptions/{id}`
Web: `types/subscription.ts:1-23`, yazma `utils/firestore.ts:291-344`. Android: `src/types.ts:13-35`, yazma `src/lib/cloud.ts:268-298`.

| Alan | Web | Android | Uyumlu mu? | Göç gerekir mi? |
|---|---|---|---|---|
| doc id | `addDoc` otomatik kimlik (20 karakter); tip `number\|string` | `'sub-' + 7 rastgele karakter` (`store/app.ts:72-74`), doc id olarak yazılıyor | ✅ ikisi de string | Hayır. Web'de tipi `string` yap |
| name | zorunlu; ≤50 karakter, emoji yok (`validateSubscription.ts:17-30`) | zorunlu; uzunluk ve emoji sınırı yok | ⚠️ Emojili ya da uzun ad web'de **görünmez** | Ortak doğrulama |
| price | number ≥0 | number >0 (deneme sırasında post-trial fiyat) | ✅ | |
| originalPrice | var | yok | ✅ (merge alanı koruyor) | |
| currency | 8 kod (USD EUR GBP TRY JPY CNY AUD CAD) | 20 kod (+INR BRL RUB KRW MXN SAR AED CHF SEK NOK DKK PLN) | ❌ Web 12 kodu süzüp **gizliyor** (`validateSubscription.ts:43-46`) | Web listesini 20'ye çıkar |
| cycle | Monthly / Yearly | Monthly / Yearly | ✅ | |
| nextDate | `"Nov 10, 2026"` (`toLocaleDateString('en-US')`, `AddSubscriptionModal.tsx:129-133`; varsayılan `firestore.ts:385`) | `"2026-11-10"` ISO (`types.ts:20`) | ❌ Bkz. §3-C2 | **Evet**: hepsini ISO `YYYY-MM-DD` yap |
| startDate / trialEndDate | string (biçim serbest) | ISO | ⚠️ | ISO |
| status | Active / Trial / Expiring / Inactive | aynı 4 değer | ✅ enum aynı. `Expiring`'i Android `markPaid`'de Active'e çeviriyor, web "cancelled" filtresinde iptal sayıyor (`SubscriptionsPage.tsx:39`) | Anlamı netleştir |
| category | serbest string: Entertainment, Music, Productivity, Cloud, Gaming, Software, Fitness, Education, Uncategorized (`SubscriptionModal.tsx:21-30`) | 7 değerlik union: Entertainment, Productivity, Tools, Music, Gaming, Health & Fitness, Shopping | ⚠️ Kesişim: Entertainment, Productivity, Music, Gaming. Gerisi bütçe ve renk eşleşmesinde kayboluyor | Ortak kategori sözlüğü + eşleme |
| type | zorunlu (`"default"` ya da marka) | yok | ⚠️ web tipi zorunlu sayıyor, kod pek kullanmıyor | İsteğe bağlı yap |
| billingDay | zorunlu (takvimde kullanılıyor, `CalendarModal.tsx:128`) | isteğe bağlı, formda yazılmıyor | ✅ (web `nextDate`'e düşüyor, ama C2 yüzünden NaN) | ISO tarihten türet |
| plan | isteğe bağlı | zorunlu string | ✅ | |
| history | number[]; "ödendi" işaretlenince ekleniyor | number[]; yalnız örnek veride dolu, `markPaid` eklemiyor | ⚠️ | Android `markPaid`'e ekleme yap |
| logo | base64 SVG data URI ya da slug | Android okumuyor (`logoFor(name)`) ama alanı taşıyor | ✅ (doküman şişiyor) | Hayır |
| isShared / myShare | var; e-postada `myShare` kullanılıyor (`emails.ts:104`) | yok. Korunuyor ama toplamlarda hesaba katılmıyor | ⚠️ | Android'e ekle |
| reminderEnabled, notes, nickname | var | var | ✅ (web notes ≤500) | |
| trialPrice, paymentMethod, brandColor | yok | var | ✅ (web yok sayıyor) | Web tipine ekle |
| createdAt | `serverTimestamp()` | `fromDoc` atmıyor → yerel store'da Timestamp → JSON'da `{seconds,nanoseconds}` → push'ta **düz map** olarak geri yazılıyor (`cloud.ts:300-304`) | ⚠️ Tip bozuluyor | `fromDoc` `createdAt`'i de atsın |
| updatedAt | `serverTimestamp()` | `serverTimestamp()`, okurken atılıyor | ✅ | |

### 2b. `users/{uid}` profil dokümanı

| Alan | Web (`firestore.ts:43-78, 114-143`) | Android (`cloud.ts:217-221`) |
|---|---|---|
| uid, email | var | **yok** (email yok → arkadaş aramasında bulunmaz) |
| displayName | var | var |
| baseCurrency | `preferences.baseCurrency` | **kök seviyede** `baseCurrency` ❌ |
| language / theme / region | `preferences.*` | yok (yerel) |
| budgetLimits / savingsGoal / totalSaved | `preferences.*` | yok (yerel) |
| notifyEmail / notifyPayment / calendarToken / privacy / profile / analyticsOptOut | `preferences.*` | yok |
| stats, analytics, achievements[], plan, referral, termsAcceptedAt, createdAt | var | yok |
| updatedAt | yok | var |

Kritik: Android önce girerse, `setDoc merge` ile yalnız `{displayName, baseCurrency, updatedAt}` içeren bir doküman yaratılıyor. Web'in `initializeUserDocument` fonksiyonu doküman varsa olduğu gibi döndürüyor (`firestore.ts:163-165`), yani `preferences`, `plan` ve `stats` hiç oluşmuyor. Web optional chaining kullandığı için çoğu yer çökmüyor, ama varsayılanlar (dil, tema, bildirim, plan) yazılmamış kalıyor.

### 2c. Ayarların yeri
- Web: `users/{uid}.preferences` (+ localStorage önbelleği `subscriptionhub.*`, `userLanguagePreference`, `userThemePreference`).
- Android: yalnız Capacitor Preferences, `subsense.app.v2` anahtarı (`store/app.ts:153-157`). Buluta hiçbir ayar gitmiyor (kök `baseCurrency` dışında).

---

## 3. Senkron çakışmaları (iki uygulama bugün aynı `users/{uid}/subscriptions`'a yazarsa)

Bugünkü ön koşul: aynı hesap iki tarafta açılamıyor (web e-posta/şifre, Android Google) ve Android'in projesi bilinmiyor. Aşağıdakiler hesaplar birleştirildikten sonra ortaya çıkar.

- **C1. Silme ve sıfırlama buluta yayılıyor (veri kaybı).** `pushDiff`, `prevMap`'te olup yerel listede olmayan her dokümanı siliyor (`cloud.ts:293-295`). Bu yüzden Android'de şu işlemler web verisini de siler:
  - "Verileri temizle" → `clearAll` (`store/app.ts:132`, `Settings.tsx:481`) → buluttaki **tüm** abonelikler silinir.
  - "Örnek veri yükle" → `loadSampleData` listeyi seed ile değiştirir (`store/app.ts:131`) → tüm gerçek dokümanlar silinir, yerine örnekler yazılır.
  - JSON yedekten geri yükleme → `importData` listeyi tamamen değiştirir (`store/app.ts:134-141`, `Settings.tsx:207`) → yedekte olmayan web abonelikleri silinir.
- **C2. Tarih formatı.** Web `"Nov 10, 2026"` yazıyor. Android `parseDate`, `new Date("Nov 10, 2026T00:00:00")` deniyor → Invalid → `null` (`src/lib/format.ts:49-53`). Sonuç: web kaydı Android'de tarihsiz görünür, `daysUntil`/takvim/bildirim çalışmaz, `markPaid` `addCycle` içinde **bugünü** baz alır (`format.ts:90`). Ters yönde, web Android'in ISO tarihini `new Date("2026-11-10")` ile UTC gece yarısı okur. UTC'nin batısındaki saat dilimlerinde bir gün kayar. Görüntü de karışık olur.
- **C3. Web doğrulaması gizliyor.** Dinleyici `validateSubscription` ile süzüyor (`firestore.ts:387`). 12 ek para birimindeki, emojili ya da 50 karakterden uzun adlı Android kayıtları web'de sessizce görünmez. Ama sayaçlarda ve e-postada (`emails.ts`, doğrulama yok) yer alır.
- **C4. Silinen kayıt geri geliyor.** Android her açılışta `startSync` ile uzlaştırıyor ve buluta olmayan yerel kayıtları "local-only" sayıp geri yüklüyor (`cloud.ts:237-238`). Web'de silinen bir abonelik, Android o sırada kapalıysa, bir sonraki açılışta yeniden yaratılır.
- **C5. "Bulut kazanır" + tüm dokümanın üstüne yazma.** İlk uzlaştırmada bulut sürümü yereli eziyor (`cloud.ts:236`). Sonrasında Android değişen kaydın **tüm alanlarını** `setDoc merge` ile yazıyor (`cloud.ts:288-291`). Web bu arada `price`/`history`/`myShare` güncellediyse, Android'in eski kopyası bir sonraki yerel düzenlemede bunları ezer (alan bazlı değil, kayıt bazlı son yazan kazanır).
- **C6. Hesap silme kurala takılıyor.** Web kuralları `users/{uid}` üzerinde `delete` izni vermiyor (`firestore.rules:18-30`). Android'in batch'i abonelikler + profil dokümanını tek atomik işlemde siliyor (`cloud.ts:121-126`), batch tamamen reddediliyor, hata yutuluyor, ardından Auth kullanıcısı siliniyor. Sonuç: **sahipsiz Firestore verisi** kalıyor (Play'in veri silme beyanına aykırı). `friends`, `friendRequests` ve `sentRequests` hiç ele alınmıyor. Çözüm: Android web'in `deleteUserAccount` callable'ını çağırsın.
- **C7. `undefined` alanlar push'u düşürüyor (bugün de var olan hata).** Yeni bir Active kayıtta `trialEndDate: undefined` ve `trialPrice: undefined` oluşuyor (`AddEditSubscription.tsx:114-120`). Firestore `ignoreUndefinedProperties` kapalı (`src/lib/firebase.ts`). `setDoc` reddediyor, `allSettled` yutuyor (`cloud.ts:297`), ama `prevMap` güncellendiği için tekrar denenmiyor. Kayıt ancak bir sonraki uygulama açılışında buluta çıkıyor (persist JSON'u undefined'ı sildikten sonra). Web o zamana kadar bu kaydı görmüyor.
- **C8. E-posta doğrulama kuralı.** `subscriptions` için `isVerified()` şart (`firestore.rules:13-15, 34-36`). Google/Apple token'larında `email_verified=true`, sorun yok. Android'e e-posta/şifre eklenirse doğrulanmamış kullanıcının senkronu `permission-denied` alır, web'deki gibi doğrulama akışı gerekir (`AuthContext.tsx:139-148, 247`).
- **C9. `plan` alanı.** Android `plan` yazmıyor, update kuralı (`firestore.rules:24-25`) geçiyor. İlk dokümanı Android yaratırsa create kuralı da geçiyor (plan yok). Sorun değil, ama web'de `plan` hiç oluşmuyor (§2b).
- **C10. Kural dosyası çakışması.** Android reposundaki `firestore.rules` (`users/{uid}/**` serbest) aynı projeye deploy edilirse web kurallarını ezer: `priceCatalog`/`priceConfig` okuması ve `feedback` yazması kapanır, `plan` koruması ve e-posta doğrulama şartı kalkar. Tek kaynak web'in `firestore.rules`'u olmalı, Android'deki silinmeli ya da arşivlenmeli.
- **C11. Web alt koleksiyonları (`friends`, `friendRequests`, `sentRequests`).** Android bunlara dokunmuyor, okumada çakışma yok. Ama Android profilinde `email` olmadığı için `searchUsers` Android kullanıcısını bulamayabilir.
- **C12. Çift hatırlatma.** Android kaydı web backend'inin günlük e-posta taramasına da giriyor (`emails.ts:80-104`). Kullanıcı hem yerel bildirim hem e-posta alır. Bu bir tercih meselesi, `notifyEmail` ile kapatılabilir.
- **C13. Backend erişimi.** Web callable'ları göreli `/api/fn/*` (`firebase/firebase.ts:91`). Vercel'de API yok (`vercel.json` her şeyi `index.html`'e yönlendiriyor), Express yalnız tailnet'te (`macmini-server`). Android'in `deleteUserAccount`/`geminiProxy`'yi kullanması için herkese açık bir API ucu (ileride Cloudflare Tunnel) gerekir.

---

## 4. Auth: tek hesap iki uygulamada

1. **Aynı Firebase projesi:** Android `subscriptionhub-85b02`'ye taşınmalı. Projeye `com.subsense.apps` Android uygulaması eklenir. Debug, upload ve **Play App Signing** SHA-1/SHA-256 değerleri kaydedilir. Yeni `google-services.json` ve `.env.local` (`VITE_FIREBASE_*`) gelir. Eski projede kullanıcı varsa, uid'ler projeler arası taşınmaz. Ya Admin SDK ile `auth:export`/`import` yapılır (uid korunur), ya da e-postaya göre eşlenen bir göç betiği yazılır.
2. **Web'e Google girişi:** `GoogleAuthProvider` + `signInWithPopup`/`Redirect`. `AuthContext` içinde `initializeUserDocument` Google kullanıcısı için de çağrılmalı. Firebase konsolunda Google sağlayıcısı açılır, Vercel alan adı ve `macmini-server.taild883a6.ts.net` "Authorized domains"a eklenir.
3. **Android'e e-posta/şifre (isteğe bağlı, önerilir):** Web kullanıcıları şifreyle girebilsin diye. Doğrulama e-postası + doğrulanmamış hesapta senkron yok uyarısı (C8) gerekir. Şifre sıfırlama web'in `ResetPasswordPage` akışına yönlendirilebilir.
4. **Hesap bağlama:** Firebase varsayılanı "e-posta başına tek hesap".
   - `@gmail.com` için Google güvenilir sağlayıcı sayılır. Doğrulanmış e-posta/şifre hesabına Google ile girilince aynı uid'e otomatik bağlanır. **Doğrulanmamış** şifre hesabında ise Google girişi şifreyi siler, hesap Google'a geçer.
   - Gmail dışı adreslerde (Workspace vb.) `auth/account-exists-with-different-credential` hatası gelir. Önce mevcut yöntemle giriş, sonra `linkWithCredential` gerekir. E-posta numaralandırma koruması açıksa `fetchSignInMethodsForEmail` boş döner, akış hata koduna göre yazılmalı.
   - Ayarlarda "Google'ı bağla" / "Apple'ı bağla" düğmesi: `linkWithPopup`/`linkWithCredential`.
5. **Sign in with Apple (iOS):** App Store yönergesi 4.8, üçüncü taraf girişi (Google) sunan uygulamada eşdeğer, gizlilik odaklı bir seçenek ister. Pratikte Apple ile Giriş eklenir. `@capacitor-firebase/authentication` `apple.com` sağlayıcısını destekliyor (`capacitor.config.ts` `providers`'a eklenir). Firebase'de Apple sağlayıcısı açılır (Services ID, Key, Team ID). Web'e de "Apple ile giriş" eklenmeli. Yoksa Apple "e-postamı gizle" (private relay) kullanıcısı web'e giremez; relay adresi farklı olduğu için hesap ancak bağlama ile birleşir.
6. **Hesap silme:** Her iki istemci `deleteUserAccount` callable'ını kullanmalı (C6). Apple ile giriş varsa Apple token iptali (revoke) de gerekir (App Store şartı).

---

## 5. iOS durumu (`ios/`, `ios-widget/`)

- **Capacitor iOS projesi:** `ios/App` mevcut. Bundle id **`com.subsense.app`** (Android `com.subsense.apps`; farklı ama sorun değil, Firebase'de ayrı iOS uygulaması olarak kaydedilir). `IPHONEOS_DEPLOYMENT_TARGET 13.0`, `MARKETING_VERSION 1.0`, build 1. `DEVELOPMENT_TEAM` tanımlı değil.
- **Derleniyor mu:** Kökte `build/Build/Products/Debug-iphonesimulator/App.app` var, yani bir simülatör debug derlemesi bir ara başarılı olmuş. Ama `Podfile`'da `CapacitorFirebaseAuthentication` yok: Firebase eklendikten sonra `npx cap sync ios` çalışmamış. `GoogleService-Info.plist` yok. Info.plist'te Google için `REVERSED_CLIENT_ID` URL şeması yok. Kısaca iOS'ta bulut girişi çalışmaz. Bu oturumda derleme denemedim.
- **Widget:** `ios-widget/` altında `SubSenseWidget.swift` (WidgetKit, aylık toplam + sıradaki ödeme, 30 dk timeline), `WidgetBridge.swift`/`.m` (App Group `group.com.subsense.app` UserDefaults'a yazıyor) ve README var. **Xcode projesine eklenmemiş** (pbxproj'de "widget" geçmiyor). Target, App Group ve entitlement elle kurulmalı. JS tarafı hazır (`src/lib/widgetBridge.ts`, `widget.ts`), plugin yokken hata yutuluyor.
- **Mağaza belgeleri:** `APP-STORE-CHECKLIST.md` (fb80d3d) ve `APP-STORE-LISTING.md` (b1b5041) 2026-06-23'te eklenmiş, 7d629fe'de silinip Türkçe rehberle değiştirilmiş (rehber de sonradan repodan çıkarılmış, bfc878b). Listeleme: ad "SubSense", en/tr başlık + açıklama, yaş 4+, ücretsiz, IAP yok, kategori Finance. Checklist'te "App Privacy: Data Not Collected" yazıyor. Bulut senkronu ve hesap eklendiği için bu artık **yanlış**: e-posta, ad, kullanıcı kimliği ve abonelik verisi toplanıyor. Gizlilik beyanı güncellenmeli. Kalan iş: Developer hesabı, imzalama, ekran görüntüleri (6.9"), iPhone-only mi Universal mı kararı. `docs/privacy.html` ve `docs/help.html` GitHub Pages'te.
- `docs/superpowers/` altında iOS tasarım cilası ve yerel asistan planları var (uygulanmış, PR #8).

---

## 6. Android'de yalnız yerelde duran ve buluta alan gerektiren veriler

| Yerel (`store/app.ts`, `types.ts:53-63`) | Önerilen bulut alanı |
|---|---|
| `settings.baseCurrency` (şu an kökte de yazılıyor) | `preferences.baseCurrency` (kök alanı kaldır) |
| `settings.language` | `preferences.language` |
| `settings.appearance` | `preferences.theme` (light/dark/system) |
| `settings.budgetLimits` | `preferences.budgetLimits` (kategori sözlüğü eşlenmeli) |
| `settings.notificationsEnabled`, `renewalAlerts` | `preferences.notifyPayment` (+ `notifyEmail` ayrı) |
| `achievements[]` (nesne + `unlocked`) | `achievements: string[]` (açılmış id'ler, web modeli) |
| `priceSnapshot`, `priceAlerts`, `dismissedAlerts` | Cihazda kalabilir ya da `preferences.priceAlerts`; web radarıyla birleştirilmeli |
| `auth.user.name` | `displayName` (var) + `email` eklenmeli |
| `settings.isPro` | kaldır (web `plan`, %100 ücretsiz) |
| `settings.appLockEnabled` | **cihazda kalmalı** (cihaza özel güvenlik) |
| `auth.onboarded` | cihazda kalabilir |
| JSON yedek (`backup.ts`) | Bulutta karşılığı yok. CSV/JSON ortak format + C1 için "geri yükle = birleştir" seçeneği |
| Web'de olup Android'de olmayanlar: `savingsGoal`, `totalSaved`, `isShared`/`myShare`, `region`, `privacy`, `calendarToken` | Android okuyup en azından korumalı |
