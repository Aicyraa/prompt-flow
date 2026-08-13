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

/** The visual style of an edge, applied globally and persisted with the flow. */
export type EdgeStyle =
  | 'curved'
  | 'bezier'
  | 'smoothstep'
  | 'step'
  | 'straight'

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

export const EDGE_STYLES: { value: EdgeStyle; label: string }[] = [
  { value: 'curved', label: 'Curved' },
  { value: 'bezier', label: 'Bezier' },
  { value: 'smoothstep', label: 'Smoothstep' },
  { value: 'step', label: 'Step' },
  { value: 'straight', label: 'Straight' },
]
