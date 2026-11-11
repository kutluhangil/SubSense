# SubSense: yapılacaklar

> Son güncelleme: 12 Kasım 2026 · Canlı: https://sub-sense-ashy.vercel.app
>
> Kodla yapılabilen her şey bitti. Bu dosyadaki adımlar senin hesaplarınla (GitHub, Apple, Firebase, Google Play) yapılması gerekenler. Sırayla git; her adımın sonunda ne görmen gerektiği yazıyor.

| # | İş | Süre | Ne gerekiyor |
|---|---|---|---|
| 1 | Yeni tasarımı canlıya çıkar | 1 dk | Claude Code'a tek cümle |
| 2 | Fiyatlara göz at | 5 dk | Tarayıcı |
| 3 | Android imzalı sürüm | 15 dk | Firebase konsolu, anahtar dosyan |
| 4 | Apple ile giriş (web) | 20 dk | Apple Developer hesabı |
| 5 | Mac App Store | 30 dk | Apple Developer hesabı |
| 6 | Eski Firebase projesini sil | 5 dk | Firebase konsolu |

---

## 1. Yeni tasarımı canlıya çıkar

Yeni ana sayfa, logo, yıllık özet sayfası, fiyat sayfaları ve dosya temizliği bilgisayarında hazır ama henüz commit edilmedi. Canlı site hâlâ eski hâlinde.

1. İstersen önce yerelde bak: Terminal'de `cd /Volumes/ProjectClaude/SubSense/apps/web && npm run dev`, sonra tarayıcıda http://localhost:5180.
2. Claude Code'a şunu yaz: **"commit at, push et"**.
3. Push'tan 1–2 dakika sonra https://sub-sense-ashy.vercel.app adresini yenile.

**Bittiğini nasıl anlarsın:** Ana sayfada yeni logo görünür ve https://sub-sense-ashy.vercel.app/fiyatlar açılır.

## 2. Fiyatlara göz at

Fiyat sayfaları herkese açık, yanlış rakam güven kaybettirir. Aşağıdaki üç tablo ne durumda olduğumuzu gösteriyor.

### Kaynaktan doğrulananlar (bir şey yapmana gerek yok)

| Servis | Türkiye fiyatı (aylık) | Kaynak |
|---|---|---|
| Spotify | Bireysel ₺115, Duo ₺159, Aile ₺199, Öğrenci ₺60 | spotify.com |
| Apple Music | Bireysel ₺89,99, Aile ₺149,99, Öğrenci ₺49,99 | apple.com |
| Amazon Prime / Prime Video | ₺69,90 | amazon.com.tr |
| YouTube Premium, Disney+ | değişmedi | kendi sayfaları |
| PlayStation Plus | Essential ₺400, Extra ₺600, Deluxe ₺710 | playstation.com |
| Microsoft 365 | Bireysel ₺329,99, Aile ₺409,99 | microsoft.com |
| Google Workspace | Starter ₺71,20, Standard ₺142,40, Plus ₺223,70 (kişi başı) | workspace.google.com |
| Adobe Creative Cloud | Fotoğrafçılık ₺669, Tek uygulama ₺769, Standard ₺1.799, Pro ₺2.299 | adobe.com |
| HBO Max (ve BluTV) | Standart ₺229,90 (yıllık ₺2.299), Özel ₺299,90 (yıllık ₺2.999) | hbomax.com/tr/tr |
| Xbox Game Pass | Essential ₺269, Premium ₺409, PC Game Pass ₺419, Ultimate ₺529 | xbox.com/tr-TR |
| Exxen | Reklamlı ₺275, Reklamsız ₺388; ikinci paket ₺486 / ₺599 | exxen.com mesafeli satış sözleşmesi |
| Apple TV | ₺49,99 (iCloud+ 50 GB içinde; ayrı satılmıyor) | apple.com/tr/icloud |

### Haber kaynağına dayananlar (yayından önce bir kez kendin kontrol et)

| Servis | Yazdığım fiyat | Neden emin değilim | Nereden bakarsın |
|---|---|---|---|
| Netflix | ₺259,99 / ₺389,99 / ₺499,99 | Tek haber (ShiftDelete, 3 Eki 2026); başka siteler eski fiyatı yazıyor | netflix.com/signup/planform |
| Tabii | Premium ₺99 | Tek haber (Hürriyet); resmî site yalnız dolar fiyatı gösterdi | tabii.com |

Rakam yanlışsa Claude Code'a "Netflix Standart fiyatı ₺X olmuş, düzelt" demen yeterli.

### Doğrulanamayanlar (eski değer duruyor)

ChatGPT (₺499 ile ₺999 arası çelişkili haberler; resmî sayfa yalnız dolar gösteriyor), Claude, Discord, Canva (yalnız yıllık ₺1.920 doğrulandı), Crunchyroll, Audible, Nintendo, Twitch, Duolingo, Trendyol Elite, Hepsiburada Premium.

Bunların çoğu fiyatı yalnız uygulama içinde ya da giriş yaptıktan sonra gösteriyor. Kullandığın bir servisin fiyatını biliyorsan söyle, işleyeyim.

**Karar:** BluTV artık HBO Max'e dönüştü. Katalogda ikisi de duruyor (aynı fiyatla). BluTV'yi listeden tamamen kaldırmamı istersen söyle.

## 3. Android imzalı sürüm

Google Play'e yüklenecek paket için iki dosya gerekiyor; ikisi de gizli olduğu için repoda yok.

