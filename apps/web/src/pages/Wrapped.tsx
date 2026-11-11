import { useApp } from '../core/store/app'
import { useMoney } from '../core/lib/useMoney'
import { categoryTotals, computeTotals, monthlyProjection } from '../core/lib/derive'
import { categoryColor } from '../core/lib/categories'
import { monthlyAmount } from '../core/lib/format'
import { useI } from '../ui/strings'
import { Glyph, PageHead } from '../ui/kit'
import { monthName } from '../ui/when'

/** Year in review: the current list projected over a year, one big number per card. */
export function Wrapped() {
  const { t, tCat, lang } = useI()
  const subs = useApp((s) => s.subscriptions).filter((s) => s.status !== 'Inactive' && !s.deletedAt)
  const { base, rates, fmt, priceOf } = useMoney()
  const year = new Date().getFullYear()

  if (!subs.length) return <PageHead title={t('wr.title', { year })} lede={t('in.empty')} />

  const totals = computeTotals(subs, base, rates)
  const topCat = categoryTotals(subs, base, rates)[0]
  const yearly = (s: (typeof subs)[number]) => monthlyAmount(priceOf(s), s.cycle) * 12
  const priciest = [...subs].sort((a, b) => yearly(b) - yearly(a))[0]
  const oldest = subs.filter((s) => s.startDate).sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0]
  const peak = monthlyProjection(subs, base, rates).reduce((a, b) => (b.amount > a.amount ? b : a))

  const cards: { label: string; big: string; small: string; glyph?: string; dot?: string }[] = [
    { label: t('wr.perDay'), big: fmt(totals.annual / 365), small: t('wr.perDayText', { week: fmt(totals.weekly) }) },
    { label: t('wr.count'), big: String(totals.activeCount), small: t('wr.countText', { month: fmt(totals.monthly) }) },
    ...(topCat ? [{ label: t('wr.topCat'), big: tCat(topCat.category), small: t('wr.topCatText', { pct: Math.round(topCat.pct), amount: fmt(topCat.amount * 12) }), dot: categoryColor(topCat.category) }] : []),
    { label: t('wr.priciest'), big: priciest.name, small: t('wr.priciestText', { amount: fmt(yearly(priciest)) }), glyph: priciest.name },
    { label: t('wr.peak'), big: monthName(peak.year, peak.month, lang), small: t('wr.peakText', { amount: fmt(peak.amount) }) },
    ...(oldest ? [{ label: t('wr.oldest'), big: oldest.name, small: t('wr.oldestText', { year: oldest.startDate!.slice(0, 4) }), glyph: oldest.name }] : []),
  ]

  return (
    <div>
      <section className="rise mx-auto max-w-[980px] px-5 pt-32 text-center sm:pt-40">
        <p className="t-eyebrow">{t('wr.title', { year })}</p>
        <p className="figure mt-4 text-[clamp(56px,11vw,132px)] leading-none text-label">{fmt(totals.annual)}</p>
        <p className="t-subhead mx-auto mt-6 max-w-[30em]">{t('wr.lede')}</p>
      </section>
      <div className="mx-auto mt-14 grid max-w-[1040px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {cards.map((c, i) => (
          <section key={c.label} className={`rise card flex min-h-[210px] flex-col p-7 ${i === 0 ? '!bg-tint text-on-tint' : ''}`} style={{ animationDelay: `${i * 90}ms` }}>
            <h2 className={`flex items-center gap-2 text-[15px] font-medium ${i === 0 ? 'opacity-85' : 'text-label-3'}`}>
              {c.dot && <span className="size-2.5 rounded-full" style={{ background: c.dot }} />}{c.label}
            </h2>
            <p className={`mt-auto flex items-center gap-3 pt-6 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.08] tracking-[-0.03em] ${i === 0 ? '' : 'text-label'}`}>
              {c.glyph && <Glyph name={c.glyph} size={40} />}<span className="num min-w-0 truncate">{c.big}</span>
            </p>
            <p className={`mt-2 text-[16px] leading-snug ${i === 0 ? 'opacity-85' : 'text-label-2'}`}>{c.small}</p>
          </section>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-[40em] px-5 text-center text-[13.5px] text-label-3">{t('wr.note')}</p>
    </div>
  )
}
