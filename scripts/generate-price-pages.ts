/**
 * Programmatic SEO — static price pages from SUBSCRIPTION_CATALOG.
 *
 * Generates one crawlable, self-contained HTML page per service under
 * dist/fiyatlar/{slug}.html (served by Vercel at /fiyatlar/{slug}), plus a hub
 * page, sitemap.xml and robots.txt. These are NOT the SPA — they are static
 * HTML with full meta + JSON-LD so Google indexes them, targeting high-volume
 * Turkish searches like "Netflix fiyat 2026".
 *
 * Runs in the build step (after `vite build`), output goes straight to dist/.
 */
import fs from 'fs';
import path from 'path';
import { SUBSCRIPTION_CATALOG, SUBSCRIPTION_CATEGORIES, CURRENCIES, type SubscriptionDetail, type PlanTier } from '../utils/data';
import { getBrandLogo } from '../utils/logoUtils';

// Turkish, SEO-friendly category titles keyed by the catalog's English names.
const CATEGORY_TR: Record<string, { title: string; slug: string }> = {
  'Entertainment & Streaming': { title: 'Dizi & Film', slug: 'dizi-film' },
  'Music & Audio': { title: 'Müzik', slug: 'muzik' },
  'Gaming': { title: 'Oyun', slug: 'oyun' },
  'Design & Creativity': { title: 'Tasarım & Yaratıcılık', slug: 'tasarim' },
  'AI & Dev Tools': { title: 'Yapay Zeka & Geliştirici', slug: 'yapay-zeka' },
  'Business & SaaS': { title: 'İş & SaaS', slug: 'is-saas' },
  'Shopping & Local': { title: 'Alışveriş', slug: 'alisveris' },
};

const SITE = 'https://sub-sense-ashy.vercel.app';
const DIST = path.resolve('dist');
const OUT = path.join(DIST, 'fiyatlar');

const slugify = (s: string) =>
  s.toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const sym = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tierName = (t: PlanTier) => t.nameLocalized || t.name;

const tierRows = (tiers: PlanTier[], currency: string) =>
  tiers
    .map(
      (t) => `<tr><td>${esc(tierName(t))}</td><td class="price">${sym(currency)}${t.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td><td>${t.cycle === 'Monthly' ? 'Aylık' : 'Yıllık'}</td></tr>`
    )
    .join('');

