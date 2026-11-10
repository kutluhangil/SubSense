import { useApp } from '../core/store/app'
import { useMoney } from '../core/lib/useMoney'
import { categoryTotals, computeTotals, monthlyProjection } from '../core/lib/derive'
import { categoryColor } from '../core/lib/categories'
import { monthlyAmount } from '../core/lib/format'
import { CATEGORIES } from '../core/data/catalog'
import { useI } from '../ui/strings'
import { Glyph, GroupTitle, PageHead, Rings, useOverlay } from '../ui/kit'

export function Insights() {
  const { t, tCat, monthsShort } = useI()
  const subs = useApp((s) => s.subscriptions)
  const budgets = useApp((s) => s.settings.budgetLimits)
  const setBudget = useApp((s) => s.setBudget)
  const { base, rates, fmt, priceOf } = useMoney()
  const show = useOverlay((s) => s.show)

  if (!subs.length) return <PageHead title={t('in.title')} lede={t('in.empty')} />

  const totals = computeTotals(subs, base, rates)
  const cats = categoryTotals(subs, base, rates)
  const projection = monthlyProjection(subs, base, rates)
  const peak = Math.max(1, ...projection.map((p) => p.amount))
  const top = subs.filter((s) => s.status !== 'Inactive').sort((a, b) => monthlyAmount(priceOf(b), b.cycle) - monthlyAmount(priceOf(a), a.cycle)).slice(0, 5)

  return (
    <div>
      <PageHead title={t('in.title')} lede={t('in.lede', { month: fmt(totals.monthly), year: fmt(totals.annual) })} />

      <div className="mx-auto mt-14 grid max-w-[1040px] gap-4 px-4 sm:px-6 md:grid-cols-2">
        <section className="card p-6">
          <GroupTitle>{t('in.byCat')}</GroupTitle>
          <div className="flex flex-col items-center gap-6 pt-2 sm:flex-row">
            <Rings size={180} items={cats.slice(0, 4).map((c) => ({ value: c.pct / 100, color: categoryColor(c.category), label: tCat(c.category) }))} />
            <ul className="w-full flex-1">
              {cats.map((c) => (
                <li key={c.category} className="flex items-center gap-2.5 py-1.5 text-[15px]">
                  <span className="size-2.5 rounded-full" style={{ background: categoryColor(c.category) }} />
                  <span className="flex-1 text-label-2">{tCat(c.category)}</span>
                  <span className="num font-medium text-label">{fmt(c.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card p-6">
          <GroupTitle>{t('in.top')}</GroupTitle>
          <div className="-mx-3">
            {top.map((s) => (
              <button key={s.id} type="button" onClick={() => show({ kind: 'editor', id: s.id })} className="row with-icon rounded-[14px] px-3">
                <Glyph name={s.name} size={36} color={s.brandColor} />
                <span className="flex-1 truncate text-[16px] text-label">{s.name}</span>
                <span className="num text-[16px] font-medium text-label">{fmt(monthlyAmount(priceOf(s), s.cycle))}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card p-6 md:col-span-2">
          <GroupTitle>{t('in.forecast')}</GroupTitle>
          <div className="mt-4 flex h-[200px] items-end gap-1.5 sm:gap-3" role="img" aria-label={projection.map((p) => `${monthsShort[p.month]} ${fmt(p.amount)}`).join(', ')}>
            {projection.map((p, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="w-full rounded-[8px] transition-[height] duration-700" style={{ height: `${Math.max((p.amount / peak) * 100, 3)}%`, background: i === 0 ? 'var(--tint)' : 'color-mix(in srgb, var(--tint) 22%, transparent)' }} title={fmt(p.amount)} />
                <span className="text-[12px] font-medium text-label-3">{monthsShort[p.month]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="md:col-span-2">
          <div className="mt-6 px-1">
            <GroupTitle>{t('in.budgets')}</GroupTitle>
            <p className="-mt-1 mb-3 text-[15px] text-label-3">{t('in.budgetHint')}</p>
          </div>
          <div className="grouped">
            {CATEGORIES.map((c) => {
              const spent = cats.find((x) => x.category === c.name)?.amount ?? 0
              const limit = budgets[c.name] ?? 0
              const over = limit > 0 && spent > limit
              return (
                <div key={c.name} className="row flex-wrap">
                  <span className="size-2.5 rounded-full" style={{ background: categoryColor(c.name) }} />
                  <span className="flex-1 text-[17px] text-label">{tCat(c.name)}</span>
                  <span className={`num text-[15px] ${over ? 'font-semibold text-red' : 'text-label-3'}`}>{fmt(spent)}</span>
                  <span className="text-label-3">/</span>
                  <input type="number" min={0} step="1" inputMode="numeric" aria-label={`${tCat(c.name)} (${base})`} placeholder={t('in.noLimit')}
                    className="inline-field num w-24" value={limit || ''} onChange={(e) => setBudget(c.name, Math.max(0, e.target.valueAsNumber || 0))} />
                  {limit > 0 && (
                    <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--label)_7%,transparent)]">
                      <span className="block h-full rounded-full" style={{ width: `${Math.min((spent / limit) * 100, 100)}%`, background: over ? 'var(--red)' : categoryColor(c.name) }} />
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
