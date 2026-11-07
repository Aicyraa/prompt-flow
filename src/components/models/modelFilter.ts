import { isFree, type ModelInfo } from '../../lib/openrouter'

export type SortKey = 'newest' | 'cheapest' | 'context' | 'name'

export interface ModelFilters {
  query: string
  freeOnly: boolean
  reasoningOnly: boolean
  sort: SortKey
}

export const DEFAULT_FILTERS: ModelFilters = {
  query: '',
  freeOnly: false,
  reasoningOnly: false,
  sort: 'newest',
}

const priceKey = (m: ModelInfo) => m.promptPrice ?? Number.POSITIVE_INFINITY

export function filterModels(
  models: ModelInfo[],
  filters: ModelFilters,
  pinned: string[] = [],
): ModelInfo[] {
  const tokens = filters.query.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = models.filter((m) => {
    if (filters.freeOnly && !isFree(m)) return false
    if (filters.reasoningOnly && !m.reasoning) return false
    if (tokens.length === 0) return true
    const haystack = `${m.name} ${m.id}`.toLowerCase()
    return tokens.every((t) => haystack.includes(t))
  })

  const sorted = [...matches].sort((a, b) => {
    switch (filters.sort) {
      case 'cheapest':
        return priceKey(a) - priceKey(b) || a.name.localeCompare(b.name)
      case 'context':
        return b.contextLength - a.contextLength
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return b.created - a.created
    }
  })

  // Favourites and recents lead the list while browsing (no search text).
  if (tokens.length > 0 || pinned.length === 0) return sorted
  const rank = new Map(pinned.map((id, i) => [id, i]))
  return [
    ...pinned
      .map((id) => sorted.find((m) => m.id === id))
      .filter((m): m is ModelInfo => Boolean(m)),
    ...sorted.filter((m) => !rank.has(m.id)),
  ]
}
