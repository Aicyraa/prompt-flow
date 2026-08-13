import { describe, it, expect } from 'vitest'
import {
  buildCurvedPath,
  cubicMidpoint,
  bendForOffset,
  EDGE_BULGE_BASE,
  EDGE_BULGE_RANGE,
  EDGE_STRAIGHT_ALLOWANCE,
  type Point,
} from './edgeGeometry'

const s: Point = { x: 0, y: 0 }
const t: Point = { x: 400, y: 0 }
const chordMid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

describe('edgeGeometry', () => {
  it('produces an M + L + C path with the arrow tip at the target', () => {
    const { d } = buildCurvedPath(s, t)
    expect(d.startsWith('M 0 0 L')).toBe(true)
    expect(d).toContain(' C ')
    expect(d.endsWith('400 0')).toBe(true)
  })

  it('starts and ends with a straight run before curving', () => {
    const { d, control } = buildCurvedPath(s, t)
    // The first segment must run straight along the chord (+x) by the allowance.
    const allowance = EDGE_STRAIGHT_ALLOWANCE
    expect(d.startsWith(`M 0 0 L ${allowance} 0`)).toBe(true)
    // The control point still deviates vertically, so the arc bows.
    expect(control.y).not.toBeCloseTo(0, 5)
  })

  it('clamps the straight allowance when the edge is very short', () => {
    const short = buildCurvedPath({ x: 0, y: 0 }, { x: 30, y: 0 })
    // allowance = max(0, (30 - 2)/2) = 14, so the L still lands on the chord.
    expect(short.d.startsWith('M 0 0 L 14 0')).toBe(true)
  })

  it('midpoint sits on the perpendicular bisector, offset by the bulge', () => {
    const { mid } = buildCurvedPath(s, t)
    const cm = chordMid(s, t)
    // x stays on the chord midpoint, y bulges perpendicularly (up).
    expect(mid.x).toBeCloseTo(cm.x, 5)
    expect(mid.y).not.toBeCloseTo(0, 5)
  })

  it('bends to opposite sides for +bend and -bend', () => {
    const up = buildCurvedPath(s, t, 1).mid.y
    const down = buildCurvedPath(s, t, -1).mid.y
    expect(up).toBeGreaterThan(0)
    expect(down).toBeLessThan(0)
  })

  it('bend=0 still produces a (gentle) bulge, not a straight line', () => {
    const { control } = buildCurvedPath(s, t, 0)
    expect(control.y).not.toBeCloseTo(0, 5)
  })

  it('handles a zero-length edge without NaN', () => {
    const { d, mid, control } = buildCurvedPath(s, s)
    expect(Number.isNaN(mid.x)).toBe(false)
    expect(Number.isNaN(mid.y)).toBe(false)
    expect(Number.isNaN(control.x)).toBe(false)
    expect(d).not.toContain('NaN')
  })

  it('scales the bulge with distance', () => {
    const short = Math.abs(buildCurvedPath(s, { x: 100, y: 0 }, 0).mid.y)
    const long = Math.abs(buildCurvedPath(s, { x: 1000, y: 0 }, 0).mid.y)
    expect(long).toBeGreaterThan(short)
  })

  it('cubicMidpoint weights the control points three times', () => {
    const p = cubicMidpoint(
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
    )
    // (0 + 0 + 30 + 10)/8 = 5 ; (0 + 30 + 30 + 0)/8 = 7.5
    expect(p.x).toBeCloseTo(5, 5)
    expect(p.y).toBeCloseTo(7.5, 5)
  })

  it('bendForOffset inverts the bulge offset back into a bend scalar', () => {
    const distance = 400
    // Default bend (0): mid offset from chord = 0.75 * baseAmount.
    const baseOffset = (distance * EDGE_BULGE_BASE) * 0.75
    expect(bendForOffset(distance, baseOffset)).toBeCloseTo(0, 5)
    // A larger perpendicular offset yields a positive bend.
    const more = baseOffset + (distance * EDGE_BULGE_RANGE) * 0.75
    const bend = bendForOffset(distance, more)
    expect(bend).toBeGreaterThan(0)
    expect(bend).toBeLessThanOrEqual(1.5)
    // Negative offset (other side) yields a negative bend.
    expect(bendForOffset(distance, -more)).toBeLessThan(0)
  })
})