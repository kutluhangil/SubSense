/**
 * Static, crawlable price pages built from the same catalog the app uses.
 * Writes dist/fiyatlar/{slug}.html (served at /fiyatlar/{slug}), a hub page,
 * sitemap.xml and robots.txt. Runs after `vite build` through vite-node.
 */
import fs from 'node:fs'
import path from 'node:path'
import { EXPLORE_CATALOG, EXPLORE_CATEGORY_ORDER, type ExploreService, type ExploreTier } from '../src/core/data/explore'
import { EXPLORE_TR } from '../src/core/data/explore.tr'
import { logoFor } from '../src/core/lib/logos'
import { formatMoney } from '../src/core/lib/format'

const SITE = 'https://sub-sense-ashy.vercel.app'
const DIST = path.resolve('dist')
const OUT = path.join(DIST, 'fiyatlar')
const YEAR = new Date().getFullYear()
const TODAY = new Date().toISOString().slice(0, 10)

const CATEGORY_TR: Record<string, string> = {
  Streaming: 'Dizi ve film', Music: 'Müzik', Design: 'Tasarım', AI: 'Yapay zekâ', SaaS: 'İş araçları',
  Gaming: 'Oyun', Community: 'Topluluk', Shopping: 'Alışveriş', Turkish: 'Türkiye servisleri',
}

const slugify = (s: string) => s.toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const tierName = (t: ExploreTier) => t.nameLocalized ?? t.name
const cheapest = (tiers: ExploreTier[]) => Math.min(...tiers.map((t) => t.price))

function logo(name: string, size: number): string {
  const info = logoFor(name)
  if (!info) return `<span class="glyph" style="width:${size}px;height:${size}px;font-size:${size * 0.42}px">${esc(name.charAt(0))}</span>`
  const svg = fs.readFileSync(path.resolve(`src/core/images/${info.slug}.svg`)).toString('base64')
  return `<span class="glyph${info.dark ? ' dark' : ''}" style="width:${size}px;height:${size}px"><img src="data:image/svg+xml;base64,${svg}" alt="" width="${size * 0.64}" height="${size * 0.64}"></span>`
}

const CSS = `
:root{--bg:#fbf9fe;--cell:#fff;--label:#1b1b1f;--label2:#5b5a66;--label3:#8e8d99;--sep:rgba(60,60,80,.13);--tint:#494bd6;--dot:rgba(73,75,214,.075)}
@media (prefers-color-scheme:dark){:root{--bg:#0d0e12;--cell:#17181d;--label:#ecebf2;--label2:#b4b2c3;--label3:#7f7e8f;--sep:rgba(255,255,255,.08);--tint:#a9aaff;--dot:rgba(192,193,255,.06)}}
*{box-sizing:border-box}html{background:var(--bg) radial-gradient(var(--dot) 1px,transparent 1px) 0 0/16px 16px;color:var(--label);font:17px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
body{margin:0}a{color:var(--tint);text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:4px}
header.top{max-width:1040px;margin:0 auto;padding:20px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:10px;color:var(--label);font:21px Georgia,"New York",serif}
main{max-width:820px;margin:0 auto;padding:48px 20px 96px}
h1,h2{font-family:"New York",Georgia,ui-serif,serif;font-weight:500;letter-spacing:-.02em;line-height:1.08;margin:0}
h1{font-size:clamp(38px,6vw,60px)}h2{font-size:28px;margin-top:56px}
.lede{font-size:19px;color:var(--label2);margin:18px 0 0;max-width:36em}
.head{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.glyph{display:inline-grid;place-items:center;flex:none;border-radius:27%;background:#fff;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.12);color:#fff;font-weight:600;background-color:#fff}
.glyph:not(:has(img)){background:linear-gradient(160deg,#6466f0,#2b2ab4)}.glyph.dark{background:#111}
.group{background:var(--cell);border-radius:18px;overflow:hidden;margin-top:18px}
.row{display:flex;align-items:center;gap:14px;padding:14px 18px;color:var(--label)}
.row+.row{border-top:.5px solid var(--sep)}a.row:hover{text-decoration:none;background:color-mix(in srgb,var(--label) 4%,var(--cell))}
.row .grow{flex:1;min-width:0}.row small{display:block;color:var(--label3);font-size:13.5px}
.price{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}
.note{color:var(--label3);font-size:13.5px;margin-top:12px}
.cta{display:inline-flex;align-items:center;min-height:44px;padding:0 22px;border-radius:980px;background:var(--label);color:var(--bg);font-weight:500;margin-top:28px}
.cta:hover{text-decoration:none;opacity:.88}
.band{margin-top:64px;padding:32px;border-radius:24px;background:#0d0e12;color:#b4b2c3}.band h2{margin:0;color:#ecebf2}.band .cta{background:#ecebf2;color:#0d0e12}
footer{max-width:820px;margin:0 auto;padding:0 20px 48px;color:var(--label3);font-size:13.5px}
`

const MARK = fs.readFileSync(path.resolve('public/favicon.svg'), 'utf8').replace('<svg ', '<svg width="28" height="28" ')

