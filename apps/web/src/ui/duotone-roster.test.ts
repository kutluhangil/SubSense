import { describe, expect, it } from 'vitest'
import { dealColumns, layoutFor } from './duotone-roster'

describe('dealColumns', () => {
  it('deals every member and role exactly once before padding', () => {
    const cols = dealColumns(10, 1, 3, 0)
    const real = cols.flat().filter((e) => !e.dup)
    expect(real.filter((e) => e.kind === 'member').map((e) => e.index).sort((a, b) => a - b)).toEqual([...Array(10).keys()])
    expect(real.filter((e) => e.kind === 'role')).toHaveLength(1)
  })

  it('pads short columns with flagged repeats so a loop never shows a gap', () => {
    const cols = dealColumns(4, 0, 3, 5)
    for (const col of cols) expect(col.length).toBeGreaterThanOrEqual(5)
    expect(cols.flat().filter((e) => !e.dup)).toHaveLength(4)
  })

  it('returns empty columns for an empty roster', () => {
    expect(dealColumns(0, 0, 3, 4)).toEqual([[], [], []])
  })
})

describe('layoutFor', () => {
  it('uses a strip on phones, two columns on tablets and the wanted count on desktop', () => {
    expect(layoutFor(390, 3)).toBe(0)
    expect(layoutFor(820, 3)).toBe(2)
    expect(layoutFor(1440, 3)).toBe(3)
    expect(layoutFor(1440, 9)).toBe(4)
  })
})
