import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../core/store/app'
import { useMoney } from '../core/lib/useMoney'
import { useI } from '../ui/strings'
import { Art, Chevron, Glyph, PageHead, monthCharges, useOverlay } from '../ui/kit'
import { monthName } from '../ui/when'

export function Calendar() {
  const { t, lang, days } = useI()
  const subs = useApp((s) => s.subscriptions)
  const { fmt, priceOf } = useMoney()
  const show = useOverlay((s) => s.show)
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [picked, setPicked] = useState<number | null>(today.getDate())

  const charges = useMemo(() => monthCharges(subs, cursor.y, cursor.m, priceOf), [subs, cursor, priceOf])
  const total = charges.reduce((a, c) => a + c.amount, 0)
  const len = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const lead = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7
  const weekdays = [...days.slice(1), days[0]]
  const isToday = (d: number) => cursor.y === today.getFullYear() && cursor.m === today.getMonth() && d === today.getDate()
  const shift = (n: number) => {
    const d = new Date(cursor.y, cursor.m + n, 1)
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
    setPicked(null)
  }
  const dayCharges = picked ? charges.filter((c) => c.day === picked) : []

  return (
    <div>
      <PageHead title={t('cal.title')} lede={t('cal.lede', { amount: fmt(total), month: monthName(cursor.y, cursor.m, lang) })} />

      <div className="mx-auto mt-12 max-w-[760px] px-4 sm:px-6">
        <div className="card p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold capitalize tracking-[-0.018em] text-label">{monthName(cursor.y, cursor.m, lang, true)}</h2>
            <div className="flex gap-1">
              <button type="button" onClick={() => shift(-1)} className="grid size-9 place-items-center rounded-full text-tint hover:bg-tint-soft" aria-label={t('cal.prev')}><ChevronLeft size={20} strokeWidth={2.2} /></button>
              <button type="button" onClick={() => shift(1)} className="grid size-9 place-items-center rounded-full text-tint hover:bg-tint-soft" aria-label={t('cal.next')}><ChevronRight size={20} strokeWidth={2.2} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((w, i) => <span key={i} className="pb-2 text-[12px] font-semibold text-label-3">{w}</span>)}
            {Array.from({ length: lead }, (_, i) => <span key={'x' + i} />)}
            {Array.from({ length: len }, (_, i) => {
              const d = i + 1
              const items = charges.filter((c) => c.day === d)
              const sel = picked === d
              return (
                <button key={d} type="button" onClick={() => setPicked(d)} aria-pressed={sel} aria-label={`${d}${items.length ? ': ' + items.map((c) => c.name).join(', ') : ''}`}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[14px] transition-colors hover:bg-cell-2">
                  <span className={`num grid size-9 place-items-center rounded-full text-[17px] ${sel ? 'bg-tint font-semibold text-on-tint' : isToday(d) ? 'font-semibold text-tint' : items.length ? 'font-medium text-label' : 'text-label-3'}`}>{d}</span>
                  <span className="flex h-1.5 gap-0.5">{items.slice(0, 3).map((c) => <span key={c.id} className="size-1.5 rounded-full" style={{ background: c.trial ? 'var(--label-3)' : c.color }} />)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {picked !== null && (
          <section className="mt-8">
            <h3 className="mb-2.5 px-1 text-[22px] font-semibold tracking-[-0.018em] text-label">
              {new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date(cursor.y, cursor.m, picked))}
            </h3>
            {dayCharges.length === 0 ? <div className="flex items-center gap-4 px-1"><Art name="calendar" size={88} /><p className="text-[15px] text-label-3">{t('cal.empty')}</p></div> : (
              <div className="grouped">
                {dayCharges.map((c) => (
                  <button key={c.id} type="button" onClick={() => show({ kind: 'editor', id: c.id })} className="row with-icon">
                    <Glyph name={c.name} size={36} color={c.color} />
                    <span className="flex-1 text-[17px] text-label">{c.name}</span>
                    <span className="num text-[17px] text-label-2">{c.trial ? t('status.Trial') : fmt(c.amount)}</span>
                    <Chevron />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
