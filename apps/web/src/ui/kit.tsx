import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { create } from 'zustand'
import { ChevronRight } from 'lucide-react'
import { logoFor } from '../core/lib/logos'
import { brandGlyph } from '../core/lib/brand'
import { parseDate } from '../core/lib/format'
import { useApp, type NewSub } from '../core/store/app'
import { resolveAppearance } from '../core/lib/appearance'
import type { Subscription } from '../core/types'

// ── Hash router (identical on the web and inside the desktop shell) ─────────
export type Page = 'home' | 'overview' | 'subs' | 'calendar' | 'insights' | 'discover' | 'settings' | 'auth' | 'privacy' | 'deletion'
const PAGES = new Set<Page>(['home', 'overview', 'subs', 'calendar', 'insights', 'discover', 'settings', 'auth', 'privacy', 'deletion'])

const subscribeHash = (cb: () => void) => (addEventListener('hashchange', cb), () => removeEventListener('hashchange', cb))

export function useRoute(): { page: Page } {
  const hash = useSyncExternalStore(subscribeHash, () => location.hash)
  const p = hash.replace(/^#\/?/, '').split('/')[0]
  return { page: PAGES.has(p as Page) ? (p as Page) : 'home' }
}

export const go = (page: Page) => {
  location.hash = `/${page}`
}

// ── Overlays ────────────────────────────────────────────────────────────────
type Overlay = { kind: 'editor'; id?: string; draft?: Partial<NewSub> } | { kind: 'service'; name: string } | { kind: 'palette' } | null

export const useOverlay = create<{ open: Overlay; show: (o: Overlay) => void; close: () => void }>((set) => ({
  open: null,
  show: (open) => set({ open }),
  close: () => set({ open: null }),
}))

// ── Theme ───────────────────────────────────────────────────────────────────
export function useThemeEffect() {
  const appearance = useApp((s) => s.settings.appearance)
  const lang = useApp((s) => s.settings.language)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => (document.documentElement.dataset.theme = resolveAppearance(appearance, mq.matches) ? 'dark' : 'light')
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [appearance])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
}

export function useIsDark() {
  const appearance = useApp((s) => s.settings.appearance)
  return resolveAppearance(appearance, matchMedia('(prefers-color-scheme: dark)').matches)
}

// ── Month helper shared by overview, calendar and the landing preview ──────
export interface Charge { id: string; name: string; day: number; amount: number; color: string; trial: boolean }

/** Charges that land in a month: monthly plans on their billing day, yearly ones and trial ends only in their month. */
export function monthCharges(subs: Subscription[], year: number, month: number, amountOf: (s: Subscription) => number): Charge[] {
  const days = new Date(year, month + 1, 0).getDate()
  const out: Charge[] = []
  for (const s of subs) {
    if (s.status === 'Inactive') continue
    const trial = s.status === 'Trial' && Boolean(s.trialEndDate)
    const next = parseDate(trial ? s.trialEndDate! : s.nextDate)
    if (!next) continue
    const inMonth = next.getFullYear() === year && next.getMonth() === month
    if ((s.cycle === 'Yearly' || trial) && !inMonth) continue
    out.push({ id: s.id, name: s.name, day: Math.min(s.billingDay ?? next.getDate(), days), amount: trial ? 0 : amountOf(s), color: s.brandColor ?? brandGlyph(s.name).color, trial })
  }
  return out.sort((a, b) => a.day - b.day || b.amount - a.amount)
}

