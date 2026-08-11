import type { FlowEdge, FlowNode } from '../types/flow'

export const FLOW_VERSION = 1

export interface SerializedFlow {
  version: number
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface ParsedFlow {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export function serializeFlow(nodes: FlowNode[], edges: FlowEdge[]): string {
  const flow: SerializedFlow = { version: FLOW_VERSION, nodes, edges }
  return JSON.stringify(flow)
}

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
      }
    }
  } catch {
    // fall through to empty flow
  }
  return { nodes: [], edges: [] }
}
