import { describe, it, expect } from 'vitest'
import {
  buildCurvedPath,
  cubicMidpoint,
  bendForOffset,
  EDGE_BULGE_RANGE,
  EDGE_CONTROL_DISTANCE,
  type Point,
} from './edgeGeometry'

const s: Point = { x: 0, y: 0 }
const t: Point = { x: 400, y: 0 }
const chordMid = (a: Point, b: Point) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

describe('edgeGeometry', () => {
  it('produces a single cubic bezier (no straight lead segments)', () => {
    const { d } = buildCurvedPath(s, t)
    expect(d.startsWith('M 0 0 C ')).toBe(true)
    expect(d).toContain(', ')
    expect(d.endsWith('400 0')).toBe(true)
    expect(d).not.toContain(' L ')
  })

  it('extends each control point horizontally out of its handle (n8n tangents)', () => {
    const { control } = buildCurvedPath(s, t)
    // The source control point sits straight out along the flow axis (+x).
    const hor = Math.min(EDGE_CONTROL_DISTANCE, 400 * 0.5)
    expect(control.x).toBeCloseTo(hor, 5)
    expect(control.y).toBeCloseTo(0, 5)
  })

  it('keeps level endpoints perfectly straight at bend=0', () => {
    const { d, mid, control } = buildCurvedPath(s, t, 0)
    expect(mid.y).toBeCloseTo(0, 5)
    expect(control.y).toBeCloseTo(0, 5)
    expect(d).not.toContain(' L ')
  })

  it('handles a zero-length edge without NaN', () => {
    const { d, mid, control } = buildCurvedPath(s, s)
    expect(Number.isNaN(mid.x)).toBe(false)
    expect(Number.isNaN(mid.y)).toBe(false)
    expect(Number.isNaN(control.x)).toBe(false)
    expect(d).not.toContain('NaN')
  })

  it('midpoint sits on the perpendicular bisector, offset by the bend', () => {
    const { mid } = buildCurvedPath(s, t, 1)
    const cm = chordMid(s, t)
    // x stays on the chord midpoint, y bulges perpendicularly.
    expect(mid.x).toBeCloseTo(cm.x, 5)
    expect(mid.y).not.toBeCloseTo(0, 5)
  })

  it('bends to opposite sides for +bend and -bend', () => {
    const up = buildCurvedPath(s, t, 1).mid.y
    const down = buildCurvedPath(s, t, -1).mid.y
    expect(up).toBeGreaterThan(0)
    expect(down).toBeLessThan(0)
  })

  it('scales the bulge with distance for a fixed bend', () => {
    const short = Math.abs(buildCurvedPath(s, { x: 100, y: 0 }, 0.5).mid.y)
    const long = Math.abs(buildCurvedPath(s, { x: 1000, y: 0 }, 0.5).mid.y)
    expect(long).toBeGreaterThan(short)
  })

  it('reflects the horizontal control offset when the flow runs backwards', () => {
    const { control } = buildCurvedPath(t, s)
    // Source (400,0) flows left toward (0,0): control extends to the left.
    expect(control.x).toBeLessThan(400)
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

  it('bendForOffset inverts a perpendicular drag back into a bend scalar', () => {
    const distance = 400
    // Drag of 0 keeps the straight line (bend 0).
    expect(bendForOffset(distance, 0)).toBeCloseTo(0, 5)
    // A perpendicular offset upward yields a positive bend.
    const bulge = distance * EDGE_BULGE_RANGE * 0.75
    const bend = bendForOffset(distance, bulge)
    expect(bend).toBeGreaterThan(0)
    expect(bend).toBeLessThanOrEqual(1.5)
    // Negative offset (other side) yields a negative bend.
    expect(bendForOffset(distance, -bulge)).toBeLessThan(0)
  })
})