function layout(title: string, description: string, url: string, body: string, jsonLd?: object): string {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
<style>${CSS}</style>
</head>
<body>
<header class="top"><a class="brand" href="/">${MARK}SubSense</a><a href="/fiyatlar">Tüm fiyatlar</a></header>
<main>${body}
<section class="band"><h2>Hepsini tek yerde takip et.</h2><p>SubSense aboneliklerini, yenileme günlerini ve zamları gösterir. Ücretsiz, reklamsız, hesap açmadan da çalışır.</p><a class="cta" href="/">Ücretsiz başla</a></section>
</main>
<footer>Fiyatlar liste fiyatıdır, ${TODAY} tarihinde derlendi. Kampanya ve vergiler farklılık gösterebilir; kesin fiyat için servisin kendi sayfasına bak.</footer>
</body>
</html>
`
}

const rows = (tiers: ExploreTier[], currency: string) =>
  tiers.map((t) => `<div class="row"><span class="grow">${esc(tierName(t))}<small>${t.cycle === 'Yearly' ? 'Yıllık' : 'Aylık'}</small></span><span class="price">${formatMoney(t.price, currency)}</span></div>`).join('')

function servicePage(svc: ExploreService): string {
  const slug = slugify(svc.name)
  const url = `${SITE}/fiyatlar/${slug}`
  const tr = svc.regions.TR?.tiers ?? []
  const us = svc.regions.US?.tiers ?? []
  const from = tr.length ? `${formatMoney(cheapest(tr), 'TRY')}` : us.length ? formatMoney(cheapest(us), 'USD') : ''
  const about = (EXPLORE_TR[svc.name]?.description ?? svc.description)?.[0] ?? ''
  const title = `${svc.name} fiyatları ${YEAR}: Türkiye abonelik ücretleri | SubSense`
  const description = `${svc.name} ${YEAR} güncel abonelik fiyatları${from ? `, ${from} başlangıç` : ''}. Tüm planlar, Türkiye ve ABD liste fiyatları tek sayfada.`
  const related = EXPLORE_CATALOG.filter((s) => s.category === svc.category && s.name !== svc.name).slice(0, 6)
  const offers = (tr.length ? tr : us).map((t) => ({ '@type': 'Offer', name: tierName(t), price: t.price, priceCurrency: tr.length ? 'TRY' : 'USD' }))
  const body = `
<div class="head">${logo(svc.name, 72)}<div><a href="/fiyatlar">Fiyatlar</a> · ${esc(CATEGORY_TR[svc.category] ?? svc.category)}</div></div>
<h1>${esc(svc.name)} fiyatları ${YEAR}</h1>
<p class="lede">${esc(svc.name)} aboneliğinin güncel liste fiyatları${from ? `: en ucuz plan ${from}` : ''}.</p>
${tr.length ? `<h2>Türkiye fiyatları</h2><div class="group">${rows(tr, 'TRY')}</div>` : ''}
${us.length ? `<h2>ABD fiyatları</h2><div class="group">${rows(us, 'USD')}</div>` : ''}
${tr.length ? '' : '<p class="note">Bu servis için Türkiye liste fiyatı yok; ücret dolar üzerinden alınır.</p>'}
${about ? `<h2>${esc(svc.name)} hakkında</h2><p class="lede">${esc(about)}</p>` : ''}
${svc.website ? `<p class="note"><a href="${esc(svc.website)}" rel="nofollow noopener">${esc(svc.name)} resmî sayfası</a></p>` : ''}
${related.length ? `<h2>Benzer servisler</h2><div class="group">${related.map(linkRow).join('')}</div>` : ''}`
  return layout(title, description, url, body, { '@context': 'https://schema.org', '@type': 'Product', name: svc.name, category: CATEGORY_TR[svc.category], url, offers })
}

function linkRow(svc: ExploreService): string {
  const tr = svc.regions.TR?.tiers ?? []
  const us = svc.regions.US?.tiers ?? []
  const from = tr.length ? formatMoney(cheapest(tr), 'TRY') : us.length ? formatMoney(cheapest(us), 'USD') : ''
  return `<a class="row" href="/fiyatlar/${slugify(svc.name)}">${logo(svc.name, 40)}<span class="grow">${esc(svc.name)}</span><span class="price">${from}</span></a>`
}

function hubPage(): string {
  const groups = EXPLORE_CATEGORY_ORDER.map((c) => ({ title: CATEGORY_TR[c.key] ?? c.label, items: EXPLORE_CATALOG.filter((s) => s.category === c.key) })).filter((g) => g.items.length)
  const body = `
<h1>Abonelik fiyatları ${YEAR}</h1>
<p class="lede">${EXPLORE_CATALOG.length} servisin güncel Türkiye ve ABD liste fiyatları. Bir servise dokun, tüm planlarını gör.</p>
${groups.map((g) => `<h2>${esc(g.title)}</h2><div class="group">${g.items.map(linkRow).join('')}</div>`).join('')}`
  return layout(`Abonelik fiyatları ${YEAR}: Netflix, Spotify, YouTube ve daha fazlası | SubSense`, `${EXPLORE_CATALOG.length} abonelik servisinin ${YEAR} güncel Türkiye fiyatları: Netflix, Spotify, YouTube Premium, Disney+ ve diğerleri.`, `${SITE}/fiyatlar`, body)
}

if (!fs.existsSync(DIST)) throw new Error('dist/ yok: önce vite build çalışmalı')
fs.mkdirSync(OUT, { recursive: true })
const slugs = new Set<string>()
for (const svc of EXPLORE_CATALOG) {
  const slug = slugify(svc.name)
  if (slugs.has(slug)) throw new Error(`Aynı adres iki servise düşüyor: ${slug}`)
  slugs.add(slug)
  fs.writeFileSync(path.join(OUT, `${slug}.html`), servicePage(svc))
}
fs.writeFileSync(path.join(OUT, 'index.html'), hubPage())
const urls = [`${SITE}/`, `${SITE}/fiyatlar`, ...[...slugs].map((s) => `${SITE}/fiyatlar/${s}`)]
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`)
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`fiyat sayfaları: ${slugs.size} servis + hub, sitemap ${urls.length} adres`)
