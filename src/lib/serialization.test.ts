import { describe, expect, it } from 'vitest'
import type { FlowEdge, FlowNode } from '../types/flow'
import { createNode } from './nodes'
import { parseFlow, serializeFlow } from './serialization'

describe('serializeFlow', () => {
  it('round-trips nodes, edges, and edge style through JSON', () => {
    const nodes: FlowNode[] = [
      createNode('input', { x: 0, y: 0 }),
      createNode('llm', { x: 100, y: 0 }),
    ]
    const edges: FlowEdge[] = [
      { id: 'e1', source: nodes[0].id, target: nodes[1].id },
    ]

    const parsed = parseFlow(serializeFlow(nodes, edges, 'smoothstep'))

    expect(parsed.nodes).toEqual(nodes)
    expect(parsed.edges).toEqual(edges)
    expect(parsed.edgeStyle).toBe('smoothstep')
  })

  it('defaults the edge style to curved when absent', () => {
    const parsed = parseFlow('{"version":2,"nodes":[],"edges":[]}')
    expect(parsed.edgeStyle).toBe('curved')
  })

  it('falls back to curved for an invalid edge style', () => {
    const parsed = parseFlow(
      '{"version":2,"nodes":[],"edges":[],"edgeStyle":"warp"}',
    )
    expect(parsed.edgeStyle).toBe('curved')
  })

  it('returns an empty flow for invalid JSON', () => {
    expect(parseFlow('not json')).toEqual({
      nodes: [],
      edges: [],
      edgeStyle: 'curved',
    })
  })

  it('returns an empty flow when arrays are missing', () => {
    expect(parseFlow('{"foo":1}')).toEqual({
      nodes: [],
      edges: [],
      edgeStyle: 'curved',
    })
  })
})
