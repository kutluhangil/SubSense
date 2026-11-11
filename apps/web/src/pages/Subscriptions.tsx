import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useApp } from '../core/store/app'
import { useMoney } from '../core/lib/useMoney'
import { daysUntil, monthlyAmount } from '../core/lib/format'
import { CATEGORIES } from '../core/data/catalog'
import { useI } from '../ui/strings'
import { Art, Chevron, Glyph, GroupTitle, PageHead, useOverlay } from '../ui/kit'

export function Subscriptions() {
  const { t, tCat, tStatus, tCycle } = useI()
  const subs = useApp((s) => s.subscriptions)
  const { fmt, priceOf } = useMoney()
  const show = useOverlay((s) => s.show)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')

  const groups = useMemo(() => {
    const k = q.trim().toLocaleLowerCase()
    const list = subs
      .filter((s) => cat === 'all' || s.category === cat)
      .filter((s) => !k || [s.name, s.plan, s.notes, s.nickname].some((x) => x?.toLocaleLowerCase().includes(k)))
      .sort((a, b) => Number(a.status === 'Inactive') - Number(b.status === 'Inactive') || a.nextDate.localeCompare(b.nextDate))
    const map = new Map<string, typeof list>()
    for (const s of list) map.set(s.category, [...(map.get(s.category) ?? []), s])
    return [...map.entries()]
  }, [subs, q, cat])

  const usedCats = CATEGORIES.filter((c) => subs.some((s) => s.category === c.name))
  const active = subs.filter((s) => s.status !== 'Inactive').length
  const when = (iso: string) => {
    const n = daysUntil(iso)
    return n === 0 ? t('subs.today') : n < 0 ? t('subs.overdue') : t('subs.inDays', { n })
  }

  return (
    <div>
      <PageHead title={t('subs.title')} lede={subs.length ? t('subs.lede', { n: subs.length, active }) : t('subs.empty')}>
        <button type="button" onClick={() => show({ kind: 'editor' })} className="btn btn-filled"><Plus size={18} strokeWidth={2.4} />{t('ov.add')}</button>
      </PageHead>

      {subs.length > 0 && (
        <div className="mx-auto mt-12 max-w-[760px] px-4 sm:px-6">
          <div className="relative">
            <Search size={18} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
            <input className="field pl-11" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('subs.search')} aria-label={t('subs.search')} />
          </div>
          {usedCats.length > 1 && (
            <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:justify-center">
              {[{ name: 'all' }, ...usedCats].map((c) => (
                <button key={c.name} type="button" aria-pressed={cat === c.name} onClick={() => setCat(c.name)}
                  className={`min-h-[34px] shrink-0 rounded-full px-4 text-[14px] font-medium transition-colors ${cat === c.name ? 'bg-label text-bg' : 'bg-[color-mix(in_srgb,var(--label)_7%,transparent)] text-label-2 hover:text-label'}`}>
                  {c.name === 'all' ? t('subs.all') : tCat(c.name)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-10 space-y-8">
            {groups.length === 0 && <div className="text-center text-[15px] text-label-3"><Art name="no-results" size={180} className="mx-auto" /><p className="mt-2">{t('subs.none')}</p></div>}
            {groups.map(([category, list]) => (
              <section key={category}>
                <GroupTitle action={<span className="num text-[14px] text-label-3">{fmt(list.filter((s) => s.status !== 'Inactive').reduce((a, s) => a + monthlyAmount(priceOf(s), s.cycle), 0))}</span>}>{tCat(category)}</GroupTitle>
                <div className="grouped">
                  {list.map((s) => (
                    <button key={s.id} type="button" onClick={() => show({ kind: 'editor', id: s.id })} className={`row with-icon ${s.status === 'Inactive' ? 'opacity-50' : ''}`}>
                      <Glyph name={s.name} size={40} color={s.brandColor} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[17px] text-label">{s.name}</span>
                          {s.status !== 'Active' && <span className="rounded-full bg-[color-mix(in_srgb,var(--label)_7%,transparent)] px-2 py-0.5 text-[12px] font-medium text-label-2">{tStatus(s.status)}</span>}
                          {s.isShared && <span className="rounded-full bg-tint-soft px-2 py-0.5 text-[12px] font-medium text-tint">{t('subs.shared')}</span>}
                        </span>
                        <span className="block truncate text-[14px] text-label-3">{[s.plan, tCycle(s.cycle)].filter(Boolean).join(', ')}</span>
                      </span>
                      <span className="text-right">
                        <span className="num block text-[17px] text-label">{fmt(priceOf(s))}</span>
                        {s.status !== 'Inactive' && <span className="block text-[13px] text-label-3">{when(s.nextDate)}</span>}
                      </span>
                      <Chevron />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
