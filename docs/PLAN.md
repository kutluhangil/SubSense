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
- **Tasarım:** Neural-Vault teması, her şey sayfanın ortasında; giriş sonrası uygulama alanı da aynı dilde. Görseller Gemini ile üretilir: `docs/GEMINI-PROMPTS.md`.

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
- [x] `docs/GEMINI-PROMPTS.md`: illüstrasyon ve Mac ikon prompt'ları.

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
- [x] `docs/GEMINI-PROMPTS.md` v3 tasarıma göre yenilendi; logo bölümü eklendi (Mac ikonu, Android uyarlanabilir ikon, yatay logo, tek renk sembol, mağaza görseli).
- [x] Mac uygulaması yeni tasarımla yeniden derlendi.

### 2026-11-10 · Oturum 6
- [x] Google Cloud (`subsense-andorid-app`): "SubSense macOS" iOS tipi OAuth istemcisi (paket kimliği `com.subsense.apps`, gizli anahtar yok). Ayrıca kullanılmayan bir "SubSense Mac" masaüstü istemcisi oluştu; silinebilir.
- [x] Firebase izinli alanlara `sub-sense-ashy.vercel.app` eklendi.
- [x] Mac'te Google girişi: sistem tarayıcısı + PKCE + `com.googleusercontent.apps.…` URL şeması (deep-link), jeton değişimi Rust tarafında (plugin-http); Info.plist'te şema kayıtlı. PKCE testi eklendi (78 test).
- [x] Vercel projesi `sub-sense`: kök klasör `apps/web`, Vite, `npm run build`, `dist`, Node 22. `.vercelignore` eklendi.
- [ ] Production yayını: Kutluhan `vercel deploy --prod --yes` çalıştıracak (otomatik onay katmanı engelledi).
- [ ] Dikkat: Vercel kökü `apps/web` olduğu için `apps/` commit'lenmeden main'e yapılan push'lar Vercel'de derlenemez.
- [ ] App Store öncesi: Google Mac'te açık olduğu için Sign in with Apple zorunlu (kural 4.8).

### 2026-11-10 · Oturum 7 (tasarım revizyonu + kapanış)
- [x] Landing hero yeniden: üç satır dev ince başlık, yan notlar, şerit, ortalı düğmeler; logo şeridi sürekli kayıyor; fiyat bölümünde yörünge animasyonu.
- [x] Menüler sıvı cam hap (`ui/liquid-navbar.tsx`, WebGL; WebGL yoksa CSS damla).
- [x] Gemini illüstrasyonları zemini silinip yerleştirildi (`public/art/`); yeni logo web, sekme ikonu, Mac ve Android ikonlarına işlendi.
- [x] Yıllık özet sayfası (`#/wrapped`), İçgörüler ve ⌘K üzerinden açılır.
- [x] SEO fiyat sayfaları: `scripts/price-pages.ts` derlemede 40 servis + hub + sitemap + robots üretir (`/fiyatlar/*`).
- [x] Paket bölündü: `firebase` ve `catalog` ayrı dosyalar.
- [x] Sign in with Apple (web) kodu hazır, `VITE_APPLE_SIGN_IN=1` ile açılır.
- [x] Eski kök web kodu, `functions/`, `server/`, Cypress ve eski Firebase yapılandırması repodan kaldırıldı.
- [x] `macmini-server`: `aboneyim_web`, `aboneyim_api`, imajları, `server_default` ağı ve tailnet 443 yayını kaldırıldı. Portainer duruyor.
- [x] Fiyat derlemesi: Spotify, Apple Music, Amazon Prime, Netflix güncellendi; kalanlar `YAPILACAKLAR.md` §5'te.
- [ ] Kutluhan'da: Apple Developer adımları, Mac App Store sertifikaları, Android anahtarları, eski Firebase projesinin silinmesi (`YAPILACAKLAR.md`).

### Sıradaki
Açık işlerin güncel listesi: [YAPILACAKLAR.md](../YAPILACAKLAR.md).
