export interface Point {
  x: number
  y: number
}

export interface CurvedEdgeGeometry {
  /** SVG path `d` — a pure cubic bezier arc between the two handles. */
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

export const EDGE_BULGE_BASE = 0 // level endpoints -> clean straight line (n8n style)
export const EDGE_BULGE_RANGE = 0.35 // per unit of `bend`
/** Horizontal distance (in flow units) each control point sits off its handle. */
export const EDGE_CONTROL_DISTANCE = 120

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
 * Build a smooth edge between two handle centers: a single cubic bezier that
 * leaves each handle perpendicular to the node edge (n8n-style horizontal
 * tangents) and arcs across, with an adjustable perpendicular bulge.
 */
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
  // Control points extend straight out along the flow axis so the line leaves
  // and arrives flat against each node side, then arcs smoothly between them.
  const hor =
    (delta.x >= 0 ? 1 : -1) * Math.min(EDGE_CONTROL_DISTANCE, distance * 0.5)
  const c1 = {
    x: source.x + hor,
    y: source.y + n.y * amount,
  }
  const c2 = {
    x: target.x - hor,
    y: target.y + n.y * amount,
  }

  const mid = cubicMidpoint(source, c1, c2, target)
  const chordMid = {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2,
  }
  const d = `M ${source.x} ${source.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${target.x} ${target.y}`
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
