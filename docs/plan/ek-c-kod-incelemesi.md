# Aboneyim — Kod İncelemesi, Gemini Denetimi ve App Store Değerlendirmesi (10 Kasım 2026)

Kapsam: `components/`, `utils/`, `contexts/`, `firebase/`, `functions/src/`, `server/`, yapılandırma dosyaları, Gemini'nin yazdığı `YAPILACAKLAR.md` + `docs/OTURUM-OZETI-2026-11-08.md`, canlı ortamlar (macmini-server, Vercel).
Doğrulama: `tsc --noEmit` frontend + functions temiz. Canlı `/api/health` ve Vercel uçları curl ile test edildi.

---

## 1. Canlı durum (ölçülen)

| Ortam | Ön yüz | Backend `/api` |
|---|---|---|
| macmini-server (`https://macmini-server.taild883a6.ts.net/`) | 200, konteynerler healthy | Ayakta ama `adminConfigured:false`, `geminiConfigured:false`, `resendConfigured:false` |
| Vercel (`https://sub-sense-ashy.vercel.app/`) | 200 | **Yok.** `POST /api/fn/*` → 405. Vercel'de backend gerektiren her şey bozuk |

Sonuç: Şu an iki ortamda da **AI asistan, AI önerileri, arkadaşlar, davet kodu, hesap silme, tüm cihazlardan çıkış, canlı takvim akışı, e-posta hatırlatma/rapor, haftalık fiyat senkronu çalışmıyor.** Çalışan: giriş/kayıt (e-posta), Firestore'daki abonelik CRUD, analizler, takvim modalı, `.ics` indirme, statik fiyat kataloğu.

---

## 2. Hatalar ve eksikler (önem sırasıyla)

### KRİTİK
1. **Takvim jetonu sızıntısı** — `functions/src/index.ts` `searchUsers`, bulunan kullanıcının `preferences` nesnesinin **tamamını** döndürüyor. `preferences.calendarToken` da bunun içinde (`components/Settings.tsx:202`, `utils/firestore.ts:213`). Bir kişinin e-postasını bilen herkes jetonunu alıp `/api/calendar.ics?token=…` ile tüm aboneliklerini, fiyatlarını indirebilir. Service account eklendiği an aktifleşir. Düzeltme: `preferences` yerine yalnız `region` ve `baseCurrency` döndür.
2. **Hesap silme çalışmıyor** — `deleteUserAccount` Admin SDK ister, sunucuda service account yok. Kullanıcı hesabını silemiyor (KVKK/GDPR ve App Store 5.1.1(v) ihlali).
3. **Vercel'de backend yok** — `vercel.json` tüm yolları `index.html`'e yönlendiriyor, `/api` proxy'si yok. Backend Tailscale-only olduğu için Vercel'den ulaşılamaz zaten. Herkese açık tek site Vercel ve orada özelliklerin yarısı ölü.

