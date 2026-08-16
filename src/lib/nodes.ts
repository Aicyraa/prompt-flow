import { nanoid } from 'nanoid'
import type { XYPosition } from '@xyflow/react'
import type { FlowNode, NodeData, NodeType } from '../types/flow'

export const DEFAULT_MODEL = 'openai/gpt-4o-mini'
export const DEFAULT_TEMPERATURE = 0.7

export const NODE_LABELS: Record<NodeType, string> = {
  input: 'Input',
  prompt: 'Prompt',
  llm: 'LLM',
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
  if (
    (node.type === 'input' || node.type === 'output') &&
    node.width == null
  ) {
    return { ...node, width: FIXED_NODE_WIDTH }
  }
  return node
}

export const MODEL_OPTIONS: string[] = [
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-1.5-flash',
  'meta-llama/llama-3.1-8b-instruct',
]

export function createNode(type: NodeType, position: XYPosition): FlowNode {
  const data: NodeData = {
    type,
    label: NODE_LABELS[type],
    status: 'idle',
  }

  switch (type) {
    case 'input':
      data.text = ''
      break
    case 'prompt':
      data.template = ''
      break
    case 'llm':
      data.model = DEFAULT_MODEL
      data.temperature = DEFAULT_TEMPERATURE
      break
    case 'output':
      data.output = ''
      break
  }

  return withFixedWidth({
    id: nanoid(),
    type,
    position,
    data,
  })
}
