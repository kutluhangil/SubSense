import { useMemo, useRef } from 'react'
import { buildSeed } from '../core/data/seed'
import { EXPLORE_CATALOG, effectivePricing, exploreStartPrice } from '../core/data/explore'
import { logoFor } from '../core/lib/logos'
import { computeTotals } from '../core/lib/derive'
import { formatMoney } from '../core/lib/format'
import { useApp } from '../core/store/app'
import { useMoney } from '../core/lib/useMoney'
import { useI } from '../ui/strings'
import { Glyph, Ornament, go, useOverlay } from '../ui/kit'
import { DuotoneRoster, type RosterMember } from '../ui/duotone-roster'
import { GlowCard } from '../ui/spotlight-card'
import { AuthForm } from './Auth'
import { OverviewBoard } from './Overview'

const COPY = {
  tr: {
    eyebrow: 'Tek bakışta', title: 'Her\nabonelik',
    sub: 'Ne ödediğini, ne zaman yenilendiğini ve hangi fiyatın arttığını gösterir. Hep ücretsiz.',
    start: 'Giriş yap', try: 'Hesapsız dene', perMonth: '/ay', free: 'Ücretsiz',
    wall: { pause: 'Durdur', play: 'Oynat', team: 'Servisler', openRole: 'Kendi aboneliğin', hiring: 'Ekle', roleLink: 'Ücretsiz başla', memberLink: 'Aç' },
    yours: 'Seninki eksik mi?', yoursNote: 'Listede olmayan her aboneliği kendin ekleyebilirsin.',
    loginEyebrow: 'Giriş', loginTitle: 'Tek hesap. Her cihazda aynı liste.',
    loginPoints: ['Google, Apple ya da e-posta ile giriş', 'Web, Mac ve Android arasında anında eşitleme', 'Hesap açmak istemezsen hesapsız da çalışır'],
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
    loginText: 'Hesap açmadan dene. Beğenirsen tüm cihazlarında eşitle.',
  },
  en: {
    eyebrow: 'At a glance', title: 'Every\nsub',
    sub: 'See what you pay, when it renews and which price went up. Free, for good.',
    start: 'Sign in', try: 'Try without an account', perMonth: '/mo', free: 'Free',
    wall: { pause: 'Pause', play: 'Play', team: 'Services', openRole: 'Your own subscription', hiring: 'Add', roleLink: 'Start for free', memberLink: 'Open' },
    yours: 'Missing yours?', yoursNote: 'Anything that is not listed can be added by hand.',
    loginEyebrow: 'Sign in', loginTitle: 'One account. The same list everywhere.',
    loginPoints: ['Sign in with Google, Apple or email', 'Instant sync across web, Mac and Android', 'Works without an account too'],
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
    loginText: 'Try it without an account. Sync across your devices when you like it.',
  },
}

// The brand's night and indigo, as the roster's burning field.
const PALETTE = { ground: '#0d0e12', deep: '#1b1c6b', hot: '#494bd6', glow: '#a9aaff', ink: '#f3f1ff', shadow: '#0a0b26', highlight: '#e6e5ff' }

const RADAR = ['Netflix', 'Spotify', 'YouTube Premium', 'Disney+', 'Exxen']

