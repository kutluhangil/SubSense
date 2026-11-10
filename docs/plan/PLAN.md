# SubSense: Birleşik Plan (Web + Android + Mac App Store)

> Tarih: 2026-11-10 · Durum: **onaylandı, uygulamada**

## Kesinleşen kararlar (2026-11-10, Kutluhan)

- **Firebase projesi:** `subsense-andorid-app` (Android'in projesi). Web ve Mac buna bağlanır.
- **Eski proje `subscriptionhub-85b02`:** kullanıcı ve veri yok. Yeni site canlıya çıkıp eski Vercel ve macmini kurulumu kapatılınca silinir (son faz). Veri göçü gerekmez.
- **Veri sözleşmesi = Android'in şeması.** Android'in buluttaki verisi bozulmasın diye web onun tiplerine uyar: ISO tarih, string id, Android'in durum ve kategori listeleri. Üzerine yalnız `updatedAt`, `deletedAt`, `catalogId`, `isShared`, `myShare` eklenir.
- **Kaldırılanlar:** arkadaşlar, davet kodu, Gemini proxy, e-posta hatırlatma, ICS akışı (K4, K5, K6 öneri yönünde).
- **Platform:** önce site + macOS (Tauri). iOS, macOS bittikten sonra ayrı tasarımla yapılır.
- **Fiyatlar:** en son derlenir (Faz 2 sona alındı).
- **App Store adı:** "SubSense - Subscription Tracker" denenir, reddedilirse K1'deki yedeklere geçilir.
- **Tasarım:** Neural-Vault teması, her şey sayfanın ortasında; giriş sonrası uygulama alanı da aynı dilde. Görseller Gemini ile üretilir: `apps/web/GEMINI-PROMPTS.md`.

## İlerleme

### 2026-11-10 · Oturum 1
- [x] Firebase `subsense-andorid-app`: web uygulaması yapılandırması alındı, **E-posta/Şifre** sağlayıcısı açıldı (Google zaten açıktı). Kurallar Android'in "sahibi okur ve yazar" kuralı; web uyumlu, değiştirilmedi.
- [x] Projede **24 gerçek Android kullanıcısı** ve abonelik verisi var. Bu yüzden şema Android'inki, göç yok.
- [x] `apps/web` iskeleti: Vite 6 + React 19 + Tailwind 4 + zustand + Firebase.
- [x] `apps/web/src/core`: Android'in mantık katmanı taşındı (store, derive, format, pricing, priceWatch, assistant, rates, catalog, explore, logolar). Capacitor bağımlılıkları web sürümleriyle değişti.
- [x] Yeni senkron motoru (`core/lib/cloud.ts` + `syncFields.ts`): yumuşak silme, alan bazlı yazma, temizlenen alana `deleteField`, "bulutta var, yerelde yok" durumunda silme yok, çevrimdışı önbellek. Google + e-posta girişi, şifre sıfırlama, Google bağlama, hesap silme (istemci tarafı).
- [x] Paylaşılan plan (`isShared`/`myShare`) fiyat hesabına girdi.
- [x] Web bildirimleri: 3 gün içindeki yenilemeler, her tarih için bir kez.
- [x] Tasarım: Neural-Vault düzeni + Android paleti, Fraunces + Inter; imza öğe **yörünge kadranı** (`ui/Orbit.tsx`).
- [x] Sayfalar: Landing, Genel bakış, Abonelikler, Takvim, İçgörüler, Keşfet + servis detayı, Asistan (yerel), Ayarlar, Giriş, Gizlilik, Hesap silme; ⌘K paleti, ⌘N ekleme, mobil alt menü, TR/EN, açık/koyu/sistem tema.
- [x] `vitest`: 93 test yeşil. `tsc` temiz. `vite build` başarılı.
- [x] `apps/web/GEMINI-PROMPTS.md`: illüstrasyon ve Mac ikon prompt'ları.

### 2026-11-10 · Oturum 2 (Kutluhan geri bildirimi)
- [x] **AI tamamen kaldırıldı:** asistan sayfası, yerel asistan motoru (`core/lib/assistant`), 68 çeviri anahtarı, gizlilik metnindeki asistan bölümü. ChatGPT, Claude gibi servisler yalnız takip edilebilir abonelik olarak katalogda duruyor.
- [x] **Tasarım v2 (premium, Apple dili):** Liquid Glass süzülen gezinme kapsülü, kaydırma kenarı bulanıklığı, SF Pro / Inter, büyük ve kalın başlıklar, gruplu iOS listeleri, bento kartlar, Activity tarzı kategori halkaları, Apple tarzı anahtar ve segment kontrol, Vazgeç/Kaydet üst çubuklu pencereler. Palet Android'den: `#FBF9FE` / `#0D0E12`, indigo `#494BD6` / `#A9AAFF`.
- [x] **Landing:** apple.com düzeni. Dev başlık, Mac penceresi içinde canlı pano önizlemesi, koyu "Zamları ilk sen gör" bölümü, bento, logo şeridi, son çağrı.
- [x] ₺ tutarları Türkçe biçimde (`₺9.112,35`). Deneme bitişi hesabındaki UTC kayması düzeldi.
- [x] 77 test yeşil, `tsc` temiz, derleme başarılı.

### 2026-11-10 · Oturum 3 (tasarım v3: Apple × Neural-Vault)
- [x] Harman: Neural-Vault düzeni (solda logo, ortada segmentli kapsül menü, sağda canlı göstergesi), serif başlıklar (Source Serif 4), noktalı kâğıt zemin, süslemeli bölüm başlıkları, ince çizgili listeler, mürekkep ve çizgi kapsül düğmeler. Apple katmanı: cam menü, kaydırma kenarı, kartlar, iOS gruplu listeler, Activity halkaları.
- [x] Genel bakış: canlı göstergeli bilgi satırı, "Aboneliklerin şu an" başlığı, sayıları kalın vurgulu cümle, numune olarak logolu yörünge kadranı; Göz atmaya değer, Yaklaşanlar, kategori kartları.
- [x] Tailwind `group` ile liste stili çakışması giderildi (`.grouped`).
- [x] **Karar:** web, Mac ve Android **tek arayüz kodunu** (`apps/web`) kullanacak, her platform yalnız kabuk ekleyecek. Böylece tasarım hiç ayrışmaz.

### 2026-11-10 · Oturum 3b (Android taşıma, yarım)
- [x] Android native projesi `apps/android` altına kopyalandı (widget, imza ayarı şablonu, `com.subsense.apps`). Eski repo yerinde duruyor, arşivlenmedi.
- [x] `apps/web/capacitor.config.ts` (android.path ../android), Capacitor 6 paketleri, `.npmrc legacy-peer-deps`.
- [x] `core/lib/native.ts`: telefonda Preferences deposu, yerel Google girişi (cloud.ts bağlı), widget verisi fonksiyonu.
- [x] Telefonda yerel bildirimler (10:00, en yakın 60), widget yayını, durum çubuğu rengi, donanım geri tuşu, güvenli alan boşluğu.
- [x] `cap sync android` + `assembleDebug` başarılı (`apps/android/app/build/outputs/apk/debug/app-debug.apk`, 10 MB). JDK 17 Homebrew ile kuruldu (Gradle 8.11 Java 25 ile çalışmıyor).
- [ ] Kutluhan: imzalı sürüm için `apps/android/app/google-services.json` ve `apps/android/keystore.properties` + anahtar dosyası. Sonra `npm run android:aab` (apps/web içinde).

### 2026-11-10 · Oturum 4 (macOS, Tauri 2)
- [x] `apps/desktop`: Tauri 2, paket kimliği `com.subsense.apps`, sürüm 3.0.0, finans kategorisi, macOS 11+.
- [x] Pencere: gizli başlık + içerik üstünde trafik ışıkları, üst çubuk sürükleme alanı, menüler üstte; landing atlanır, doğrudan uygulama açılır.
- [x] Menü çubuğu öğesi: bu ayın toplamı + 7 gün içindeki ilk yenileme (`set_tray_title` komutu), menüde Aç / Çıkış.
- [x] Yerel macOS bildirimleri (`tauri-plugin-notification`), App Store sandbox + yalnız ağ istemcisi yetkisi, sıkı CSP.
- [x] Uygulama ikonu (indigo squircle + yörünge) ve ikon seti.
- [x] `tauri build --debug --bundles app` başarılı, uygulama açıldı ve çalıştı.
- [ ] Mac'te Google girişi: Tauri penceresi açılır pencereye izin vermediği için şimdilik gizli; sistem tarayıcısı + loopback (PKCE) akışı ve Sign in with Apple ayrı faz.
- [ ] App Store: Developer hesabında `com.subsense.apps` App ID, Mac App Store sertifikaları, `tauri build --target universal-apple-darwin`, `productbuild` ile imzalı `.pkg`, Transporter ile yükleme.

### 2026-11-10 · Oturum 5
- [x] Kadran v2: halka kendini çizer, günler sırayla belirir, ibre tepeden bugüne süpürür, düğümler merkezden uçar, tutar sayarak artar; dönen dış yörünge + uydu, nefes alan ışıma, bugün nabzı; boş ayda soluk servis logoları yörüngede döner ve "İlkini ekle" daveti çıkar; üzerine gelince büyüme, merkeze kesik çizgi, kapsül etiket.
- [x] Yeni footer: her temada koyu bant, marka + canlı durum (senkron, kurlar, katalog, sürüm), Uygulama / Platformlar / Destek sütunları, sayfa genişliğinde dev serif "SubSense", dil seçimi ve telif satırı.
- [x] `apps/web/GEMINI-PROMPTS.md` v3 tasarıma göre yenilendi; logo bölümü eklendi (Mac ikonu, Android uyarlanabilir ikon, yatay logo, tek renk sembol, mağaza görseli).
- [x] Mac uygulaması yeni tasarımla yeniden derlendi.

### 2026-11-10 · Oturum 6
- [x] Google Cloud (`subsense-andorid-app`): "SubSense macOS" iOS tipi OAuth istemcisi (paket kimliği `com.subsense.apps`, gizli anahtar yok). Ayrıca kullanılmayan bir "SubSense Mac" masaüstü istemcisi oluştu; silinebilir.
- [x] Firebase izinli alanlara `sub-sense-ashy.vercel.app` eklendi.
- [x] Mac'te Google girişi: sistem tarayıcısı + PKCE + `com.googleusercontent.apps.…` URL şeması (deep-link), jeton değişimi Rust tarafında (plugin-http); Info.plist'te şema kayıtlı. PKCE testi eklendi (78 test).
- [x] Vercel projesi `sub-sense`: kök klasör `apps/web`, Vite, `npm run build`, `dist`, Node 22. `.vercelignore` eklendi.
- [ ] Production yayını: Kutluhan `vercel deploy --prod --yes` çalıştıracak (otomatik onay katmanı engelledi).
- [ ] Dikkat: Vercel kökü `apps/web` olduğu için `apps/` commit'lenmeden main'e yapılan push'lar Vercel'de derlenemez.
- [ ] App Store öncesi: Google Mac'te açık olduğu için Sign in with Apple zorunlu (kural 4.8).

### Sıradaki
1. Wrapped (yıllık özet) ve SEO fiyat sayfaları (`/fiyatlar/*`) yeni tasarımla.
2. Paket boyutu (1,36 MB): Firebase ve keşif verisini ayrı parçalara böl.
3. Firestore kurallarına alan doğrulaması (Android yazımlarını bozmadan) + emülatör testi.
4. Faz 4: Android'i yeni senkron kurallarına geçir (yumuşak silme, `deletedAt` süzme, alan bazlı yazma, e-posta girişi).
5. Faz 6: Tauri 2 ile macOS uygulaması (`apps/desktop`).
6. Vercel'e yeni siteyi yayınla, eski kökteki kodu, `functions/` ve `server/` kurulumunu kaldır, `subscriptionhub-85b02` projesini sil.
7. En son: fiyat derlemesi (Faz 2), Sign in with Apple.

> Aşağıdaki ilk taslak referans olarak duruyor. Çelişki varsa yukarıdaki kararlar geçerli.
> Ekler: [A: katalog ve fiyat karşılaştırması](ek-a-katalog-karsilastirma.md) · [B: özellik ve veri modeli karşılaştırması](ek-b-ozellik-veri-karsilastirma.md) · [C: kod incelemesi](ek-c-kod-incelemesi.md)

## 0. Hedef (senin isteklerin)

1. **Tamamen ücretsiz.** Reklam yok, uygulama içi satın alma yok, abonelik yok. Fark bu olacak.
2. **Tek altyapı, tek hesap.** Web, Android ve Mac uygulaması aynı Firebase projesini kullanır. Aynı hesapla girilir, aynı abonelikler görünür.
3. **Tek katalog.** Servis adları, planlar, TR/US fiyatları, kategoriler ve logolar her yerde aynı olur.
4. **Site sıfırdan yazılır.** Yerleşim ve tipografi Neural-Vault sitesinin dilinde olur, renk paleti Android uygulamasından gelir.
5. **Ad:** site ve uygulama "SubSense". App Store adı "SubSense - Subscription Tracker" (bkz. karar K1, ad çakışması var).
6. **Mac App Store'a masaüstü uygulaması.** Bu repoda yapılır, yeni repo açılmaz.
7. Ek C'deki hatalar bu işin içinde kapanır.

---

## 1. Bugünkü durum (ölçülen)

| | Web (bu repo) | Android (`SubSense-AndroidApp`) |
|---|---|---|
| Teknoloji | React 19 + Vite + Tailwind 4, Firebase | React 19 + Vite + Tailwind 3 + Capacitor 6, Firebase (isteğe bağlı) |
| Veri | Firestore'dan okunuyor, giriş şart | Önce cihaz (local-first), bulut isteğe bağlı |
| Giriş | Yalnız e-posta + şifre | Yalnız Google, ya da hesapsız |
| Firebase projesi | `subscriptionhub-85b02` | **Bilinmiyor** (ayar dosyaları repoda yok) |
| Firestore yolu | `users/{uid}/subscriptions` | `users/{uid}/subscriptions` (aynı yol) |
| Katalog | 70 servis, fiyatlar 2026-11-08 | 48 servis, fiyatlar 2026-07-02 |
| Testler | Yok (Cypress kurulu, kullanılmıyor) | Vitest, mantık katmanında testli |
| Yayın | Vercel + macmini-server (tailnet) | Google Play (`com.subsense.apps`) |

### Özellik farkı özeti (tam matris: Ek B §1)

- **İkisinde de var:** ana sayfa, liste, ekle/düzenle, detay + fiyat geçmişi, takvim, içgörüler, keşfet, zam uyarısı, başarımlar, bütçe limiti, TR/EN, 3 tema, karşılama, hesap silme.
- **Yalnız web'de:** arkadaşlar, davet kodu, Wrapped, tasarruf hedefi, ortak abonelik (`myShare`), e-posta hatırlatma + aylık rapor, ICS takvim akışı, Gemini AI, CSV içe/dışa aktarma, profil kartı, geri bildirim formu, e-posta/şifre girişi.
- **Yalnız Android'de:** widget, biyometrik kilit, yerel bildirim, yerel (ağsız) asistan, JSON yedek, hesapsız kullanım, Google girişi, 20 para birimi, `trialPrice` / `paymentMethod` / `brandColor` alanları.

### Katalog farkı özeti (tam tablo: Ek A §2)

- 70 tekil servis. **Ortak 48, birebir aynı yalnız 8.**
- Yalnız web'de 22 servis var: Gain, Ubisoft+, PuhuTV, Yemeksepeti, Getir, Amazon Music ve diğerleri.
- 27 serviste 50 plan fiyatı farklı. Farkın çoğu TR fiyatlarında; örneğin Netflix TR web'de ₺389,99, Android'de ₺289,99.
- 11 serviste ad yazımı, 2 serviste kategori farklı. Kategori listeleri de farklı, ortak kategori yalnız 4.
- Daha güncel taraf **web.** Android `pricing.ts` dosyasının başlığında hâlâ "2025" yazıyor.

### Birleştirmeyi bugün engelleyen riskler (Ek B §3)

1. **Veri kaybı.** Android, buluttaki ama cihazda olmayan her kaydı siliyor. Android'de "Verileri temizle" demek web'deki tüm abonelikleri siler.
2. **Tarih biçimi.** Web `"Nov 10, 2026"` yazıyor, Android `2026-11-10` bekliyor. İki taraf birbirinin tarihini yanlış okuyor.
3. **Silinen kayıt geri geliyor.** Web'de silinen kaydı Android tekrar buluta yüklüyor.
4. **Web, Android'in kayıtlarını gizliyor.** Web yalnız 8 para birimini kabul ediyor, Android'in 20 para birimli kayıtları web'de görünmüyor.
5. **Kural dosyaları çakışıyor.** Android'in `firestore.rules` dosyası aynı projeye yüklenirse web'in kurallarını ezer.
6. **Ortak giriş yöntemi yok.**

---

## 2. Kararlar (fazlara başlamadan senden onay)

Her maddede önerim ilk sırada.

| # | Karar | Öneri | Alternatif |
|---|---|---|---|
| **K1** | App Store adı | **"SubSense - Subscription Tracker" kullanılamayabilir.** "SubSense: Subscription Tracker" adında başka bir geliştiricinin uygulaması zaten yayında, ayrıca 6 tane "SubSense"li uygulama var. Öneri: **"SubSense: Abonelik & Zam Takibi"** (TR) / **"SubSense: Price Hike Tracker"** (EN). Ad App Store Connect'te kayıt sırasında denenir; reddedilirse bu yedeklere geçilir. | İstediğin adı dene, reddedilirse yedeğe geç |
| **K2** | Tek Firebase projesi | **`subscriptionhub-85b02`** (web'in projesi, Firestore kuralları ve katalog orada). Android de bu projeye bağlanır. | Android'in projesi. Hangisi olduğunu Firebase konsolundan bana söylemen gerekiyor (bkz. §7 soru 1) |
| **K3** | Backend | **Çekirdek özellikler backend'siz.** Abonelik, senkron, hesap silme ve katalog doğrudan Firestore ve kurallarla çalışır (Android'in yaptığı gibi). Ev sunucusu yalnız **dışarı bağlanan bir işçi** olur: haftalık fiyat taraması ve isteğe bağlı e-posta. **Dışarıya port, tünel ya da alan adı gerekmez.** | `aboneyim_api`'yi Cloudflare Tunnel ile internete açmak (alan adı ve bakım gerektirir) |
| **K4** | AI asistan | **Android'in yerel asistanı her yerde** (ağsız, ücretsiz, gizlilik sorunu yok, App Store 5.1.2 derdi yok). Gemini sonra isteğe bağlı eklenir. | Gemini proxy (herkese açık backend gerektirir) |
| **K5** | Yalnız web'de olan sosyal özellikler | **Arkadaşlar ve davet kodu kaldırılır.** Herkese açık backend gerektiriyorlar, güvenlik açığı (Ek C #1) ve App Store gizlilik yükü getiriyorlar, kullanımları da düşük. **Wrapped kalır** (tamamen istemci tarafında). | Arkadaşları sonraki sürüme ertele |
| **K6** | E-posta hatırlatma / ICS akışı | **Yerine cihaz bildirimi** (Android ve Mac'te yerel, web'de tarayıcı) ve **.ics indirme.** E-posta işçisi isteğe bağlı kalır. | Mevcut haliyle tut (service account + Resend gerekir) |
| **K7** | Mac teknolojisi | **Tauri 2** (gerçek macOS uygulaması, küçük boyut, menü çubuğu ve bildirim desteği, App Store dağıtımı var). Web'in yeni arayüzünü aynen kullanır. | Android repodaki Capacitor iOS projesi ("iPad uygulaması Mac'te çalışır"); masaüstü hissi zayıf, Intel Mac'te yok |
| **K8** | Yeni sitenin temeli | **Android'in mantık katmanı** (`store/`, `lib/derive`, `lib/assistant`, `lib/pricing`, `lib/priceWatch`, testleriyle) + Neural-Vault tarzı yeni arayüz. Web'in eski bileşenleri silinir. | Web'in eski mantığını taşımak (test yok, daha dağınık) |
| **K9** | Yayın yeri | **Vercel** herkese açık site olur. macmini-server yalnız işçi; istersen tailnet'te önizleme. | İkisinde de tam site (iki kopya bakımı) |
| **K10** | Analitik | **Firebase Analytics ve Performance kaldırılır** (Android'de de yok). App Store gizlilik etiketi "yalnız uygulama işlevi için e-posta ve kullanıcı içeriği" olur. | Tutmak (etiket ve onay yükü) |

---

## 3. Hedef mimari

```
SubSense/                      (bu repo, npm workspaces)
├─ apps/
│  ├─ web/                     yeni site + uygulama arayüzü (Vercel)
│  └─ desktop/                 Tauri 2 kabuğu (src-tauri/), apps/web çıktısını paketler
├─ packages/
│  └─ core/                    tipler, veri sözleşmesi, katalog, senkron, hesaplar, asistan, i18n
│     └─ catalog/catalog.json  TEK fiyat kataloğu (kaynak)
├─ server/                     işçi: fiyat taraması (+ isteğe bağlı e-posta), Docker
├─ firestore.rules             TEK kural dosyası (web + Android + Mac)
└─ docs/
```

Android repo ayrı kalır. Bağlantı noktaları:

- **Katalog:** Android `PRICE_CATALOG_URL` → `https://<site>/price-catalog.json`. Bu dosya `packages/core/catalog/catalog.json`'dan build sırasında üretilir.
- **Veri sözleşmesi:** `packages/core` tipleri Android'e de uygulanır. Android repoda `cloud.ts` ve `types.ts` aynı kurallara göre düzeltilir.
- **Kurallar:** yalnız bu repodaki `firestore.rules` deploy edilir. Android'deki dosya silinir ve README'den bu dosyaya yönlendirilir.

### 3.1 Veri sözleşmesi v1 (her platformda aynı)

`users/{uid}`:

```ts
{ displayName, email, createdAt, updatedAt, schemaVersion: 1,
  settings: { baseCurrency, language, appearance, budgetLimits, savingsGoal,
              notificationsEnabled, renewalAlerts } }
```

Biyometrik kilit cihaza özeldir ve cihazda kalır.

`users/{uid}/subscriptions/{id}`:

```ts
{ id: string,                 // uuid, istemci üretir
  name, plan, price: number, currency: ISO-4217 (20 kod),
  cycle: 'Monthly' | 'Yearly',
  nextDate: 'YYYY-MM-DD', startDate?, trialEndDate?, trialPrice?,
  status: 'Active' | 'Trial' | 'Paused' | 'Cancelled',
  category: <birleşik kategori listesi>,
  isShared?, myShare?, paymentMethod?, notes?, nickname?, reminderEnabled?,
  history?: { date: 'YYYY-MM-DD', price: number }[],
  catalogId?: string,          // katalog eşleşmesi: zam radarı ve logo bunu kullanır
  updatedAt: serverTimestamp, deletedAt?: serverTimestamp | null }
```

Kurallar:

- **Tarih her zaman `YYYY-MM-DD`,** yerel tarih olarak okunur, UTC kayması olmaz.
- **Silme yumuşaktır:** kayıt silinmez, `deletedAt` yazılır. Hiçbir istemci "bende yok" diye buluttaki kaydı silmez. "Verileri temizle" yalnız cihazı temizler, bulutu temizlemek ayrı ve onaylı bir işlemdir.
- **Birleştirme alan bazlıdır:** yalnız değişen alan yazılır (`updateDoc`). Çakışmada `updatedAt` yenisi kazanır.
- `undefined` alan yazılmaz (`ignoreUndefinedProperties: true`).
- **Durum eşlemesi:** Android'in `'Expiring'` durumu kayıtta tutulmaz, ekranda hesaplanır. Web'in `'Inactive'` durumu `'Cancelled'` olur.
- **Birleşik kategoriler:** Streaming, Music, Gaming, AI, Productivity, Design, Cloud & Storage, Education, Health & Fitness, Shopping, News, Other. Eski değerler göç sırasında eşlenir.
- **Göç:** eski web kayıtları (`"Nov 10, 2026"`, `Inactive`, eski kategoriler) ilk girişte istemcide bir kez çevrilir ve `schemaVersion: 1` yazılır. Admin anahtarı gerekmez.

### 3.2 Giriş (tek hesap)

- Her platformda üç yöntem: **Apple, Google, e-posta + şifre.** Apple, App Store kuralı 4.8 gereği şart.
- Firebase "aynı e-postayla tek hesap" ayarı açık kalır. `account-exists-with-different-credential` hatasında bağlama akışı çalışır; Ayarlar'da "Google'ı bağla" / "Apple'ı bağla" seçenekleri olur.
- **Hesapsız kullanım her yerde serbest** (local-first). Giriş yalnız senkron içindir; App Store 5.1.1(v) ile de uyumlu.
- Mac'te Google girişi sistem tarayıcısında açılır (masaüstü OAuth, PKCE ve loopback), dönen kimlik `signInWithCredential` ile Firebase'e verilir. Apple girişi yerel `AuthenticationServices` ile yapılır (küçük bir Tauri eklentisi). İkisinin de backend'e ihtiyacı yok.

### 3.3 Firestore kuralları v1 (özet)

- `users/{uid}`: yalnız sahibi okur, yazar ve siler.
- `users/{uid}/subscriptions/{id}`: sahibi okur ve yazar. Alanlar tip ve uzunluk açısından doğrulanır (ad ≤ 80, fiyat ≥ 0, para birimi listede, tarih biçimi).
- `priceCatalog/*` ve `priceConfig/*`: herkes okur, yalnız işçi yazar.
- `feedback/*`: girişli kullanıcı oluşturabilir, kimse okuyamaz.
- Diğer her şey kapalı.
- E-posta doğrulama şartı kalkar; Google ve Apple zaten doğrulanmış. Şifreli hesap doğrulanmadan senkron yapmaz, bu kural değil istemci uyarısıdır.
- Kurallar için emülatör testi yazılır.

### 3.4 Katalog

- **Kaynak:** `packages/core/catalog/catalog.json`.
- **Şema:** Android'in beklediği biçimin üst kümesi: `{ version, updatedAt, services: { [catalogId]: { name, aliases[], category, color, logo, regions: { TR: {currency, tiers[]}, US: {...} } } } }`.
- **Temel:** web'in 2026-11-08 fiyatları. Ek A'daki 27 farklı serviste TR fiyatları resmî sitelerden tek tek doğrulanır ve kaynak bağlantısı + tarih JSON'a yazılır.
- **70 servisin hepsi** katalogda tam plan listesiyle yer alır. Arama listesine özel "varsayılan 9,99 $" kaldırılır.
- **Logolar:** tek SVG klasörü `packages/core/catalog/logos/`. Web'in 66 logosu temel alınır, Android'in eksiği tamamlanır. Steam Deck → EA Play ve MasterClass → masterpass hataları düzeltilir.
- **Yayın:** build sırasında `apps/web/public/price-catalog.json` üretilir, Vercel yayınlar. Android ve Mac bunu 12 saatte bir çeker. Paket içinde de bir kopyası olur, internet yoksa o kullanılır.
- **Zam radarı:** kayıtta `catalogId` + plan adı eşleşirse çalışır. Eşleşme belirsizse uyarı gösterilmez (Ek C #5 kapanır). "Tümünü güncelle" düğmesi yok, her kayıt tek tek onaylanır.
- **Haftalık tarama (işçi):** Gemini + arama ile önerilen fiyatlar `priceCatalog` koleksiyonuna "öneri" olarak yazılır. Sen onaylayınca `catalog.json`'a girer. Yapay zekânın bulduğu fiyat doğrudan kullanıcıya gitmez.

---

## 4. Tasarım sistemi

**Yerleşim ve tipografi Neural-Vault sitesinden** (`~/Neural-Vault/Website`):

- Üstte ince bir TopBar; mobilde alt sekme çubuğu; her yerde ⌘K komut paleti.
- Ortalanmış editoryal başlık: serif, 52–68 px, altında 18 px açıklama.
- Bölümler süs işaretiyle ayrılır ve ortalı serif başlık taşır.
- Listeler ince çizgili satırlardan oluşur (`border-line-2`). Kartlar `rounded-2xl`, ince kenarlıklı, üzerine gelince hafif kalkar.
- Arka planda nokta ızgarası (`.dots`). Canlılık göstergesi `live-dot` ile verilir.
- İkonlar lucide, çizgi kalınlığı 1.75.
- Fontlar: başlıklarda **Source Serif 4**, metinde **Inter**, tutarlarda **JetBrains Mono** (tabular).
- TR/EN dil, açık/koyu/sistem tema.

**Renkler Android'den** (`src/styles/theme.css`, Material 3 token'ları):

| Token | Açık | Koyu |
|---|---|---|
| `--bg` | `#fbf8fd` | `#121317` |
| `--surface` | `#f5f2f7` | `#1a1b1f` |
| `--raised` | `#ffffff` | `#1e1f23` |
| `--sunk` | `#efedf1` | `#0d0e12` |
| `--ink` | `#1b1b1f` | `#e3e2e7` |
| `--ink-2` | `#46464f` | `#c7c4d7` |
| `--ink-3` | `#76767f` | `#908fa0` |
| `--line` | `#c7c5d0` | `#464554` |
| `--accent` (Neural-Vault'taki kil rengi yerine) | `#494bd6` | `#c0c1ff` |
| `--accent-strong` | `#2f2ebe` | `#8083ff` |
| `--danger` | `#ba1a1a` | `#ffb4ab` |

Neural-Vault'taki kil rengi (`#d97757`) kullanılmaz, onun yerini indigo alır.

**Sayfalar:**

- **Herkese açık:** Giriş sayfası, Fiyatlar (`/fiyatlar` + 70 servis sayfası, aynı tasarımla, SEO), Gizlilik, Hesap silme, Yardım.
- **Uygulama:** Genel bakış, Abonelikler, Takvim, İçgörüler, Keşfet, Asistan, Wrapped, Ayarlar.
- **Görseller (isteğe bağlı):** Neural-Vault'taki gravür illüstrasyonların indigo sürümleri Gemini ile üretilir. Gemini prompt'ları `apps/web/GORSEL.md` dosyasına yazılır. Görseller gelmeden de site eksiksiz çalışır.
- **Kural:** "10.000+ kullanıcı" gibi sahte sosyal kanıt yok, sahte puan yok.

Uygulama tasarımı da bu sistemle yapılır. Mac uygulaması aynı arayüzü kullanır, yalnız macOS'a özgü küçük farklar olur: trafik ışıkları alanı, sürüklenebilir başlık çubuğu, ⌘ kısayolları.

---

## 5. Fazlar

Her faz ayrı oturumda uygulanır; sonunda doğrulama yapılır. Commit ve push yalnız sen söyleyince.

### Faz 0: Hazırlık ve kararlar (yarım oturum)

- [ ] K1–K10 onayı, §7'deki soruların cevapları.
- [ ] Android'in Firebase projesi belirlenir. `subscriptionhub-85b02` değilse göç notu çıkarılır.
- [ ] Firebase CLI girişi (`npx firebase-tools login`, senin tek komutun).
- [ ] Firebase konsolunda Google ve Apple sağlayıcıları açılır, "aynı e-postayla tek hesap" ayarı kontrol edilir.
- **Bitti sayılır:** karar tablosu dolu, proje kimliği belli.

### Faz 1: Çekirdek paket ve veri sözleşmesi

- [ ] npm workspaces iskeleti (`apps/`, `packages/core`). Eski web kodu şimdilik kökte kalır, Faz 3 sonunda silinir.
- [ ] `packages/core`: tipler (§3.1), Android'den taşınan mantık (`derive`, `format`, `pricing`, `priceWatch`, `assistant`, `rates`, `backup`) ve Android'deki testleri.
- [ ] Senkron motoru: yumuşak silme, alan bazlı birleştirme, `updatedAt`, çevrimdışı kuyruk. Çakışma, silme ve göç senaryoları için test.
- [ ] Eski web kayıtları için göç fonksiyonu + testleri (tarih, durum, kategori, para birimi).
- [ ] `firestore.rules` v1 + emülatör testleri.
- **Bitti sayılır:** `npm test` yeşil, kurallar emülatörde test edildi.

### Faz 2: Tek katalog

- [ ] `catalog.json` oluşturulur: 70 servis, web fiyatları temel alınır.
- [ ] Ek A'daki 27 farklı serviste TR fiyatları resmî kaynaktan doğrulanır (kaynak + tarih alanı). Doğrulanamayanlar listelenip sana sorulur.
- [ ] Ad, kategori ve renk birleştirilir; tek logo klasörü kurulur; logo hataları düzeltilir.
- [ ] Build betiği: `price-catalog.json` + SEO fiyat sayfaları + sitemap.
- [ ] Katalog şema testi: her serviste en az bir TR ve bir US planı, logo dosyası mevcut, fiyat > 0.
- **Bitti sayılır:** tek JSON, test yeşil, fark raporu sıfır.

### Faz 3: Yeni site (sıfırdan)

- [ ] `apps/web`: Vite + React 19 + TS + Tailwind 4; §4'teki token'lar ve bileşenler.
- [ ] Herkese açık sayfalar + uygulama sayfaları (§4).
- [ ] Giriş: Apple + Google + e-posta, hesap bağlama, hesapsız mod.
- [ ] Ayarlar: dil, tema, para birimi, bütçe, bildirim, JSON + CSV yedek (Android ile aynı JSON biçimi), hesap silme (istemci tarafı, kural destekli).
- [ ] Vercel: `cleanUrls`, güvenlik başlıkları, CSP, production'da source map kapalı.
- [ ] Eski kökteki web kodu, `functions/` callable'ları, Stripe/Pro/referans artıkları ve `Aboneyim` adı kaldırılır. Her referans aynı işte güncellenir.
- [ ] Playwright ile duman testi: giriş, ekleme, düzenleme, silme, iki sekmede senkron, hesapsız mod.
- **Bitti sayılır:** Vercel önizlemesinde tüm akışlar çalışıyor, Lighthouse erişilebilirlik ≥ 95.

### Faz 4: Android'i bağla (`SubSense-AndroidApp` reposu)

- [ ] `.env.local` + `google-services.json` → `subscriptionhub-85b02` (ya da K2'de seçilen proje).
- [ ] `cloud.ts` yeni senkron motoruna geçer (`packages/core`'daki mantığın kopyası ya da paketi). Silme, temizleme ve geri yükleme buluttaki veriyi artık silmez.
- [ ] `types.ts` sözleşme v1'e göre güncellenir; tarih ve kategori göçü; `trialEndDate: undefined` hatası düzeltilir.
- [ ] Apple + e-posta girişi eklenir (Google zaten var); hesap bağlama.
- [ ] `PRICE_CATALOG_URL` yeni adrese çevrilir; ekleme akışı adları katalogla birleştirilir; eski `PRICING` / `CATALOG` kopyaları silinir.
- [ ] Ayarlar buluta da yazılır (`settings`).
- [ ] Android'deki `firestore.rules` silinir.
- [ ] Çapraz test: web'de ekle → Android'de görünür; Android'de sil → web'de kaybolur; Android'de "temizle" → web etkilenmez.
- **Bitti sayılır:** iki cihazda aynı hesapla aynı liste, vitest yeşil, imzalı AAB hazır (Play'e yüklemeyi sen yaparsın).

### Faz 5: İşçi (ev sunucusu)

- [ ] `functions/` sadeleşip `server/worker` olur: haftalık fiyat taraması, `priceCatalog` öneri yazımı. İsteğe bağlı olarak e-posta hatırlatma da burada kalır (K6).
- [ ] Gemini modeli güncellenir, anahtar başlığa taşınır, service account `.env` dosyasına yazılır (sır, repoya girmez).
- [ ] Docker: `aboneyim_web` ve `aboneyim_api` kaldırılır, yerine yalnız `subsense_worker` gelir. Dışarı port açılmaz. `tailscale serve` kapatılır ya da önizlemeye çevrilir (K9).
- **Bitti sayılır:** `dsrv ps` üzerinde worker sağlıklı, test taraması öneri yazdı.

### Faz 6: Mac uygulaması (Tauri 2, `apps/desktop`)

- [ ] Tauri 2 kabuğu `apps/web` çıktısını paketler. Universal binary (Apple Silicon + Intel), sandbox, yalnız ağ istemci yetkisi.
- [ ] Bundle ID `com.subsense.apps` (Android ile aynı ad alanı); Developer hesabında oluşturulur.
- [ ] Yerel özellikler (kural 4.2 için şart):
  - menü çubuğu öğesi ("bu ay ₺X · sıradaki: Spotify yarın"),
  - yenilemeden 1 ve 3 gün önce yerel bildirim,
  - çevrimdışı çalışma,
  - ⌘N / ⌘K / ⌘, kısayolları,
  - isteğe bağlı "girişte başlat".
- [ ] Apple girişi (yerel eklenti) + Google (sistem tarayıcısı) + e-posta.
- [ ] Service worker ve PWA kabukta kapalı; uygulama giriş sayfasıyla değil, doğrudan uygulamayla açılır.
- [ ] `tauri build --target universal-apple-darwin` → imzalı `.pkg` → Transporter ile App Store Connect'e yükleme.
- **Bitti sayılır:** TestFlight (Mac) üzerinde kurulup giriş, senkron, bildirim ve menü çubuğu çalışıyor.

### Faz 7: App Store yayını

- [ ] App Store Connect: ad (K1), alt başlık, anahtar kelimeler (TR + EN), kategori Finans, fiyat Ücretsiz.
- [ ] Gizlilik etiketi: E-posta + Kullanıcı İçeriği → yalnız uygulama işlevi, takip yok.
- [ ] Gizlilik politikası ve hesap silme sayfası (`/gizlilik`, `/hesap-silme`) yayında.
- [ ] Ekran görüntüleri (Mac 2880×1800) yeni tasarımdan Playwright ile üretilir.
- [ ] İnceleme notu: demo hesabı, "tamamen ücretsiz, backend'siz çekirdek" açıklaması.
- [ ] İncelemeye gönderme sende (tek tık).
- **Bitti sayılır:** inceleme onayı.

### Faz 8 (sonra, isteğe bağlı)

- iOS uygulaması: Android repodaki Capacitor iOS projesi ya da `apps/web` + Capacitor. Widget kodu hazır.
- Gemini asistan (isteğe bağlı, onaylı).
- Paylaşılan abonelik ve aile özellikleri.
- Alan adı (ör. `subsense.app` doluysa başka bir ad) + Cloudflare.

---

## 6. Ek C'deki hataların akıbeti

| Ek C maddesi | Ne olur |
|---|---|
| 1 Takvim jetonu sızıntısı | Arkadaş arama ve ICS akışı kaldırılınca (K5, K6) ortadan kalkar |
| 2 Hesap silme | İstemci tarafı silme + kural desteği (Faz 1, 3, 4) |
| 3 Vercel'de backend yok | Çekirdek backend'siz olduğu için gereksiz (K3) |
| 4 SEO sayfaları | `cleanUrls` + yeni sayfa üretimi (Faz 2, 3) |
| 5 Yanlış zam uyarısı | `catalogId` eşleşmesi, toplu güncelleme yok (Faz 2) |
| 6 Sahte sosyal kanıt | Yeni sitede yok |
| 7 Kurallar canlıda değil | Faz 1'de test edilip deploy edilir |
| 8 Gemini modeli | Faz 5 |
| 9–14 Pro artıkları, cron, source map, rate limit | Eski kodla birlikte kalkar ya da Faz 3/5'te kapanır |
| 15–20 Temizlik | Faz 3'te eski kod silinirken |

---

## 7. Senden gereken cevaplar

1. **Android uygulamasının Firebase projesi hangisi?** Firebase konsolu → Proje ayarları → Genel → `com.subsense.apps` uygulamasının bulunduğu proje. Play'de bulut senkronunu kullanan gerçek kullanıcı var mı?
2. **Web'de (`subscriptionhub-85b02`) gerçek kullanıcı ve veri var mı,** yoksa yalnız senin test hesapların mı? Göç ne kadar özenli olmalı, buna göre belirlenir.
3. K1–K10 kararlarından değiştirmek istediğin var mı? Özellikle **K5:** arkadaşlar ve davet kodu kaldırılsın mı?
4. Mac uygulamasının yanında **iOS uygulaması** da istiyor musun (Faz 8), yoksa şimdilik yalnız Mac mi?
5. Alan adı almayı düşünüyor musun? Şimdilik gerekmiyor; site `sub-sense-ashy.vercel.app` adresinde kalabilir. Vercel'de proje adı `subsense` yapılırsa adres `subsense-xxx.vercel.app` olur.
