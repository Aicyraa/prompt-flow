import type { Node, Edge } from '@xyflow/react'

export type NodeType = 'input' | 'prompt' | 'llm' | 'output'

export type NodeStatus = 'idle' | 'running' | 'done' | 'error'

export interface NodeData {
  type: NodeType
  label?: string
  text?: string
  template?: string
  model?: string
  temperature?: number
  output?: string
  error?: string
  status?: NodeStatus
  [key: string]: unknown
}

export type FlowNode = Node<NodeData, NodeType>

/**
 * The visual style of an edge. Bezier is the only line style — every edge
 * renders as the wavy cubic arc with a straight lead-in/out and an arrowhead.
 * Kept as a type so serialized flows can carry (and ignore) legacy values.
 */
export type EdgeStyle = 'curved'

/** Edge type string used by React Flow's `edgeTypes` registry. */
export type FlowEdgeType = EdgeStyle

export interface EdgeData {
  bend?: number
  [key: string]: unknown
}
export type FlowEdge = Edge<EdgeData, FlowEdgeType>

export interface FlowState {
  nodes: FlowNode[]
  edges: FlowEdge[]
}
