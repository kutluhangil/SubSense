import { useState, type ReactNode } from 'react'
import { Bell, Download, FileText, Globe, Link2, LogOut, Moon, ShieldCheck, Trash2, Upload, UserRound, Wallet } from 'lucide-react'
import { useApp } from '../core/store/app'
import { useCloud, deleteAccount, linkGoogle, signOutCloud } from '../core/lib/cloud'
import { buildBackup, exportBackup, parseBackup, pickBackupFile } from '../core/lib/backup'
import { CURRENCIES } from '../core/data/currencies'
import type { Appearance, Subscription } from '../core/types'
import { useI } from '../ui/strings'
import { Chevron, PageHead, Segmented, Switch } from '../ui/kit'

function Icon({ bg, children }: { bg: string; children: ReactNode }) {
  return <span className="grid size-[30px] shrink-0 place-items-center rounded-[8px] text-white" style={{ background: bg }}>{children}</span>
}

function Section({ title, foot, children }: { title?: string; foot?: string; children: ReactNode }) {
  return (
    <section>
      {title && <p className="mb-1.5 px-4 text-[13px] text-label-3">{title}</p>}
      <div className="grouped">{children}</div>
      {foot && <p className="mt-1.5 px-4 text-[13px] leading-snug text-label-3">{foot}</p>}
    </section>
  )
}

const toCsv = (subs: Subscription[]) => {
  const cols = ['name', 'plan', 'price', 'currency', 'cycle', 'nextDate', 'category', 'status'] as const
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [cols.join(','), ...subs.map((s) => cols.map((c) => esc(s[c])).join(','))].join('\n')
}

