import type { EdgeStyle, FlowEdge, FlowNode } from '../types/flow'

export const FLOW_VERSION = 3

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

export function serializeFlow(
  nodes: FlowNode[],
  edges: FlowEdge[],
  edgeStyle: EdgeStyle,
): string {
  const flow: SerializedFlow = { version: FLOW_VERSION, nodes, edges, edgeStyle }
  return JSON.stringify(flow)
}

const CURVED_ONLY = 'curved' as const

export function parseFlow(json: string): ParsedFlow {
  try {
    const parsed = JSON.parse(json) as Partial<SerializedFlow>
    if (
      parsed &&
      Array.isArray(parsed.nodes) &&
      Array.isArray(parsed.edges)
    ) {
      return {
        nodes: parsed.nodes as FlowNode[],
        edges: parsed.edges as FlowEdge[],
        // Bezier is the only line style now; legacy styles coerce to it.
        edgeStyle: CURVED_ONLY,
      }
    }
  } catch {
    // fall through to empty flow
  }
  return { nodes: [], edges: [], edgeStyle: CURVED_ONLY }
}
