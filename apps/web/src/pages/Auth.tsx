import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useApp } from '../core/store/app'
import { appleSignInEnabled, googleSignInEnabled, resetPassword, signInWithApple, signInWithEmail, signInWithGoogle, signUpWithEmail, useCloud } from '../core/lib/cloud'
import { useI } from '../ui/strings'
import { Mark, go } from '../ui/kit'
import { GlowCard } from '../ui/spotlight-card'

/** The sign-in screen as its own page. */
export function Auth() {
  return (
    <div className="rise mx-auto max-w-[480px] px-5 pb-10 pt-28 sm:pt-36">
      <GlowCard glowColor="purple" className="p-6 sm:p-9"><AuthForm /></GlowCard>
    </div>
  )
}

/** Sign in, sign up, reset and guest entry. Shared by the auth page and the landing page. */
export function AuthForm() {
  const { t, err } = useI()
  const completeOnboarding = useApp((s) => s.completeOnboarding)
  const uid = useCloud((s) => s.uid)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(null)

  useEffect(() => {
    if (uid) go('overview')
  }, [uid])
  if (uid) return null

  const done = () => (completeOnboarding(), go('overview'))
  const attempt = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setMsg(null)
    try {
      await fn()
      done()
    } catch (e) {
      setMsg({ text: err(e) })
    } finally {
      setBusy(false)
    }
  }
  const forgot = async () => {
    if (!email.trim()) return setMsg({ text: t('err.auth/invalid-email') })
    try {
      await resetPassword(email)
      setMsg({ text: t('auth.resetSent'), ok: true })
    } catch (e) {
      setMsg({ text: err(e) })
    }
  }

  return (
    <div className="relative text-center">
      <div className="flex justify-center drop-shadow-[0_12px_30px_rgba(73,75,214,.35)]"><Mark size={64} /></div>
      <h2 className="mt-6 text-[30px] font-bold leading-tight tracking-[-0.026em] text-label">{mode === 'in' ? t('auth.title') : t('auth.titleUp')}</h2>
      <p className="t-subhead mx-auto mt-3 max-w-[24em] !text-[17px]">{t('auth.lede')}</p>

      <div className="mt-8" />
      {googleSignInEnabled && <button type="button" disabled={busy} onClick={() => attempt(signInWithGoogle)} className="btn min-h-[50px] w-full bg-cell text-label shadow-[0_0_0_.5px_var(--sep),0_2px_8px_rgba(0,0,0,.05)]">
        <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
        {t('auth.google')}
      </button>}
      {appleSignInEnabled && (
        <button type="button" disabled={busy} onClick={() => attempt(signInWithApple)} className="btn btn-ink mt-3 min-h-[50px] w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.05 12.54c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.84 0-2.14-.96-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.26-.48 8.09 1.35 10.74.9 1.3 1.96 2.75 3.36 2.7 1.35-.05 1.86-.87 3.49-.87 1.63 0 2.09.87 3.52.84 1.45-.03 2.37-1.32 3.26-2.62 1.03-1.5 1.45-2.96 1.48-3.03-.03-.02-2.83-1.09-2.85-4.31ZM14.37 4.6c.74-.9 1.24-2.15 1.1-3.4-1.07.04-2.36.71-3.13 1.61-.69.8-1.29 2.07-1.13 3.3 1.19.09 2.41-.61 3.16-1.51Z"/></svg>
          {t('auth.apple')}
        </button>
      )}

      {(googleSignInEnabled || appleSignInEnabled) && <div className="my-6 flex items-center gap-3 text-[13px] text-label-3"><span className="h-px flex-1 bg-sep" />{t('auth.or')}<span className="h-px flex-1 bg-sep" /></div>}

      <form onSubmit={(e) => (e.preventDefault(), void attempt(() => (mode === 'in' ? signInWithEmail(email, password) : signUpWithEmail(name, email, password))))} className="text-left">
        <div className="grouped">
          {mode === 'up' && <label className="row"><span className="sr-only">{t('auth.name')}</span><input className="w-full bg-transparent text-[17px] text-label outline-none placeholder:text-label-3" placeholder={t('auth.name')} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>}
          <label className="row"><span className="sr-only">{t('auth.email')}</span><input className="w-full bg-transparent text-[17px] text-label outline-none placeholder:text-label-3" placeholder={t('auth.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="row"><span className="sr-only">{t('auth.password')}</span><input className="w-full bg-transparent text-[17px] text-label outline-none placeholder:text-label-3" placeholder={t('auth.password')} type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        </div>
        {msg && <p role="alert" className={`mt-3 px-1 text-center text-[14px] ${msg.ok ? 'text-green' : 'text-red'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="btn btn-filled mt-5 min-h-[50px] w-full font-semibold">{mode === 'in' ? t('auth.signIn') : t('auth.signUp')}</button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-[15px]">
        {mode === 'in' && <button type="button" onClick={forgot} className="text-tint">{t('auth.forgot')}</button>}
        <button type="button" onClick={() => (setMode(mode === 'in' ? 'up' : 'in'), setMsg(null))} className="text-label-2 hover:text-label">{mode === 'in' ? t('auth.toUp') : t('auth.toIn')}</button>
        <button type="button" onClick={done} className="mt-3 inline-flex items-center text-label-3 hover:text-label">{t('auth.guest')}<ChevronRight size={16} strokeWidth={2.2} /></button>
      </div>
    </div>
  )
}
