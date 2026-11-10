import { daysUntil, parseDate } from '../core/lib/format'

const locale = (lang: string) => (lang === 'tr' ? 'tr-TR' : 'en-US')

export function fmtDate(iso: string, lang: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }): string {
  const d = parseDate(iso)
  return d ? new Intl.DateTimeFormat(locale(lang), opts).format(d) : iso
}

/** "today", "tomorrow", "in 4 days" or a date, in the UI language. */
export function relWhen(iso: string, lang: string): string {
  const n = daysUntil(iso)
  if (Math.abs(n) <= 6) return new Intl.RelativeTimeFormat(locale(lang), { numeric: 'auto' }).format(n, 'day')
  return fmtDate(iso, lang)
}

export function monthName(year: number, month: number, lang: string, withYear = false): string {
  return new Intl.DateTimeFormat(locale(lang), { month: 'long', ...(withYear ? { year: 'numeric' } : {}) }).format(new Date(year, month, 1))
}
