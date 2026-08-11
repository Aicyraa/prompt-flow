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
export type FlowEdge = Edge

export interface FlowState {
  nodes: FlowNode[]
  edges: FlowEdge[]
}
