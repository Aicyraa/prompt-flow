import { nanoid } from 'nanoid'
import type { XYPosition } from '@xyflow/react'
import type { FlowNode, NodeData, NodeType } from '../types/flow'

export const DEFAULT_MODEL = 'openai/gpt-4o-mini'
export const DEFAULT_TEMPERATURE = 0.7

export const NODE_LABELS: Record<NodeType, string> = {
  input: 'Input',
  prompt: 'Prompt',
  llm: 'Agent',
  output: 'Output',
}

/** Fixed flow-space width for nodes whose shell has a locked layout. */
export const FIXED_NODE_WIDTH = 288

/**
 * Print a node with a locked width (input/output). React Flow positions the
 * side handles and edge attachment points against the node's own width, so
 * it must match the rendered shell or the handles drift toward the centre.
 */
export function withFixedWidth(node: FlowNode): FlowNode {
  if ((node.type === 'input' || node.type === 'output') && node.width == null) {
    return { ...node, width: FIXED_NODE_WIDTH }
  }
  return node
}

export function createNode(type: NodeType, position: XYPosition): FlowNode {
  const label = NODE_LABELS[type]
  let data: NodeData
  switch (type) {
    case 'input':
      data = { type, label, text: '' }
      break
    case 'prompt':
      data = { type, label, template: '' }
      break
    case 'llm':
      data = {
        type,
        label,
        model: DEFAULT_MODEL,
        temperature: DEFAULT_TEMPERATURE,
      }
      break
    case 'output':
      data = { type, label }
      break
  }

  return withFixedWidth({
    id: nanoid(),
    type,
    position,
    data,
  })
}
