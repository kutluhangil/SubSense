# Aboneyim — Yapılacaklar ve İsteğe Bağlı Yapılandırma Rehberi

> **Son Güncelleme:** 8 Kasım 2026  
> **Canlı Sunucu:** `https://macmini-server.taild883a6.ts.net/` (`aboneyim_web` + `aboneyim_api` Docker konteynerleri `macmini-server` üzerinde çalışıyor)

---

## 1. Şu An Tam Çalışan Özellikler (Ek Ayar Gerektirmez)

Aşağıdaki tüm özellikler şu an canlı ortamda (`https://macmini-server.taild883a6.ts.net/`) ve yerel geliştirme ortamında (`http://localhost:5173`) eksiksiz çalışmaktadır:

- **Kullanıcı Girişi & Kayıt:** E-posta/Şifre ve Google OAuth (`macmini-server.taild883a6.ts.net` Firebase Authorized Domains listesine eklendi).
- **Firestore Gerçek Zamanlı Senkronizasyon:** Abonelik ekleme, düzenleme, silme, ortak abonelik (`isShared` / `myShare`), deneme süresi (`Trial`), bütçe limitleri (`budgetLimits`), tasarruf hedefi (`savingsGoal`), toplam tasarruf (`totalSaved`) ve bildirim tercihleri.
- **Yıllık, Aylık ve Deneme (Trial) Takvimi:** Uygulama içi `CalendarModal` görünümü ve `.ics` dosya indirme.
- **TR / EN Çift Dil Desteği:** 811 Türkçe / 811 İngilizce çeviri anahtarı, Yardım Merkezi 5 adımlı Kullanım Rehberi ve Bilinen Sınırlamalar modalları.
- **%100 Ücretsiz (Free) Mod:** Tüm Pro kilitleri, yükseltme pencereleri ve Stripe ödeme adımları kaldırıldı.

---

## 2. İsteğe Bağlı: Self-Hosted Backend (`aboneyim_api`) Anahtarlarını Aktifleştirme

`macmini-server` üzerinde çalışan `aboneyim_api` konteyneri (`/api/fn/:name` ve `/api/calendar.ics`) ayaktadır. Ancak sunucu tarafındaki **Gemini AI**, **Firebase Admin SDK** (arkadaş arama/ekleme, tüm cihazlardan çıkış, canlı ICS takvim akışı aboneliği) ve **Resend E-posta** (yenileme hatırlatıcısı ve aylık rapor e-postaları) özelliklerinin çalışması için kök dizindeki `.env` dosyasına aşağıdaki anahtarların eklenmesi gerekir.

> **Güvenlik Notu:** Bu değişkenlerin hiçbiri `VITE_` ile başlamadığı için tarayıcı paketine (`aboneyim_web`) **asla** girmez; yalnızca `macmini-server` içindeki `aboneyim_api` konteynerine aktarılır. `.env` dosyası `.gitignore` ve `.dockerignore` içindedir.

### Adım 2.1 — `GEMINI_API_KEY` (AI Tasarruf Önerileri ve AI Asistanı İçin)
1. [Google AI Studio — API Keys](https://aistudio.google.com/app/apikey) sayfasına git ve bir API anahtarı oluştur.
2. `/Volumes/ProjectClaude/SubSense/.env` dosyasını aç ve şu satırı ekle/güncelle:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

### Adım 2.2 — `FIREBASE_SERVICE_ACCOUNT_JSON` (Arkadaşlar, Canlı ICS Akışı ve Oturum İptali İçin)
`aboneyim_api` konteynerinin Firestore ve Firebase Auth üzerinde Admin yetkisiyle işlem yapabilmesi için:
1. [Firebase Console → Project Settings → Service accounts](https://console.firebase.google.com/project/subscriptionhub-85b02/settings/serviceaccounts/adminsdk) sayfasına git.
2. **"Generate new private key"** butonuna tıkla ve indirilen `.json` dosyasını aç.
3. JSON içeriğini **tek satır (minified)** haline getirip `.env` dosyasına tek tırnak içinde yapıştır:
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"subscriptionhub-85b02",...}'
   ```
   *(İpucu: İndirdiğin JSON dosyasını tek satıra çevirmek için terminalde `jq -c . < indirdigin-dosya.json` komutunu kullanabilirsin.)*

### Adım 2.3 — `RESEND_API_KEY` ve `ADMIN_EMAILS` (E-posta Bildirimleri ve Fiyat Senkronizasyonu İçin — İsteğe Bağlı)
Yenileme hatırlatmaları (`sendRenewalReminders`), aylık raporlar (`sendMonthlyReports`) ve özel doğrulama e-postaları göndermek istersen:
1. [Resend Dashboard](https://resend.com/api-keys) üzerinden bir API anahtarı al.
2. `.env` dosyasına ekle:
   ```env
   RESEND_API_KEY="re_..."
   RESEND_FROM_EMAIL="Aboneyim <bildirim@senindomainin.com>"
   ADMIN_EMAILS="senin-epostan@gmail.com"
   ```

### Adım 2.4 — Değişiklikleri `macmini-server` Üzerine Gönderme
`.env` dosyasını kaydettikten sonra Mac terminalinde proje dizinindeyken tek komut çalıştırman yeterlidir:
```bash
cd /Volumes/ProjectClaude/SubSense
bash server/scripts/deploy.sh
```
Bu komut yeni `.env` değişkenlerini `macmini-server` üzerindeki `aboneyim_api` konteynerine aktarır ve servisleri kesintisiz yeniden başlatır.

---

## 3. İleride Yapılabilecekler (Gelecek Fazlar)

- [ ] **Cloudflare Tunnel ile Dış Dünyaya Açma (İsteğe Bağlı):**
  - Şu an uygulama `tailscale serve` ile yalnızca senin Tailnet ağında (`https://macmini-server.taild883a6.ts.net/`) yayında.
  - İleride herkese açık bir alan adıyla (ör. `aboneyim.com`) yayınlamak istediğinde Cloudflare Tunnel içinde hedefi `http://127.0.0.1:3002` olarak göstermen ve yeni alan adını **Firebase Console → Authentication → Settings → Authorized domains** listesine eklemen yeterli.
- [ ] **Firestore Güvenlik Kurallarını (`firestore.rules`) Deploy Etme:**
  - `firestore.rules` dosyasında yapılan sıkılaştırmaları canlı Firebase projesine göndermek için:
    ```bash
    npx firebase-tools deploy --only firestore:rules --project subscriptionhub-85b02
    ```
- [ ] **Eski Ölü Kod Temizliği (Düşük Öncelik):**
  - `utils/firestore.ts` içinde artık backend (`aboneyim_api` / `utils/friends.ts`) üzerinden yürütülen eski istemci tarafı arkadaşlık yardımcı fonksiyonları ileride tamamen silinebilir.
- [ ] **Sunucu Rutin Bakımı:**
  - `macmini-server` üzerinde Docker paketleri otomatik güncellenmediği için ayda bir kez `ssh kutluhan@macmini-server` ile bağlanıp `sudo apt update && sudo apt upgrade` çalıştırılması önerilir.
