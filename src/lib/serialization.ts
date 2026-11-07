import { z } from 'zod'
import type { EdgeStyle, FlowEdge, FlowNode, NodeData } from '../types/flow'

export const FLOW_VERSION = 5

export interface SerializedFlow {
  version: number
  nodes: FlowNode[]
  edges: FlowEdge[]
  edgeStyle?: EdgeStyle
}

export interface ParsedFlow {
  nodes: FlowNode[]
  edges: FlowEdge[]
  edgeStyle: EdgeStyle
}

const CURVED_ONLY = 'curved' as const

const nodeTypeSchema = z.enum(['input', 'prompt', 'llm', 'output'])

const nodeSchema = z
  .object({
    id: z.string().min(1),
    type: nodeTypeSchema.optional(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.object({ type: nodeTypeSchema }).passthrough(),
  })
  .passthrough()

const edgeSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
  })
  .passthrough()

const flowSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
})

/** Run-time keys older versions stored on node data. */
const LEGACY_RUN_KEYS = ['status', 'output', 'error'] as const

export function stripTransient(data: NodeData): NodeData {
  const clean: Record<string, unknown> = { ...data }
  for (const key of LEGACY_RUN_KEYS) delete clean[key]
  return clean as NodeData
}

export function stripTransientNode(node: FlowNode): FlowNode {
  const { selected: _selected, ...rest } = node
  return { ...rest, data: stripTransient(node.data) }
}

/**
 * Single normalisation path for edges, shared by file import, persisted
 * state migration, and `loadFlow`. Bezier is the only line style, so legacy
 * edge types coerce to it; `data` is always present so renderers can rely on it.
 */
export function normalizeEdges(
  edges: readonly FlowEdge[],
  nodes: readonly FlowNode[],
): FlowEdge[] {
  const ids = new Set(nodes.map((n) => n.id))
  return edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .map((e) => ({
      ...e,
      type: CURVED_ONLY,
      data: { bend: 0, ...(e.data ?? {}) },
    }))
}

export function serializeFlow(
  nodes: FlowNode[],
  edges: FlowEdge[],
  edgeStyle: EdgeStyle,
): string {
  const flow: SerializedFlow = {
    version: FLOW_VERSION,
    nodes: nodes.map(stripTransientNode),
    edges,
    edgeStyle,
  }
  return JSON.stringify(flow)
}

/** Returns null when the text is not a valid PromptFlow file. */
export function parseFlowStrict(json: string): ParsedFlow | null {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return null
  }
  const result = flowSchema.safeParse(raw)
  if (!result.success) return null
  const nodes = result.data.nodes.map((n) =>
    stripTransientNode(n as unknown as FlowNode),
  )
  const edges = normalizeEdges(
    result.data.edges as unknown as FlowEdge[],
    nodes,
  )
  // Bezier is the only line style now; legacy styles coerce to it.
  return { nodes, edges, edgeStyle: CURVED_ONLY }
}

/** Lenient variant: an invalid file yields an empty flow. */
export function parseFlow(json: string): ParsedFlow {
  return (
    parseFlowStrict(json) ?? { nodes: [], edges: [], edgeStyle: CURVED_ONLY }
  )
}
