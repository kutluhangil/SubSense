import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

const HUES = { blue: [220, 200], purple: [280, 300], green: [120, 200], red: [0, 200], orange: [30, 200] } as const

/** Card whose border and surface light up under the pointer. Styles: `.glow-card` in styles.css. */
export function GlowCard({ children, className = '', glowColor = 'blue' }: { children: ReactNode; className?: string; glowColor?: keyof typeof HUES }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = (e: PointerEvent) => {
      const s = ref.current?.style
      if (!s) return
      s.setProperty('--x', e.clientX.toFixed(2))
      s.setProperty('--xp', (e.clientX / innerWidth).toFixed(2))
      s.setProperty('--y', e.clientY.toFixed(2))
      s.setProperty('--yp', (e.clientY / innerHeight).toFixed(2))
    }
    document.addEventListener('pointermove', sync)
    return () => document.removeEventListener('pointermove', sync)
  }, [])

  const [base, spread] = HUES[glowColor]
  return (
    <div ref={ref} data-glow className={`glow-card ${className}`} style={{ '--base': base, '--spread': spread } as CSSProperties}>
      <div data-glow />
      {children}
    </div>
  )
}
