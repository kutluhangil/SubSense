import { useMemo, useState, type ReactNode } from 'react'
import { Check, Search } from 'lucide-react'
import { useApp, type NewSub } from '../core/store/app'
import { EXPLORE_CATALOG, appCategoryFor, effectivePricing, type ExploreService } from '../core/data/explore'
import { CATALOG, CATEGORIES } from '../core/data/catalog'
import { CURRENCIES } from '../core/data/currencies'
import { formatMoney, isoInDays, parseDate } from '../core/lib/format'
import type { Category, Cycle, SubStatus } from '../core/types'
import { useI } from '../ui/strings'
import { Chevron, Glyph, Segmented, Sheet, Switch, useOverlay } from '../ui/kit'

type Service = { name: string; category: Category; color?: string; explore?: ExploreService }

/** Every known service once: Explore entries (with regional plans) first, then the add-flow list. */
const SERVICES: Service[] = (() => {
  const seen = new Set(EXPLORE_CATALOG.map((s) => s.name.toLowerCase()))
  return [
    ...EXPLORE_CATALOG.map((s) => ({ name: s.name, category: appCategoryFor(s.category), color: s.accent, explore: s })),
    ...CATALOG.filter((c) => !seen.has(c.name.toLowerCase())).map((c) => ({ name: c.name, category: c.category, color: c.brandColor })),
  ]
})()

const blank = (currency: string): NewSub => ({ name: '', plan: '', price: 0, currency, cycle: 'Monthly', nextDate: isoInDays(30), category: 'Entertainment', status: 'Active', reminderEnabled: true })

export function Editor() {
  const { open, close } = useOverlay()
  if (open?.kind !== 'editor') return null
  return <EditorSheet key={open.id ?? 'new'} id={open.id} draft={open.draft} onClose={close} />
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="row">
      <span className="shrink-0 text-[17px] text-label">{label}</span>
      <span className="flex min-w-0 flex-1 items-center justify-end gap-2">{children}</span>
      {error && <span className="absolute bottom-1 right-[18px] text-[12px] text-red">{error}</span>}
    </label>
  )
}

