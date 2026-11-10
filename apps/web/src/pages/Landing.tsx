import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { buildSeed } from '../core/data/seed'
import { EXPLORE_CATALOG, effectivePricing } from '../core/data/explore'
import { computeTotals } from '../core/lib/derive'
import { formatMoney } from '../core/lib/format'
import { useApp } from '../core/store/app'
import { useMoney } from '../core/lib/useMoney'
import { useI } from '../ui/strings'
import { Glyph, Ornament, go, useOverlay } from '../ui/kit'
import { OverviewBoard } from './Overview'

const COPY = {
  tr: {
    eyebrow: 'Ücretsiz, reklamsız, hesap gerekmez', title: ['Her abonelik.', 'Tek bakışta.'],
    sub: 'Ne ödediğini, ne zaman yenilendiğini ve hangi fiyatın arttığını gösterir. Hep ücretsiz.',
    start: 'Ücretsiz başla', try: 'Hesapsız dene',
    thisMonth: 'Bu ay',
    radarEyebrow: 'Güncel fiyatlar', radarTitle: 'Zamları ilk sen gör.',
    radarText: 'Türkiye ve ABD fiyatları güncel tutulur. Kayıtlı fiyatın eskidiyse SubSense söyler.',
    radarNote: 'Türkiye, aylık liste fiyatları.',
    bentoTitle: 'Az şey yapar. Hepsini iyi yapar.',
    bento: [
      ['₺0', 'Sonsuza kadar ücretsiz. Premium sürüm, reklam, gizli ücret yok.'],
      ['{n}', 'servisin Türkiye ve ABD fiyatı, plan plan.'],
      ['3 gün', 'önce hatırlatma. Unutulan deneme faturaya dönüşmez.'],
      ['Tek hesap', 'Web, Mac ve Android aynı listeyi görür.'],
      ['Çevrimdışı', 'İnternet yokken de çalışır, gelince eşitlenir.'],
      ['Verin senin', 'JSON ve CSV olarak dışa aktar, tek tıkla sil.'],
    ],
    railTitle: 'Türkiye’nin abonelikleri. Tek listede.',
    finalTitle: 'Ücretsiz. Gerçekten.', finalText: 'Hesap açmadan dene. Beğenirsen tüm cihazlarında eşitle.',
  },
  en: {
    eyebrow: 'Free, ad-free, no account needed', title: ['Every subscription.', 'At a glance.'],
    sub: 'See what you pay, when it renews and which price went up. Free, for good.',
    start: 'Start for free', try: 'Try without an account',
    thisMonth: 'This month',
    radarEyebrow: 'Current prices', radarTitle: 'Catch price hikes first.',
    radarText: 'Prices for Turkey and the US are kept current. If your saved price is out of date, SubSense tells you.',
    radarNote: 'Turkey, monthly list prices.',
    bentoTitle: 'Does a few things. Does them well.',
    bento: [
      ['$0', 'Free forever. No premium tier, no ads, no hidden fees.'],
      ['{n}', 'services with Turkey and US prices, plan by plan.'],
      ['3 days', 'heads-up before renewals. Forgotten trials never turn into charges.'],
      ['One account', 'Web, Mac and Android see the same list.'],
      ['Offline', 'Works without internet and syncs when you are back.'],
      ['Your data', 'Export JSON or CSV, delete with one click.'],
    ],
    railTitle: 'Every service you pay for. One list.',
    finalTitle: 'Free. Really.', finalText: 'Try it without an account. Sync across your devices when you like it.',
  },
}

const RADAR = ['Netflix', 'Spotify', 'YouTube Premium', 'Disney+', 'Exxen']

