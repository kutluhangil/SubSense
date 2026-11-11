import * as React from 'react'

/*
 * Duotone roster: a heavy display headline sits bottom-left on a burning colour
 * field; beside it hangs a wall of tall tiles that drift slowly in opposite
 * directions. Every tile is pushed through one tritone (shadow, midtone,
 * highlight) built from the palette, so forty different brand marks read as one set.
 *
 * Point at, tab to or tap a tile and it lifts out of the wall, its true colour
 * bleeds back in, the rest of the wall sinks into the field, and its small chip
 * unfolds into a card. The columns hold still while you read.
 *
 * Below ~700px the columns become one drifting strip above the headline. Reduced
 * motion keeps the columns staggered and still. A pause button stops the drift.
 */

export type RosterPalette = {
  /** Darkest colour: the edges of the field and the chips. */
  ground: string
  /** The field between the edge and the glow. */
  deep: string
  /** The hot centre of the field, and the tritone midtone. */
  hot: string
  /** The brightest light in the field. */
  glow: string
  /** Headline, chip text and the CTA fill. */
  ink: string
  /** Tritone shadow and highlight applied to every tile. */
  shadow: string
  highlight: string
}

export type RosterMember = {
  name: string
  role: string
  /** Short label on the chip. Defaults to the role. */
  craft?: string
  /** One line shown when the chip unfolds. */
  bio?: string
  /** Image URL. A monogram plate stands in when missing or broken. */
  photo?: string
  /** Marks the image as a logo: it floats bare on the field, and this plate colour appears behind its true colours on hover. */
  tile?: string
  href?: string
  linkLabel?: string
}

export type OpenRole = {
  title: string
  href: string
  craft?: string
  note?: string
  /** Big word in the empty frame. */
  mark?: string
  linkLabel?: string
}

export type RosterLabels = { pause: string; play: string; team: string; openRole: string; hiring: string; roleLink: string; memberLink: string }

export type RosterLink = { label: string; href: string; onClick?: (e: React.MouseEvent) => void }

type Deal = { kind: 'member' | 'role'; index: number; dup: boolean }

// #region roster-logic
/** "#f80" or "#ff8800" to [r, g, b] in 0..1, for the SVG tritone tables. */
function hexToUnit(hex: string) {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0, 0, 0]
  return [0, 2, 4].map((i) => Math.round((parseInt(h.slice(i, i + 2), 16) / 255) * 1000) / 1000)
}

/** Mixes two hex colours, t = 0 gives a, t = 1 gives b. */
function mixHex(a: string, b: string, t: number) {
  const x = hexToUnit(a)
  const y = hexToUnit(b)
  return '#' + [0, 1, 2].map((i) => Math.round((x[i] + (y[i] - x[i]) * t) * 255).toString(16).padStart(2, '0')).join('')
}

