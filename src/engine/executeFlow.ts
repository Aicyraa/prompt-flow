import type OpenAI from 'openai'
import type { FlowEdge, FlowNode, NodeStatus } from '../types/flow'
import { generateText, type GenerateOptions } from '../lib/openrouter'
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE } from '../lib/nodes'
import { topologicalSort } from './topologicalSort'

export interface LlmRunner {
  (options: GenerateOptions): Promise<string>
}

export interface NodeStatusUpdate {
  nodeId: string
  status: NodeStatus
  output?: string
  error?: string
}

export interface ExecuteFlowParams {
  nodes: FlowNode[]
  edges: FlowEdge[]
  client: OpenAI | null
  generate?: LlmRunner
  onStatus: (update: NodeStatusUpdate) => void
}

export interface FlowExecutionResult {
  succeeded: boolean
  failedNodeId?: string
}

export function getUpstreamNodeIds(edges: FlowEdge[], nodeId: string): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source)
}

export function applyTemplate(
  template: string,
  upstream: { label: string; value: string }[],
): string {
  let result = template
  const inputs = upstream.map((u) => u.value).filter((v) => v.length > 0)
  result = result.replace(/\{\{\s*input\s*\}\}/gi, () => inputs.join('\n\n'))

  for (const u of upstream) {
    if (!u.label) continue
    const escaped = u.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, 'gi'),
      () => u.value,
    )
  }

  return result
}

function resolveNodeInput(
  node: FlowNode,
  edges: FlowEdge[],
  values: Map<string, string>,
  nodes: FlowNode[],
): string {
  const upstreamIds = getUpstreamNodeIds(edges, node.id)
  const upstreamNodes = upstreamIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is FlowNode => Boolean(n))

  if (node.data.type === 'prompt') {
    return applyTemplate(
      node.data.template ?? '',
      upstreamNodes.map((n) => ({
        label: n.data.label ?? '',
        value: values.get(n.id) ?? '',
      })),
    )
  }

  return upstreamIds.map((id) => values.get(id) ?? '').join('\n\n')
}

export async function executeFlow(
  params: ExecuteFlowParams,
): Promise<FlowExecutionResult> {
  const { nodes, edges, client, onStatus } = params
  const runner: LlmRunner =
    params.generate ?? ((options) => generateText(client!, options))

  const order = topologicalSort(
    nodes.map((n) => n.id),
    edges,
  )
  const values = new Map<string, string>()
  let failedNodeId: string | undefined

  for (const id of order) {
    const node = nodes.find((n) => n.id === id)
    if (!node) continue

    onStatus({ nodeId: id, status: 'running' })

    try {
      if (node.data.type === 'input') {
        const value = node.data.text ?? ''
        values.set(id, value)
        onStatus({ nodeId: id, status: 'done', output: value })
        continue
      }

      const inputText = resolveNodeInput(node, edges, values, nodes)

      if (node.data.type === 'prompt') {
        values.set(id, inputText)
        onStatus({ nodeId: id, status: 'done', output: inputText })
        continue
      }

      if (node.data.type === 'llm') {
        if (!inputText.trim()) {
          throw new Error('LLM node has no incoming prompt')
        }
        if (!client && !params.generate) {
          throw new Error('Missing OpenRouter API key')
        }
        const output = await runner({
          model: node.data.model ?? DEFAULT_MODEL,
          temperature: node.data.temperature ?? DEFAULT_TEMPERATURE,
          prompt: inputText,
        })
        values.set(id, output)
        onStatus({ nodeId: id, status: 'done', output })
        continue
      }

      if (node.data.type === 'output') {
        onStatus({ nodeId: id, status: 'done', output: inputText })
        continue
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution failed'
      onStatus({ nodeId: id, status: 'error', error: message })
      failedNodeId = id
      break
    }
  }

  return { succeeded: failedNodeId === undefined, failedNodeId }
}
