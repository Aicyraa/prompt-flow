import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EdgeChange, NodeChange } from '@xyflow/react'
import { useFlowStore } from './flowStore'
import type { FlowEdge } from '../types/flow'

vi.mock('../lib/openrouter', () => ({
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  TEST_PROMPT: 'test prompt',
  createOpenRouterClient: vi.fn(() => ({})),
  generateText: vi.fn(async () => 'mocked response'),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const resetStore = () =>
  useFlowStore.setState({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    isRunning: false,
  })

const edge = (source: string, target: string): FlowEdge => ({
  id: `${source}-${target}`,
  source,
  target,
})

describe('flowStore', () => {
  beforeEach(resetStore)

  it('addNode appends a node of the given type', () => {
    useFlowStore.getState().addNode('input', { x: 0, y: 0 })
    const { nodes } = useFlowStore.getState()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].data.type).toBe('input')
  })

  it('updateNodeData merges a partial patch without losing other fields', () => {
    useFlowStore.getState().addNode('llm', { x: 0, y: 0 })
    const id = useFlowStore.getState().nodes[0].id
    useFlowStore.getState().updateNodeData(id, { temperature: 0.2 })
    const node = useFlowStore.getState().nodes[0]
    expect(node.data.temperature).toBe(0.2)
    expect(node.data.model).toBe('openai/gpt-4o-mini')
  })

  it('deleteNode removes the node and any edges connected to it', () => {
    const { addNode } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    addNode('output', { x: 200, y: 0 })
    const [a, b, c] = useFlowStore.getState().nodes
    useFlowStore.setState((s) => ({
      ...s,
      edges: [edge(a.id, b.id), edge(b.id, c.id)],
    }))
    useFlowStore.getState().deleteNode(a.id)
    const { nodes, edges } = useFlowStore.getState()
    expect(nodes.map((n) => n.id)).toEqual([b.id, c.id])
    expect(edges).toEqual([edge(b.id, c.id)])
  })

  it('deleteNode clears the selection when the selected node is removed', () => {
    const { addNode, selectNode } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    const id = useFlowStore.getState().nodes[0].id
    selectNode(id)
    useFlowStore.getState().deleteNode(id)
    expect(useFlowStore.getState().selectedNodeId).toBeNull()
  })

  it('onNodesChange applies a position change', () => {
    useFlowStore.getState().addNode('input', { x: 0, y: 0 })
    const id = useFlowStore.getState().nodes[0].id
    const change: NodeChange = {
      id,
      type: 'position',
      position: { x: 50, y: 60 },
      dragging: true,
    }
    useFlowStore.getState().onNodesChange([change])
    expect(useFlowStore.getState().nodes[0].position).toEqual({ x: 50, y: 60 })
  })

  it('onNodesChange removes edges connected to a removed node', () => {
    const { addNode, connectNodes } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useFlowStore.getState().nodes
    connectNodes({ source: a.id, target: b.id, sourceHandle: null, targetHandle: null })
    const change: NodeChange = { id: a.id, type: 'remove' }
    useFlowStore.getState().onNodesChange([change])
    expect(useFlowStore.getState().edges).toEqual([])
  })

  it('onEdgesChange applies a remove change', () => {
    useFlowStore.setState((s) => ({ ...s, edges: [edge('a', 'b')] }))
    const change: EdgeChange = { id: 'a-b', type: 'remove' }
    useFlowStore.getState().onEdgesChange([change])
    expect(useFlowStore.getState().edges).toEqual([])
  })

  it('connectNodes adds an edge with a unique id', () => {
    const { addNode, connectNodes } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useFlowStore.getState().nodes
    connectNodes({ source: a.id, target: b.id, sourceHandle: null, targetHandle: null })
    const { edges } = useFlowStore.getState()
    expect(edges).toHaveLength(1)
    expect(edges[0].source).toBe(a.id)
    expect(edges[0].target).toBe(b.id)
  })

  it('selectNode sets the selected node id', () => {
    useFlowStore.getState().selectNode('abc')
    expect(useFlowStore.getState().selectedNodeId).toBe('abc')
  })

  it('runFlow executes a chain and updates node statuses and outputs', async () => {
    const { addNode, connectNodes, updateNodeData } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useFlowStore.getState().nodes
    updateNodeData(a.id, { text: 'hi' })
    connectNodes({ source: a.id, target: b.id, sourceHandle: null, targetHandle: null })

    await useFlowStore.getState().runFlow()

    const { nodes, isRunning } = useFlowStore.getState()
    expect(isRunning).toBe(false)
    expect(nodes.find((n) => n.id === a.id)!.data.status).toBe('done')
    expect(nodes.find((n) => n.id === b.id)!.data.status).toBe('done')
    expect(nodes.find((n) => n.id === b.id)!.data.output).toBe('mocked response')
  })

  it('runFlow resets previous outputs before executing', async () => {
    const { addNode, updateNodeData } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    const id = useFlowStore.getState().nodes[0].id
    updateNodeData(id, { text: 'hello', output: 'stale', status: 'done' })

    await useFlowStore.getState().runFlow()

    const node = useFlowStore.getState().nodes[0]
    expect(node.data.status).toBe('done')
    expect(node.data.output).toBe('hello')
  })

  it('connectNodes creates a curved edge with empty data', () => {
    const { addNode, connectNodes } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useFlowStore.getState().nodes
    connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    const [e] = useFlowStore.getState().edges
    expect(e.type).toBe('curved')
    expect(e.data).toEqual({})
  })

  it('updateEdgeData merges a patch onto an edge', () => {
    useFlowStore.setState((s) => ({
      ...s,
      edges: [{ id: 'a-b', source: 'a', target: 'b', type: 'curved', data: { bend: 0 } }],
    }))
    useFlowStore.getState().updateEdgeData('a-b', { bend: 0.75 })
    expect(useFlowStore.getState().edges[0]!.data?.bend).toBe(0.75)
  })

  it('loadFlow replaces nodes/edges and clears the selection', () => {
    const { addNode, selectNode } = useFlowStore.getState()
    addNode('input', { x: 0, y: 0 })
    const id = useFlowStore.getState().nodes[0].id
    selectNode(id)

    useFlowStore.getState().loadFlow(
      [{ id: 'n1', type: 'output', position: { x: 1, y: 1 }, data: { type: 'output' } }],
      [{ id: 'e1', source: 'n1', target: 'n1', type: 'curved', data: {} }],
    )

    const state = useFlowStore.getState()
    expect(state.nodes.map((n) => n.id)).toEqual(['n1'])
    expect(state.edges.map((e) => e.id)).toEqual(['e1'])
    expect(state.selectedNodeId).toBeNull()
  })

  it('migrates legacy "auto" edges to the curved style', () => {
    const raw = {
      state: {
        version: 1,
        nodes: [],
        edges: [{ id: 'a-b', source: 'a', target: 'b', type: 'auto' }],
        edgeStyle: 'auto',
      },
    }
    expect(useFlowStore.persist.getOptions().migrate?.(raw, 1)).toEqual({
      nodes: [],
      edges: [{ id: 'a-b', source: 'a', target: 'b', type: 'curved', data: { bend: 0 } }],
      edgeStyle: 'curved',
    })
  })
})