// ── Brand tile: app-icon squircle with the logo, or a tinted initial ───────
export function Glyph({ name, size = 40, color }: { name: string; size?: number; color?: string }) {
  const logo = logoFor(name)
  const r = Math.round(size * 0.27)
  if (logo) {
    return (
      <span className="grid shrink-0 place-items-center overflow-hidden" style={{ width: size, height: size, borderRadius: r, background: logo.dark ? '#111' : '#fff', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,.12)' }}>
        <img src={logo.url} alt="" className="h-[64%] w-[64%] object-contain" loading="lazy" />
      </span>
    )
  }
  const c = color ?? brandGlyph(name).color
  return (
    <span className="grid shrink-0 place-items-center font-semibold text-white" style={{ width: size, height: size, borderRadius: r, background: `linear-gradient(160deg, ${c}, color-mix(in srgb, ${c} 70%, #000))`, fontSize: size * 0.42 }} aria-hidden>
      {(brandGlyph(name).letter ?? name.charAt(0)).toUpperCase()}
    </span>
  )
}

/** App mark: indigo squircle with a white orbit. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="mk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6264ef" /><stop offset="1" stopColor="#2f2ebe" /></linearGradient>
      </defs>
      <rect width="32" height="32" rx="8.6" fill="url(#mk)" />
      <circle cx="16" cy="16" r="8" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="2.6" fill="#fff" />
      <circle cx="21.66" cy="10.34" r="2.3" fill="#fff" />
    </svg>
  )
}

// ── Layout ──────────────────────────────────────────────────────────────────
export function PageHead({ title, lede, children }: { title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mx-auto max-w-[820px] px-5 pt-32 text-center sm:pt-36">
      <h1 className="t-display text-label">{title}</h1>
      {lede && <p className="t-subhead mx-auto mt-4 max-w-[34em]">{lede}</p>}
      {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
    </header>
  )
}

export function GroupTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between px-1">
      <h2 className="text-[22px] font-semibold tracking-[-0.018em] text-label">{children}</h2>
      {action}
    </div>
  )
}

export function Chevron() {
  return <ChevronRight size={17} strokeWidth={2.2} className="shrink-0 text-label-3 opacity-70" aria-hidden />
}

// ── Activity-style rings ────────────────────────────────────────────────────
export function Rings({ items, size = 200, center }: { items: { value: number; color: string; label: string }[]; size?: number; center?: ReactNode }) {
  const stroke = Math.max(14, size * 0.09)
  const gap = 4
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={items.map((i) => `${i.label} ${Math.round(i.value * 100)}%`).join(', ')}>
        {items.map((it, i) => {
          const r = size / 2 - stroke / 2 - i * (stroke + gap)
          if (r <= stroke) return null
          const len = 2 * Math.PI * r
          const v = Math.max(0.02, Math.min(it.value, 1))
          return (
            <g key={it.label} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={it.color} strokeOpacity="0.16" strokeWidth={stroke} />
              <circle className="ring-draw" style={{ ['--len' as string]: len, ['--i' as string]: i }} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={it.color}
                strokeWidth={stroke} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - v)} />
            </g>
          )
        })}
      </svg>
      {center && <div className="absolute inset-0 grid place-items-center text-center">{center}</div>}
    </div>
  )
}

// ── Sheet: Cancel ‹ title › primary, grouped content ───────────────────────
export function Sheet({ title, onClose, children, width = 560, primary }: { title: string; onClose: () => void; children: ReactNode; width?: number; primary?: { label: string; onClick: () => void; disabled?: boolean } }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    (ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current)?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const els = [...ref.current.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea')].filter((x) => !x.hasAttribute('disabled'))
        if (!els.length) return
        const [a, z] = [els[0], els[els.length - 1]]
        if (e.shiftKey && document.activeElement === a) (e.preventDefault(), z.focus())
        else if (!e.shiftKey && document.activeElement === z) (e.preventDefault(), a.focus())
      }
    }
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus?.focus()
    }
  }, [onClose])
  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="outline-none sheet-in no-scrollbar max-h-[94dvh] w-full overflow-y-auto rounded-t-[22px] bg-bg-2 shadow-2xl sm:rounded-[22px]" style={{ maxWidth: width }}>
        <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-bg-2/85 px-4 py-3 backdrop-blur-xl">
          <button type="button" onClick={onClose} className="justify-self-start rounded-full px-2 py-1 text-[17px] text-tint">{primary ? t2('cancel') : t2('done')}</button>
          <h2 className="truncate text-[17px] font-semibold text-label">{title}</h2>
          {primary ? (
            <button type="button" onClick={primary.onClick} disabled={primary.disabled} className="justify-self-end rounded-full px-2 py-1 text-[17px] font-semibold text-tint disabled:opacity-40">{primary.label}</button>
          ) : <span />}
        </div>
        <div className="px-4 pb-8 pt-2 sm:px-6">{children}</div>
      </div>
    </div>
  )
}

// Sheet chrome words without pulling the whole translator into this module.
function t2(k: 'cancel' | 'done') {
  const tr = useApp.getState().settings.language === 'tr'
  return k === 'cancel' ? (tr ? 'Vazgeç' : 'Cancel') : tr ? 'Bitti' : 'Done'
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-green' : 'bg-[color-mix(in_srgb,var(--label)_14%,transparent)]'}`}>
      <span className={`absolute left-0 top-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.15),0_1px_1px_rgba(0,0,0,.08)] transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
  )
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[10px] bg-[color-mix(in_srgb,var(--label)_7%,transparent)] p-[2px]">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={`min-h-[30px] rounded-[8px] px-3.5 text-[14px] font-medium transition-all duration-200 ${value === o.value ? 'bg-cell text-label shadow-[0_3px_8px_rgba(0,0,0,.08),0_0_0_.5px_rgba(0,0,0,.04)]' : 'text-label-2 hover:text-label'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function useFlash(ms = 2400): [boolean, () => void] {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!on) return
    const t = setTimeout(() => setOn(false), ms)
    return () => clearTimeout(t)
  }, [on, ms])
  return [on, () => setOn(true)]
}

// ── Neural-Vault editorial pieces ──────────────────────────────────────────
export function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4" aria-hidden>
      <span className="h-px w-16 bg-sep sm:w-24" />
      <svg width="30" height="30" viewBox="0 0 30 30" className="text-tint">
        <circle cx="15" cy="15" r="10.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 3" />
        <circle cx="15" cy="15" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="15" cy="15" r="1.7" fill="currentColor" />
        <circle cx="22.4" cy="7.6" r="1.9" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-sep sm:w-24" />
    </div>
  )
}

/** Ornament + centered serif title, the section rhythm of the site. */
export function Section({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`mx-auto mt-24 px-4 sm:px-6 ${wide ? 'max-w-[1080px]' : 'max-w-[860px]'}`}>
      <Ornament />
      <h2 className="t-section mt-5 text-center text-label">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  )
}
