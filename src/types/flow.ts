import type { Node, Edge } from '@xyflow/react'

export type NodeType = 'input' | 'prompt' | 'llm' | 'merge' | 'output'

export type NodeStatus = 'idle' | 'running' | 'done' | 'error' | 'cancelled'

export type NodeTextSize = 'sm' | 'md' | 'lg' | 'xl'

/** Fields shared by every node kind. */
type BaseData = {
  label?: string
  /** Text size inside this node; the global setting applies when absent. */
  fontSize?: NodeTextSize
}

export type OutputMode = 'text' | 'json'

export type InputData = BaseData & { type: 'input'; text?: string }
export type PromptData = BaseData & { type: 'prompt'; template?: string }
export type LlmData = BaseData & {
  type: 'llm'
  model?: string
  temperature?: number
  maxTokens?: number
  reasoningEffort?: string
  /** Sent as the system message before the upstream text. */
  system?: string
  /** Tried in order when the primary model fails (not for auth/credit errors). */
  fallbackModels?: string[]
  outputMode?: OutputMode
}
export type MergeSeparator = 'blank' | 'line' | 'rule' | 'custom'

/** Joins the text of several branches into one, without calling a model. */
export type MergeData = BaseData & {
  type: 'merge'
  separator?: MergeSeparator
  /** Used when `separator` is 'custom'. */
  customSeparator?: string
  /** Put each branch's node name above its text. */
  labelled?: boolean
}
export type OutputData = BaseData & { type: 'output' }

/** Discriminated on `type`; narrow with `data.type === '…'`. */
export type NodeData = InputData | PromptData | LlmData | MergeData | OutputData

/** Transient execution state for one node. Never persisted or exported. */
export interface Usage {
  promptTokens: number
  completionTokens: number
  /** USD. From the provider when reported, else computed from catalog prices. */
  cost?: number
}

export interface NodeRun {
  status: NodeStatus
  output?: string
  error?: string
  /** Why the node failed, so the UI can offer the right fix. */
  errorKind?: string
  startedAt?: number
  endedAt?: number
  usage?: Usage
  /** The model that actually answered (differs from the node's when a fallback was used). */
  model?: string
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

export type EdgeData = { bend?: number }
export type FlowEdge = Edge<EdgeData, FlowEdgeType>

export interface FlowState {
  nodes: FlowNode[]
  edges: FlowEdge[]
}