function EditorSheet({ id, draft, onClose }: { id?: string; draft?: Partial<NewSub>; onClose: () => void }) {
  const { t, tCat, tStatus, tCycle, lang } = useI()
  const base = useApp((s) => s.settings.baseCurrency)
  const existing = useApp((s) => s.subscriptions.find((x) => x.id === id))
  const { addSubscription, updateSubscription, removeSubscription, markPaid } = useApp()
  const preferred = base === 'TRY' || lang === 'tr' ? 'TRY' : base
  const [form, setForm] = useState<NewSub>(() => (existing ? { ...existing } : { ...blank(preferred), ...draft }))
  const [query, setQuery] = useState('')
  const [picking, setPicking] = useState(!existing && !draft?.name)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = <K extends keyof NewSub>(k: K, v: NewSub[K]) => setForm((f) => ({ ...f, [k]: v }))

  const service = SERVICES.find((s) => s.name.toLowerCase() === form.name.trim().toLowerCase())
  const region = form.currency === 'TRY' ? 'TR' : 'US'
  const tierCurrency = region === 'TR' ? 'TRY' : 'USD'
  const tiers = service?.explore ? effectivePricing(service.explore).regions[region]?.tiers ?? [] : []

  const matches = useMemo(() => {
    const k = query.trim().toLocaleLowerCase()
    return (k ? SERVICES.filter((s) => s.name.toLocaleLowerCase().includes(k)) : SERVICES).slice(0, 14)
  }, [query])

  const pickService = (s: Service) => {
    const first = s.explore ? effectivePricing(s.explore).regions[preferred === 'TRY' ? 'TR' : 'US']?.tiers?.[0] : undefined
    setForm((f) => ({
      ...f, name: s.name, category: s.category, brandColor: s.color,
      ...(first ? { plan: preferred === 'TRY' && first.nameLocalized ? first.nameLocalized : first.name, price: first.price, currency: preferred === 'TRY' ? 'TRY' : 'USD', cycle: first.cycle ?? 'Monthly' } : {}),
    }))
    setPicking(false)
  }

  const save = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = t('ed.errName')
    if (!(form.price >= 0)) e.price = t('ed.errPrice')
    if (!parseDate(form.nextDate)) e.nextDate = t('ed.errDate')
    setErrors(e)
    if (Object.keys(e).length) return
    const clean: NewSub = {
      ...form,
      name: form.name.trim().slice(0, 80),
      plan: (form.plan ?? '').trim().slice(0, 60),
      notes: form.notes?.trim().slice(0, 500) || undefined,
      paymentMethod: form.paymentMethod?.trim().slice(0, 40) || undefined,
      trialEndDate: form.status === 'Trial' ? form.trialEndDate : undefined,
      myShare: form.isShared ? form.myShare : undefined,
      billingDay: parseDate(form.nextDate)!.getDate(),
    }
    if (existing) updateSubscription(existing.id, clean)
    else addSubscription(clean)
    onClose()
  }

  if (picking) {
    return (
      <Sheet title={t('ed.add')} onClose={onClose}>
        <div className="relative mt-2">
          <Search size={18} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
          <input data-autofocus className="field pl-11" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('ed.findPh')} aria-label={t('ed.find')} />
        </div>
        <div className="grouped mt-4">
          {query.trim() && (
            <button type="button" onClick={() => (set('name', query.trim()), setPicking(false))} className="row text-tint">
              {t('ed.custom', { q: query.trim() })}
            </button>
          )}
          {matches.map((s) => (
            <button key={s.name} type="button" onClick={() => pickService(s)} className="row with-icon">
              <Glyph name={s.name} size={36} color={s.color} />
              <span className="flex-1 text-[17px] text-label">{s.name}</span>
              <span className="text-[15px] text-label-3">{tCat(s.category)}</span>
              <Chevron />
            </button>
          ))}
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title={existing ? t('ed.edit') : t('ed.add')} onClose={onClose} width={580} primary={{ label: existing ? t('ed.save') : t('ed.addShort'), onClick: save }}>
      <div className="flex flex-col items-center pb-5 pt-3 text-center">
        <Glyph name={form.name || '?'} size={76} color={form.brandColor} />
        <input className="mt-4 w-full bg-transparent text-center text-[28px] font-semibold tracking-[-0.02em] text-label outline-none placeholder:text-label-3"
          value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('ed.name')} aria-label={t('ed.name')} />
        {errors.name && <p className="text-[13px] text-red">{errors.name}</p>}
        {!existing && <button type="button" onClick={() => setPicking(true)} className="mt-1 text-[15px] text-tint">{t('ed.find')}</button>}
      </div>

      {tiers.length > 0 && (
        <>
          <p className="mb-2 px-4 text-[13px] text-label-3">{t('ed.planPick')}</p>
          <div className="grouped mb-6">
            {tiers.map((tier) => {
              const label = region === 'TR' && tier.nameLocalized ? tier.nameLocalized : tier.name
              const on = form.plan === label && form.price === tier.price
              return (
                <button key={tier.name + tier.price} type="button" aria-pressed={on} className="row"
                  onClick={() => setForm((f) => ({ ...f, plan: label, price: tier.price, currency: tierCurrency, cycle: tier.cycle ?? 'Monthly' }))}>
                  <span className="flex-1 text-[17px] text-label">{label}</span>
                  <span className="num text-[17px] text-label-2">{formatMoney(tier.price, tierCurrency)}</span>
                  <span className="w-5">{on && <Check size={19} strokeWidth={2.6} className="text-tint" />}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className="grouped mb-6">
        <Field label={t('ed.plan')}><input className="inline-field w-full" value={form.plan ?? ''} onChange={(e) => set('plan', e.target.value)} placeholder="Standard" /></Field>
        <Field label={t('ed.price')} error={errors.price}>
          <input className="inline-field num w-28" type="number" inputMode="decimal" min={0} step="0.01" value={Number.isFinite(form.price) ? form.price : ''} onChange={(e) => set('price', e.target.valueAsNumber)} />
          <select className="inline-field cursor-pointer appearance-none text-tint" value={form.currency} onChange={(e) => set('currency', e.target.value)} aria-label={t('ed.currency')}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
        </Field>
        <div className="row">
          <span className="flex-1 text-[17px] text-label">{t('ed.cycle')}</span>
          <Segmented<Cycle> label={t('ed.cycle')} value={form.cycle} onChange={(v) => set('cycle', v)} options={(['Monthly', 'Yearly'] as Cycle[]).map((c) => ({ value: c, label: tCycle(c) }))} />
        </div>
        <Field label={t('ed.next')} error={errors.nextDate}><input className="inline-field" type="date" value={form.nextDate} onChange={(e) => set('nextDate', e.target.value)} /></Field>
        <Field label={t('ed.category')}>
          <select className="inline-field cursor-pointer appearance-none" value={form.category} onChange={(e) => set('category', e.target.value as Category)}>
            {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{tCat(c.name)}</option>)}
          </select>
        </Field>
        <div className="row">
          <span className="flex-1 text-[17px] text-label">{t('ed.status')}</span>
          <Segmented<SubStatus> label={t('ed.status')} value={form.status === 'Expiring' ? 'Active' : form.status} onChange={(v) => set('status', v)}
            options={(['Active', 'Trial', 'Inactive'] as SubStatus[]).map((s) => ({ value: s, label: tStatus(s) }))} />
        </div>
        {form.status === 'Trial' && <Field label={t('ed.trialEnd')}><input className="inline-field" type="date" value={form.trialEndDate ?? ''} onChange={(e) => set('trialEndDate', e.target.value || undefined)} /></Field>}
      </div>

      <div className="grouped mb-6">
        <div className="row"><span className="flex-1 text-[17px] text-label">{t('ed.remind')}</span><Switch checked={form.reminderEnabled !== false} onChange={(v) => set('reminderEnabled', v)} label={t('ed.remind')} /></div>
        <div className="row"><span className="flex-1 text-[17px] text-label">{t('ed.shared')}</span><Switch checked={Boolean(form.isShared)} onChange={(v) => set('isShared', v)} label={t('ed.shared')} /></div>
        {form.isShared && (
          <Field label={t('ed.myShare')}>
            <input className="inline-field num w-28" type="number" min={0} step="0.01" value={form.myShare ?? ''} onChange={(e) => set('myShare', Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : undefined)} />
            <span className="text-[17px] text-label-3">{form.currency}</span>
          </Field>
        )}
      </div>

      <div className="grouped mb-6">
        <Field label={t('ed.payment')}><input className="inline-field w-full" value={form.paymentMethod ?? ''} placeholder={t('ed.paymentPh')} onChange={(e) => set('paymentMethod', e.target.value)} /></Field>
        <label className="row items-start">
          <span className="sr-only">{t('ed.notes')}</span>
          <textarea className="min-h-[72px] w-full resize-none bg-transparent text-[17px] text-label outline-none placeholder:text-label-3" placeholder={t('ed.notes')} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
        </label>
      </div>

      {existing && (
        <div className="grouped">
          <button type="button" className="row justify-center text-tint" onClick={() => (markPaid(existing.id), onClose())}>{t('ed.paid')}</button>
          {confirmDelete ? (
            <div className="row flex-col items-stretch gap-3 py-4 text-center">
              <p className="text-[15px] text-label-2">{t('ed.deleteConfirm', { name: existing.name })}</p>
              <div className="flex justify-center gap-3">
                <button type="button" className="btn btn-gray" onClick={() => setConfirmDelete(false)}>{t('ed.cancel')}</button>
                <button type="button" className="btn btn-destructive" onClick={() => (removeSubscription(existing.id), onClose())}>{t('ed.deleteYes')}</button>
              </div>
            </div>
          ) : (
            <button type="button" className="row justify-center text-red" onClick={() => setConfirmDelete(true)}>{t('ed.delete')}</button>
          )}
        </div>
      )}
    </Sheet>
  )
}