1. [Firebase Console → Proje ayarları](https://console.firebase.google.com/project/subsense-andorid-app/settings/general) → "Uygulamalarınız" → Android uygulaması → **google-services.json** indir.
2. İndirdiğin dosyayı şuraya koy: `apps/android/app/google-services.json`
3. Play'e ilk yüklemede kullandığın `keystore.properties` dosyasını ve `.jks` anahtar dosyasını `apps/android/` klasörüne kopyala. Bu dosyalar diskteki projelerde yok (eski `SubSense-AndroidApp` klasörüne baktım), sakladığın yerden almalısın. **Yeni anahtar üretme:** Play'deki uygulama eski anahtarla imzalı, farklı anahtarla güncelleme yüklenmez.
4. Terminal'de: `cd /Volumes/ProjectClaude/SubSense/apps/web && npm run android:aab`
5. Çıkan dosya: `apps/android/app/build/outputs/bundle/release/app-release.aab`. Bunu [Play Console](https://play.google.com/console) → SubSense → Üretim → Yeni sürüm oluştur ekranına yükle.

**Bittiğini nasıl anlarsın:** Play Console paketi kabul eder ve sürüm kodu öncekinden büyük görünür. Yükledikten sonra telefonda yeni ikonun kenarlarının kırpılmadığına bir kez bak.

Takılırsan dosyaları koyduktan sonra Claude Code'a "Android imzalı paketi üret" yaz.

## 4. Apple ile giriş (web)

Kod hazır ama kapalı; Apple tarafı kurulmadan düğme hata verir.

1. [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers/list/serviceId) → sağ üstten **Services IDs** seç → **+** → kimlik: `com.subsense.apps.web`, "Sign in with Apple" kutusunu işaretle, kaydet.
2. Az önce oluşturduğun Service ID'ye tıkla → **Configure**:
   - Domains: `subsense-andorid-app.firebaseapp.com`
   - Return URLs: `https://subsense-andorid-app.firebaseapp.com/__/auth/handler`
3. Sol menüden **Keys → +** → "Sign in with Apple" işaretle → oluştur → `.p8` dosyasını indir (yalnız bir kez indirilir). Ekrandaki **Key ID**'yi ve sağ üstteki **Team ID**'yi not et.
4. [Firebase Console → Authentication → Sign-in method](https://console.firebase.google.com/project/subsense-andorid-app/authentication/providers) → **Apple** → etkinleştir → Service ID, Team ID, Key ID ve `.p8` dosyasının içeriğini yapıştır → kaydet.
5. [Vercel](https://vercel.com) → `sub-sense` projesi → Settings → Environment Variables → ad `VITE_APPLE_SIGN_IN`, değer `1` → kaydet → Deployments → son yayında **Redeploy**.

**Bittiğini nasıl anlarsın:** Giriş sayfasında "Apple ile devam et" düğmesi görünür ve Apple hesabınla giriş yapabilirsin.

## 5. Mac App Store

Bu Mac'te imzalama sertifikası olmadığı için imzalı paket üretilemedi.

1. Apple Developer → **Identifiers → App IDs → +** → `com.subsense.apps`.
2. **Certificates → +** → sırayla "Mac App Distribution" ve "Mac Installer Distribution" oluştur. İndirdiğin iki `.cer` dosyasına çift tıkla; Anahtar Zinciri'ne kurulur.
3. **Profiles → +** → "Mac App Store Connect" → `com.subsense.apps` → indir.
4. Claude Code'a şunu yaz: **"Mac App Store paketini hazırla"**. Gerisini (derleme, imzalama, `.pkg`, yükleme) ben yaparım.

**Google girişi kararı (sen bir şey yapma, bilgin olsun):** App Store, Google girişi olan uygulamada Apple girişini de zorunlu tutuyor. Bu yüzden App Store sürümü Google düğmesi olmadan, yalnız e-posta girişiyle derleniyor (`npm run build:mas`). Normal Mac sürümünde Google girişi duruyor. İleride Mac'e Apple girişi eklemek istersen söyle.

## 6. Eski Firebase projesini sil

`subscriptionhub-85b02` projesi artık hiçbir yerde kullanılmıyor.

1. [Firebase Console → subscriptionhub-85b02 → Authentication](https://console.firebase.google.com/project/subscriptionhub-85b02/authentication/users) ekranında saklamak istediğin kullanıcı olmadığına bak.
2. [Proje ayarları](https://console.firebase.google.com/project/subscriptionhub-85b02/settings/general) → en altta **Projeyi sil**. 30 gün içinde geri alınabilir.
3. Proje silindikten sonra repo kökündeki `.env` ve `.env.local` dosyalarını sil; yalnız bu eski projenin anahtarlarını tutuyorlar.

---

## Sonraya kalanlar (acil değil)

- **Mac ve Android'de Apple girişi:** yerel eklenti gerekir; 4. ve 5. adımlardan sonra yapılabilir.
- **Firestore kurallarına alan doğrulaması:** projede 24 gerçek Android kullanıcısı var; kural değişikliği emülatör testiyle birlikte ayrı bir işte yapılmalı.
- **Android'in yeni senkron kurallarına geçişi** (Plan, Faz 4): mağazadaki eski sürümün kullanıcıları yeni sürüme geçince tamamlanır.
- **Kullanılmayan Gemini görselleri:** `offline` görseli için uygulamada yer yok; `logo-horizontal` kullanılmıyor.
