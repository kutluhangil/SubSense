import { useMemo, type ReactNode } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { useApp } from '../core/store/app'
import { useCloud, resendVerification } from '../core/lib/cloud'
import { useMoney } from '../core/lib/useMoney'
import { budgetAlerts, categoryOverlap, categoryTotals, computeTotals, trialsEndingSoon, upcoming } from '../core/lib/derive'
import { categoryColor } from '../core/lib/categories'
import { convert, formatMoney } from '../core/lib/format'
import type { Subscription } from '../core/types'
import { useI } from '../ui/strings'
import { Art, Glyph, GroupTitle, Rings, Section, go, monthCharges, useFlash, useOverlay } from '../ui/kit'
import { Orbit } from '../ui/Orbit'
import { monthName, relWhen } from '../ui/when'

/** The dashboard grid. Also rendered read-only inside the landing page's Mac window. */
export function OverviewBoard({ subs, onPick, preview = false }: { subs: Subscription[]; onPick?: (id: string) => void; preview?: boolean }) {
  const { t, lang, tCat, days } = useI()
  const { base, rates, fmt, priceOf } = useMoney()
  const now = useMemo(() => new Date(), [])
  const soon = upcoming(subs, 30).slice(0, 7)
  const cats = categoryTotals(subs, base, rates)
  const totals = computeTotals(subs, base, rates)
  const charges = useMemo(() => monthCharges(subs, now.getFullYear(), now.getMonth(), priceOf), [subs, now, priceOf])
  const len = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const lead = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7
  const weekdays = [...days.slice(1), days[0]]
  const Row = onPick ? 'button' : 'div'

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="card p-5 md:row-span-2">
        <GroupTitle>{t('ov.upcoming')}</GroupTitle>
        {soon.length === 0 ? <p className="px-1 py-6 text-[15px] text-label-3">{t('ov.noneSoon')}</p> : (
          <div className="-mx-2">
            {soon.map((s) => (
              <Row key={s.id} type={onPick ? 'button' : undefined} onClick={onPick ? () => onPick(s.id) : undefined} className="row with-icon rounded-[14px] px-2">
                <Glyph name={s.name} size={40} color={s.brandColor} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-medium text-label">{s.name}</span>
                  <span className="block truncate text-[13.5px] text-label-3">{relWhen(s.nextDate, lang)}</span>
                </span>
                <span className="num text-[16px] font-medium text-label">{fmt(priceOf(s))}</span>
              </Row>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <GroupTitle>{t('ov.categories')}</GroupTitle>
        {cats.length === 0 ? <p className="px-1 py-6 text-[15px] text-label-3">{t('in.empty')}</p> : (
          <div className="flex items-center gap-6 px-1 pt-1">
            <Rings size={preview ? 132 : 150} items={cats.slice(0, 3).map((c) => ({ value: c.pct / 100, color: categoryColor(c.category), label: tCat(c.category) }))} />
            <ul className="min-w-0 flex-1 space-y-2.5">
              {cats.slice(0, 4).map((c) => (
                <li key={c.category} className="flex items-center gap-2.5 text-[14.5px]">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: categoryColor(c.category) }} />
                  <span className="min-w-0 flex-1 truncate text-label-2">{tCat(c.category)}</span>
                  <span className="num font-medium text-label">{Math.round(c.pct)}%</span>
                </li>
              ))}
              <li className="pt-1 text-[13px] text-label-3">{fmt(totals.monthly)} {t('ov.perMonth')}</li>
            </ul>
          </div>
        )}
      </section>

      <section className="card p-5">
        <GroupTitle action={<span className="num text-[14px] text-label-3">{fmt(charges.reduce((a, c) => a + c.amount, 0))}</span>}>
          <span className="capitalize">{monthName(now.getFullYear(), now.getMonth(), lang)}</span>
        </GroupTitle>
        <div className="grid grid-cols-7 gap-y-1.5 text-center">
          {weekdays.map((w, i) => <span key={i} className="text-[11px] font-medium text-label-3">{w}</span>)}
          {Array.from({ length: lead }, (_, i) => <span key={'x' + i} />)}
          {Array.from({ length: len }, (_, i) => {
            const d = i + 1
            const items = charges.filter((c) => c.day === d)
            const today = d === now.getDate()
            return (
              <span key={d} className="flex flex-col items-center gap-0.5">
                <span className={`num grid size-7 place-items-center rounded-full text-[13px] ${today ? 'bg-tint font-semibold text-on-tint' : items.length ? 'font-semibold text-label' : 'text-label-3'}`}>{d}</span>
                <span className="flex h-1.5 gap-0.5">{items.slice(0, 3).map((c) => <span key={c.id} className="size-1.5 rounded-full" style={{ background: c.color }} />)}</span>
              </span>
            )
          })}
        </div>
      </section>
    </div>
  )
}

/** Puts values into a sentence template, set in bold like Neural-Vault's stats line. */
function fill(tpl: string, vals: Record<string, ReactNode>) {
  return tpl.split(/(\{\w+\})/).map((part, i) => {
    const k = part.match(/^\{(\w+)\}$/)?.[1]
    return k ? <strong key={i} className="num font-semibold text-label">{vals[k]}</strong> : part
  })
}

export function Overview() {
  const { t, lang, tCat } = useI()
  const subs = useApp((s) => s.subscriptions)
  const budgets = useApp((s) => s.settings.budgetLimits)
  const priceAlerts = useApp((s) => s.priceAlerts)
  const dismissPriceAlerts = useApp((s) => s.dismissPriceAlerts)
  const loadSample = useApp((s) => s.loadSampleData)
  const cloud = useCloud()
  const { base, rates, fmt, priceOf } = useMoney()
  const show = useOverlay((s) => s.show)
  const [sent, markSent] = useFlash()
  const now = useMemo(() => new Date(), [])

  const totals = computeTotals(subs, base, rates)
  const soon = upcoming(subs, 30)
  const next = soon[0]
  const cats = categoryTotals(subs, base, rates)
  const charges = useMemo(() => monthCharges(subs, now.getFullYear(), now.getMonth(), priceOf), [subs, now, priceOf])
  const month = monthName(now.getFullYear(), now.getMonth(), lang)
  const empty = subs.length === 0

  const alerts: { key: string; text: string; tone: string }[] = []
  for (const b of budgetAlerts(subs, budgets, base, rates)) {
    const limit = budgets[b.category]
    alerts.push({ key: 'b' + b.category, tone: 'var(--orange)', text: t('ov.overBudget', { cat: tCat(b.category), spent: fmt(limit + b.over), limit: fmt(limit) }) })
  }
  const overlap = categoryOverlap(subs, base, rates)
  if (overlap?.category) alerts.push({ key: 'o', tone: 'var(--tint)', text: t('ov.overlap', { count: overlap.count, cat: tCat(overlap.category), amount: fmt(overlap.savings) }) })
  for (const s of trialsEndingSoon(subs)) alerts.push({ key: 't' + s.id, tone: 'var(--orange)', text: t('ov.trialEnds', { name: s.name, when: relWhen(s.trialEndDate!, lang), amount: fmt(s.price, s.currency) }) })
  for (const p of priceAlerts) alerts.push({ key: 'p' + p.id, tone: 'var(--red)', text: t('ov.priceUp', { name: p.name, price: formatMoney(convert(p.toUsd, 'USD', base, rates), base) }) })

  return (
    <div className="pb-4">
      <section className="rise mx-auto max-w-[780px] px-5 pt-32 text-center sm:pt-36">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13.5px] text-label-3">
          <span className="inline-flex items-center gap-2"><span className={`live-dot ${cloud.uid && cloud.status === 'synced' ? 'on' : ''}`} style={{ background: cloud.uid ? undefined : 'var(--label-3)' }} />{cloud.uid ? t('sync.synced') : t('sync.local')}</span>
          <span className="capitalize">{monthName(now.getFullYear(), now.getMonth(), lang, true)}</span>
          {!empty && <span>{t('ov.metaSubs', { n: subs.length })}</span>}
        </p>
        {empty && <Art name="empty-month" size={220} className="mx-auto mt-6" />}
        <h1 className="t-display mt-5 text-label">{empty ? t('ov.emptyTitle') : t('ov.title')}</h1>
        <p className="mx-auto mt-6 max-w-[34em] text-[18px] leading-[1.65] text-label-2">
          {empty ? t('ov.emptyText') : <>
            {fill(t('ov.sentence'), { month: fmt(totals.monthly), year: fmt(totals.annual), n: totals.activeCount })}{' '}
            {next ? fill(t('ov.next'), { name: next.name, when: relWhen(next.nextDate, lang) }) : t('ov.noneSoon')}
          </>}
        </p>
        {cloud.uid && !cloud.verified && cloud.providers.includes('password') && (
          <p className="mt-3 text-[14px] text-orange">
            {t('ov.verify')}{' '}
            <button type="button" className="font-medium underline underline-offset-4" onClick={() => resendVerification().then(markSent).catch(() => {})}>{sent ? t('ov.sent') : t('ov.resend')}</button>
          </p>
        )}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => show({ kind: 'editor' })} className="btn btn-ink"><Plus size={18} strokeWidth={2.4} />{t('ov.add')}</button>
          {empty
            ? <button type="button" onClick={loadSample} className="btn btn-line">{t('ov.sample')}</button>
            : <button type="button" onClick={() => go('calendar')} className="btn btn-line"><CalendarDays size={18} strokeWidth={2} />{t('ov.calendar')}</button>}
        </div>
      </section>

      <figure className="mx-auto mt-6 max-w-[620px] px-3">
        <Orbit charges={charges} year={now.getFullYear()} month={now.getMonth()} monthLabel={month} onPick={(id) => show({ kind: 'editor', id })}
          amount={charges.reduce((a, c) => a + c.amount, 0)} format={(n) => fmt(n)} label={t('ov.dueMonth')}
          foot={charges.length ? t('ov.kicker', { month, n: charges.length }) : undefined} emptyHint={t('ov.emptyHint')} onEmpty={() => show({ kind: 'editor' })} />
        <figcaption className="-mt-3 text-center text-[13px] text-label-3">{t('ov.specimen')}</figcaption>
      </figure>

      {alerts.length > 0 && (
        <Section title={t('ov.alerts')}>
          <ul className="mx-auto max-w-[680px]">
            {alerts.map((a, i) => (
              <li key={a.key} className={`flex items-start gap-3 px-2 py-4 text-[16px] leading-relaxed text-label-2 ${i ? 'border-t border-sep' : ''}`}>
                <span className="mt-2.5 size-2 shrink-0 rounded-full" style={{ background: a.tone }} />
                <span className="flex-1">{a.text}</span>
                {a.key.startsWith('p') && <button type="button" onClick={dismissPriceAlerts} className="text-[14px] text-tint">{t('ov.dismiss')}</button>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {soon.length > 0 && (
        <Section title={t('ov.upcoming')}>
          <ul>
            {soon.slice(0, 8).map((s, i) => (
              <li key={s.id} className={i ? 'border-t border-sep' : ''}>
                <button type="button" onClick={() => show({ kind: 'editor', id: s.id })}
                  className="group grid w-full grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] items-center gap-5 rounded-2xl px-3 py-4 text-left transition-colors hover:bg-cell/70 max-sm:grid-cols-[minmax(0,1fr)_auto]">
                  <span className="flex min-w-0 items-center gap-3">
                    <Glyph name={s.name} size={36} color={s.brandColor} />
                    <span className="serif truncate text-[19px] text-label transition-colors group-hover:text-tint">{s.name}</span>
                  </span>
                  <span className="truncate text-[15px] text-label-3 max-sm:hidden">{[s.plan, relWhen(s.nextDate, lang)].filter(Boolean).join(', ')}</span>
                  <span className="num text-[16px] font-medium text-label">{fmt(priceOf(s))}</span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {cats.length > 0 && (
        <Section title={t('ov.categories')} wide>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => {
              const names = subs.filter((s) => s.category === c.category && s.status !== 'Inactive')
              return (
                <li key={c.category} className="card flex h-full flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--lift)]">
                  <span className="flex items-center justify-between text-[13px] text-label-3">
                    <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: categoryColor(c.category) }} />{tCat(c.category)}</span>
                    <span className="num">{Math.round(c.pct)}%</span>
                  </span>
                  <span className="serif mt-3 text-[28px] leading-none text-label">{fmt(c.amount)}</span>
                  <span className="mt-4 flex -space-x-2">{names.slice(0, 6).map((s) => <span key={s.id} className="rounded-[10px] ring-2 ring-cell"><Glyph name={s.name} size={28} color={s.brandColor} /></span>)}</span>
                  <span className="mt-3 line-clamp-2 text-[14px] text-label-2">{names.map((s) => s.name).join(', ')}</span>
                </li>
              )
            })}
          </ul>
        </Section>
      )}
    </div>
  )
}