/** One feFuncR/G/B table per channel: shadow, midtone, highlight. */
function tritoneTables(shadow: string, mid: string, highlight: string) {
  const s = hexToUnit(shadow)
  const m = hexToUnit(mid)
  const h = hexToUnit(highlight)
  return [0, 1, 2].map((c) => s[c] + ' ' + m[c] + ' ' + h[c])
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/**
 * Deals the members (and open roles) into columns round-robin, so neighbours
 * differ, then pads short columns with repeats until each holds `minPerColumn`
 * so a drifting loop never shows a gap. Repeats are flagged `dup` and are
 * hidden from assistive tech. Open roles are spread through the deck.
 */
export function dealColumns(count: number, roleCount: number, columns: number, minPerColumn: number): Deal[][] {
  const cols = Math.max(1, Math.floor(columns) || 1)
  const deck: Deal[] = []
  for (let i = 0; i < count; i++) deck.push({ kind: 'member', index: i, dup: false })
  for (let r = 0; r < roleCount; r++) {
    const at = Math.min(deck.length, Math.round(((r + 1) * (count + roleCount)) / (roleCount + 1)) - 1 + r)
    deck.splice(Math.max(0, at), 0, { kind: 'role', index: r, dup: false })
  }
  const out: Deal[][] = Array.from({ length: cols }, () => [])
  deck.forEach((d, i) => out[i % cols].push({ ...d }))
  if (!deck.length) return out
  // Pad from the far end of the column furthest away, so a repeat never sits
  // level with the same tile in the next column.
  for (let c = 0; c < cols; c++) {
    const from = cols === 1 ? 0 : (c + Math.floor(cols / 2) + (cols % 2 ? 1 : 0)) % cols
    const candidates = out[from].filter((e) => !e.dup).reverse().concat(deck.slice().reverse())
    let k = 0
    let guard = 0
    while (out[c].length < minPerColumn && guard < candidates.length * 3) {
      const d = candidates[k % candidates.length]
      k++
      guard++
      const clash = out[c].some((e) => e.kind === d.kind && e.index === d.index)
      if (clash && guard < candidates.length) continue
      out[c].push({ kind: d.kind, index: d.index, dup: true })
    }
  }
  return out
}

/** Font size that makes the widest headline line fill `available` px. */
function fitTitleSize(available: number, widestAt100: number, stretch: number, min: number, max: number) {
  if (!(available > 0) || !(widestAt100 > 0)) return min
  const size = (available / (widestAt100 * (stretch > 0 ? stretch : 1))) * 100
  return Math.max(min, Math.min(max, Math.floor(size * 10) / 10))
}

/** Layout for a container width: a strip on phones (0), 2 columns on tablets. */
export function layoutFor(width: number, columns: number) {
  if (width > 0 && width < 700) return 0
  if (width > 0 && width < 1000) return 2
  return Math.max(2, Math.min(4, Math.round(columns) || 3))
}
// #endregion roster-logic

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

const DISPLAY_STACK = '"Arial Black", "Archivo Black", "Helvetica Neue", Inter, "Segoe UI", system-ui, sans-serif'

const css = `
.dtr{position:relative;isolation:isolate;overflow:hidden;width:100%;container-type:inline-size;color:var(--dtr-ink);background:var(--dtr-ground);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;--dtr-ease:cubic-bezier(.23,1,.32,1);--dtr-gap:14px;--dtr-pad:clamp(20px,3.2cqw,48px)}
.dtr *,.dtr *::before,.dtr *::after{box-sizing:border-box}
.dtr-field{position:absolute;inset:0;z-index:-2;background:radial-gradient(38cqw 46cqw at 0% 100%,var(--dtr-ground) 0%,color-mix(in srgb,var(--dtr-ground) 55%,var(--dtr-deep)) 72%,transparent 100%),radial-gradient(70% 62% at 34% 36%,var(--dtr-glow) 0%,var(--dtr-hot) 26%,color-mix(in srgb,var(--dtr-hot) 55%,var(--dtr-deep)) 48%,transparent 78%),radial-gradient(60% 90% at 78% 30%,color-mix(in srgb,var(--dtr-hot) 70%,var(--dtr-deep)) 0%,transparent 70%),linear-gradient(98deg,var(--dtr-ground) 0%,var(--dtr-deep) 16%,transparent 42%),linear-gradient(0deg,var(--dtr-ground) 0%,color-mix(in srgb,var(--dtr-deep) 85%,transparent) 30%,transparent 62%),var(--dtr-deep)}
.dtr-grain{position:absolute;inset:-50%;z-index:-1;pointer-events:none;opacity:.2;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -.35'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");background-size:220px 220px}
.dtr-defs{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}
.dtr-in{position:relative;display:grid;grid-template-columns:minmax(0,42fr) minmax(0,58fr);height:100%}
.dtr[data-cols="2"] .dtr-in{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.dtr-copy{position:relative;z-index:5;isolation:isolate;grid-row:1;grid-column:1;pointer-events:none;display:flex;flex-direction:column;justify-content:flex-end;padding:var(--dtr-pad);padding-right:clamp(16px,2cqw,32px);min-width:0}
.dtr-title{position:relative;margin:0;text-shadow:0 .02em .14em color-mix(in srgb,var(--dtr-ground) 30%,transparent);font-family:var(--dtr-display);font-weight:900;font-synthesis:none;line-height:.84;letter-spacing:-.035em;color:var(--dtr-ink);font-size:var(--dtr-ts,clamp(56px,9cqw,200px));text-transform:var(--dtr-case)}
.dtr-eyebrow{display:block;font-size:.36em;line-height:1;letter-spacing:-.01em;margin:0 0 .16em .02em;transform:scaleX(var(--dtr-stretch));transform-origin:0 50%;white-space:nowrap}
.dtr-line{display:block;clip-path:inset(-30% -400% 0 -10%);padding-bottom:.04em;margin-bottom:-.04em}
.dtr-line>span{display:inline-block;white-space:nowrap;transform:scaleX(var(--dtr-stretch));transform-origin:0 50%}
.dtr-line>span>span{display:inline-block;animation:dtr-line-in 900ms var(--dtr-ease) both;animation-delay:calc(120ms + var(--i,0) * 50ms)}
.dtr-intro,.dtr-actions{pointer-events:auto}
.dtr-intro{margin:clamp(18px,2.2cqw,28px) 0 0;max-width:38ch;font-size:clamp(15px,1.15cqw,17px);line-height:1.55;color:color-mix(in srgb,var(--dtr-ink) 86%,transparent);text-wrap:pretty}
.dtr-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px 22px;margin-top:clamp(20px,2.4cqw,30px)}
.dtr-cta{position:relative;display:inline-flex;align-items:center;gap:12px;height:46px;padding:0 18px 0 20px;border-radius:3px;background:var(--dtr-ink);color:var(--dtr-ground);font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;overflow:hidden;transition:transform 160ms var(--dtr-ease),background-color 220ms ease;outline:none}
.dtr-cta::before{content:"";position:absolute;inset:0;background:var(--dtr-glow);clip-path:inset(0 100% 0 0);transition:clip-path 280ms var(--dtr-ease)}
.dtr-cta>span{position:relative;z-index:1}
.dtr-cta-label{position:relative;display:inline-block;overflow:hidden;height:1.2em;line-height:1.2em}
.dtr-cta-label>span{display:block;transition:transform 260ms var(--dtr-ease)}
.dtr-cta-arrow{display:inline-block;transition:transform 260ms var(--dtr-ease)}
.dtr-cta:active{transform:scale(.97)}
.dtr-cta:focus-visible::before{clip-path:inset(0 0 0 0)}
.dtr-cta:focus-visible,.dtr-link:focus-visible,.dtr-pause:focus-visible,.dtr-panel a:focus-visible{outline:2px solid var(--dtr-ink);outline-offset:3px}
.dtr-link{color:var(--dtr-ink);font-size:14px;font-weight:600;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px;transition:text-underline-offset 220ms var(--dtr-ease),opacity 200ms ease;outline:none}
.dtr-wall{position:relative;z-index:1;grid-row:1;grid-column:2;display:grid;grid-template-columns:repeat(var(--dtr-cols),minmax(0,1fr));gap:var(--dtr-gap);padding:0 var(--dtr-pad) 0 clamp(8px,1cqw,16px);height:100%;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 5%,#000 95%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 5%,#000 95%,transparent 100%)}
.dtr-col{position:relative;min-width:0;animation:dtr-rise 1100ms var(--dtr-ease) both;animation-delay:calc(var(--ci) * 90ms)}
.dtr-track{display:flex;flex-direction:column;will-change:transform;transition:translate 280ms var(--dtr-ease);animation:dtr-up var(--dtr-dur) linear infinite;animation-delay:var(--dtr-phase)}
.dtr-col[data-dir="down"] .dtr-track{animation-name:dtr-down}
.dtr[data-paused] .dtr-track,.dtr[data-active] .dtr-track,.dtr[data-offscreen] .dtr-track,.dtr-wall:focus-within .dtr-track,.dtr[data-paused] .dtr-strip-track,.dtr[data-active] .dtr-strip-track,.dtr[data-offscreen] .dtr-strip-track,.dtr-strip:focus-within .dtr-strip-track{animation-play-state:paused}
.dtr-card{position:relative;container:dtrcard/inline-size;margin:0 0 var(--dtr-gap);aspect-ratio:3/4;border-radius:3px;transition:transform 260ms var(--dtr-ease);-webkit-tap-highlight-color:transparent}
.dtr-card::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;box-shadow:0 2px 6px color-mix(in srgb,var(--dtr-ground) 40%,transparent),0 18px 44px -12px color-mix(in srgb,var(--dtr-ground) 85%,transparent);opacity:0;transition:opacity 260ms ease;pointer-events:none}
.dtr-photo{position:absolute;inset:0;overflow:hidden;border-radius:3px;background:var(--dtr-deep);transition:opacity 260ms ease,filter 260ms ease}
.dtr-photo img{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;object-fit:cover;transform-origin:50% 22%;transition:transform 300ms var(--dtr-ease)}
.dtr-photo[data-logo]{background:none}
.dtr-photo[data-logo]~.dtr-chip{display:none}
.dtr-photo[data-logo] img{object-fit:contain;padding:26% 18%;transform-origin:50% 50%}
.dtr-card[data-on] .dtr-photo img{transform:scale(1.05)}
.dtr-card[data-on] .dtr-photo[data-logo] img{transform:translateY(-13%) scale(1.05)}
.dtr-hit{position:absolute;inset:0;z-index:1;margin:0;padding:0;border:0;border-radius:3px;background:transparent;cursor:default;outline:none;-webkit-tap-highlight-color:transparent}
.dtr-card[data-click] .dtr-hit{cursor:pointer}
.dtr-hit:focus-visible{box-shadow:0 0 0 2px var(--dtr-ground),0 0 0 4px var(--dtr-ink)}
.dtr-true{opacity:0;transition:opacity 300ms ease}
.dtr-plate{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(90% 70% at 50% 35%,var(--dtr-hot),var(--dtr-deep) 70%,var(--dtr-ground));font-family:var(--dtr-display);font-weight:900;color:var(--dtr-ink);font-size:clamp(40px,7cqw,96px);letter-spacing:-.04em}
.dtr-plate span{transform:scaleX(var(--dtr-stretch));transition:transform 300ms var(--dtr-ease)}
.dtr-card[data-on] .dtr-plate span{transform:translateY(-.95em) scaleX(var(--dtr-stretch)) scale(.82)}
.dtr-plate{grid-template-rows:1fr auto 1fr}.dtr-plate span{grid-row:2}
.dtr-plate em{transition:opacity 160ms ease;grid-row:3;align-self:start;margin-top:.9em;max-width:80%;font:700 12px/1.35 ui-sans-serif,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;font-style:normal;text-align:center;color:color-mix(in srgb,var(--dtr-ink) 78%,transparent)}
.dtr-role .dtr-plate{background:repeating-linear-gradient(135deg,transparent 0 10px,color-mix(in srgb,var(--dtr-ink) 9%,transparent) 10px 11px),radial-gradient(90% 70% at 50% 30%,color-mix(in srgb,var(--dtr-hot) 70%,var(--dtr-deep)),var(--dtr-ground) 85%);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dtr-ink) 28%,transparent);font-size:clamp(34px,5.2cqw,76px)}
.dtr-card{--dtr-ct:calc(100% - 26px);--dtr-cr:calc(100% - var(--dtr-cw));--dtr-cb:0px;--dtr-cl:0px}
.dtr-chip,.dtr-panel{position:absolute;left:12px;bottom:12px;background:color-mix(in srgb,var(--dtr-ground) 95%,transparent);color:var(--dtr-ink);border-radius:3px}
.dtr-chip{padding:8px 10px 7px;font-size:11px;font-weight:700;line-height:1;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;transition:opacity 160ms ease}
.dtr-panel{z-index:2;right:12px;max-height:calc(100% - 24px);overflow:hidden;padding:10px 12px 11px;clip-path:inset(var(--dtr-ct) var(--dtr-cr) var(--dtr-cb) var(--dtr-cl) round 3px);opacity:0;visibility:hidden;transition:clip-path 200ms var(--dtr-ease),opacity 100ms ease 120ms,visibility 0s linear 220ms;pointer-events:none}
.dtr-col:first-child .dtr-chip{left:auto;right:12px}
.dtr-col:first-child .dtr-card{--dtr-cr:0px;--dtr-cl:calc(100% - var(--dtr-cw))}
.dtr-name{margin:0;font-size:clamp(15px,7cqw,19px);font-weight:800;line-height:1.15;letter-spacing:-.01em}
.dtr-roleline{margin:3px 0 0;font-size:13px;line-height:1.35;color:color-mix(in srgb,var(--dtr-ink) 78%,transparent)}
.dtr-bio{margin:6px 0 0;font-size:13px;line-height:1.4;color:color-mix(in srgb,var(--dtr-ink) 90%,transparent)}
.dtr-panel a{display:inline-flex;align-items:center;gap:6px;margin-top:8px;color:var(--dtr-ink);font-size:13px;font-weight:700;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px;outline:none}
.dtr-panel a span{display:inline-block;transition:transform 260ms var(--dtr-ease)}
.dtr-card[data-on]{z-index:3;transform:translateY(-6px) scale(1.02)}
.dtr-card[data-on]::after{opacity:1}
.dtr-card[data-on] .dtr-true{opacity:.72}
.dtr-card[data-on] .dtr-photo[data-logo] .dtr-true{opacity:1}
.dtr-card[data-on] .dtr-chip,.dtr-card[data-on] .dtr-plate em{opacity:0;transition-duration:90ms}
.dtr-card[data-on] .dtr-panel{clip-path:inset(0 0 0 0 round 3px);opacity:1;visibility:visible;pointer-events:auto;transition:clip-path 300ms var(--dtr-ease),opacity 60ms ease,visibility 0s}
.dtr-title{transform-origin:0 100%;transition:transform 300ms var(--dtr-ease)}
.dtr[data-active-col="0"] .dtr-title{transform:scale(.84)}
.dtr[data-active] .dtr-card:not([data-on]) .dtr-photo{opacity:.42;filter:saturate(.7)}
.dtr[data-active] .dtr-card:not([data-on]) .dtr-chip{opacity:.5}
.dtr-pause{position:absolute;right:var(--dtr-pad);bottom:14px;z-index:6;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dtr-ink) 32%,transparent);display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;border:0;border-radius:3px;background:color-mix(in srgb,var(--dtr-ground) 88%,transparent);color:var(--dtr-ink);font:700 11px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:transform 160ms var(--dtr-ease),background-color 200ms ease;outline:none}
.dtr-pause:active{transform:scale(.96)}
.dtr-pause i{display:inline-block;width:8px;height:9px;border-left:3px solid currentColor;border-right:3px solid currentColor}
.dtr[data-paused] .dtr-pause i{border-right:0;border-left:8px solid currentColor;border-top:4.5px solid transparent;border-bottom:4.5px solid transparent;width:0;height:0}
.dtr-strip{display:none}
.dtr[data-mode="strip"] .dtr-in{display:flex;flex-direction:column;height:auto}
.dtr[data-mode="strip"] .dtr-wall{display:none}
.dtr[data-mode="strip"] .dtr-strip{display:block;position:relative;order:-1;overflow:hidden;padding:20px 0 4px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%)}
.dtr-strip-track{display:flex;width:max-content;padding-left:20px;will-change:transform;transition:translate 280ms var(--dtr-ease);animation:dtr-left var(--dtr-sdur) linear infinite}
.dtr-strip .dtr-card{width:clamp(170px,56cqw,250px);margin:0 10px 0 0;flex:none}
.dtr[data-mode="strip"] .dtr-copy{padding:18px 20px 28px}
.dtr[data-mode="strip"] .dtr-pause{position:static;margin-left:auto}
@container dtrcard (max-width:229px){.dtr-bio{display:none}.dtr-panel{padding:9px 10px 10px}}
@keyframes dtr-up{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-50%,0)}}
@keyframes dtr-down{from{transform:translate3d(0,-50%,0)}to{transform:translate3d(0,0,0)}}
@keyframes dtr-left{from{transform:translate3d(0,0,0)}to{transform:translate3d(calc(-50% + 10px),0,0)}}
@keyframes dtr-rise{from{opacity:0;transform:translate3d(0,56px,0)}to{opacity:1;transform:none}}
@keyframes dtr-line-in{from{transform:translate3d(0,104%,0)}to{transform:none}}
@media (hover:hover) and (pointer:fine){
.dtr-cta:hover::before{clip-path:inset(0 0 0 0)}
.dtr-cta:hover .dtr-cta-label>span{transform:translateY(-100%)}
.dtr-cta:hover .dtr-cta-arrow{transform:translateX(4px)}
.dtr-link:hover{text-underline-offset:8px}
.dtr-panel a:hover span{transform:translate(2px,-2px)}
.dtr-pause:hover{background:var(--dtr-ground)}
}
@media (prefers-reduced-motion:reduce){
.dtr-track,.dtr-strip-track{animation:none;transform:translate3d(0,calc(-50% * var(--dtr-rest,0)),0)}
.dtr-strip-track{transform:none}
.dtr-col,.dtr-line>span>span{animation:none}
.dtr-card,.dtr-panel,.dtr-cta-label>span,.dtr-cta-arrow{transition-duration:1ms}
.dtr-card[data-on],.dtr-card[data-on] .dtr-photo img{transform:none}
.dtr-title{transition-duration:1ms}
.dtr-pause{display:none}
}
`

type Slot =
  | { key: string; kind: 'member'; member: RosterMember; dup: boolean }
  | { key: string; kind: 'role'; role: OpenRole; dup: boolean }

/** Nudges a drifting column (or the phone strip) so a focused card is fully visible. */
function bringIntoView(card: HTMLElement) {
  const frame = card.closest<HTMLElement>('.dtr-wall, .dtr-strip')
  const track = card.closest<HTMLElement>('.dtr-track, .dtr-strip-track')
  if (!frame || !track) return
  const f = frame.getBoundingClientRect()
  const r = card.getBoundingClientRect()
  // Start from where the track is right now (it may still be easing back).
  const now = getComputedStyle(track).translate
  const parts = !now || now === 'none' ? ['0', '0'] : now.split(' ')
  let x = parseFloat(parts[0]) || 0
  let y = parseFloat(parts[1] || '0') || 0
  const m = 24
  if (track.classList.contains('dtr-track')) {
    if (r.top < f.top + m) y += f.top + m - r.top
    else if (r.bottom > f.bottom - m) y -= r.bottom - (f.bottom - m)
  } else {
    if (r.left < f.left + m) x += f.left + m - r.left
    else if (r.right > f.right - m) x -= r.right - (f.right - m)
  }
  track.style.translate = Math.round(x) + 'px ' + Math.round(y) + 'px'
}

/** Lets the track ease back into its loop once focus moves on. */
function releaseNudge(card: HTMLElement) {
  const track = card.closest<HTMLElement>('.dtr-track, .dtr-strip-track')
  if (track) track.style.translate = ''
}

function Tile(props: {
  slot: Slot
  on: boolean
  filterId: string
  labels: RosterLabels
  onEnter: (key: string) => void
  onLeave: (key: string) => void
  onToggle: (key: string) => void
  onSelect?: (member: RosterMember) => void
}) {
  const { slot, on, filterId, labels, onEnter, onLeave, onToggle, onSelect } = props
  const [failed, setFailed] = React.useState(false)
  const pointer = React.useRef('mouse')
  const panelId = 'p' + React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const hidden = slot.dup
  const member = slot.kind === 'member' ? slot.member : null
  const role = slot.kind === 'role' ? slot.role : null
  const craft = member ? member.craft || member.role : role ? role.craft || labels.hiring : ''
  const label = member ? member.name + ', ' + member.role : role ? labels.openRole + ': ' + role.title : ''
  const photo = member && member.photo && !failed ? member.photo : ''
  const href = member ? member.href : role ? role.href : undefined
  const linkLabel = member ? member.linkLabel || labels.memberLink : (role && role.linkLabel) || labels.roleLink
  const followable = Boolean(href) && !/^mailto:/i.test(String(href))
  const clickable = Boolean((member && onSelect) || followable)
  const plate = member?.tile ? { background: member.tile } : undefined

  return (
    <div
      className={'dtr-card' + (role ? ' dtr-role' : '')}
      data-on={on ? '' : undefined}
      data-click={clickable ? '' : undefined}
      aria-hidden={hidden ? true : undefined}
      style={{ '--dtr-cw': Math.min(26, craft.length) * 0.74 + 2.2 + 'em' } as React.CSSProperties}
      onPointerDown={(e) => {
        pointer.current = e.pointerType
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        // A card cut off by the frame slides fully into view (it stays under the pointer).
        bringIntoView(e.currentTarget)
        onEnter(slot.key)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return
        onLeave(slot.key)
        if (!e.currentTarget.contains(document.activeElement)) releaseNudge(e.currentTarget)
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        onLeave(slot.key)
        releaseNudge(e.currentTarget)
      }}
    >
      <div className="dtr-photo" data-logo={plate ? '' : undefined}>
        {photo ? (
          <>
            <img className="dtr-duo" src={photo} alt="" loading="lazy" decoding="async" draggable={false} style={{ filter: 'url(#' + filterId + ')' }} onError={() => setFailed(true)} />
            <img className="dtr-true" src={photo} alt="" loading="lazy" decoding="async" draggable={false} style={plate} />
          </>
        ) : (
          <div className="dtr-plate" aria-hidden="true">
            <span>{member ? initials(member.name) : role?.mark || '+'}</span>
            {role ? <em>{role.title}</em> : null}
          </div>
        )}
      </div>
      <span className="dtr-chip" aria-hidden="true">{craft}</span>
      <button
        type="button"
        className="dtr-hit"
        tabIndex={hidden ? -1 : 0}
        aria-label={label}
        aria-expanded={hidden ? undefined : on}
        aria-controls={panelId}
        onFocus={(e) => {
          // Pointer focus is handled by hover and tap; keyboard focus unfolds here.
          if (!e.currentTarget.matches(':focus-visible')) return
          onEnter(slot.key)
          bringIntoView(e.currentTarget.parentElement as HTMLElement)
        }}
        onClick={(e) => {
          const card = e.currentTarget.parentElement as HTMLElement
          const link = card.querySelector<HTMLAnchorElement>('.dtr-panel a')
          if (e.detail === 0) {
            // Keyboard: Enter opens the card, a second Enter selects it or moves to its link.
            if (!on) (onEnter(slot.key), bringIntoView(card))
            else if (link) link.focus()
            else if (member && onSelect) onSelect(member)
            return
          }
          if (pointer.current === 'mouse') {
            if (member && onSelect) onSelect(member)
            else if (followable) link?.click()
            return
          }
          // Touch: first tap unfolds, a tap on the open card selects it.
          if (on && member && onSelect) return onSelect(member)
          if (!on) bringIntoView(card)
          onToggle(slot.key)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onLeave(slot.key)
        }}
      />
      <div
        className="dtr-panel"
        id={panelId}
        aria-hidden={on ? undefined : true}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          e.currentTarget.parentElement?.querySelector<HTMLElement>('.dtr-hit')?.focus()
          onLeave(slot.key)
        }}
      >
        <p className="dtr-name">{member ? member.name : role?.title}</p>
        {member || role?.note ? <p className="dtr-roleline">{member ? member.role : role?.note}</p> : null}
        {member?.bio ? <p className="dtr-bio">{member.bio}</p> : null}
        {href ? (
          <a href={href} tabIndex={hidden || !on ? -1 : 0}>
            {linkLabel} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </div>
  )
}

export function DuotoneRoster({
  members,
  openRoles = [],
  eyebrow,
  title,
  intro,
  cta,
  secondaryCta,
  palette,
  labels,
  columns = 3,
  driftSeconds = 9,
  height = '100svh',
  fontFamily = DISPLAY_STACK,
  stretch = 1.16,
  uppercase = true,
  onMemberSelect,
}: {
  members: RosterMember[]
  /** Empty frames placed among the tiles, each linking somewhere. */
  openRoles?: OpenRole[]
  /** Small display word above the headline. */
  eyebrow?: string
  /** The headline. Use "\n" to break lines; each line is fitted to the column. */
  title: string
  intro?: string
  cta?: RosterLink
  secondaryCta?: RosterLink
  palette: RosterPalette
  labels: RosterLabels
  /** Columns on wide screens (2 to 4). Tablets get 2; phones a strip. */
  columns?: number
  /** Seconds a column takes to drift past one tile. Lower is faster. */
  driftSeconds?: number
  /** Section height on tablet and desktop. A definite length, never a percentage. */
  height?: string
  fontFamily?: string
  /** Horizontal stretch of the display face (1 = as drawn). */
  stretch?: number
  uppercase?: boolean
  /** Called when a tile is clicked or opened with the keyboard. */
  onMemberSelect?: (member: RosterMember) => void
}) {
  const pal = palette
  const uid = 'dtr' + React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const filterId = uid + '-tone'
  const titleId = uid + '-title'
  const rootRef = React.useRef<HTMLElement>(null)
  const copyRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)
  const [cols, setCols] = React.useState(layoutFor(0, columns))
  const [titleSize, setTitleSize] = React.useState(0)
  const [active, setActive] = React.useState<string | null>(null)
  const [paused, setPaused] = React.useState(false)
  const [outOfView, setOutOfView] = React.useState(false)
  const [tabHidden, setTabHidden] = React.useState(false)
  const [minPer, setMinPer] = React.useState(4)

  const lines = title.split('\n').map((l) => l.trim()).filter(Boolean)
  // Bare logos are toned from glow to white so black marks still read on the field;
  // photos keep a shadow end, lifted toward the field so dark areas keep their detail.
  const tables = members.some((m) => m.tile)
    ? tritoneTables(pal.glow, mixHex(pal.glow, pal.highlight, 0.6), '#ffffff')
    : tritoneTables(mixHex(pal.shadow, pal.deep, 0.4), mixHex(pal.hot, pal.highlight, 0.35), mixHex(pal.highlight, pal.ink, 0.5))
  const plan = React.useMemo(() => dealColumns(members.length, openRoles.length, cols || 1, cols ? minPer : 0), [members.length, openRoles.length, cols, minPer])

  const slotFor = (e: Deal, key: string): Slot =>
    e.kind === 'role' ? { key, kind: 'role', role: openRoles[e.index], dup: e.dup } : { key, kind: 'member', member: members[e.index], dup: e.dup }

  // Measure the container: choose the layout and fit the headline to its column.
  useIsoLayoutEffect(() => {
    const root = rootRef.current
    const copy = copyRef.current
    const head = titleRef.current
    if (!root || !copy || !head) return
    const fit = () => {
      const { width: w, height: h } = root.getBoundingClientRect()
      const next = layoutFor(w, columns)
      setCols(next)
      let widest = 0
      head.querySelectorAll<HTMLElement>('.dtr-line > span').forEach((s) => (widest = Math.max(widest, s.offsetWidth)))
      const widestAt100 = (widest / (parseFloat(getComputedStyle(head).fontSize) || 100)) * 100
      const cs = getComputedStyle(copy)
      const avail = copy.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const strip = next === 0
      // Enough tiles per column that one loop is taller than the wall.
      if (!strip) {
        const cardH = ((w * (next === 2 ? 0.5 : 0.58) - 14 * (next + 1)) / next) * (4 / 3) + 14
        setMinPer(Math.max(3, Math.ceil(h / Math.max(80, cardH))))
      }
      const maxByHeight = strip ? 200 : Math.max(56, (h * 0.52) / Math.max(1, lines.length + 0.45))
      // On the wall layout the widest line runs on into the first column of tiles, like a poster.
      setTitleSize(fitTitleSize(avail * (strip ? 1 : 1.18), widestAt100, stretch, 40, Math.min(280, maxByHeight)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(root)
    return () => ro.disconnect()
  }, [columns, stretch, title, fontFamily, uppercase, lines.length])

  // Stop drifting while nobody can see it.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setOutOfView(!entry.isIntersecting), { threshold: 0 })
    io.observe(root)
    const vis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', vis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', vis)
    }
  }, [])

  const onEnter = React.useCallback((key: string) => setActive(key), [])
  const onLeave = React.useCallback((key: string) => setActive((a) => (a === key ? null : a)), [])
  const onToggle = React.useCallback((key: string) => setActive((a) => (a === key ? null : key)), [])

  // Tap outside an unfolded card folds it again.
  React.useEffect(() => {
    if (!active) return
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && !(e.target as HTMLElement | null)?.closest?.('.dtr-card')) setActive(null)
    }
    document.addEventListener('pointerdown', down)
    return () => document.removeEventListener('pointerdown', down)
  }, [active])

  const rootStyle = {
    '--dtr-ground': pal.ground,
    '--dtr-deep': pal.deep,
    '--dtr-hot': pal.hot,
    '--dtr-glow': pal.glow,
    '--dtr-ink': pal.ink,
    '--dtr-display': fontFamily,
    '--dtr-stretch': String(stretch),
    '--dtr-case': uppercase ? 'uppercase' : 'none',
    '--dtr-cols': String(cols || 1),
    '--dtr-ts': titleSize ? titleSize + 'px' : undefined,
    '--dtr-sdur': Math.max(8, (members.length + openRoles.length) * Math.max(1, driftSeconds) * 0.55) + 's',
    height: cols === 0 ? 'auto' : height,
    minHeight: cols === 0 ? undefined : '600px',
  } as React.CSSProperties

  const pauseButton = (
    <button type="button" className="dtr-pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
      <i aria-hidden="true" />
      {paused ? labels.play : labels.pause}
    </button>
  )

  const tile = (slot: Slot) => (
    <Tile key={slot.key} slot={slot} on={active === slot.key} filterId={filterId} labels={labels} onEnter={onEnter} onLeave={onLeave} onToggle={onToggle} onSelect={onMemberSelect} />
  )
  const phases = [0, 0.38, 0.71, 0.18]

  return (
    <section
      ref={rootRef}
      className="dtr"
      style={rootStyle}
      aria-labelledby={titleId}
      data-mode={cols === 0 ? 'strip' : 'columns'}
      data-cols={cols || undefined}
      data-active={active ? '' : undefined}
      data-active-col={active && cols !== 0 ? active.split('-')[0] : undefined}
      data-paused={paused ? '' : undefined}
      data-offscreen={outOfView || tabHidden ? '' : undefined}
    >
      <style>{css}</style>
      <svg className="dtr-defs" aria-hidden="true" focusable="false">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0.13 0.5 0.9 1" />
            <feFuncG type="table" tableValues="0 0.13 0.5 0.9 1" />
            <feFuncB type="table" tableValues="0 0.13 0.5 0.9 1" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="table" tableValues={tables[0]} />
            <feFuncG type="table" tableValues={tables[1]} />
            <feFuncB type="table" tableValues={tables[2]} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div className="dtr-field" aria-hidden="true" />
      <div className="dtr-grain" aria-hidden="true" />
      {cols !== 0 ? pauseButton : null}

      <div className="dtr-in">
        <div className="dtr-copy" ref={copyRef}>
          <h1 className="dtr-title" id={titleId} ref={titleRef}>
            {eyebrow ? <span className="dtr-eyebrow">{eyebrow} </span> : null}
            {lines.map((l, i) => (
              <span className="dtr-line" key={i} style={{ '--i': i } as React.CSSProperties}>
                <span>
                  <span>{l}</span>
                </span>
                {i < lines.length - 1 ? ' ' : null}
              </span>
            ))}
          </h1>
          {intro ? <p className="dtr-intro">{intro}</p> : null}
          <div className="dtr-actions">
            {cta ? (
              <a className="dtr-cta" href={cta.href} onClick={cta.onClick}>
                <span className="dtr-cta-label">
                  <span>{cta.label}</span>
                  <span aria-hidden="true">{cta.label}</span>
                </span>
                <span className="dtr-cta-arrow" aria-hidden="true">→</span>
              </a>
            ) : null}
            {secondaryCta ? <a className="dtr-link" href={secondaryCta.href} onClick={secondaryCta.onClick}>{secondaryCta.label}</a> : null}
            {cols === 0 ? pauseButton : null}
          </div>
        </div>

        {cols === 0 ? (
          <div className="dtr-strip" role="group" aria-label={labels.team}>
            <div className="dtr-strip-track">
              {[0, 1].map((copy) => plan[0].map((e, i) => tile(slotFor({ ...e, dup: e.dup || copy === 1 }, 's' + copy + '-' + i))))}
            </div>
          </div>
        ) : (
          <div className="dtr-wall" role="group" aria-label={labels.team}>
            {plan.map((col, c) => {
              const dur = Math.max(6, col.length * Math.max(1, driftSeconds))
              const phase = phases[c % phases.length]
              return (
                <div className="dtr-col" key={c} data-dir={c % 2 ? 'down' : 'up'} style={{ '--ci': c, '--dtr-dur': dur + 's', '--dtr-phase': -(dur * phase) + 's', '--dtr-rest': c % 2 ? 1 - phase : phase } as React.CSSProperties}>
                  <div className="dtr-track">
                    {[0, 1].map((copy) => col.map((e, i) => tile(slotFor({ ...e, dup: e.dup || copy === 1 }, c + '-' + copy + '-' + i))))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