export function Landing() {
  const { lang } = useI()
  const c = COPY[lang]
  const { base, rates, fmt } = useMoney()
  const completeOnboarding = useApp((s) => s.completeOnboarding)
  const show = useOverlay((s) => s.show)
  const sample = useMemo(() => buildSeed(), [])
  const total = computeTotals(sample, base, rates).monthly
  const tryIt = () => (completeOnboarding(), go('overview'))

  const radar = RADAR.map((name) => EXPLORE_CATALOG.find((s) => s.name === name))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ name: s.name, tiers: effectivePricing(s).regions.TR?.tiers ?? [] }))
    .filter((s) => s.tiers.length)

  return (
    <div className="overflow-x-clip">
      <section className="rise mx-auto max-w-[980px] px-5 pt-36 text-center sm:pt-44">
        <p className="inline-flex items-center gap-2 text-[13.5px] text-label-3"><span className="live-dot on" />{c.eyebrow}</p>
        <h1 className="t-hero mt-5 text-label">{c.title[0]}<br />{c.title[1]}</h1>
        <p className="t-subhead mx-auto mt-6 max-w-[30em]">{c.sub}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a href="#/auth" className="btn btn-ink">{c.start}</a>
          <button type="button" onClick={tryIt} className="btn btn-line">{c.try}<ChevronRight size={17} strokeWidth={2.2} /></button>
        </div>
      </section>

      {/* Product shot: the real dashboard inside a Mac window */}
      <section className="mx-auto mt-16 max-w-[1120px] px-4 sm:mt-20 sm:px-6" aria-hidden>
        <div className="overflow-hidden rounded-[18px] bg-bg-2 shadow-[0_40px_120px_-40px_rgba(47,46,190,.45),0_0_0_.5px_var(--sep)]">
          <div className="flex h-11 items-center gap-2 border-b border-sep bg-cell/80 px-4">
            <span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#febc2e]" /><span className="size-3 rounded-full bg-[#28c840]" />
            <span className="mx-auto pr-12 text-[13px] font-medium text-label-2">SubSense</span>
          </div>
          <div className="pointer-events-none select-none px-4 pb-6 pt-8 sm:px-8">
            <p className="text-center text-[15px] font-semibold text-tint">{c.thisMonth}</p>
            <p className="figure text-center text-[clamp(44px,7vw,76px)] leading-none text-label">{fmt(total)}</p>
            <div className="mt-8"><OverviewBoard subs={sample} preview /></div>
          </div>
        </div>
      </section>

      <section className="mt-32 bg-night py-28 text-center sm:py-36" data-theme="dark">
        <div className="mx-auto max-w-[980px] px-5">
          <p className="t-eyebrow" style={{ color: '#a9aaff' }}>{c.radarEyebrow}</p>
          <h2 className="t-display grad-text mx-auto mt-3 max-w-[14em] pb-1">{c.radarTitle}</h2>
          <p className="t-subhead mx-auto mt-5 max-w-[30em]" style={{ color: '#a1a1b3' }}>{c.radarText}</p>
          <div className="mx-auto mt-14 max-w-[640px] overflow-hidden rounded-[22px] bg-night-2 text-left ring-1 ring-white/[0.07]">
            {radar.map((s, i) => (
              <button key={s.name} type="button" onClick={() => show({ kind: 'service', name: s.name })} className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] ${i ? 'border-t border-white/[0.07]' : ''}`}>
                <Glyph name={s.name} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium text-[#ecebf2]">{s.name}</span>
                  <span className="block truncate text-[13.5px] text-[#8f8ea0]">{s.tiers.map((x) => x.nameLocalized ?? x.name).join(', ')}</span>
                </span>
                <span className="num text-[17px] font-semibold text-[#ecebf2]">{formatMoney(Math.min(...s.tiers.map((x) => x.price)), 'TRY')}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-[#7f7e8f]">{c.radarNote}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1040px] px-4 py-28 sm:px-6 sm:py-36">
        <Ornament />
        <h2 className="t-section mx-auto mt-5 max-w-[16em] text-center text-label">{c.bentoTitle}</h2>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.bento.map(([big, small], i) => (
            <div key={i} className={`card flex min-h-[220px] flex-col justify-end p-7 ${i === 0 ? '!bg-tint text-on-tint' : ''}`}>
              <p className={`figure text-[clamp(40px,5vw,56px)] leading-none ${i === 0 ? '' : 'text-label'}`}>{big.replace('{n}', String(EXPLORE_CATALOG.length))}</p>
              <p className={`mt-3 text-[17px] leading-snug ${i === 0 ? 'opacity-85' : 'text-label-2'}`}>{small}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-8 text-center">
        <Ornament />
        <h2 className="t-section mx-auto mt-5 max-w-[15em] px-5 text-label">{c.railTitle}</h2>
        <div className="no-scrollbar mt-14 flex snap-x gap-4 overflow-x-auto px-[max(20px,calc(50vw-520px))] pb-6">
          {EXPLORE_CATALOG.map((s) => (
            <button key={s.name} type="button" onClick={() => show({ kind: 'service', name: s.name })} className="flex w-[92px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-[18px] py-1 transition-transform active:scale-95" aria-label={s.name}>
              <Glyph name={s.name} size={72} color={s.accent} />
              <span className="w-full truncate text-[12.5px] text-label-2">{s.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[980px] px-5 py-28 text-center sm:py-36">
        <Ornament />
        <h2 className="t-display mt-5 text-label">{c.finalTitle}</h2>
        <p className="t-subhead mx-auto mt-5 max-w-[28em]">{c.finalText}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a href="#/auth" className="btn btn-ink">{c.start}</a>
          <button type="button" onClick={tryIt} className="btn btn-line">{c.try}<ChevronRight size={17} strokeWidth={2.2} /></button>
        </div>
      </section>
    </div>
  )
}
