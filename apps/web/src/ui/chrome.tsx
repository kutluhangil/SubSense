import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Compass, Home, LayoutGrid, Moon, PieChart, Plus, Search, Settings, Sun } from 'lucide-react'
import { useApp } from '../core/store/app'
import { useCloud } from '../core/lib/cloud'
import { useRates } from '../core/store/rates'
import { isDesktop } from '../core/lib/native'
import { EXPLORE_CATALOG } from '../core/data/explore'
import { useI } from './strings'
import { Glyph, Mark, go, useIsDark, useOverlay, type Page } from './kit'
import { LiquidNavbar, type NimbusFx } from './liquid-navbar'

export const APP_NAV: { page: Page; key: string; icon: typeof Home; fx: NimbusFx }[] = [
  { page: 'overview', key: 'nav.overview', icon: Home, fx: 'glow' },
  { page: 'subs', key: 'nav.subs', icon: LayoutGrid, fx: 'pop' },
  { page: 'calendar', key: 'nav.calendar', icon: CalendarDays, fx: 'drop' },
  { page: 'insights', key: 'nav.insights', icon: PieChart, fx: 'spin' },
  { page: 'discover', key: 'nav.discover', icon: Compass, fx: 'wave' },
]

/** The water pill menu, shared by the top bar and the mobile tab bar. */
function WaterNav({ page, items, compact }: { page: Page; items: typeof APP_NAV; compact?: boolean }) {
  const { t } = useI()
  const dark = useIsDark()
  return (
    <LiquidNavbar tone={dark ? 'dark' : 'light'} compact={compact} active={items.findIndex((n) => n.page === page)}
      items={items.map((n) => ({ label: t(n.key), href: `#/${n.page}`, icon: <n.icon size={18} strokeWidth={1.8} />, fx: n.fx }))} />
  )
}

const iconBtn = 'grid size-9 place-items-center rounded-full text-label-2 transition-colors hover:bg-[color-mix(in_srgb,var(--label)_7%,transparent)] hover:text-label'

function LiveChip() {
  const { t } = useI()
  const { uid, status } = useCloud()
  const label = !uid ? t('sync.local') : t(`sync.${status === 'idle' ? 'working' : status}`)
  const color = !uid ? 'var(--label-3)' : status === 'error' ? 'var(--red)' : status === 'offline' ? 'var(--orange)' : 'var(--green)'
  return (
    <span className="mr-1 hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] text-label-2 shadow-[inset_0_0_0_1px_var(--sep)] xl:inline-flex">
      <span className={`live-dot ${uid && status === 'synced' ? 'on' : ''}`} style={{ background: color }} />
      {label}
    </span>
  )
}

