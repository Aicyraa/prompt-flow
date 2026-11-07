import { beforeEach, describe, expect, it } from 'vitest'
import type { EdgeChange, NodeChange } from '@xyflow/react'
import { useGraphStore } from './graphStore'
import type { FlowEdge, FlowNode } from '../types/flow'

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

describe('graphStore undo / redo', () => {
  beforeEach(() => {
    useGraphStore.setState({
      nodes: [],
      edges: [],
      past: [],
      future: [],
      clipboard: null,
    })
  })
  const s = () => useGraphStore.getState()

  it('undoes and redoes adding a node', () => {
    s().addNode('input', { x: 0, y: 0 })
    expect(s().nodes).toHaveLength(1)
    s().undo()
    expect(s().nodes).toHaveLength(0)
    s().redo()
    expect(s().nodes).toHaveLength(1)
  })

  it('undoes a delete, including the removed edges', () => {
    const a = s().addNode('input', { x: 0, y: 0 })
    const b = s().addNode('llm', { x: 300, y: 0 })
    s().connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    s().deleteNode(b.id)
    expect(s().edges).toHaveLength(0)
    s().undo()
    expect(s().nodes).toHaveLength(2)
    expect(s().edges).toHaveLength(1)
  })

  it('a new action clears the redo stack', () => {
    s().addNode('input', { x: 0, y: 0 })
    s().undo()
    expect(s().future).toHaveLength(1)
    s().addNode('prompt', { x: 0, y: 0 })
    expect(s().future).toHaveLength(0)
  })

  it('treats continuous typing in one node as a single step', () => {
    const n = s().addNode('input', { x: 0, y: 0 })
    const before = s().past.length
    for (const text of ['h', 'he', 'hel', 'hell', 'hello']) {
      s().updateNodeData(n.id, { text })
    }
    expect(s().past.length).toBe(before + 1)
    s().undo()
    expect((s().nodes[0].data as { text?: string }).text).toBe('')
  })

  it('records a whole drag as one step, not one per move', () => {
    const n = s().addNode('input', { x: 0, y: 0 })
    const before = s().past.length
    const move = (x: number, dragging: boolean) =>
      ({
        id: n.id,
        type: 'position',
        position: { x, y: 0 },
        dragging,
      }) as NodeChange<FlowNode>
    s().onNodesChange([move(5, true)])
    s().onNodesChange([move(10, true)])
    s().onNodesChange([move(20, true)])
    s().onNodesChange([move(20, false)])
    expect(s().past.length).toBe(before + 1)
    s().undo()
    expect(s().nodes[0].position.x).toBe(0)
  })

  it('caps the undo history', () => {
    for (let i = 0; i < 60; i++) s().addNode('input', { x: i, y: 0 })
    expect(s().past.length).toBe(50)
  })

  it('does nothing when there is nothing to undo or redo', () => {
    s().undo()
    s().redo()
    expect(s().nodes).toHaveLength(0)
  })

  it('does not persist the history', () => {
    s().addNode('input', { x: 0, y: 0 })
    const persisted = useGraphStore.persist.getOptions().partialize?.(s())
    expect(persisted).not.toHaveProperty('past')
    expect(persisted).not.toHaveProperty('future')
    expect(persisted).not.toHaveProperty('clipboard')
  })
})

describe('graphStore copy / paste / duplicate', () => {
  beforeEach(() => {
    useGraphStore.setState({
      nodes: [],
      edges: [],
      past: [],
      future: [],
      clipboard: null,
    })
  })
  const s = () => useGraphStore.getState()

  function chain() {
    const a = s().addNode('input', { x: 0, y: 0 })
    const b = s().addNode('llm', { x: 300, y: 0 })
    s().connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    return { a, b }
  }
  const selectOnly = (...ids: string[]) =>
    useGraphStore.setState((st) => ({
      nodes: st.nodes.map((n) => ({ ...n, selected: ids.includes(n.id) })),
    }))

  it('pastes copies with new ids, offset, selected, and the edges between them', () => {
    const { a, b } = chain()
    selectOnly(a.id, b.id)
    expect(s().copySelection()).toBe(true)
    expect(s().pasteClipboard()).toBe(2)
    expect(s().nodes).toHaveLength(4)
    expect(s().edges).toHaveLength(2)
    const copies = s().nodes.filter((n) => n.selected)
    expect(copies).toHaveLength(2)
    expect(copies.map((n) => n.id)).not.toContain(a.id)
    expect(copies[0].position.x).toBeGreaterThan(a.position.x)
    const copyIds = new Set(copies.map((n) => n.id))
    const newEdge = s().edges.find((e) => copyIds.has(e.source))!
    expect(copyIds.has(newEdge.target)).toBe(true)
  })

  it('leaves out edges that reach unselected nodes', () => {
    const { a } = chain()
    selectOnly(a.id)
    s().duplicateSelection()
    expect(s().nodes).toHaveLength(3)
    expect(s().edges).toHaveLength(1)
  })

  it('cascades repeated pastes instead of stacking them', () => {
    const { a } = chain()
    selectOnly(a.id)
    s().copySelection()
    s().pasteClipboard()
    s().pasteClipboard()
    const xs = s()
      .nodes.filter((n) => n.data.type === 'input')
      .map((n) => n.position.x)
    expect(new Set(xs).size).toBe(3)
  })

  it('duplicate keeps what was copied on the clipboard', () => {
    const { a, b } = chain()
    selectOnly(b.id)
    s().copySelection()
    selectOnly(a.id)
    s().duplicateSelection()
    expect(s().clipboard?.nodes.map((n) => n.id)).toEqual([b.id])
  })

  it('paste is one undo step and copy does nothing without a selection', () => {
    const { a } = chain()
    selectOnly()
    expect(s().copySelection()).toBe(false)
    expect(s().pasteClipboard()).toBe(0)
    selectOnly(a.id)
    s().duplicateSelection()
    s().undo()
    expect(s().nodes).toHaveLength(2)
  })
})
