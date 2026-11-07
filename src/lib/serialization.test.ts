import { describe, expect, it } from 'vitest'
import type { FlowEdge, FlowNode } from '../types/flow'
import { createNode } from './nodes'
import { parseFlow, parseFlowStrict, serializeFlow } from './serialization'

describe('serializeFlow', () => {
  it('round-trips nodes, edges, and edge style through JSON', () => {
    const nodes: FlowNode[] = [
      createNode('input', { x: 0, y: 0 }),
      createNode('llm', { x: 100, y: 0 }),
    ]
    const edges: FlowEdge[] = [
      { id: 'e1', source: nodes[0].id, target: nodes[1].id },
    ]

    const parsed = parseFlow(serializeFlow(nodes, edges, 'curved'))

    expect(parsed.nodes.map((n) => n.id)).toEqual(nodes.map((n) => n.id))
    expect(parsed.edges).toEqual([
      { ...edges[0], type: 'curved', data: { bend: 0 } },
    ])
    expect(parsed.edgeStyle).toBe('curved')
  })

  it('coerces any legacy edge style to curved', () => {
    const parsed = parseFlow(
      '{"version":2,"nodes":[],"edges":[],"edgeStyle":"smoothstep"}',
    )
    expect(parsed.edgeStyle).toBe('curved')
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

  it('strips run results and selection from exported nodes', () => {
    const node = createNode('output', { x: 0, y: 0 })
    node.selected = true
    node.data = {
      ...node.data,
      status: 'done',
      output: 'secret',
      error: 'x',
    } as unknown as typeof node.data
    const out = JSON.parse(serializeFlow([node], [], 'curved'))
    expect(out.nodes[0].selected).toBeUndefined()
    expect(out.nodes[0].data).not.toHaveProperty('output')
    expect(out.nodes[0].data).not.toHaveProperty('error')
    expect(out.nodes[0].data).not.toHaveProperty('status')
  })
})

describe('parseFlowStrict', () => {
  const nodeJson = (id: string) => ({
    id,
    type: 'input',
    position: { x: 0, y: 0 },
    data: { type: 'input', text: 'hi' },
  })

  it('accepts a valid empty flow', () => {
    expect(
      parseFlowStrict('{"version":5,"nodes":[],"edges":[]}'),
    ).not.toBeNull()
  })

  it('rejects invalid JSON, wrong shapes, and malformed nodes', () => {
    expect(parseFlowStrict('nope')).toBeNull()
    expect(parseFlowStrict('{"foo":1}')).toBeNull()
    expect(
      parseFlowStrict(
        JSON.stringify({ nodes: [{ id: 'a', data: {} }], edges: [] }),
      ),
    ).toBeNull()
  })

  it('normalises edges: adds data, forces curved, drops dangling edges', () => {
    const parsed = parseFlowStrict(
      JSON.stringify({
        nodes: [nodeJson('a'), nodeJson('b')],
        edges: [
          { id: 'e1', source: 'a', target: 'b', type: 'smoothstep' },
          { id: 'e2', source: 'a', target: 'ghost' },
        ],
      }),
    )
    expect(parsed?.edges).toEqual([
      { id: 'e1', source: 'a', target: 'b', type: 'curved', data: { bend: 0 } },
    ])
  })
})
