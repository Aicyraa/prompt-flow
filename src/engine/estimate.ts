import type { FlowEdge, FlowNode } from '../types/flow'
import { DEFAULT_MODEL } from '../lib/nodes'
import type { ModelInfo } from '../lib/openrouter'

export interface CostEstimate {
  /** Expected USD. */
  expected: number
  /** Upper bound USD (output at the cap; reasoning models padded). */
  max: number
  /** LLM nodes whose model has no price in the catalog. */
  unpriced: number
}

const CHARS_PER_TOKEN = 4
const DEFAULT_OUTPUT_TOKENS = 500
const REASONING_FACTOR = 3

const tokens = (chars: number) => Math.ceil(chars / CHARS_PER_TOKEN)

/**
 * Rough pre-run cost: prompt size is estimated from static upstream text
 * (inputs and templates), LLM outputs from `maxTokens` or a default.
 * Deliberately approximate; shown as "about".
 */
export function estimateCost(
  nodes: FlowNode[],
  edges: FlowEdge[],
  getModel: (id: string) => ModelInfo | undefined,
  /** Limit to these node ids (e.g. a partial run). */
  only?: Set<string>,
): CostEstimate {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const upstream = (id: string) =>
    edges
      .filter((e) => e.target === id)
      .map((e) => byId.get(e.source))
      .filter((n): n is FlowNode => Boolean(n))

  const memo = new Map<string, number>()
  /** Estimated token count of what a node emits downstream. */
  const emitted = (node: FlowNode): number => {
    const cached = memo.get(node.id)
    if (cached !== undefined) return cached
    memo.set(node.id, 0) // cycle guard
    let result = 0
    const data = node.data
    if (data.type === 'input') result = tokens((data.text ?? '').length)
    else if (data.type === 'prompt') {
      result =
        tokens((data.template ?? '').length) +
        upstream(node.id).reduce((s, n) => s + emitted(n), 0)
    } else if (data.type === 'llm') {
      result = data.maxTokens ?? DEFAULT_OUTPUT_TOKENS
    } else {
      result = upstream(node.id).reduce((s, n) => s + emitted(n), 0)
    }
    memo.set(node.id, result)
    return result
  }

  let expected = 0
  let max = 0
  let unpriced = 0
  for (const node of nodes) {
    if (node.data.type !== 'llm') continue
    if (only && !only.has(node.id)) continue
    const info = getModel(node.data.model ?? DEFAULT_MODEL)
    if (!info || info.promptPrice === null || info.completionPrice === null) {
      unpriced++
      continue
    }
    const promptTokens = upstream(node.id).reduce((s, n) => s + emitted(n), 0)
    const outTokens = node.data.maxTokens ?? DEFAULT_OUTPUT_TOKENS
    const reasoning = info.reasoning ? REASONING_FACTOR : 1
    const cap = info.maxCompletionTokens ?? outTokens * 4
    expected +=
      promptTokens * info.promptPrice +
      outTokens * reasoning * info.completionPrice
    max += promptTokens * info.promptPrice + cap * info.completionPrice
  }
  return { expected, max, unpriced }
}

export function formatUsd(amount: number): string {
  if (amount === 0) return '$0'
  if (amount < 0.01) return `$${amount.toFixed(4)}`
  return `$${amount.toFixed(2)}`
}
