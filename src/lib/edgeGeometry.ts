export interface Point {
  x: number
  y: number
}

export interface CurvedEdgeGeometry {
  /** SVG path `d` — a straight lead-out/in then a cubic bezier arc. */
  d: string
  /** Point at the curve's midpoint (the bulge peak). */
  mid: Point
  /** First bezier control point (used to judge the bulge). */
  control: Point
  /** Perpendicular unit vector (pointing "up" relative to the chord). */
  normal: Point
  /** Center of the chord (source→target). */
  chordMid: Point
}

export const EDGE_BULGE_BASE = 0.1 // permanent gentle sweep -> never straight
export const EDGE_BULGE_RANGE = 0.35 // per unit of `bend`
/** Length of the straight run each edge leaves its handles with. */
export const EDGE_STRAIGHT_ALLOWANCE = 24

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

/** Midpoint of a cubic bezier: (P0 + 3·P1 + 3·P2 + P3) / 8. */
export function cubicMidpoint(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point {
  return {
    x: (p0.x + 3 * p1.x + 3 * p2.x + p3.x) / 8,
    y: (p0.y + 3 * p1.y + 3 * p2.y + p3.y) / 8,
  }
}

/**
 * Build a smooth edge between two handle centers: each end leaves its handle
 * along the chord for a short straight run (`EDGE_STRAIGHT_ALLOWANCE`) before
 * the cubic bezier arc, so lines start/stop on a clean tangent.
 */
export function buildCurvedPath(
  source: Point,
  target: Point,
  bend = 0,
): CurvedEdgeGeometry {
  const delta = sub(target, source)
  const distance = len(delta)
  const dir = unit(delta)

  // Clamp the allowance so the two straight runs can never overlap.
  const allowance =
    distance > 2 * EDGE_STRAIGHT_ALLOWANCE + 2
      ? EDGE_STRAIGHT_ALLOWANCE
      : Math.max(0, (distance - 2) / 2)
  const p1 = {
    x: source.x + dir.x * allowance,
    y: source.y + dir.y * allowance,
  }
  const p2 = {
    x: target.x - dir.x * allowance,
    y: target.y - dir.y * allowance,
  }

  const baseAmount = distance * EDGE_BULGE_BASE
  const bendAmount = distance * EDGE_BULGE_RANGE
  const amount = baseAmount + bend * bendAmount

  const n = perp(delta)
  const chordLen = len(sub(p2, p1))
  const controlDist = Math.max(allowance, chordLen * 0.4)
  const c1 = {
    x: p1.x + dir.x * controlDist + n.x * amount,
    y: p1.y + dir.y * controlDist + n.y * amount,
  }
  const c2 = {
    x: p2.x - dir.x * controlDist + n.x * amount,
    y: p2.y - dir.y * controlDist + n.y * amount,
  }

  const mid = cubicMidpoint(p1, c1, c2, p2)
  const chordMid = { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 }
  const d = `M ${source.x} ${source.y} L ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y} L ${target.x} ${target.y}`
  return { d, mid, control: c1, normal: n, chordMid }
}

/** Convert a perpendicular hand-drag offset (pixels) into a `bend` scalar. */
export function bendForOffset(distance: number, offset: number): number {
  if (distance === 0) return 0
  const baseAmount = distance * EDGE_BULGE_BASE
  const bendAmount = distance * EDGE_BULGE_RANGE
  // The cubic's midpoint sits at chordMid + normal * (amount * 0.75), so a
  // perpendicular drag offset of `offset` means amount = offset / 0.75.
  const amount = offset / 0.75
  const bend = (amount - baseAmount) / bendAmount
  return Math.max(-1.5, Math.min(1.5, bend))
}