/** Neural-Vault layout: logo left, segmented glass pill centered, live chip and tools right. */
export function TopBar({ page, inApp }: { page: Page; inApp: boolean }) {
  const { t, lang } = useI()
  const setSetting = useApp((s) => s.setSetting)
  const dark = useIsDark()
  const show = useOverlay((s) => s.show)
  // The landing page is always dark, whatever the theme.
  const landing = page === 'home'

  return (
    <>
      <div className="scroll-edge" aria-hidden />
      <header className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]" data-theme={landing ? 'dark' : undefined} data-tauri-drag-region>
        <div data-tauri-drag-region className={`mx-auto grid h-[68px] max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 ${isDesktop ? 'pl-[84px] sm:pl-[84px]' : ''}`}>
          {landing ? <span /> : (
            <a href={inApp ? '#/overview' : '#/'} className="flex items-center gap-2.5 justify-self-start" aria-label="SubSense">
              <Mark size={28} />
              <span className="serif text-[21px] text-label">SubSense</span>
            </a>
          )}

          {inApp ? (
            <div className="hidden md:block"><WaterNav page={page} items={APP_NAV} /></div>
          ) : <span />}

          <div className={`flex items-center justify-self-end ${landing ? 'glass rounded-full p-1' : ''}`}>
            {inApp && <LiveChip />}
            {inApp && <button type="button" onClick={() => show({ kind: 'palette' })} className={iconBtn} aria-label={`${t('top.search')} (⌘K)`}><Search size={17} strokeWidth={2} /></button>}
            <button type="button" onClick={() => setSetting('language', lang === 'tr' ? 'en' : 'tr')} className={`${iconBtn} w-auto px-2.5 text-[13px] font-semibold`} aria-label={t('top.lang')}>{lang === 'tr' ? 'EN' : 'TR'}</button>
            {!landing && <button type="button" onClick={() => setSetting('appearance', dark ? 'light' : 'dark')} className={iconBtn} aria-label={t('top.theme')}>
              {dark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>}
            {inApp ? (
              <a href="#/settings" aria-label={t('nav.settings')} aria-current={page === 'settings' ? 'page' : undefined} className={`${iconBtn} ${page === 'settings' ? 'text-label' : ''}`}><Settings size={17} strokeWidth={2} /></a>
            ) : (
              <a href="#/auth" className="btn btn-line ml-1 min-h-[38px] px-4 text-[14.5px]">{t('top.signIn')}</a>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

/** Mobile: floating water pill with the add button beside it. */
export function MobileNav({ page }: { page: Page }) {
  const { t } = useI()
  const show = useOverlay((s) => s.show)
  return (
    <div className="fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-40 flex items-center justify-center gap-2.5 px-4 md:hidden">
      <WaterNav page={page} items={APP_NAV.slice(0, 4)} compact />
      <button type="button" onClick={() => show({ kind: 'editor' })} className="grid size-[54px] place-items-center rounded-full bg-tint text-on-tint shadow-[var(--lift)]" aria-label={t('ov.add')}>
        <Plus size={22} strokeWidth={2.4} />
      </button>
    </div>
  )
}

/** Always-dark closing band: brand + live status, link columns, a full-width wordmark. */
export function Footer() {
  const { t, lang } = useI()
  const { uid, status } = useCloud()
  const ratesAt = useRates((s) => s.updatedAt)
  const setSetting = useApp((s) => s.setSetting)
  const L = lang === 'tr'
  const cols = [
    { title: L ? 'Uygulama' : 'App', links: APP_NAV.map((n) => ({ label: t(n.key), href: `#/${n.page}` })) },
    {
      title: L ? 'Platformlar' : 'Platforms',
      links: [
        { label: 'Web', href: '#/' },
        { label: L ? 'Mac (App Store, yakında)' : 'Mac (App Store, soon)', href: '#/' },
        { label: 'Android (Google Play)', href: 'https://play.google.com/store/apps/details?id=com.subsense.apps', ext: true },
      ],
    },
    {
      title: L ? 'Destek' : 'Support',
      links: [
        { label: L ? 'Güncel fiyatlar' : 'Current prices (Turkish)', href: 'https://sub-sense-ashy.vercel.app/fiyatlar', ext: true },
        { label: t('foot.privacy'), href: '#/privacy' },
        { label: t('foot.deletion'), href: '#/deletion' },
        { label: L ? 'İletişim' : 'Contact', href: 'mailto:kutluhangil@gmail.com', ext: true },
      ],
    },
  ]
  const syncText = !uid ? t('sync.local') : t(`sync.${status === 'idle' ? 'working' : status}`)
  const ratesText = ratesAt ? new Intl.DateTimeFormat(L ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(ratesAt) : '—'
  const facts = [[L ? 'Eşitleme' : 'Sync', syncText], [L ? 'Kurlar' : 'Rates', ratesText], [L ? 'Katalog' : 'Catalog', `${EXPLORE_CATALOG.length} ${L ? 'servis' : 'services'}`], [L ? 'Sürüm' : 'Version', __APP_VERSION__]]

  return (
    <footer className="mt-32 overflow-hidden bg-night text-[#b4b2c3] [[data-theme=dark]_&]:border-t [[data-theme=dark]_&]:border-white/[0.06] [[data-theme=dark]_&]:bg-[#08090c]">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-6 pb-8 pt-16 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <a href="#/" className="inline-flex items-center gap-3"><Mark size={44} /><span className="serif text-[34px] leading-none text-[#ecebf2]">SubSense</span></a>
          <p className="mt-5 max-w-[30ch] text-[17px] leading-relaxed text-[#b4b2c3]">{t('foot.tagline')}</p>
          <dl className="mt-7 grid max-w-[340px] grid-cols-2 overflow-hidden rounded-[16px] bg-white/[0.03] ring-1 ring-white/[0.08]">
            {facts.map(([k, v], i) => (
              <div key={k} className={`px-4 py-3 ${i % 2 ? 'border-l border-white/[0.08]' : ''} ${i > 1 ? 'border-t border-white/[0.08]' : ''}`}>
                <dt className="text-[12px] text-[#7f7e8f]">{k}</dt>
                <dd className="mt-0.5 flex items-center gap-2 text-[14.5px] text-[#dcdae6]">{i === 0 && <span className={`live-dot shrink-0 ${uid && status === 'synced' ? 'on' : ''}`} style={{ background: uid ? undefined : '#7f7e8f' }} />}{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-[13px] font-medium text-[#7f7e8f]">{c.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...('ext' in l && l.ext ? { target: '_blank', rel: 'noreferrer noopener' } : {})} className="text-[15px] text-[#dcdae6] transition-colors hover:text-white">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p aria-hidden className="serif pointer-events-none -mb-[0.22em] select-none text-center leading-none text-transparent [-webkit-text-stroke:1px_rgba(192,193,255,.22)]" style={{ fontSize: 'clamp(88px, 21vw, 300px)', letterSpacing: '-0.04em' }}>SubSense</p>

      <div className="relative border-t border-white/10 bg-inherit">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-5 pb-28 md:pb-5">
          <p className="text-[13px] text-[#7f7e8f]">© {new Date().getFullYear()} Kutluhan Gül · ReBuildReBreak · İstanbul</p>
          <div className="flex items-center gap-1 text-[13px]">
            {(['tr', 'en'] as const).map((l) => (
              <button key={l} type="button" onClick={() => setSetting('language', l)} aria-pressed={lang === l}
                className={`h-8 rounded-full px-3 transition-colors ${lang === l ? 'bg-white/10 text-white' : 'text-[#9e9cb0] hover:text-white'}`}>{l === 'tr' ? 'Türkçe' : 'English'}</button>
            ))}
            <a href="https://github.com/kutluhangil" target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="ml-2 grid size-8 place-items-center rounded-full text-[#9e9cb0] hover:bg-white/10 hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── ⌘K palette (Spotlight-like) ─────────────────────────────────────────────
export function Palette() {
  const { t } = useI()
  const { open, close, show } = useOverlay()
  const subs = useApp((s) => s.subscriptions)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const isOpen = open?.kind === 'palette'

  useEffect(() => {
    if (!isOpen) return
    setQ('')
    setSel(0)
    setTimeout(() => input.current?.focus(), 0)
  }, [isOpen])

  const results = useMemo(() => {
    const k = q.trim().toLocaleLowerCase()
    const m = (s: string) => !k || s.toLocaleLowerCase().includes(k)
    type Item = { id: string; group: string; label: string; glyph?: string; run: () => void }
    const mine: Item[] = subs.filter((s) => m(s.name) || m(s.plan ?? '')).slice(0, 6).map((s) => ({ id: 's' + s.id, group: t('pal.subs'), label: s.name, glyph: s.name, run: () => show({ kind: 'editor', id: s.id }) }))
    const services: Item[] = k ? EXPLORE_CATALOG.filter((s) => m(s.name)).slice(0, 6).map((s) => ({ id: 'c' + s.name, group: t('pal.services'), label: s.name, glyph: s.name, run: () => show({ kind: 'service', name: s.name }) })) : []
    const pages: Item[] = [...APP_NAV, { page: 'wrapped' as Page, key: 'nav.wrapped', icon: Settings }, { page: 'settings' as Page, key: 'nav.settings', icon: Settings }].filter((n) => m(t(n.key))).map((n) => ({ id: 'p' + n.page, group: t('pal.pages'), label: t(n.key), run: () => go(n.page) }))
    return [...mine, ...services, ...pages]
  }, [q, subs, t, show])

  if (!isOpen) return null
  const pick = (i: number) => {
    const r = results[i]
    if (!r) return
    close()
    r.run()
  }
  let lastGroup = ''
  return (
    <div className="fade-in fixed inset-0 z-50 flex justify-center bg-black/25 px-4 pt-[14vh]" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div role="dialog" aria-modal="true" aria-label={t('top.search')} className="glass sheet-in h-fit w-full max-w-[620px] overflow-hidden rounded-[22px]">
        <div className="flex items-center gap-3 px-5">
          <Search size={20} strokeWidth={2} className="text-label-3" />
          <input ref={input} value={q} onChange={(e) => (setQ(e.target.value), setSel(0))} placeholder={t('pal.ph')}
            className="h-[60px] flex-1 bg-transparent text-[20px] tracking-[-0.01em] text-label outline-none placeholder:text-label-3"
            onKeyDown={(e) => {
              if (e.key === 'Escape') close()
              if (e.key === 'ArrowDown') (e.preventDefault(), setSel((s) => Math.min(s + 1, results.length - 1)))
              if (e.key === 'ArrowUp') (e.preventDefault(), setSel((s) => Math.max(s - 1, 0)))
              if (e.key === 'Enter') pick(sel)
            }} />
        </div>
        <ul className="no-scrollbar max-h-[52vh] overflow-y-auto border-t border-sep p-2" role="listbox">
          {results.length === 0 && <li className="px-3 py-8 text-center text-[15px] text-label-3">{t('pal.none')}</li>}
          {results.map((r, i) => {
            const head = r.group !== lastGroup
            lastGroup = r.group
            return (
              <li key={r.id}>
                {head && <p className="px-3 pb-1 pt-3 text-[12px] font-semibold text-label-3">{r.group}</p>}
                <button type="button" role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={() => pick(i)}
                  className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left text-[15px] ${i === sel ? 'bg-tint text-on-tint' : 'text-label'}`}>
                  {r.glyph ? <Glyph name={r.glyph} size={28} /> : <span className="size-7" />}
                  {r.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
