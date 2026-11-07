import { beforeEach, describe, expect, it } from 'vitest'
import type { EdgeChange, NodeChange } from '@xyflow/react'
import { useGraphStore } from './graphStore'
import type { FlowEdge } from '../types/flow'

const resetStore = () =>
  useGraphStore.setState({
    nodes: [],
    edges: [],
  })

const edge = (source: string, target: string): FlowEdge => ({
  id: `${source}-${target}`,
  source,
  target,
})

describe('graphStore', () => {
  beforeEach(resetStore)

  it('addNode appends a node of the given type', () => {
    useGraphStore.getState().addNode('input', { x: 0, y: 0 })
    const { nodes } = useGraphStore.getState()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].data.type).toBe('input')
  })

  it('updateNodeData merges a partial patch without losing other fields', () => {
    useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    const id = useGraphStore.getState().nodes[0].id
    useGraphStore.getState().updateNodeData(id, { temperature: 0.2 })
    const node = useGraphStore.getState().nodes[0]
    expect(node.data).toMatchObject({
      temperature: 0.2,
      model: 'openai/gpt-4o-mini',
    })
  })

  it('deleteNode removes the node and any edges connected to it', () => {
    const { addNode } = useGraphStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    addNode('output', { x: 200, y: 0 })
    const [a, b, c] = useGraphStore.getState().nodes
    useGraphStore.setState((s) => ({
      ...s,
      edges: [edge(a.id, b.id), edge(b.id, c.id)],
    }))
    useGraphStore.getState().deleteNode(a.id)
    const { nodes, edges } = useGraphStore.getState()
    expect(nodes.map((n) => n.id)).toEqual([b.id, c.id])
    expect(edges).toEqual([edge(b.id, c.id)])
  })

  it('onNodesChange applies a position change', () => {
    useGraphStore.getState().addNode('input', { x: 0, y: 0 })
    const id = useGraphStore.getState().nodes[0].id
    const change: NodeChange = {
      id,
      type: 'position',
      position: { x: 50, y: 60 },
      dragging: true,
    }
    useGraphStore.getState().onNodesChange([change])
    expect(useGraphStore.getState().nodes[0].position).toEqual({ x: 50, y: 60 })
  })

  it('onNodesChange removes edges connected to a removed node', () => {
    const { addNode, connectNodes } = useGraphStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useGraphStore.getState().nodes
    connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    const change: NodeChange = { id: a.id, type: 'remove' }
    useGraphStore.getState().onNodesChange([change])
    expect(useGraphStore.getState().edges).toEqual([])
  })

  it('onEdgesChange applies a remove change', () => {
    useGraphStore.setState((s) => ({ ...s, edges: [edge('a', 'b')] }))
    const change: EdgeChange = { id: 'a-b', type: 'remove' }
    useGraphStore.getState().onEdgesChange([change])
    expect(useGraphStore.getState().edges).toEqual([])
  })

  it('connectNodes adds an edge with a unique id', () => {
    const { addNode, connectNodes } = useGraphStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useGraphStore.getState().nodes
    connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    const { edges } = useGraphStore.getState()
    expect(edges).toHaveLength(1)
    expect(edges[0].source).toBe(a.id)
    expect(edges[0].target).toBe(b.id)
  })

  it('connectNodes creates a curved edge with empty data', () => {
    const { addNode, connectNodes } = useGraphStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useGraphStore.getState().nodes
    connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    const [e] = useGraphStore.getState().edges
    expect(e.type).toBe('curved')
    expect(e.data).toEqual({})
  })

  it('updateEdgeData merges a patch onto an edge', () => {
    useGraphStore.setState((s) => ({
      ...s,
      edges: [
        {
          id: 'a-b',
          source: 'a',
          target: 'b',
          type: 'curved',
          data: { bend: 0 },
        },
      ],
    }))
    useGraphStore.getState().updateEdgeData('a-b', { bend: 0.75 })
    expect(useGraphStore.getState().edges[0]!.data?.bend).toBe(0.75)
  })

  it('loadFlow replaces nodes and edges', () => {
    useGraphStore.getState().addNode('input', { x: 0, y: 0 })

    useGraphStore.getState().loadFlow(
      [
        {
          id: 'n1',
          type: 'output',
          position: { x: 1, y: 1 },
          data: { type: 'output' },
        },
      ],
      [{ id: 'e1', source: 'n1', target: 'n1', type: 'curved', data: {} }],
    )

    const state = useGraphStore.getState()
    expect(state.nodes.map((n) => n.id)).toEqual(['n1'])
    expect(state.edges.map((e) => e.id)).toEqual(['e1'])
  })

  it('migrates legacy edge styles to the single curved style', () => {
    const raw = {
      state: {
        version: 1,
        nodes: ['a', 'b', 'c', 'd'].map((id) => ({
          id,
          type: 'prompt',
          position: { x: 0, y: 0 },
          data: { type: 'prompt', status: 'running', output: 'stale' } as never,
        })),
        edges: [
          { id: 'a-b', source: 'a', target: 'b', type: 'auto' },
          { id: 'c-d', source: 'c', target: 'd', type: 'smoothstep' },
        ],
        edgeStyle: 'smoothstep',
      },
    }
    const migrated = useGraphStore.persist.getOptions().migrate?.(raw, 1) as {
      nodes: { data: Record<string, unknown> }[]
    }
    // Stale run results are dropped during migration.
    expect(migrated.nodes[0].data).toEqual({ type: 'prompt' })
    expect(migrated).toMatchObject({
      edges: [
        {
          id: 'a-b',
          source: 'a',
          target: 'b',
          type: 'curved',
          data: { bend: 0 },
        },
        {
          id: 'c-d',
          source: 'c',
          target: 'd',
          type: 'curved',
          data: { bend: 0 },
        },
      ],
      edgeStyle: 'curved',
    })
  })

  it('selectEdgeOnly selects one edge and deselects nodes and other edges', () => {
    const { addNode } = useGraphStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    useGraphStore.setState((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: true })),
      edges: [
        { id: 'e1', source: 'a', target: 'b', selected: true },
        { id: 'e2', source: 'a', target: 'b' },
      ],
    }))
    useGraphStore.getState().selectEdgeOnly('e2')
    const { nodes, edges } = useGraphStore.getState()
    expect(nodes.every((n) => !n.selected)).toBe(true)
    expect(edges.map((e) => Boolean(e.selected))).toEqual([false, true])
  })

  it('does not persist selection or run results', () => {
    useGraphStore.getState().addNode('input', { x: 0, y: 0 })
    useGraphStore.setState((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: true })),
    }))
    const { partialize } = useGraphStore.persist.getOptions()
    const saved = partialize?.(useGraphStore.getState()) as {
      nodes: Record<string, unknown>[]
    }
    expect(saved.nodes[0]).not.toHaveProperty('selected')
  })
})

describe('graphStore addNode selection', () => {
  beforeEach(resetStore)

  it('returns the new node, selects it, and deselects the rest', () => {
    const { addNode } = useGraphStore.getState()
    const first = addNode('input', { x: 0, y: 0 })
    const second = addNode('llm', { x: 10, y: 0 })
    const { nodes } = useGraphStore.getState()
    expect(second.id).toBe(nodes[1].id)
    expect(nodes.find((n) => n.id === first.id)?.selected).toBe(false)
    expect(nodes.find((n) => n.id === second.id)?.selected).toBe(true)
  })

  it('selectNodeOnly selects one node and clears edge selection', () => {
    const { addNode } = useGraphStore.getState()
    const a = addNode('input', { x: 0, y: 0 })
    const b = addNode('llm', { x: 10, y: 0 })
    useGraphStore.setState((s) => ({
      edges: [{ id: 'e', source: a.id, target: b.id, selected: true }],
      nodes: s.nodes,
    }))
    useGraphStore.getState().selectNodeOnly(a.id)
    const { nodes, edges } = useGraphStore.getState()
    expect(nodes.map((n) => Boolean(n.selected))).toEqual([true, false])
    expect(edges[0].selected).toBe(false)
  })
})