function download(name: string, text: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function Settings() {
  const { t, lang, err } = useI()
  const { settings, subscriptions, setSetting, importData, loadSampleData, clearAll } = useApp()
  const cloud = useCloud()
  const [note, setNote] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const hasPassword = cloud.providers.includes('password')
  const ic = { size: 17, strokeWidth: 2.2 }

  const doImport = async () => {
    const text = await pickBackupFile()
    if (!text) return
    try {
      const parsed = parseBackup(text)
      const byId = new Map(subscriptions.map((s) => [s.id, s]))
      for (const s of parsed.subscriptions) byId.set(s.id, { ...s, updatedAt: Date.now() })
      importData({ subscriptions: [...byId.values()], settings: parsed.settings })
      setNote(t('set.imported', { n: parsed.subscriptions.length }))
    } catch {
      setNote(t('set.importBad'))
    }
  }

  const doDelete = async () => {
    setBusy(true)
    setNote(null)
    try {
      await deleteAccount(password || undefined)
      location.hash = '/'
    } catch (e) {
      setNote(err(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHead title={t('set.title')} />
      <div className="mx-auto mt-12 max-w-[640px] space-y-8 px-4 sm:px-6">
        {note && <p role="status" className="rounded-[14px] bg-tint-soft px-4 py-3 text-center text-[15px] text-label">{note}</p>}

        <Section title={t('set.account')} foot={cloud.uid ? undefined : t('set.local')}>
          {cloud.uid ? (
            <>
              <div className="row with-icon">
                <Icon bg="linear-gradient(160deg,#6264ef,#2f2ebe)"><UserRound {...ic} /></Icon>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] text-label">{cloud.name || cloud.email}</span>
                  <span className="block truncate text-[13px] text-label-3">{t('set.signedAs', { email: cloud.email ?? '' })}</span>
                </span>
              </div>
              {!cloud.providers.includes('google.com') && (
                <button type="button" className="row with-icon" onClick={() => linkGoogle().catch((e) => setNote(err(e)))}>
                  <Icon bg="#34a853"><Link2 {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.linkGoogle')}</span><Chevron />
                </button>
              )}
              <button type="button" className="row with-icon" onClick={() => signOutCloud().then(() => (location.hash = '/'))}>
                <Icon bg="#8e8d99"><LogOut {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.signOut')}</span>
              </button>
            </>
          ) : (
            <a href="#/auth" className="row with-icon">
              <Icon bg="linear-gradient(160deg,#6264ef,#2f2ebe)"><UserRound {...ic} /></Icon><span className="flex-1 text-[17px] text-tint">{t('set.signIn')}</span><Chevron />
            </a>
          )}
        </Section>

        <Section title={t('set.look')}>
          <div className="row with-icon">
            <Icon bg="#3a3a52"><Moon {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.theme')}</span>
            <Segmented<Appearance> label={t('set.theme')} value={settings.appearance} onChange={(v) => setSetting('appearance', v)}
              options={[{ value: 'light', label: t('set.light') }, { value: 'dark', label: t('set.dark') }, { value: 'system', label: t('set.system') }]} />
          </div>
          <div className="row with-icon">
            <Icon bg="#0a84ff"><Globe {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.language')}</span>
            <Segmented label={t('set.language')} value={lang} onChange={(v) => setSetting('language', v)} options={[{ value: 'tr', label: 'Türkçe' }, { value: 'en', label: 'English' }]} />
          </div>
          <label className="row with-icon">
            <Icon bg="#22a35a"><Wallet {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.currency')}</span>
            <select className="inline-field cursor-pointer appearance-none" value={settings.baseCurrency} onChange={(e) => setSetting('baseCurrency', e.target.value)}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <Chevron />
          </label>
        </Section>

        <Section title={t('set.notify')}>
          <div className="row with-icon">
            <Icon bg="#e5383b"><Bell {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.notifyOn')}</span>
            <Switch checked={settings.notificationsEnabled && settings.renewalAlerts} label={t('set.notifyOn')}
              onChange={(v) => (setSetting('notificationsEnabled', v), setSetting('renewalAlerts', v), v && typeof Notification !== 'undefined' && Notification.requestPermission())} />
          </div>
        </Section>

        <Section title={t('set.data')} foot={cloud.uid ? t('set.clearSigned') : undefined}>
          <button type="button" className="row with-icon" onClick={() => exportBackup(buildBackup(subscriptions, settings))}>
            <Icon bg="#0a84ff"><Download {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.export')}</span><Chevron />
          </button>
          <button type="button" className="row with-icon" onClick={() => download(`subsense-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(subscriptions))}>
            <Icon bg="#22a35a"><FileText {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.exportCsv')}</span><Chevron />
          </button>
          <button type="button" className="row with-icon" onClick={doImport}>
            <Icon bg="#e8830c"><Upload {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.import')}</span><Chevron />
          </button>
          {!cloud.uid && (
            <>
              <button type="button" className="row text-tint" onClick={loadSampleData}>{t('set.sample')}</button>
              <button type="button" className="row text-red" onClick={() => window.confirm(t('set.clearText')) && clearAll()}>{t('set.clear')}</button>
            </>
          )}
        </Section>

        <Section title={t('set.about')}>
          <a href="#/privacy" className="row with-icon"><Icon bg="#5b5a66"><ShieldCheck {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.privacy')}</span><Chevron /></a>
          <a href="#/deletion" className="row with-icon"><Icon bg="#5b5a66"><Trash2 {...ic} /></Icon><span className="flex-1 text-[17px] text-label">{t('set.deletion')}</span><Chevron /></a>
          <div className="row"><span className="flex-1 text-[17px] text-label">{t('set.versionLabel')}</span><span className="text-[17px] text-label-3">{__APP_VERSION__}</span></div>
        </Section>

        {cloud.uid && (
          <Section foot={t('set.deleteText')}>
            {deleting ? (
              <div className="row flex-col items-stretch gap-3 py-4">
                {hasPassword && <input className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('set.deletePw')} aria-label={t('set.deletePw')} />}
                <div className="flex justify-center gap-3">
                  <button type="button" className="btn btn-gray" onClick={() => setDeleting(false)}>{t('ed.cancel')}</button>
                  <button type="button" className="btn btn-destructive" disabled={busy || (hasPassword && !password)} onClick={doDelete}>{t('set.deleteYes')}</button>
                </div>
              </div>
            ) : (
              <button type="button" className="row justify-center text-red" onClick={() => setDeleting(true)}>{t('set.delete')}</button>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}
