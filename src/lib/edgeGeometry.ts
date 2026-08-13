export interface Point {
  x: number
  y: number
}

export interface CurvedEdgeGeometry {
  /** SVG path `d` — a quadratic bezier arc from `source` to `target`. */
  d: string
  /** Point at the arc's midpoint (the bulge peak). */
  mid: Point
  /** Control point driving the arc. */
  control: Point
  /** Perpendicular unit vector (pointing "up" relative to the chord). */
  normal: Point
  /** Center of the chord (source→target). */
  chordMid: Point
}

export const EDGE_BULGE_BASE = 0.1 // permanent gentle sweep -> never straight
export const EDGE_BULGE_RANGE = 0.35 // per unit of `bend`

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y }
}

function len(v: Point): number {
  return Math.hypot(v.x, v.y)
}

function unit(v: Point): Point {
  const l = len(v)
  return l === 0 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l }
}

// Unit vector perpendicular to `v` (rotated -90°), so for a horizontal edge
// pointing right it points straight up.
function perp(v: Point): Point {
  const u = unit(v)
  return { x: -u.y, y: u.x }
}

/** Midpoint of a quadratic bezier: (P0 + 2·P1 + P2) / 4. */
export function quadraticMidpoint(
  p0: Point,
  p1: Point,
  p2: Point,
): Point {
  return {
    x: (p0.x + 2 * p1.x + p2.x) / 4,
    y: (p0.y + 2 * p1.y + p2.y) / 4,
  }
}

/** Build a smooth, "flowy" quadratic arc between two handle centers. */
export function buildCurvedPath(
  source: Point,
  target: Point,
  bend = 0,
): CurvedEdgeGeometry {
  const delta = sub(target, source)
  const distance = len(delta)

  const baseAmount = distance * EDGE_BULGE_BASE
  const bendAmount = distance * EDGE_BULGE_RANGE
  const amount = baseAmount + bend * bendAmount

  const n = perp(delta)
  const control = {
    x: source.x + delta.x * 0.5 + n.x * amount,
    y: source.y + delta.y * 0.5 + n.y * amount,
  }

  const mid = quadraticMidpoint(source, control, target)
  const chordMid = { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 }
  const d = `M ${source.x} ${source.y} Q ${control.x} ${control.y}, ${target.x} ${target.y}`
  return { d, mid, control, normal: n, chordMid }
}

/** Convert a perpendicular hand-drag offset (pixels) into a `bend` scalar. */
export function bendForOffset(distance: number, offset: number): number {
  if (distance === 0) return 0
  const baseAmount = distance * EDGE_BULGE_BASE
  const bendAmount = distance * EDGE_BULGE_RANGE
  // mid sits at chordMid + normal * (amount / 2), so amount = 2 * offset.
  const amount = 2 * offset
  const bend = (amount - baseAmount) / bendAmount
  return Math.max(-1.5, Math.min(1.5, bend))
}
