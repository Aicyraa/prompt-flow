import type { FlowNode } from '../types/flow'

/** `{{name}}`: a word, optionally with dashes, inside double braces. */
const VARIABLE = /\{\{\s*([A-Za-z_][\w-]*)\s*\}\}/g

/** `{{input}}` always means "the upstream text", never a variable. */
const RESERVED = new Set(['input'])

/** Text fields of a node that may mention variables. */
function nodeTexts(node: FlowNode): string[] {
  switch (node.data.type) {
    case 'input':
      return [node.data.text ?? '']
    case 'prompt':
      return [node.data.template ?? '']
    case 'llm':
      return [node.data.system ?? '']
    default:
      return []
  }
}

/** Names mentioned in `text`, in order of first appearance. */
export function variableNames(text: string): string[] {
  const seen = new Set<string>()
  for (const match of text.matchAll(VARIABLE)) {
    if (!RESERVED.has(match[1].toLowerCase())) seen.add(match[1])
  }
  return [...seen]
}

/**
 * The variables a flow uses. A `{{name}}` that matches another node's label
 * is a reference to that node's output (see `applyTemplate`), not a variable.
 */
export function findFlowVariables(nodes: FlowNode[]): string[] {
  const labels = new Set(
    nodes.map((n) => (n.data.label ?? '').trim().toLowerCase()).filter(Boolean),
  )
  const seen = new Set<string>()
  for (const node of nodes) {
    for (const text of nodeTexts(node)) {
      for (const name of variableNames(text)) {
        if (!labels.has(name.toLowerCase())) seen.add(name)
      }
    }
  }
  return [...seen]
}

/** Which nodes mention each variable (to point errors at the right place). */
export function variableUsers(nodes: FlowNode[], name: string): FlowNode[] {
  return nodes.filter((n) =>
    nodeTexts(n).some((text) => variableNames(text).includes(name)),
  )
}

/**
 * Replaces `{{name}}` with its value. Unknown or reserved names are left
 * exactly as written, and values are inserted literally (never re-scanned).
 */
export function substituteVariables(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(VARIABLE, (match, name: string) =>
    RESERVED.has(name.toLowerCase()) || !(name in values)
      ? match
      : values[name],
  )
}

/** Variables the flow uses that have no value yet. */
export function missingVariables(
  nodes: FlowNode[],
  values: Record<string, string>,
): string[] {
  return findFlowVariables(nodes).filter((name) => !values[name]?.trim())
}
