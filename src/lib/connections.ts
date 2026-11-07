import type { Edge } from '@xyflow/react'
import type { NodeType } from '../types/flow'

export interface NodeRef {
  id: string
  type: NodeType
}

export const SOURCE_NODE_TYPES: NodeType[] = ['input', 'prompt', 'llm', 'merge']
export const TARGET_NODE_TYPES: NodeType[] = [
  'prompt',
  'llm',
  'merge',
  'output',
]

export function canConnect(
  source: NodeRef,
  target: NodeRef,
  edges: Edge[],
): boolean {
  if (!SOURCE_NODE_TYPES.includes(source.type)) return false
  if (!TARGET_NODE_TYPES.includes(target.type)) return false
  if (source.id === target.id) return false
  if (edges.some((e) => e.source === source.id && e.target === target.id)) {
    return false
  }
  if (wouldCreateCycle(source.id, target.id, edges)) return false
  return true
}

export function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: Edge[],
): boolean {
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    if (edge.source === edge.target) continue
    const targets = adjacency.get(edge.source) ?? []
    targets.push(edge.target)
    adjacency.set(edge.source, targets)
  }

  const visited = new Set<string>()
  const stack = [targetId]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === sourceId) return true
    if (visited.has(current)) continue
    visited.add(current)
    const next = adjacency.get(current) ?? []
    for (const n of next) {
      if (!visited.has(n)) stack.push(n)
    }
  }
  return false
}