export function Landing() {
  const { lang } = useI()
  const c = COPY[lang]
  const { base, rates, fmt } = useMoney()
  const completeOnboarding = useApp((s) => s.completeOnboarding)
  const show = useOverlay((s) => s.show)
  const login = useRef<HTMLElement>(null)
  const sample = useMemo(() => buildSeed(), [])
  const total = computeTotals(sample, base, rates).monthly

  const radar = RADAR.map((name) => EXPLORE_CATALOG.find((s) => s.name === name))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ name: s.name, tiers: effectivePricing(s).regions.TR?.tiers ?? [] }))
    .filter((s) => s.tiers.length)

  // One tile per service with a bundled logo; plans and the starting price show in the unfolded card.
  const members = EXPLORE_CATALOG.flatMap((s): RosterMember[] => {
    const logo = logoFor(s.name)
    if (!logo) return []
    const { regions } = effectivePricing(s)
    const tiers = (base === 'TRY' ? regions.TR : regions.US)?.tiers ?? regions.TR?.tiers ?? regions.US?.tiers ?? []
    const from = exploreStartPrice(s, base)
    return [{ name: s.name, role: from.amount ? fmt(from.amount, from.currency) + c.perMonth : c.free, bio: tiers.slice(0, 3).map((x) => x.nameLocalized ?? x.name).join(' · '), photo: logo.url, tile: logo.dark ? '#111111' : '#ffffff' }]
  })

  return (
    <div className="overflow-x-clip bg-bg text-label" data-theme="dark">
      <DuotoneRoster
        members={members}
        openRoles={[{ title: c.yours, note: c.yoursNote, href: '#/auth' }]}
        eyebrow={c.eyebrow}
        title={c.title}
        intro={c.sub}
        cta={{ label: c.start, href: '#/auth', onClick: (e) => (e.preventDefault(), login.current?.scrollIntoView({ behavior: 'smooth' })) }}
        secondaryCta={{ label: c.try, href: '#/overview', onClick: (e) => (e.preventDefault(), completeOnboarding(), go('overview')) }}
        palette={PALETTE}
        labels={c.wall}
        onMemberSelect={(m) => show({ kind: 'service', name: m.name })}
      />

      {/* Sign in, right under the hero */}
      <section ref={login} className="mx-auto grid max-w-[1120px] scroll-mt-20 items-center gap-12 px-5 py-24 sm:py-32 lg:grid-cols-[1fr_minmax(0,460px)]">
        <div>
          <p className="t-eyebrow">{c.loginEyebrow}</p>
          <h2 className="t-display grad-text mt-3 max-w-[12em] pb-1">{c.loginTitle}</h2>
          <p className="t-subhead mt-5 max-w-[28em]">{c.loginText}</p>
          <ul className="mt-8 space-y-3 text-[16px] text-label-2">
            {c.loginPoints.map((p) => <li key={p} className="flex items-center gap-3"><span className="live-dot shrink-0" />{p}</li>)}
          </ul>
        </div>
        <GlowCard glowColor="purple" className="p-6 sm:p-9"><AuthForm /></GlowCard>
      </section>

      {/* Product shot: the real dashboard inside a Mac window */}
      <section className="mx-auto max-w-[1120px] px-4 sm:px-6" aria-hidden>
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

      <section className="mx-auto max-w-[1040px] px-4 pt-28 sm:px-6 sm:pt-36">
        <Ornament />
        <h2 className="t-section mx-auto mt-5 max-w-[16em] text-center text-label">{c.bentoTitle}</h2>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.bento.map(([big, small], i) => (
            <GlowCard key={i} glowColor={i % 2 ? 'blue' : 'purple'} className="flex min-h-[220px] flex-col justify-end p-7">
              <p className="figure relative text-[clamp(40px,5vw,56px)] leading-none text-label">{big.replace('{n}', String(EXPLORE_CATALOG.length))}</p>
              <p className="relative mt-3 text-[17px] leading-snug text-label-2">{small}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="py-28 text-center sm:py-36">
        <div className="mx-auto max-w-[980px] px-5">
          <svg className="mx-auto mb-7" width="96" height="96" viewBox="-48 -48 96 96" aria-hidden>
            {[[18, 9, 2.6], [30, 15, 2.2], [42, 24, 1.8]].map(([r, dur, dot], i) => (
              <g key={r} className="orbit-turn" style={{ animationDuration: `${dur}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
                <circle r={r} fill="none" stroke="rgba(192,193,255,.3)" strokeWidth="1" strokeDasharray={i === 1 ? '1.5 4' : undefined} />
                <circle cx={r} r={dot} fill="#c0c1ff" />
              </g>
            ))}
            <circle r="4" fill="#8083ff" />
            <circle r="4" fill="none" stroke="#8083ff" strokeWidth="1" className="orbit-beat" />
          </svg>
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
    </div>
  )
}
