import { Capacitor, registerPlugin } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { StateStorage } from 'zustand/middleware'
import type { AppSettings, Subscription } from '../types'
import { computeTotals, upcoming } from './derive'
import { subEffectivePrice } from './pricing'
import { formatMoney, shortDate } from './format'
import { tStatic, type Lang } from './i18n'

// Platform layer: the same UI runs on the web, in the Mac shell and in the Android shell.
export const isNative = Capacitor.isNativePlatform()

/** Durable storage on phones (native preferences survive WebView storage eviction). */
export const appStorage: StateStorage = isNative
  ? {
      getItem: async (k) => (await Preferences.get({ key: k })).value ?? null,
      setItem: async (k, v) => void (await Preferences.set({ key: k, value: v })),
      removeItem: async (k) => void (await Preferences.remove({ key: k })),
    }
  : {
      getItem: (k) => localStorage.getItem(k),
      setItem: (k, v) => localStorage.setItem(k, v),
      removeItem: (k) => localStorage.removeItem(k),
    }

interface FirebaseAuthPlugin {
  signInWithGoogle(): Promise<{ credential?: { idToken?: string } | null }>
  signOut(): Promise<void>
}
const NativeAuth = registerPlugin<FirebaseAuthPlugin>('FirebaseAuthentication')

/** Native Google account picker; returns the ID token for the Firebase JS SDK. */
export async function nativeGoogleIdToken(): Promise<string> {
  const res = await NativeAuth.signInWithGoogle()
  const token = res.credential?.idToken
  if (!token) throw Object.assign(new Error('no-id-token'), { code: 'auth/popup-closed-by-user' })
  return token
}

export const nativeSignOut = () => (isNative ? NativeAuth.signOut().catch(() => {}) : Promise.resolve())

/**
 * Snapshot for the Android home-screen widget (SubSenseWidget.java reads the
 * "subsense.widget" key from Capacitor's SharedPreferences). Strings arrive pre-formatted.
 */
export async function publishWidgetData(subs: Subscription[], settings: AppSettings, rates: Record<string, number>): Promise<void> {
  if (!isNative) return
  const lang: Lang = settings.language === 'tr' ? 'tr' : 'en'
  const base = settings.baseCurrency
  const next = upcoming(subs, 90)[0]
  const payload = {
    hasData: subs.some((s) => s.status !== 'Inactive'),
    monthlyLabel: tStatic(lang, 'widget.monthly'),
    monthlyText: formatMoney(computeTotals(subs, base, rates).monthly, base),
    nextLabel: tStatic(lang, 'widget.next'),
    nextName: next?.name ?? '',
    nextAmountText: next ? formatMoney(subEffectivePrice(next, base, rates), base) : '',
    nextDateText: next ? shortDate(next.nextDate) : '',
    emptyText: tStatic(lang, 'widget.empty'),
    updatedAt: Date.now(),
  }
  await Preferences.set({ key: 'subsense.widget', value: JSON.stringify(payload) }).catch(() => {})
}

// ── Mac shell (Tauri) ───────────────────────────────────────────────────────
export const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/** Menu bar text next to the SubSense icon. */
export async function setTrayTitle(title: string): Promise<void> {
  if (!isDesktop) return
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('set_tray_title', { title }).catch(() => {})
}

/** Native macOS notification (WKWebView has no web Notification API). */
export async function desktopNotify(title: string, body: string): Promise<boolean> {
  const n = await import('@tauri-apps/plugin-notification')
  let ok = await n.isPermissionGranted()
  if (!ok) ok = (await n.requestPermission()) === 'granted'
  if (ok) n.sendNotification({ title, body })
  return ok
}

// ── Mac Google sign-in: system browser + PKCE + app URL scheme (no client secret) ──
const MAC_GOOGLE_CLIENT = '648156139284-j203dop1rb5sqb2d5gevr14frn1c5bn0.apps.googleusercontent.com'
const MAC_REDIRECT = `com.googleusercontent.apps.${MAC_GOOGLE_CLIENT.split('.')[0]}:/oauth2redirect`

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/** RFC 7636 verifier + S256 challenge. */
export async function pkcePair(): Promise<{ verifier: string; challenge: string }> {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)))
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  return { verifier, challenge: b64url(digest) }
}

/** Opens Google in the default browser and resolves with an ID token for Firebase. */
export async function desktopGoogleIdToken(): Promise<string> {
  const [{ onOpenUrl }, { openUrl }, { fetch: tauriFetch }] = await Promise.all([
    import('@tauri-apps/plugin-deep-link'),
    import('@tauri-apps/plugin-opener'),
    import('@tauri-apps/plugin-http'),
  ])
  const { verifier, challenge } = await pkcePair()
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)))
  const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  for (const [k, v] of Object.entries({ client_id: MAC_GOOGLE_CLIENT, redirect_uri: MAC_REDIRECT, response_type: 'code', scope: 'openid email profile', code_challenge: challenge, code_challenge_method: 'S256', state, prompt: 'select_account' })) auth.searchParams.set(k, v)

  const code = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'auth/popup-closed-by-user' })), 5 * 60_000)
    void onOpenUrl((urls) => {
      const hit = urls.map((u) => new URL(u)).find((u) => u.searchParams.get('state') === state)
      if (!hit) return
      clearTimeout(timer)
      const c = hit.searchParams.get('code')
      if (c) resolve(c)
      else reject(Object.assign(new Error('denied'), { code: 'auth/popup-closed-by-user' }))
    })
    void openUrl(auth.toString()).catch(reject)
  })

  const res = await tauriFetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: MAC_GOOGLE_CLIENT, redirect_uri: MAC_REDIRECT, grant_type: 'authorization_code', code_verifier: verifier }).toString(),
  })
  const json = (await res.json()) as { id_token?: string; error?: string }
  if (!json.id_token) throw Object.assign(new Error(json.error ?? 'token-exchange-failed'), { code: 'auth/network-request-failed' })
  return json.id_token
}
