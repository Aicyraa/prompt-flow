import type { EdgeStyle, FlowEdge, FlowNode } from '../types/flow'

export const FLOW_VERSION = 2

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

const VALID_EDGE_STYLES = new Set<EdgeStyle>([
  'curved',
  'bezier',
  'smoothstep',
  'step',
  'straight',
])

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
        edgeStyle:
          parsed.edgeStyle && VALID_EDGE_STYLES.has(parsed.edgeStyle)
            ? parsed.edgeStyle
            : 'curved',
      }
    }
  } catch {
    // fall through to empty flow
  }
  return { nodes: [], edges: [], edgeStyle: 'curved' }
}