### YÜKSEK
4. **Vercel'de 47 SEO sayfası bozuk** — sitemap `/fiyatlar/netflix` gibi temiz URL veriyor; Vercel bunu SPA ana sayfasına düşürüyor (ölçüldü: başlık "Aboneyim — Akıllı Abonelik Takipçisi"). Sadece `.html` uzantılı adres çalışıyor. Düzeltme: `vercel.json` içine `"cleanUrls": true`.
5. **Yanlış zam uyarısı riski** — `utils/priceCatalog.ts:267` `matchBestTier`: abonelikte plan adı boşsa **rastgele ikinci kademeyi** seçiyor; alt dize eşleşmesi "Premium" → "Premium Family" gibi yanlış kademeye kayabiliyor. "Tümünü Otomatik Güncelle" kullanıcının doğru fiyatını yanlışla ezebilir (öğrenci/aile/kampanya fiyatları dahil).
6. **Sahte sosyal kanıt** — `utils/translations.ts:16/943` "10,000+ kullanıcı tarafından güveniliyor". Doğru değil; tüketici hukuku ve App Store 2.3 açısından risk. Kaldır.
7. **Firestore kuralları canlıda değil** — Gemini sıkılaştırdı ama deploy etmedi (kendi YAPILACAKLAR'ında açık madde). Canlıdaki kural seti doğrulanmadı.
8. **Gemini modeli eski** — `functions/src/index.ts` `gemini-2.0-flash` kullanıyor; bu model kullanımdan kaldırma takviminde. Anahtar eklenince ilk test bu olmalı, büyük olasılıkla model adı güncellenmeli. Ayrıca anahtar URL query'sinde (`?key=`), `x-goog-api-key` başlığına taşınmalı.

### ORTA
9. **Ücretsiz modda "Pro" artıkları** — `functions/src/referrals.ts` hâlâ "30 gün Pro" veriyor (`plan.proUntil`); `AuthContext.tsx` `isPro`/`upgradeToPro`, `utils/firestore.ts` `stripeCustomerId`. Ölü kavram; davet akışı ya kaldırılmalı ya rozet/başarıma çevrilmeli.
10. **Cron fiyat senkronu anahtarsız da çalışıyor** — `server.ts` Pazartesi 03:00 `syncPricesWeekly`'yi service account kontrolünden **önce** tetikliyor; her hafta sessizce hata veriyor.
11. **Hesap silme yarım** — silinen kullanıcı arkadaşlarının `friends/{uid}` kayıtlarında kalıyor; batch 500 işlem sınırını aşarsa silme patlar.
12. **Production source map yayında** — `vite.config.ts` `sourcemap: true`; kaynak kodun tamamı herkese açık.
13. **E-posta ile hesap varlığı sorgulanabiliyor** — `searchUsers` tam eşleşme ile hesabın var olup olmadığını söylüyor (hesap numaralandırma). Hız sınırı yok.
14. **Rate limit yok** — `/api/fn/*` uçlarında istek sınırı yok; Gemini açılınca tek kullanıcı kotayı bitirebilir.

### DÜŞÜK (temizlik)
15. Kök `package.json`'da frontend'in kullanmadığı `firebase-admin`, `firebase-functions`, `@google/genai`.
16. `functions/Dockerfile` Node 20, `package.json` engines Node 22; `firebase-admin@11` / `firebase-functions@4` eski sürümler.
17. `firebase/firebase.ts`: sabit kodlu fallback config, altındaki "config eksik" uyarısını ölü kod yapıyor; `getFunctions` artık gereksiz.
18. `ProfileCardModal.tsx:175` paylaşım linki hâlâ `https://subsense.app/u/…` (sahibi olmadığın alan adı). `index.ts` redirect fallback'i de `subsense.app`.
19. PWA manifest `orientation: "portrait"` masaüstü kurulumda gereksiz kısıt.
20. `IS_BETA = true` sabit; yayın öncesi kapatılmalı.

---

## 3. Gemini'nin yazdıkları — doğru mu?

| Gemini'nin iddiası | Gerçek |
|---|---|
| "Google OAuth ile giriş çalışıyor" | **Yanlış.** Kodda `GoogleAuthProvider` / `signInWithPopup` yok; yalnız e-posta + şifre var |
| "Otomatik fiyat güncelleme ve canlı zam radarı" | **Kısmen.** Radar yalnız pakete gömülü statik katalogla karşılaştırıyor; canlı kısım (Gemini + Google Search) anahtar olmadığı için hiç çalışmıyor |
| "Vercel'de eksiksiz çalışıyor" | **Yanlış.** Vercel'de `/api` yok (405) ve SEO sayfaları SPA'ya düşüyor |
| "Firestore kuralları sıkılaştırıldı" | Dosyada evet, **canlıya deploy edilmedi** |
| Cron saatleri: fiyat Pzt 06:00, rapor ayın 1'i 10:00 | Kodda Pzt **03:00** ve ayın 1'i **09:00** |
| "localStorage anahtarları `aboneyim_*`'a taşındı" | Kısmen; `subsense_notify_*`, `subsense_notified` hâlâ kullanılıyor (çalışıyor, ad tutarsız) |
| Stripe/Pro tamamen kaldırıldı | Ön yüzde evet; backend referral'da ve tiplerde artıklar var (madde 9) |
| Docker + tailscale serve kurulumu, port kuralları | **Doğru.** `127.0.0.1:3002`, API dışarı port açmıyor, kurallara uygun |
| 811/811 çeviri, TS derlemesi | Doğru, `tsc` temiz |

Genel not: Gemini'nin altyapı işi sağlam. Belgeleri ise fazla iyimser; "çalışıyor" dediği özelliklerin bir kısmı anahtar eksikliğinden ölü.

---

## 4. App Store (Mac) uygunluk kontrolü

Kısa cevap: **Bu hâliyle uygun değil.** Proje bir web SPA'sı; App Store'a girmesi için yerel bir kabuk ve aşağıdaki değişiklikler gerekir.

| Şart | Durum | Gereken |
|---|---|---|
| Apple Developer Program | — | Yıllık 99 USD (uygulama ücretsiz olsa bile) |
| Yerel paket (sandbox, imzalı, universal) | Yok | Tauri 2 (hafif, Mac App Store desteği var) veya SwiftUI + WKWebView. Electron ağır |
| 4.2 Asgari işlev ("paketlenmiş web sitesi" reddi) | **Risk yüksek** | Menü çubuğu öğesi, yerel bildirim, çevrimdışı çalışma gibi yerel özellikler şart |
| Backend herkese açık mı? | **Hayır**, Tailscale-only | Cloudflare Tunnel ile `127.0.0.1`'e bağlı herkese açık API ya da backend'siz (yalnız Firebase) mimari |
| API adresi | Göreli `/api/fn/…` | Yerel kabukta origin `tauri://` olur; mutlak `VITE_API_BASE_URL` gerekir |
| 5.1.1(v) Hesap silme | Kodda var, **çalışmıyor** | Service account + madde 11 düzeltmesi |
| 5.1.1(v) Girişsiz kullanım | Giriş zorunlu | Basit takip için Apple girişsiz/yerel mod isteyebilir; "hesapsız yerel mod" önerilir |
| 4.8 Giriş servisleri | Şu an yalnız e-posta (sorun yok) | Google girişi eklenirse Sign in with Apple da şart |
| 5.1.2 Üçüncü taraf AI'ya veri | Açıklama yok | Gemini'ye abonelik verisi gidiyor; açık onay ekranı ve gizlilik metni gerekli |
| Gizlilik politikası URL'si + gizlilik etiketleri | Yalnız modal içinde | Herkese açık `/gizlilik` sayfası; Firebase Analytics + Performance veri toplamını App Store Connect'te beyan |
| 2.3 Doğru meta veri | "10,000+ kullanıcı" | Kaldır |
| Uygulama içinde pazarlama sayfası | Hero/landing açılıyor | Uygulama doğrudan giriş/dashboard ile açılmalı |
| Service worker / PWA | Açık | Yerel kabukta kapatılmalı |
| 5.2 Marka logoları | Netflix vb. logolar | Gerçek logolar genelde tolere edilir ama ret sebebi olabilir; risk notu |

---

## 5. App Store pazarı ve fikirler

Rakipler (2026): **Bobby** (iPhone + Apple Silicon Mac + Vision, ücretsiz + küçük tek seferlik paketler, 10 yıllık), **Subby** (iCloud senkron, widget, 1.99 USD/ay), **Chronicle** (fatura odaklı, Pro 14.99 USD), **Rocket Money** (banka bağlantılı, ABD odaklı). Hepsi manuel giriş ve İngilizce/ABD odaklı.

Aboneyim'in gerçek farkı:
- **Türkiye kataloğu:** Exxen, Gain, Tabii, BluTV/Max, Trendyol Plus, Hepsiburada Premium TL fiyatları. Rakiplerde yok.
- **Zam radarı:** TR'de zamlar sık; "Netflix zamlandı, senin fiyatın eski" bildirimi gerçek bir ihtiyaç.
- **Tamamen ücretsiz ve sınırsız:** Bobby/Subby sınır koyuyor veya ücret alıyor.

Fikirler (değere göre sıralı):
1. **Önce iOS uygulaması.** Abonelik hatırlatması telefonda işe yarar. iPhone/iPad uygulaması Apple Silicon Mac'lerde Mac App Store'da otomatik listelenir; tek uygulama, iki platform.
2. **Hesapsız yerel mod + isteğe bağlı senkron.** "Banka yok, hesap yok, veri cihazında" mesajı rakiplerle aynı güven çizgisi; 5.1.1(v) riskini de kapatır.
3. **Yerel bildirim** (yenilemeden 1–3 gün önce). E-posta hatırlatmasından değerli ve backend istemez.
4. **Widget + menü çubuğu:** "Bu ay ₺1.240, sıradaki: Spotify yarın". 4.2'yi geçmenin en güçlü kanıtı.
5. **Zam bildirimi:** Katalog güncellenince "3 aboneliğin zamlandı" bildirimi. Fiyat verisi elle doğrulanmalı (madde 5).
6. **Kısayollar/Siri:** "Bu ay ne kadar ödüyorum?"
7. **ICS yerine EventKit:** Yenilemeleri doğrudan Apple Takvim'e yaz; jeton/sunucu gerekmez.
8. **Mağaza konumlandırması:** Ad "Aboneyim", alt başlık "Abonelik ve Zam Takibi". TR anahtar kelimeleri: abonelik takip, Netflix zam, dijital abonelik. ABD için İngilizce alt başlık şart; "Aboneyim" orada anlam taşımaz.

---

## 6. Mantıklı mı? (görüş)

**Yalnız Mac App Store için: şimdilik hayır.** Sebepler:
- Gelir yok, maliyet var (99 USD/yıl + inceleme + bakım).
- Mac App Store'da keşfedilme düşük; bu kategori telefonda yaşıyor.
- Backend ev sunucusunda ve Tailscale-only; dışarıdan kullanıcıya hizmet veremez. Herkese açmak ev sunucusunu internete açmak demek (Cloudflare Tunnel planı zaten var ama yük, yedek ve kesinti sorumluluğu sende).
- Web sarmalayıcı 4.2'den büyük olasılıkla döner.

**Mantıklı olan sıra:**
1. Bu rapordaki KRİTİK + YÜKSEK maddeleri düzelt (çoğu küçük iş).
2. Backend kararını ver: (a) anahtarları ekle + Cloudflare Tunnel ile API'yi aç, ya da (b) App Store sürümünü backend'siz yap (yerel veri + bildirim + statik katalog, AI'sız).
3. Hedef App Store ise **iOS-öncelikli** yerel uygulama (Flutter ile yazarsan güçlü olduğun alan; Capacitor ile mevcut React kodunu kullanırsan daha hızlı). Mac'e otomatik gelir.
4. Portföy/deneyim hedefliyorsan değer: App Store yayın süreci, inceleme, gizlilik etiketleri CV'de güçlü durur.

---

## 7. Önerilen faz planı

- **Faz A (güvenlik, ~1 oturum):** madde 1, 4, 6, 10, 12, 18, 20 + `firestore.rules` deploy.
- **Faz B (backend):** service account + Gemini anahtarı + model güncelleme (8), hesap silme düzeltmesi (11), rate limit (14), referral'ı sadeleştir (9).
- **Faz C (fiyat doğruluğu):** `matchBestTier` düzeltmesi + test (5).
- **Faz D (App Store hazırlığı):** API base URL, hesapsız mod, gizlilik sayfası, AI onay ekranı, landing'siz uygulama girişi.
- **Faz E (yerel uygulama):** iOS (Flutter/Capacitor) → bildirim, widget, Kısayollar → TestFlight → inceleme.
