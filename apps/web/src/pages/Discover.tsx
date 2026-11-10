import { useMemo, useState } from 'react'
import { ExternalLink, Plus, Search } from 'lucide-react'
import { useApp } from '../core/store/app'
import { useCatalog } from '../core/store/catalog'
import { EXPLORE_CATALOG, EXPLORE_CATEGORY_ORDER, appCategoryFor, effectivePricing, exploreService, exploreStartPrice, localizedExplore } from '../core/data/explore'
import { formatMoney, isoInDays } from '../core/lib/format'
import { useI } from '../ui/strings'
import { Glyph, GroupTitle, PageHead, Segmented, Sheet, useOverlay } from '../ui/kit'

const CAT_TR: Record<string, string> = {
  Streaming: 'Dizi ve film', Music: 'Müzik', Design: 'Tasarım', AI: 'Yapay zekâ araçları', SaaS: 'Yazılım', Gaming: 'Oyun', Community: 'Topluluk', Shopping: 'Alışveriş', Turkish: 'Yerli platformlar',
}

export function Discover() {
  const { t, lang } = useI()
  const base = useApp((s) => s.settings.baseCurrency)
  const show = useOverlay((s) => s.show)
  useCatalog((s) => s.version)
  const [q, setQ] = useState('')
  const currency = base === 'TRY' || lang === 'tr' ? 'TRY' : base

  const groups = useMemo(() => {
    const k = q.trim().toLocaleLowerCase()
    return EXPLORE_CATEGORY_ORDER.map((c) => ({ ...c, items: EXPLORE_CATALOG.filter((s) => s.category === c.key && (!k || s.name.toLocaleLowerCase().includes(k))) })).filter((g) => g.items.length)
  }, [q])

  return (
    <div>
      <PageHead title={t('dis.title')} lede={t('dis.lede', { n: EXPLORE_CATALOG.length })} />
      <div className="mx-auto mt-12 max-w-[1040px] px-4 sm:px-6">
        <div className="relative mx-auto max-w-[560px]">
          <Search size={18} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
          <input className="field pl-11" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('dis.search')} aria-label={t('dis.search')} />
        </div>
        <div className="mt-12 space-y-12">
          {groups.length === 0 && <p className="text-center text-label-3">{t('dis.none')}</p>}
          {groups.map((g) => (
            <section key={g.key}>
              <GroupTitle>{lang === 'tr' ? CAT_TR[g.key] ?? g.label : g.label}</GroupTitle>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {g.items.map((s) => {
                  const p = exploreStartPrice(s, currency)
                  return (
                    <button key={s.name} type="button" onClick={() => show({ kind: 'service', name: s.name })}
                      className="card flex flex-col items-center gap-3 px-2 pb-4 pt-5 text-center transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                      <Glyph name={s.name} size={60} color={s.accent} />
                      <span className="w-full">
                        <span className="block truncate text-[14px] font-medium text-label">{s.name}</span>
                        <span className="num block text-[12.5px] text-label-3">{formatMoney(p.amount, p.currency)}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ServiceSheet() {
  const { open, close, show } = useOverlay()
  const { t, lang } = useI()
  useCatalog((s) => s.version)
  const [region, setRegion] = useState<'TR' | 'US'>(lang === 'tr' ? 'TR' : 'US')
  if (open?.kind !== 'service') return null
  const svc = exploreService(open.name)
  if (!svc) return null
  const tiers = effectivePricing(svc).regions[region]?.tiers ?? []
  const currency = region === 'TR' ? 'TRY' : 'USD'
  const text = localizedExplore(svc, lang)

  const track = (tier?: (typeof tiers)[number]) =>
    show({
      kind: 'editor',
      draft: {
        name: svc.name, category: appCategoryFor(svc.category), brandColor: svc.accent, currency,
        plan: tier ? (region === 'TR' && tier.nameLocalized ? tier.nameLocalized : tier.name) : '',
        price: tier?.price ?? 0, cycle: tier?.cycle ?? 'Monthly', nextDate: isoInDays(30),
      },
    })

  return (
    <Sheet title={svc.name} onClose={close} width={580}>
      <div className="flex flex-col items-center pb-6 pt-3 text-center">
        <Glyph name={svc.name} size={84} color={svc.accent} />
        <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.02em] text-label">{svc.name}</h3>
        <p className="mt-2 max-w-[30em] text-[15px] leading-relaxed text-label-2">{text.description[0]}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => track(tiers[0])} className="btn btn-filled"><Plus size={18} strokeWidth={2.4} />{t('dis.add')}</button>
          {svc.website && <a href={svc.website} target="_blank" rel="noreferrer" className="btn btn-gray"><ExternalLink size={16} strokeWidth={2} />{t('dis.site')}</a>}
        </div>
      </div>
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h4 className="text-[20px] font-semibold tracking-[-0.016em] text-label">{t('dis.tiers')}</h4>
        <Segmented label={t('dis.region')} value={region} onChange={setRegion} options={[{ value: 'TR', label: t('dis.tr') }, { value: 'US', label: t('dis.us') }]} />
      </div>
      <div className="grouped">
        {tiers.map((tier, i) => (
          <button key={tier.name + i} type="button" onClick={() => track(tier)} className="row">
            <span className="flex-1 text-[17px] text-label">{region === 'TR' && tier.nameLocalized ? tier.nameLocalized : tier.name}</span>
            <span className="num text-[17px] text-label-2">{formatMoney(tier.price, currency)}</span>
            <Plus size={18} strokeWidth={2.4} className="text-tint" aria-label={t('dis.add')} />
          </button>
        ))}
      </div>
    </Sheet>
  )
}
