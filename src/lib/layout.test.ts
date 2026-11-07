import { describe, expect, it } from 'vitest'
import { tidyPositions, type LayoutNode } from './layout'

const node = (
  id: string,
  x: number,
  y: number,
  width = 288,
  height = 160,
): LayoutNode => ({ id, x, y, width, height })

describe('tidyPositions', () => {
  it('returns nothing for an empty graph', () => {
    expect(tidyPositions([], [])).toEqual({})
  })

  it('lays a chain out left to right with even gaps', () => {
    const nodes = [node('a', 500, 300), node('b', 0, 0), node('c', 90, 700)]
    const pos = tidyPositions(nodes, [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ])
    expect(pos.a.x).toBeLessThan(pos.b.x)
    expect(pos.b.x).toBeLessThan(pos.c.x)
    expect(pos.b.x - pos.a.x).toBe(288 + 90)
    // a straight chain stays on one row
    expect(new Set([pos.a.y, pos.b.y, pos.c.y]).size).toBe(1)
  })

  it('puts parallel branches in the same column, stacked without overlap', () => {
    const nodes = [
      node('in', 0, 0),
      node('x', 400, 0),
      node('y', 400, 10),
      node('out', 800, 0),
    ]
    const pos = tidyPositions(nodes, [
      { source: 'in', target: 'x' },
      { source: 'in', target: 'y' },
      { source: 'x', target: 'out' },
      { source: 'y', target: 'out' },
    ])
    expect(pos.x.x).toBe(pos.y.x)
    expect(Math.abs(pos.x.y - pos.y.y)).toBeGreaterThanOrEqual(160 + 48)
    // the merge node sits between its two inputs
    const mid = (pos.x.y + pos.y.y) / 2
    expect(Math.abs(pos.out.y - mid)).toBeLessThanOrEqual(1)
  })

  it('uses the deepest path to decide the column', () => {
    const nodes = [node('a', 0, 0), node('b', 0, 0), node('c', 0, 0)]
    const pos = tidyPositions(nodes, [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'a', target: 'c' }, // shortcut must not pull c left
    ])
    expect(pos.c.x).toBeGreaterThan(pos.b.x)
  })

  it('keeps the graph centred where it was', () => {
    const nodes = [node('a', 1000, 1000), node('b', 1400, 1000)]
    const pos = tidyPositions(nodes, [{ source: 'a', target: 'b' }])
    const cx = (pos.a.x + pos.b.x + 288) / 2
    expect(Math.abs(cx - (1000 + 1400 + 288) / 2)).toBeLessThanOrEqual(1)
  })

  it('orders a column by where its upstream nodes sit, to avoid crossings', () => {
    const nodes = [
      node('top', 0, 0),
      node('bottom', 0, 400),
      node('fromBottom', 400, 0), // listed first but belongs below
      node('fromTop', 400, 400),
    ]
    const pos = tidyPositions(nodes, [
      { source: 'top', target: 'fromTop' },
      { source: 'bottom', target: 'fromBottom' },
    ])
    expect(pos.fromTop.y).toBeLessThan(pos.fromBottom.y)
  })

  it('terminates on a cycle and still positions every node', () => {
    const nodes = [node('a', 0, 0), node('b', 0, 0), node('c', 0, 0)]
    const pos = tidyPositions(nodes, [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'c', target: 'a' },
    ])
    expect(Object.keys(pos).sort()).toEqual(['a', 'b', 'c'])
    for (const p of Object.values(pos)) {
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true)
    }
  })

  it('ignores edges to unknown nodes and self-loops', () => {
    const pos = tidyPositions(
      [node('a', 0, 0)],
      [
        { source: 'a', target: 'ghost' },
        { source: 'a', target: 'a' },
      ],
    )
    expect(Object.keys(pos)).toEqual(['a'])
  })
})
