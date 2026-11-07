import type { FlowNode } from '../types/flow'
import { DEFAULT_MODEL } from '../lib/nodes'
import type { ErrorKind, ModelInfo } from '../lib/openrouter'
import { missingVariables, variableUsers } from '../lib/variables'

export interface PreflightIssue {
  nodeId?: string
  kind: ErrorKind
  message: string
}

interface PreflightInput {
  nodes: FlowNode[]
  hasKey: boolean
  /** Current variable values; omitted means "don't check variables". */
  variables?: Record<string, string>
  /** Null when no real catalog has loaded; model checks are skipped then. */
  catalog: ModelInfo[] | null
}

/**
 * Checks that can fail before any token is spent. Returns every issue so the
 * UI can mark all affected nodes at once.
 */
export function preflight({
  nodes,
  hasKey,
  catalog,
  variables,
}: PreflightInput): PreflightIssue[] {
  const issues: PreflightIssue[] = []

  if (variables) {
    for (const name of missingVariables(nodes, variables)) {
      const users = variableUsers(nodes, name)
      for (const user of users) {
        issues.push({
          nodeId: user.id,
          kind: 'missing_variable',
          message: `Fill in the variable {{${name}}} before running.`,
        })
      }
    }
  }

  const llmNodes = nodes.filter((n) => n.data.type === 'llm')
  if (llmNodes.length === 0) return issues

  if (!hasKey) {
    issues.push({
      kind: 'no_key',
      message: 'No API key. Add yours in Settings.',
    })
  }

  if (catalog) {
    const ids = new Set(catalog.map((m) => m.id))
    for (const node of llmNodes) {
      if (node.data.type !== 'llm') continue
      const wanted = [
        node.data.model ?? DEFAULT_MODEL,
        ...(node.data.fallbackModels ?? []),
      ]
      for (const model of wanted) {
        if (!ids.has(model)) {
          issues.push({
            nodeId: node.id,
            kind: 'model_unavailable',
            message: `Model "${model}" is not available for your API key. Pick another.`,
          })
        }
      }
    }
  }
  return issues
}
