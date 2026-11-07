export interface LayoutNode {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutEdge {
  source: string
  target: string
}

export interface Position {
  x: number
  y: number
}

interface Options {
  /** Space between columns and between nodes in a column, in flow px. */
  gapX?: number
  gapY?: number
}

/**
 * Left-to-right layered layout. Each node goes in the column after its
 * deepest upstream node; inside a column nodes are ordered by where their
 * upstream nodes ended up (fewer crossings). Columns are centred on each
 * other, and the whole graph keeps its original centre so it doesn't jump.
 * Cycles can't be layered properly, so their nodes are simply placed after
 * everything that reaches them first.
 */
export function tidyPositions(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  { gapX = 90, gapY = 48 }: Options = {},
): Record<string, Position> {
  if (nodes.length === 0) return {}
  const known = new Set(nodes.map((n) => n.id))
  const links = edges.filter(
    (e) => known.has(e.source) && known.has(e.target) && e.source !== e.target,
  )

  // Longest-path layering. Bounded passes keep cycles from looping forever.
  const layer = new Map(nodes.map((n) => [n.id, 0]))
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false
    for (const e of links) {
      const next = layer.get(e.source)! + 1
      if (next > layer.get(e.target)! && next < nodes.length) {
        layer.set(e.target, next)
        changed = true
      }
    }
    if (!changed) break
  }

  const columns: LayoutNode[][] = []
  for (const n of nodes) (columns[layer.get(n.id)!] ??= []).push(n)

  // Order columns left to right; within one, by the mean row of upstream nodes.
  const centreY = new Map<string, number>()
  const placed: Record<string, Position> = {}
  let cursorX = 0

  columns.forEach((column) => {
    if (!column) return
    const upstream = (id: string) =>
      links.filter((e) => e.target === id).map((e) => e.source)
    const score = (n: LayoutNode) => {
      const ups = upstream(n.id).filter((u) => centreY.has(u))
      return ups.length
        ? ups.reduce((sum, u) => sum + centreY.get(u)!, 0) / ups.length
        : n.y + n.height / 2
    }
    column.sort((a, b) => score(a) - score(b) || a.y - b.y || a.x - b.x)

    const width = Math.max(...column.map((n) => n.width))
    const total =
      column.reduce((sum, n) => sum + n.height, 0) + gapY * (column.length - 1)
    let y = -total / 2
    column.forEach((n) => {
      placed[n.id] = { x: cursorX, y }
      centreY.set(n.id, y + n.height / 2)
      y += n.height + gapY
    })
    cursorX += width + gapX
  })

  // Keep the overall centre where it was.
  const bounds = (pts: { x: number; y: number; w: number; h: number }[]) => {
    const minX = Math.min(...pts.map((p) => p.x))
    const maxX = Math.max(...pts.map((p) => p.x + p.w))
    const minY = Math.min(...pts.map((p) => p.y))
    const maxY = Math.max(...pts.map((p) => p.y + p.h))
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
  }
  const before = bounds(
    nodes.map((n) => ({ x: n.x, y: n.y, w: n.width, h: n.height })),
  )
  const after = bounds(
    nodes.map((n) => ({
      x: placed[n.id].x,
      y: placed[n.id].y,
      w: n.width,
      h: n.height,
    })),
  )
  const dx = before.cx - after.cx
  const dy = before.cy - after.cy
  const result: Record<string, Position> = {}
  for (const n of nodes) {
    result[n.id] = {
      x: Math.round(placed[n.id].x + dx),
      y: Math.round(placed[n.id].y + dy),
    }
  }
  return result
}
