import { useEffect, useMemo, useRef, useState } from 'react'
import { logoFor } from '../core/lib/logos'
import type { Charge } from './kit'

interface Props {
  charges: Charge[]
  year: number
  month: number
  monthLabel: string
  amount: number
  format: (n: number) => string
  label: string
  foot?: string
  emptyHint?: string
  onPick?: (id: string) => void
  onEmpty?: () => void
}

const SIZE = 600
const C = SIZE / 2
const R = 214
const ARC = 150
const GHOSTS = ['Netflix', 'Spotify', 'YouTube Premium', 'Disney+', 'ChatGPT Plus']

/** Animates a number from 0 to `target` (ease-out), restarting when the target changes. */
function useCountUp(target: number, ms = 1100) {
  const [v, setV] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setV(target)
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (t: number) => {
      const p = Math.min((t - start) / ms, 1)
      const val = a + (target - a) * (1 - Math.pow(1 - p, 3))
      setV(val)
      from.current = val
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

/**
 * The month as a dial (the site's specimen): day 1 at the top, days clockwise, each
 * charge a node on its renewal day (bigger = costs more). The hand sweeps to today, the
 * inner arc shows how much of the month is already charged. An empty month shows faint
 * services orbiting as an invitation to add the first one.
 */
export function Orbit({ charges, year, month, monthLabel, amount, format, label, foot, emptyHint, onPick, onEmpty }: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const today = new Date()
  const days = new Date(year, month + 1, 0).getDate()
  const current = today.getFullYear() === year && today.getMonth() === month
  const angle = (day: number) => ((day - 1) / days) * Math.PI * 2 - Math.PI / 2
  const max = Math.max(1, ...charges.map((c) => c.amount))
  const shown = useCountUp(amount)
  const empty = charges.length === 0

  const nodes = useMemo(() => {
    const perDay = new Map<number, number>()
    return charges.map((c, i) => {
      const k = perDay.get(c.day) ?? 0
      perDay.set(c.day, k + 1)
      const r = 8 + Math.sqrt(c.amount / max) * 15
      const ring = R + (k % 2 === 0 ? 1 : -1) * Math.ceil(k / 2) * 32
      const a = angle(c.day)
      const x = C + Math.cos(a) * ring
      const y = C + Math.sin(a) * ring
      return { ...c, i, r, a, x, y, logo: r >= 12 ? logoFor(c.name) : undefined }
    })
  }, [charges, days, max]) // angle depends only on days

  const total = charges.reduce((s, c) => s + c.amount, 0)
  const paid = current ? charges.filter((c) => c.day <= today.getDate()).reduce((s, c) => s + c.amount, 0) : 0
  const share = total ? paid / total : 0
  const arcLen = 2 * Math.PI * ARC
  const ringLen = 2 * Math.PI * R
  const hand = current ? (angle(today.getDate() + today.getHours() / 24) * 180) / Math.PI : null
  const focused = nodes.find((n) => n.id === hover)
  const labelW = focused ? Math.max(70, focused.name.length * 8.6 + 28) : 0

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="orbit h-auto w-full select-none overflow-visible" role="img" aria-label={`${monthLabel}: ${format(amount)}`}>
      <defs>
        <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--tint)" stopOpacity="0.16" />
          <stop offset="70%" stopColor="var(--tint)" stopOpacity="0.03" />
          <stop offset="100%" stopColor="var(--tint)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orbit-arc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--tint)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--tint) 45%, #f1d4ff)" />
        </linearGradient>
      </defs>

      <circle className="orbit-breathe" cx={C} cy={C} r={R + 80} fill="url(#orbit-glow)" />

      {/* Slow outer orbit with a travelling satellite (ambient) */}
      <g className="orbit-spin" style={{ transformOrigin: `${C}px ${C}px` }}>
        <circle cx={C} cy={C} r={R + 54} fill="none" stroke="var(--sep)" strokeWidth="1" strokeDasharray="2 7" />
        <circle cx={C + R + 54} cy={C} r="3.5" fill="var(--tint)" opacity="0.7" />
      </g>

      {/* Day ticks draw in clockwise */}
      {Array.from({ length: days }, (_, d) => {
        const a = angle(d + 1)
        const long = d % 7 === 0
        const [r1, r2] = [R - (long ? 12 : 6), R + (long ? 12 : 6)]
        return <line key={d} className="orbit-tick" style={{ ['--i' as string]: d }} x1={C + Math.cos(a) * r1} y1={C + Math.sin(a) * r1} x2={C + Math.cos(a) * r2} y2={C + Math.sin(a) * r2} stroke={long ? 'var(--label-3)' : 'var(--sep)'} strokeOpacity={long ? 0.5 : 1} strokeWidth={long ? 1.6 : 1} strokeLinecap="round" />
      })}
      <circle className="orbit-draw" style={{ ['--len' as string]: ringLen }} cx={C} cy={C} r={R} fill="none" stroke="var(--sep)" strokeWidth="1" strokeDasharray={ringLen} transform={`rotate(-90 ${C} ${C})`} />
      {[1, 8, 15, 22].filter((d) => d <= days).map((d) => (
        <text key={d} className="orbit-fade" x={C + Math.cos(angle(d)) * (R + 34)} y={C + Math.sin(angle(d)) * (R + 34)} textAnchor="middle" dominantBaseline="central" fontSize="13" fill="var(--label-3)">{d}</text>
      ))}

      {/* Face + charged-so-far arc */}
      <circle cx={C} cy={C} r={ARC} fill="var(--cell)" fillOpacity="0.6" stroke="var(--sep)" strokeWidth="1.5" />
      {share > 0 && (
        <circle className="orbit-draw" style={{ ['--len' as string]: arcLen }} cx={C} cy={C} r={ARC} fill="none" stroke="url(#orbit-arc)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${arcLen * share} ${arcLen}`} transform={`rotate(-90 ${C} ${C})`} />
      )}

      {/* Hover link from center to the focused node */}
      {focused && <line x1={C} y1={C} x2={focused.x} y2={focused.y} stroke={focused.color} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 5" pointerEvents="none" />}

      {/* Today hand sweeps from 12 o'clock */}
      {hand !== null && (
        <g transform={`translate(${C} ${C})`}>
          <g className="orbit-hand" style={{ ['--to' as string]: `${hand}deg`, transform: `rotate(${hand}deg)` }}>
            <line x1={ARC + 10} y1="0" x2={R - 22} y2="0" stroke="var(--tint)" strokeWidth="1.8" strokeLinecap="round" />
            <circle className="orbit-pulse" cx={R - 22} cy="0" r="9" fill="var(--tint)" opacity="0.25" />
            <circle cx={R - 22} cy="0" r="4.5" fill="var(--tint)" />
            <circle cx={ARC} cy="0" r="5" fill="var(--bg)" stroke="var(--tint)" strokeWidth="2" />
          </g>
        </g>
      )}

      {/* Center */}
      <g className="orbit-fade">
        <text x={C} y={C - 52} textAnchor="middle" fontSize="15" fill="var(--label-3)" style={{ textTransform: 'capitalize' }}>{monthLabel}</text>
        <text x={C} y={C + 8} textAnchor="middle" fontSize={format(amount).length > 11 ? 40 : 48} fontWeight="700" letterSpacing="-1.3" fill="var(--label)" style={{ fontVariantNumeric: 'tabular-nums' }}>{format(shown)}</text>
        <text x={C} y={C + 42} textAnchor="middle" fontSize="15" fill="var(--label-2)">{label}</text>
        {foot && !empty && <text x={C} y={C + 68} textAnchor="middle" fontSize="13" fill="var(--label-3)">{foot}</text>}
      </g>

      {/* Empty month: faint services circle the ring, the center invites the first add */}
      {empty && (
        <>
          <g className="orbit-spin-slow" style={{ transformOrigin: `${C}px ${C}px` }} aria-hidden>
            {GHOSTS.map((name, i) => {
              const a = (i / GHOSTS.length) * Math.PI * 2 - Math.PI / 2
              const x = C + Math.cos(a) * R
              const y = C + Math.sin(a) * R
              const logo = logoFor(name)
              return (
                <g key={name} opacity="0.42">
                  <circle cx={x} cy={y} r="19" fill="var(--bg)" />
                  <circle cx={x} cy={y} r="15" fill={logo?.dark ? '#111' : '#fff'} stroke="var(--sep)" strokeWidth="1.5" strokeDasharray="3 3" />
                  {logo && <image href={logo.url} x={x - 9} y={y - 9} width="18" height="18" />}
                </g>
              )
            })}
          </g>
          {emptyHint && onEmpty && (
            <g className="orbit-fade cursor-pointer" role="button" tabIndex={0} onClick={onEmpty} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onEmpty())}>
              <rect x={C - 92} y={C + 60} width="184" height="34" rx="17" fill="var(--tint)" fillOpacity="0.12" />
              <text x={C} y={C + 82} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--tint)">{emptyHint}</text>
            </g>
          )}
        </>
      )}

      {/* Nodes fly out from the center to their day */}
      {nodes.map((n) => (
        <g key={n.id} className="orbit-node" style={{ ['--i' as string]: n.i, ['--dx' as string]: `${C - n.x}px`, ['--dy' as string]: `${C - n.y}px` }}
          role={onPick ? 'button' : undefined} tabIndex={onPick ? 0 : undefined} aria-label={n.name}
          onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover((h) => (h === n.id ? null : h))} onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}
          onClick={() => onPick?.(n.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick?.(n.id))} cursor={onPick ? 'pointer' : 'default'}>
          <g className="orbit-hover" style={{ transformOrigin: `${n.x}px ${n.y}px`, transform: hover === n.id ? 'scale(1.18)' : undefined }} opacity={hover && hover !== n.id ? 0.3 : 1}>
            <circle cx={n.x} cy={n.y} r={n.r + 5} fill="var(--bg)" />
            {n.logo && !n.trial ? (
              <>
                <circle cx={n.x} cy={n.y} r={n.r} fill={n.logo.dark ? '#111' : '#fff'} stroke={n.color} strokeWidth="2" />
                <image href={n.logo.url} x={n.x - n.r * 0.62} y={n.y - n.r * 0.62} width={n.r * 1.24} height={n.r * 1.24} preserveAspectRatio="xMidYMid meet" />
              </>
            ) : (
              <circle cx={n.x} cy={n.y} r={n.r} fill={n.trial ? 'var(--bg)' : n.color} stroke={n.trial ? n.color : 'none'} strokeWidth="2" strokeDasharray={n.trial ? '3 3' : undefined} />
            )}
          </g>
        </g>
      ))}

      {/* Label pill for the focused node */}
      {focused && (() => {
        const ox = Math.cos(focused.a) > 0.3 ? 1 : Math.cos(focused.a) < -0.3 ? -1 : 0
        const lx = focused.x + Math.cos(focused.a) * (focused.r + 22)
        const ly = focused.y + Math.sin(focused.a) * (focused.r + 22)
        const x = ox === 1 ? lx : ox === -1 ? lx - labelW : lx - labelW / 2
        return (
          <g pointerEvents="none" className="fade-in">
            <rect x={x} y={ly - 15} width={labelW} height="30" rx="15" fill="var(--label)" />
            <text x={x + labelW / 2} y={ly + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--bg)">{focused.name}</text>
          </g>
        )
      })()}
    </svg>
  )
}
