import { useEffect } from 'react'
import { useApp } from './core/store/app'
import { useCloud } from './core/lib/cloud'
import { useRates } from './core/store/rates'
import { useCatalog } from './core/store/catalog'
import { detectPriceChanges } from './core/lib/priceWatch'
import { notifyPriceChanges, syncRenewalNotifications } from './core/lib/notifications'
import { isDesktop, isNative, publishWidgetData, setTrayTitle } from './core/lib/native'
import { computeTotals, upcoming } from './core/lib/derive'
import { formatMoney } from './core/lib/format'
import { App as NativeApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Footer, MobileNav, Palette, TopBar } from './ui/chrome'
import { go, useOverlay, useRoute, useThemeEffect } from './ui/kit'
import { Landing } from './pages/Landing'
import { Overview } from './pages/Overview'
import { Subscriptions } from './pages/Subscriptions'
import { Calendar } from './pages/Calendar'
import { Insights } from './pages/Insights'
import { Discover, ServiceSheet } from './pages/Discover'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'
import { Legal } from './pages/Legal'
import { Editor } from './pages/Editor'

const PUBLIC = new Set(['home', 'auth', 'privacy', 'deletion'])

export default function App() {
  useThemeEffect()
  const { page } = useRoute()
  const onboarded = useApp((s) => s.auth.onboarded)
  const uid = useCloud((s) => s.uid)
  const subs = useApp((s) => s.subscriptions)
  const settings = useApp((s) => s.settings)
  const rates = useRates((s) => s.rates)
  const catalogVersion = useCatalog((s) => s.version)
  const show = useOverlay((s) => s.show)
  const inApp = Boolean(uid || onboarded || isDesktop)

  // Signed-in or guest users skip the landing page; strangers can't open app pages.
  useEffect(() => {
    if (page === 'home' && inApp) go('overview')
    if (!PUBLIC.has(page) && !inApp) go('home')
  }, [page, inApp])

  useEffect(() => {
    scrollTo(0, 0)
  }, [page])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!inApp || !(e.metaKey || e.ctrlKey)) return
      const typing = (e.target as HTMLElement)?.closest('input, textarea, select')
      if (e.key.toLowerCase() === 'k') (e.preventDefault(), show({ kind: 'palette' }))
      if (e.key.toLowerCase() === 'n' && !typing) (e.preventDefault(), show({ kind: 'editor' }))
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [inApp, show])

  // Price watch + renewal reminders, once data and the catalog are loaded.
  useEffect(() => {
    if (!inApp || !subs.length) return
    const { priceSnapshot, recordPriceCheck } = useApp.getState()
    const { changes, snapshot } = detectPriceChanges(subs, priceSnapshot)
    recordPriceCheck(changes, snapshot)
    void notifyPriceChanges(changes, settings, rates)
    void syncRenewalNotifications(subs, settings, rates)
  }, [inApp, subs.length, catalogVersion])

  // Android shell: home-screen widget, status bar colors and the hardware back button.
  useEffect(() => {
    if (isNative) void publishWidgetData(subs, settings, rates)
  }, [subs, settings, rates])

  // Mac shell: this month's total and the next renewal in the menu bar.
  useEffect(() => {
    if (!isDesktop) return
    const base = settings.baseCurrency
    const total = formatMoney(computeTotals(subs, base, rates).monthly, base, { decimals: 0 })
    const next = upcoming(subs, 7)[0]
    void setTrayTitle(next ? `${total} · ${next.name}` : total)
  }, [subs, settings, rates])

  const dark = useApp((s) => s.settings.appearance)
  useEffect(() => {
    if (!isNative) return
    const isDark = document.documentElement.dataset.theme === 'dark'
    void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {})
    void StatusBar.setBackgroundColor({ color: isDark ? '#0d0e12' : '#fbf9fe' }).catch(() => {})
  }, [dark])

  useEffect(() => {
    if (!isNative) return
    const sub = NativeApp.addListener('backButton', () => {
      const overlay = useOverlay.getState()
      if (overlay.open) overlay.close()
      else if (location.hash.startsWith('#/overview') || location.hash === '' || location.hash === '#/home') void NativeApp.exitApp()
      else history.back()
    })
    return () => void sub.then((h) => h.remove())
  }, [])

  const showApp = inApp && !PUBLIC.has(page)
  return (
    <div className="flex min-h-dvh flex-col text-label">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded-full focus:bg-tint focus:px-4 focus:py-2 focus:text-on-tint">Skip to content</a>
      <TopBar page={page} inApp={inApp} />
      <main id="main" className="flex-1">
        {page === 'home' && !inApp && <Landing />}
        {page === 'auth' && <Auth />}
        {page === 'privacy' && <Legal kind="privacy" />}
        {page === 'deletion' && <Legal kind="deletion" />}
        {showApp && page === 'overview' && <Overview />}
        {showApp && page === 'subs' && <Subscriptions />}
        {showApp && page === 'calendar' && <Calendar />}
        {showApp && page === 'insights' && <Insights />}
        {showApp && page === 'discover' && <Discover />}
        {showApp && page === 'settings' && <Settings />}
      </main>
      {page !== 'auth' && <Footer />}
      {showApp && <MobileNav page={page} />}
      <Editor />
      <ServiceSheet />
      <Palette />
    </div>
  )
}
