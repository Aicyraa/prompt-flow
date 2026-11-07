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

/** "just now", "5 min ago", "3 h ago", "2 days ago", or a date after a week. */
export function formatAgo(then: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - then) / 1000))
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}
