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
