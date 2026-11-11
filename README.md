# SubSense

Ücretsiz abonelik takipçisi: ne ödediğini, ne zaman yenilendiğini ve hangi fiyatın arttığını gösterir. Reklam yok, ücretli sürüm yok, hesap açmadan da çalışır.

**Canlı:** https://sub-sense-ashy.vercel.app · **Fiyat sayfaları:** https://sub-sense-ashy.vercel.app/fiyatlar

A free subscription tracker for web, Mac and Android. One UI codebase, three shells.

## Yapı

```
apps/
  web/       Arayüzün tamamı (Vite 6, React 19, TypeScript, Tailwind 4, zustand, Firebase)
  desktop/   macOS kabuğu (Tauri 2): menü çubuğu, yerel bildirim, Google girişi
  android/   Android kabuğu (Capacitor 6): widget, yerel bildirim
docs/        Plan, görsel prompt'ları, pazarlama notları
```

Web, Mac ve Android aynı `apps/web` kodunu kullanır; kabuklar yalnız platforma özel parçaları ekler. Veri Firebase `subsense-andorid-app` projesinde durur (Auth + Firestore). Sunucu tarafı yoktur.

## Çalıştırma

```bash
cd apps/web
npm install
npm run dev      # http://localhost:5180
npm test         # vitest
npm run build    # tip kontrolü + derleme + /fiyatlar sayfaları, sitemap, robots
```

| İş | Komut (`apps/web` içinde) |
|---|---|
| Android hata ayıklama APK'sı | `npm run android:apk` |
| Android imzalı paket | `npm run android:aab` (anahtar dosyaları gerekir) |
| Mac uygulaması | `cd ../desktop && npm run build` |

Yayın: `main` dalına push edilince Vercel `apps/web` klasörünü derler.

Açık işler ve elle yapılacak adımlar: [YAPILACAKLAR.md](YAPILACAKLAR.md).