function pageHtml(svc: SubscriptionDetail, related: { slug: string; name: string }[]): string {
  const tr = svc.regions?.TR;
  const us = svc.regions?.US;
  const logo = getBrandLogo(svc.name);
  const desc1 = svc.description?.split('\n')[0] || `${svc.name} güncel Türkiye fiyatları, planları ve abonelik ücretleri.`;
  const metaDesc = `${svc.name} Türkiye fiyatları 2026: güncel aylık planlar ve ücretler. ${tr?.tiers?.[0] ? `${tierName(tr.tiers[0])} ${sym(tr.currency)}${tr.tiers[0].price}.` : ''} SubSense ile tüm aboneliklerini tek yerden takip et.`;
  const slug = slugify(svc.name);
  const url = `${SITE}/fiyatlar/${slug}`;

  const offers = (tr?.tiers || us?.tiers || []).map((t) => ({
    '@type': 'Offer',
    name: tierName(t),
    price: t.price,
    priceCurrency: tr ? tr.currency : us?.currency || 'USD',
  }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${svc.name} Aboneliği`,
    description: metaDesc,
    brand: { '@type': 'Brand', name: svc.name },
    offers,
  };

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(svc.name)} Türkiye Fiyatları 2026 — Güncel Planlar | SubSense</title>
<meta name="description" content="${esc(metaDesc)}"/>
<link rel="canonical" href="${url}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(svc.name)} Türkiye Fiyatları 2026"/>
<meta property="og:description" content="${esc(metaDesc)}"/>
<meta property="og:url" content="${url}"/>
<link rel="icon" href="/icon-192.png"/>
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
:root{--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#64748b;--border:#e2e8f0;--brand:#6366f1}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
.wrap{max-width:760px;margin:0 auto;padding:24px 20px 64px}
a{color:var(--brand);text-decoration:none}
.top{display:flex;align-items:center;gap:8px;font-weight:800;font-size:18px;margin-bottom:32px}
.hero{display:flex;align-items:center;gap:18px;margin-bottom:8px}
.logo{width:64px;height:64px;border-radius:16px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;padding:10px;flex-shrink:0}
.logo img{max-width:100%;max-height:100%}
h1{font-size:30px;margin:0;letter-spacing:-.02em}
.facts{color:var(--muted);font-size:13px;margin:6px 0 24px;display:flex;flex-wrap:wrap;gap:14px}
.lead{color:#334155;margin:0 0 28px}
h2{font-size:20px;margin:32px 0 12px;letter-spacing:-.01em}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
th,td{text-align:left;padding:12px 16px;border-bottom:1px solid var(--border);font-size:14px}
th{background:#f1f5f9;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
tr:last-child td{border-bottom:0}
td.price{font-weight:800;font-variant-numeric:tabular-nums}
.cta{display:block;margin:36px 0;background:var(--brand);color:#fff;text-align:center;padding:16px;border-radius:14px;font-weight:800;font-size:16px}
.cta span{opacity:.85;font-weight:500;font-size:13px;display:block}
.about{color:#475569;font-size:15px}
.related{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.related a{background:var(--card);border:1px solid var(--border);padding:6px 12px;border-radius:999px;font-size:13px;color:var(--text)}
footer{margin-top:48px;padding-top:20px;border-top:1px solid var(--border);color:var(--muted);font-size:12px;text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <a class="top" href="/">🪙 SubSense</a>
  <div class="hero">
    ${logo ? `<div class="logo"><img src="${logo}" alt="${esc(svc.name)} logo" loading="lazy"/></div>` : ''}
    <div><h1>${esc(svc.name)} Fiyatları</h1></div>
  </div>
  <div class="facts">
    ${svc.foundedYear ? `<span>📅 ${esc(svc.foundedYear.split(' ')[0])}</span>` : ''}
    ${svc.headquarters ? `<span>📍 ${esc(svc.headquarters.split(',')[0])}</span>` : ''}
    ${svc.globalUserCount ? `<span>🌍 ${esc(svc.globalUserCount)}</span>` : ''}
  </div>
  <p class="lead">${esc(desc1)}</p>

  ${tr?.tiers?.length ? `<h2>🇹🇷 Türkiye Planları (2026)</h2>
  <table><thead><tr><th>Plan</th><th>Fiyat</th><th>Dönem</th></tr></thead><tbody>${tierRows(tr.tiers, tr.currency)}</tbody></table>` : ''}

  ${us?.tiers?.length && tr ? `<h2>🌐 Global (ABD) Fiyatları</h2>
  <table><thead><tr><th>Plan</th><th>Fiyat</th><th>Dönem</th></tr></thead><tbody>${tierRows(us.tiers, us.currency)}</tbody></table>` : ''}

  <a class="cta" href="/">${esc(svc.name)} ve tüm aboneliklerini takip et<span>Ücretsiz · ne kadar harcadığını anında gör</span></a>

  ${svc.description ? `<h2>${esc(svc.name)} hakkında</h2><p class="about">${esc(svc.description.split('\n').slice(0, 2).join(' '))}</p>` : ''}

  <h2>Diğer abonelik fiyatları</h2>
  <div class="related">${related.map((r) => `<a href="/fiyatlar/${r.slug}">${esc(r.name)}</a>`).join('')}</div>

  <footer>Fiyatlar güncel verilere dayanır, değişebilir. © SubSense — abonelik & harcama takip uygulaması.</footer>
</div>
</body>
</html>`;
}

// Lowest monthly TR (or US) tier price for a service, formatted — for category tables.
function startingPrice(svc: SubscriptionDetail): string {
  const r = svc.regions?.TR || svc.regions?.US;
  if (!r?.tiers?.length) return '—';
  const monthly = r.tiers.filter((t) => t.cycle === 'Monthly');
  const pool = monthly.length ? monthly : r.tiers;
  const min = pool.reduce((m, t) => (t.price < m.price ? t : m), pool[0]);
  return `${sym(r.currency)}${min.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
}

function categoryHtml(title: string, services: SubscriptionDetail[]): string {
  const rows = services
    .map((s) => `<tr><td><a href="/fiyatlar/${slugify(s.name)}">${esc(s.name)}</a></td><td class="price">${startingPrice(s)}<span class="mo">/ay’dan</span></td></tr>`)
    .join('');
  return `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>En İyi ${esc(title)} Abonelikleri ve Fiyatları (Türkiye 2026) | SubSense</title>
<meta name="description" content="${esc(title)} kategorisindeki ${services.length}+ aboneliğin güncel Türkiye fiyatları. Karşılaştır, en uygununu seç, SubSense ile takip et."/>
<link rel="canonical" href="${SITE}/fiyatlar/kategori/${esc(CATEGORY_TR_BY_TITLE[title])}"/>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8fafc;color:#0f172a;max-width:760px;margin:0 auto;padding:24px 20px 64px;line-height:1.6}a{color:#6366f1;text-decoration:none}.top{font-weight:800;font-size:18px}h1{letter-spacing:-.02em}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-top:18px}td{padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:15px}td:first-child{font-weight:600}td.price{text-align:right;font-weight:800;font-variant-numeric:tabular-nums}.mo{font-weight:400;color:#94a3b8;font-size:12px;margin-left:4px}tr:last-child td{border-bottom:0}.cta{display:block;margin:32px 0;background:#6366f1;color:#fff;text-align:center;padding:16px;border-radius:14px;font-weight:800}</style>
</head><body>
<a class="top" href="/">🪙 SubSense</a>
<h1>En İyi ${esc(title)} Abonelikleri (2026)</h1>
<p>${esc(title)} kategorisindeki popüler aboneliklerin güncel Türkiye fiyatları. Birine tıkla, tüm planları gör.</p>
<table><tbody>${rows}</tbody></table>
<a class="cta" href="/">Bu aboneliklerin hepsini tek yerden takip et — ücretsiz</a>
<p><a href="/fiyatlar">← Tüm abonelik fiyatları</a></p>
</body></html>`;
}

// ---- run ----
const entries = Object.values(SUBSCRIPTION_CATALOG).filter((s) => s.regions?.TR || s.regions?.US);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'kategori'), { recursive: true });

const byName: Record<string, SubscriptionDetail> = {};
entries.forEach((s) => { byName[s.name.toLowerCase()] = s; });
const CATEGORY_TR_BY_TITLE: Record<string, string> = Object.fromEntries(
  Object.values(CATEGORY_TR).map((c) => [c.title, c.slug])
);

const all = entries.map((s) => ({ slug: slugify(s.name), name: s.name }));
const urls: string[] = [`${SITE}/fiyatlar`];

for (const svc of entries) {
  const slug = slugify(svc.name);
  const related = all.filter((r) => r.slug !== slug).sort(() => Math.random() - 0.5).slice(0, 12);
  fs.writeFileSync(path.join(OUT, `${slug}.html`), pageHtml(svc, related));
  urls.push(`${SITE}/fiyatlar/${slug}`);
}

// Category hub pages
const categoryLinks: { slug: string; title: string }[] = [];
for (const cat of SUBSCRIPTION_CATEGORIES) {
  const meta = CATEGORY_TR[cat.name];
  if (!meta) continue;
  const services = (cat.examples as string[]).map((n) => byName[n.toLowerCase()]).filter(Boolean) as SubscriptionDetail[];
  if (services.length === 0) continue;
  fs.writeFileSync(path.join(OUT, 'kategori', `${meta.slug}.html`), categoryHtml(meta.title, services));
  urls.push(`${SITE}/fiyatlar/kategori/${meta.slug}`);
  categoryLinks.push({ slug: meta.slug, title: meta.title });
}

// Hub page
const hub = `<!doctype html><html lang="tr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Abonelik Fiyatları 2026 — Türkiye Güncel Liste | SubSense</title>
<meta name="description" content="Netflix, Spotify, Disney+, PlayStation Plus ve ${all.length}+ servisin güncel Türkiye abonelik fiyatları. SubSense ile hepsini takip et."/>
<link rel="canonical" href="${SITE}/fiyatlar"/>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8fafc;color:#0f172a;max-width:760px;margin:0 auto;padding:24px 20px 64px;line-height:1.6}a{color:#6366f1;text-decoration:none}.top{font-weight:800;font-size:18px}h1{letter-spacing:-.02em}.grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.grid a{background:#fff;border:1px solid #e2e8f0;padding:10px 14px;border-radius:12px;font-size:14px;font-weight:600;color:#0f172a}</style>
</head><body>
<a class="top" href="/">🪙 SubSense</a>
<h1>Abonelik Fiyatları (Türkiye, 2026)</h1>
<p>${all.length}+ servisin güncel aylık abonelik fiyatları. Birine tıkla, planları gör — sonra <a href="/">SubSense</a> ile hepsini tek yerden takip et.</p>
<h2 style="font-size:16px;margin-top:24px">Kategoriler</h2>
<div class="grid">${categoryLinks.map((c) => `<a href="/fiyatlar/kategori/${c.slug}">${esc(c.title)}</a>`).join('')}</div>
<h2 style="font-size:16px;margin-top:24px">Tüm servisler</h2>
<div class="grid">${all.sort((a, b) => a.name.localeCompare(b.name)).map((r) => `<a href="/fiyatlar/${r.slug}">${esc(r.name)}</a>`).join('')}</div>
</body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), hub);

// Sitemap + robots
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[SITE, ...urls].map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`✓ Generated ${entries.length} price pages + ${categoryLinks.length} category hubs + hub + sitemap (${urls.length} urls)`);
