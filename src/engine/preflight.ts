import type { FlowNode } from '../types/flow'
import { DEFAULT_MODEL } from '../lib/nodes'
import type { ErrorKind, ModelInfo } from '../lib/openrouter'

export interface PreflightIssue {
  nodeId?: string
  kind: ErrorKind
  message: string
}

interface PreflightInput {
  nodes: FlowNode[]
  hasKey: boolean
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
}: PreflightInput): PreflightIssue[] {
  const issues: PreflightIssue[] = []
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
            message: `Model "${model}" is not in the OpenRouter catalog. Pick another.`,
          })
        }
      }
    }
  }
  return issues
}
