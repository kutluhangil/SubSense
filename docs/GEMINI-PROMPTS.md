# SubSense görselleri ve logo: Gemini prompt'ları

> Güncel tasarım (v3): Apple × Neural-Vault. Serif başlıklar (Source Serif 4), noktalı kâğıt zemin, cam menü, indigo vurgu.
> Renkler: açık zemin `#FBF9FE`, koyu zemin `#0D0E12`, indigo `#494BD6`, açık indigo `#A9AAFF`, lavanta `#C0C1FF`, mürekkep `#1B1B1F`.

Site ve uygulamalar görseller olmadan da eksiksiz çalışır. Üretilen dosyaları `apps/web/assets-src/` klasörüne koy (git dışı), sonra Claude Code'a şunu yaz:
**"GEMINI-PROMPTS.md görsellerini ve logoyu yerleştir."**
Claude görselleri sıkıştırıp `public/art/` altına, logoyu uygulama ikonlarına (Mac, Android, web) dönüştürür.

---

## A. Logo ve ikonlar

Logo fikri: **yörünge.** Bir halka, merkezde dolu bir nokta, halkanın sağ üstünde küçük bir uydu. Ay bir döngüdür, abonelikler o döngüde yenilenir. Sitedeki kadran ve süslemelerle aynı aile.

### A1. Uygulama ikonu (Mac App Store, ana dosya)

```
macOS app icon, 1024x1024 PNG with transparent corners, Apple's macOS squircle shape with the
standard inset margin (icon body about 824x824 centered). Body: smooth deep indigo gradient,
#6466F0 at the top to #2B2AB4 at the bottom, with a very subtle glass sheen on the upper half and
a faint inner edge highlight. Center symbol in pure white: a thin, perfectly round orbit ring,
a solid dot at its exact center, and one smaller solid satellite dot sitting on the ring at the
upper-right (about 45 degrees). Stroke weight of the ring equals about one fifth of the center
dot's diameter. Crisp vector edges, soft inner shadow under the symbol, no text, no letters,
no extra decoration. Premium, calm, instantly readable at 16px.
```
Dosya: `app-icon.png`

### A2. Android uyarlanabilir ikon (ön ve arka katman)

```
Android adaptive icon foreground layer, 1024x1024 PNG, fully transparent background. Only the
white orbit symbol (thin round ring, solid center dot, small satellite dot on the ring at the
upper right), centered inside the inner 66% safe zone, crisp vector edges, no shadow, no text.
```
Dosya: `android-foreground.png` · Arka katman düz renk: `#3B3CCB` (Claude koda yazar, görsel gerekmez).

### A3. Yatay logo (wordmark)

```
Horizontal logo lockup on a transparent background, 2400x800 PNG. Left: the SubSense app icon
(indigo squircle with the white orbit symbol). Right: the word "SubSense" set in an elegant
transitional serif similar to Source Serif 4 at medium weight, tight but comfortable letter
spacing, color #1B1B1F. The icon height equals the cap height plus descender of the word.
Clean, editorial, premium. No tagline, no other elements.
```
Dosya: `logo-horizontal.png` · Koyu zemin sürümü: aynı prompt, yazı rengi `#ECEBF2` → `logo-horizontal-dark.png`

### A4. Tek renk sembol (favicon, menü çubuğu, baskı)

```
Monochrome symbol only, 1024x1024 PNG, transparent background: the orbit mark (thin round ring,
solid center dot, small satellite dot on the ring at the upper right) in solid black #000000,
perfectly geometric, even stroke, no gradient, no shadow, no text.
```
Dosya: `mark-mono.png` (Claude bundan menü çubuğu şablon ikonunu ve favicon'u üretir.)

### A5. App Store / Play Store tanıtım görseli

```
Wide promotional banner 2880x1800 (and a 1024x500 crop safe area in the center). Deep night
background #0D0E12 with a very faint dot grid. Centered: a large glowing orbit dial, a thin ring
with small colored glass spheres placed around it like dates on a clock, a slim indigo hand
pointing to the lower right, soft indigo radial glow behind. Left third empty for text that will
be added later. No text, no letters, no logos of real brands. Premium, calm, cinematic lighting.
```
Dosya: `store-banner.png`

---

## B. İllüstrasyonlar (boş durumlar ve bölümler)

### Ortak stil (her prompt'un başına ekle)

```
Fine-art editorial illustration in the spirit of a hand-inked engraving: confident fine ink
linework with delicate hatching, slightly organic strokes, like a plate from an old astronomy
atlas, combined with a subtle modern glass sheen on the main object. Selective flat color only in
deep indigo #494BD6 and soft lavender #C0C1FF, tiny accents of cool grey #76767F. Calm, precise,
generous negative space, single centered subject. No text, no letters, no numbers, no logos,
no faces, no UI, no frame, no border, no background scene.
TRANSPARENT BACKGROUND (PNG with alpha). If impossible use pure white #FFFFFF.
Square 2048x2048, subject fills about 65% of the canvas, print quality.
```

Koyu tema sürümü için sona ekle:

```
Dark-mode variant of the exact same drawing: ink lines in pale lavender #ECEBF2 instead of black,
fills in #8083FF and #A9AAFF. Transparent background, or pure black #000000 if impossible.
```

| # | Dosya | Nerede | Prompt (ortak stilden sonra) |
|---|---|---|---|
| 1 | `empty-month.png` | Genel bakış, hiç abonelik yokken | `An astronomer's orrery with empty rings and no planets yet; one small indigo glass sphere waits on a stand beside it.` |
| 2 | `no-results.png` | Arama sonucu yok | `A brass magnifying glass resting on an open star chart, its lens showing only blank paper.` |
| 3 | `offline.png` | Bağlantı ya da senkron hatası | `A small satellite drifting slightly off its dotted orbit line, one antenna folded, calm.` |
| 4 | `calendar.png` | Takvimde boş gün | `A single calendar page with a tiny indigo ring orbiting one of its empty squares.` |
| 5 | `free.png` | Landing "Ücretsiz" bölümü | `An open birdcage with its door wide open and a small indigo paper bird flying out.` |
| 6 | `ornament.png` | Bölüm ayırıcıları (küçük) | `A small symmetrical orbit ornament: concentric dotted rings with one satellite, like a cartographer's compass rose. Wide 2048x1024, lots of empty space.` |
| 7 | `seal.png` | Footer imzası (her zaman koyu sürüm) | `A round seal-like emblem drawn as an engraving: the orbit symbol inside a thin double circle, small stars between the circles. Flat, no text.` |

Her birinin koyu sürümü: aynı ad + `-dark` (`empty-month-dark.png` …). `seal.png` yalnız koyu sürüm yeterli.

---

## Kontrol listesi
- [ ] Zemin şeffaf ya da saf beyaz/siyah; kenarda gri hale yok.
- [ ] Metin yok (A3 dışında), gerçek marka logosu yok, yüz yok.
- [ ] Açık ve koyu sürüm aynı çizim, yalnız renkler farklı.
- [ ] İkonlar 16 px'te de okunuyor (A1, A4).
