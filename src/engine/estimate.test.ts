import { describe, expect, it } from 'vitest'
import { createNode } from '../lib/nodes'
import { parseModels } from '../lib/openrouter'
import type { FlowEdge, FlowNode, NodeData } from '../types/flow'
import { estimateCost, formatUsd } from './estimate'

const [cheap, reasoner, free] = parseModels({
  data: [
    {
      id: 'a/cheap',
      pricing: { prompt: '0.000001', completion: '0.000002' },
      top_provider: { max_completion_tokens: 1000 },
    },
    {
      id: 'a/reasoner',
      pricing: { prompt: '0.000001', completion: '0.000002' },
      reasoning: { mandatory: true, supported_efforts: ['low'] },
    },
    { id: 'a/free', pricing: { prompt: '0', completion: '0' } },
  ],
})
const catalog = new Map([cheap, reasoner, free].map((m) => [m.id, m]))
const getModel = (id: string) => catalog.get(id)

function chain(model: string, text: string, extra: Partial<NodeData> = {}) {
  const input = createNode('input', { x: 0, y: 0 })
  input.data = { ...input.data, text } as NodeData
  const llm = createNode('llm', { x: 1, y: 0 })
  llm.data = { ...llm.data, model, ...extra } as NodeData
  const edges: FlowEdge[] = [{ id: 'e', source: input.id, target: llm.id }]
  return { nodes: [input, llm] as FlowNode[], edges }
}

describe('estimateCost', () => {
  it('prices prompt tokens (~chars/4) plus default output tokens', () => {
    const { nodes, edges } = chain('a/cheap', 'x'.repeat(4000))
    const e = estimateCost(nodes, edges, getModel)
    // 1000 prompt tokens * 1e-6 + 500 output * 2e-6
    expect(e.expected).toBeCloseTo(0.001 + 0.001, 6)
    // upper bound uses the model's max completion tokens (1000)
    expect(e.max).toBeCloseTo(0.001 + 0.002, 6)
    expect(e.unpriced).toBe(0)
  })

  it('uses maxTokens when set and pads reasoning models', () => {
    const a = chain('a/cheap', '', { maxTokens: 100 } as Partial<NodeData>)
    expect(estimateCost(a.nodes, a.edges, getModel).expected).toBeCloseTo(
      0.0002,
      6,
    )
    const b = chain('a/reasoner', '', { maxTokens: 100 } as Partial<NodeData>)
    expect(estimateCost(b.nodes, b.edges, getModel).expected).toBeCloseTo(
      0.0006,
      6,
    )
  })

  it('is zero for free models and counts unknown models as unpriced', () => {
    const f = chain('a/free', 'hello')
    expect(estimateCost(f.nodes, f.edges, getModel).expected).toBe(0)
    const u = chain('x/unknown', 'hello')
    expect(estimateCost(u.nodes, u.edges, getModel)).toMatchObject({
      expected: 0,
      unpriced: 1,
    })
  })

  it('feeds an upstream LLM output into the next LLM prompt', () => {
    const a = chain('a/cheap', '', { maxTokens: 1000 } as Partial<NodeData>)
    const second = createNode('llm', { x: 2, y: 0 })
    second.data = {
      ...second.data,
      model: 'a/cheap',
      maxTokens: 10,
    } as NodeData
    const edges = [
      ...a.edges,
      { id: 'e2', source: a.nodes[1].id, target: second.id },
    ]
    const e = estimateCost([...a.nodes, second], edges, getModel)
    // second LLM prompt = first LLM output (1000 tokens)
    const first = 1000 * 2e-6
    const secondCost = 1000 * 1e-6 + 10 * 2e-6
    expect(e.expected).toBeCloseTo(first + secondCost, 6)
  })

  it('limits the estimate to the given node set', () => {
    const { nodes, edges } = chain('a/cheap', 'x'.repeat(4000))
    expect(estimateCost(nodes, edges, getModel, new Set()).expected).toBe(0)
  })
})

describe('formatUsd', () => {
  it('formats small and normal amounts', () => {
    expect(formatUsd(0)).toBe('$0')
    expect(formatUsd(0.00123)).toBe('$0.0012')
    expect(formatUsd(1.5)).toBe('$1.50')
  })
})
