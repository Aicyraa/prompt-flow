import { describe, it, expect } from 'vitest'
import {
  buildCurvedPath,
  quadraticMidpoint,
  bendForOffset,
  EDGE_BULGE_BASE,
  EDGE_BULGE_RANGE,
  type Point,
} from './edgeGeometry'

const s: Point = { x: 0, y: 0 }
const t: Point = { x: 400, y: 0 }
const chordMid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

describe('edgeGeometry', () => {
  it('produces an M + Q path', () => {
    const { d } = buildCurvedPath(s, t)
    expect(d.startsWith('M 0 0 Q')).toBe(true)
    expect(d.endsWith('400 0')).toBe(true)
  })

  it('control point sits off the chord so the line is never straight', () => {
    const { control } = buildCurvedPath(s, t)
    // control must deviate vertically from the x-axis chord.
    expect(control.y).not.toBeCloseTo(0, 5)
  })

  it('midpoint sits on the perpendicular bisector, offset by the bulge', () => {
    const { mid } = buildCurvedPath(s, t)
    const cm = chordMid(s, t)
    // x stays on the chord midpoint, y bulges perpendicularly (up, for this edge)
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

  it('quadraticMidpoint weights the control point twice', () => {
    const p = quadraticMidpoint({ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 0 })
    // (0 + 2*0 + 10)/4 = 2.5 ; (0 + 2*10 + 0)/4 = 5
    expect(p).toEqual({ x: 2.5, y: 5 })
  })

  it('bendForOffset inverts the bulge offset back into a bend scalar', () => {
    const distance = 400
    // Default bend (0) corresponds to half the base amount offset.
    const baseOffset = (distance * EDGE_BULGE_BASE) / 2
    expect(bendForOffset(distance, baseOffset)).toBeCloseTo(0, 5)
    // Doubling that offset should yield bend ≈ +0.5
    const more = baseOffset + (distance * EDGE_BULGE_RANGE) / 2
    const bend = bendForOffset(distance, more)
    expect(bend).toBeGreaterThan(0)
    expect(bend).toBeLessThanOrEqual(1.5)
    // Negative offset (other side) yields a negative bend.
    expect(bendForOffset(distance, -more)).toBeLessThan(0)
  })
})
