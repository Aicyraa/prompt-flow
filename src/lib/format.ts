import type { Usage } from '../types/flow'
import { formatUsd } from '../engine/estimate'

const compact = (n: number) =>
  n >= 10_000 ? `${(n / 1000).toFixed(0)}K` : n.toLocaleString()

/** "1,234 tokens · $0.0012 · 2.3s" (parts omitted when unknown). */
export function formatUsage(usage?: Usage, ms?: number): string {
  const parts: string[] = []
  if (usage) {
    parts.push(`${compact(usage.promptTokens + usage.completionTokens)} tokens`)
    if (usage.cost !== undefined) parts.push(formatUsd(usage.cost))
  }
  if (ms !== undefined && ms >= 0) parts.push(`${(ms / 1000).toFixed(1)}s`)
  return parts.join(' · ')
}

export interface RunTotals {
  steps: number
  promptTokens: number
  completionTokens: number
  /** Total cost in USD; only meaningful when `priced`. */
  cost: number
  /** False when any model call had no known price (cost would be understated). */
  priced: boolean
  ms: number
}

/**
 * One-line summary of a whole run: "3 steps · 1,234 tokens (800 in / 434 out)
 * · $0.0012 · 4.2s". Says "cost unknown" rather than showing a partial total.
 */
export function formatRunSummary(t: RunTotals): string {
  const tokens = t.promptTokens + t.completionTokens
  const parts = [`${t.steps} ${t.steps === 1 ? 'step' : 'steps'}`]
  if (tokens > 0) {
    parts.push(
      `${compact(tokens)} tokens (${compact(t.promptTokens)} in / ${compact(t.completionTokens)} out)`,
    )
    parts.push(t.priced ? formatUsd(t.cost) : 'cost unknown')
  }
  if (t.ms >= 0) parts.push(`${(t.ms / 1000).toFixed(1)}s`)
  return parts.join(' · ')
}
