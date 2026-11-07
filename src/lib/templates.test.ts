import { describe, expect, it } from 'vitest'
import { findCycleNodeIds } from '../engine/topologicalSort'
import { canConnect } from './connections'
import { TEMPLATES } from './templates'

describe.each(TEMPLATES)('template $id', (template) => {
  it('builds a valid, acyclic, connectable flow ending in an output', () => {
    const { nodes, edges } = template.build()
    const ids = new Set(nodes.map((n) => n.id))
    expect(ids.size).toBe(nodes.length)
    expect(edges.every((e) => ids.has(e.source) && ids.has(e.target))).toBe(
      true,
    )
    expect(findCycleNodeIds([...ids], edges)).toEqual([])
    expect(nodes[nodes.length - 1].data.type).toBe('output')
    for (const e of edges) {
      const s = nodes.find((n) => n.id === e.source)!
      const t = nodes.find((n) => n.id === e.target)!
      expect(
        canConnect(
          { id: s.id, type: s.data.type },
          { id: t.id, type: t.data.type },
          [],
        ),
      ).toBe(true)
    }
  })

  it('returns fresh ids on every build', () => {
    expect(template.build().nodes[0].id).not.toBe(template.build().nodes[0].id)
  })
})
