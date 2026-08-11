import { describe, expect, it, vi } from 'vitest'
import type { GenerateOptions } from '../lib/openrouter'
import {
  applyTemplate,
  executeFlow,
  getUpstreamNodeIds,
} from './executeFlow'
import type { FlowEdge, FlowNode, NodeData, NodeType } from '../types/flow'

function node(id: string, type: NodeType, data: Partial<NodeData> = {}): FlowNode {
  return { id, type, position: { x: 0, y: 0 }, data: { type, status: 'idle', ...data } }
}

function edge(source: string, target: string): FlowEdge {
  return { id: `${source}-${target}`, source, target }
}

function collect() {
  const statuses: { nodeId: string; status: string }[] = []
  const onStatus = (u: { nodeId: string; status: string }) => statuses.push(u)
  return { statuses, onStatus }
}

describe('getUpstreamNodeIds', () => {
  it('returns the source ids of incoming edges', () => {
    const edges = [edge('a', 'c'), edge('b', 'c')]
    expect(getUpstreamNodeIds(edges, 'c').sort()).toEqual(['a', 'b'])
  })

  it('returns an empty list when there are no incoming edges', () => {
    expect(getUpstreamNodeIds([], 'a')).toEqual([])
  })
})

describe('applyTemplate', () => {
  it('replaces {{input}} with upstream values joined by blank lines', () => {
    const result = applyTemplate('Combine:\n{{input}}', [
      { label: 'In', value: 'one' },
      { label: 'In2', value: 'two' },
    ])
    expect(result).toBe('Combine:\none\n\ntwo')
  })

  it('replaces {{label}} with the matching upstream value', () => {
    const result = applyTemplate('{{summary}}', [
      { label: 'Summary', value: 'short text' },
    ])
    expect(result).toBe('short text')
  })

  it('leaves unknown placeholders untouched', () => {
    const result = applyTemplate('{{missing}}', [])
    expect(result).toBe('{{missing}}')
  })

  it('handles regex-special characters in labels', () => {
    const result = applyTemplate('{{a.b}}', [{ label: 'a.b', value: 'x' }])
    expect(result).toBe('x')
  })
})

describe('executeFlow', () => {
  it('feeds an input node value into an llm node and records statuses', async () => {
    const nodes = [
      node('a', 'input', { text: 'Hello' }),
      node('b', 'llm', { model: 'openai/gpt-4o-mini', temperature: 0.3 }),
    ]
    const generate = vi.fn(async (opts: GenerateOptions) => `Echo: ${opts.prompt}`)
    const { statuses, onStatus } = collect()

    const result = await executeFlow({
      nodes,
      edges: [edge('a', 'b')],
      client: null,
      generate,
      onStatus,
    })

    expect(result.succeeded).toBe(true)
    expect(generate).toHaveBeenCalledWith({
      model: 'openai/gpt-4o-mini',
      temperature: 0.3,
      prompt: 'Hello',
    })
    expect(statuses).toContainEqual({ nodeId: 'a', status: 'running' })
    expect(statuses).toContainEqual({ nodeId: 'a', status: 'done', output: 'Hello' })
    expect(statuses).toContainEqual({ nodeId: 'b', status: 'running' })
    expect(statuses).toContainEqual({ nodeId: 'b', status: 'done', output: 'Echo: Hello' })
  })

  it('resolves a prompt template before sending to the llm', async () => {
    const nodes = [
      node('a', 'input', { text: 'cats' }),
      node('b', 'prompt', { template: 'Tell me about {{input}}' }),
      node('c', 'llm', { model: 'm', temperature: 0 }),
    ]
    const generate = vi.fn(async (_: GenerateOptions) => 'response')
    const { onStatus } = collect()

    await executeFlow({ nodes, edges: [edge('a', 'b'), edge('b', 'c')], client: null, generate, onStatus })

    expect(generate).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'Tell me about cats' }))
  })

  it('passes the final value to an output node', async () => {
    const nodes = [node('a', 'input', { text: 'Hi' }), node('b', 'output')]
    const { statuses, onStatus } = collect()

    const result = await executeFlow({ nodes, edges: [edge('a', 'b')], client: null, onStatus })

    expect(result.succeeded).toBe(true)
    expect(statuses).toContainEqual({ nodeId: 'b', status: 'done', output: 'Hi' })
  })

  it('fails an llm node that has no upstream input', async () => {
    const nodes = [node('a', 'llm', { model: 'm' })]
    const { statuses, onStatus } = collect()

    const result = await executeFlow({ nodes, edges: [], client: null, onStatus })

    expect(result.succeeded).toBe(false)
    expect(result.failedNodeId).toBe('a')
    expect(statuses).toContainEqual(
      expect.objectContaining({ nodeId: 'a', status: 'error', error: expect.stringContaining('no incoming prompt') }),
    )
  })

  it('fails an llm node when no client is available', async () => {
    const nodes = [node('a', 'input', { text: 'x' }), node('b', 'llm')]
    const updates: { nodeId: string; status: string; error?: string }[] = []
    const onStatus = (u: { nodeId: string; status: string; error?: string }) => updates.push(u)

    const result = await executeFlow({ nodes, edges: [edge('a', 'b')], client: null, onStatus })

    expect(result.succeeded).toBe(false)
    expect(result.failedNodeId).toBe('b')
    expect(updates).toContainEqual(
      expect.objectContaining({ nodeId: 'b', status: 'error', error: expect.stringContaining('API key') }),
    )
  })

  it('marks a node as failed and stops when generation rejects', async () => {
    const nodes = [
      node('a', 'input', { text: 'x' }),
      node('b', 'llm'),
      node('c', 'output'),
    ]
    const generate = vi.fn(async () => {
      throw new Error('boom')
    })
    const { statuses, onStatus } = collect()

    const result = await executeFlow({
      nodes,
      edges: [edge('a', 'b'), edge('b', 'c')],
      client: null,
      generate,
      onStatus,
    })

    expect(result.succeeded).toBe(false)
    expect(result.failedNodeId).toBe('b')
    expect(statuses).toContainEqual(
      expect.objectContaining({ nodeId: 'b', status: 'error', error: 'boom' }),
    )
    expect(statuses.some((s) => s.nodeId === 'c')).toBe(false)
  })

  it('handles empty text on input nodes without failing', async () => {
    const nodes = [node('a', 'input', { text: '' }), node('b', 'output')]
    const { statuses, onStatus } = collect()

    const result = await executeFlow({ nodes, edges: [edge('a', 'b')], client: null, onStatus })

    expect(result.succeeded).toBe(true)
    expect(statuses).toContainEqual({ nodeId: 'a', status: 'done', output: '' })
  })
})
