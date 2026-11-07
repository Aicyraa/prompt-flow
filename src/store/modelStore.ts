import { create } from 'zustand'
import { fetchModels, isUsableModel, type ModelInfo } from '../lib/openrouter'
import { DEFAULT_MODEL } from '../lib/nodes'

export const MODEL_CACHE_KEY = 'promptflow:models'
export const MODEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error'

/** Used only when the catalog has never loaded (first run, offline). */
export const FALLBACK_MODELS: ModelInfo[] = [
  DEFAULT_MODEL,
  'openai/gpt-4o',
  'meta-llama/llama-3.1-8b-instruct',
].map((id) => ({
  id,
  name: id,
  description: '',
  contextLength: 0,
  promptPrice: null,
  completionPrice: null,
  inputModalities: ['text'],
  outputModalities: ['text'],
  supportedParameters: ['temperature', 'max_tokens'],
  maxCompletionTokens: null,
  reasoning: null,
  created: 0,
  expirationDate: null,
  knowledgeCutoff: null,
  tokenizer: null,
  supportsChat: true,
}))

interface CacheEntry {
  fetchedAt: number
  models: ModelInfo[]
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(MODEL_CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as { fetchedAt?: number; models?: unknown }
    if (typeof entry.fetchedAt !== 'number') return null
    // Re-run the lenient parser's shape on cached rows by wrapping them.
    const models = Array.isArray(entry.models)
      ? (entry.models as ModelInfo[]).filter(
          (m) =>
            m &&
            typeof m.id === 'string' &&
            Array.isArray(m.supportedParameters),
        )
      : []
    return models.length ? { fetchedAt: entry.fetchedAt, models } : null
  } catch {
    return null
  }
}

function writeCache(entry: CacheEntry) {
  try {
    localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Quota exceeded or storage blocked: the in-memory catalog still works.
  }
}

interface ModelStore {
  /** Every parsed model. Use `usable` for anything shown to the user. */
  models: ModelInfo[]
  usable: ModelInfo[]
  status: CatalogStatus
  fetchedAt: number | null
  error: string | null
  /** True once a real catalog (cached or fetched) is loaded. */
  hasCatalog: boolean
  /** Stale-while-revalidate: use the cache immediately, refresh if old. */
  load: (opts?: { force?: boolean }) => Promise<void>
  getModel: (id: string) => ModelInfo | undefined
}

let inflight: Promise<void> | null = null

function applyModels(models: ModelInfo[], fetchedAt: number) {
  return {
    models,
    usable: models.filter(isUsableModel),
    fetchedAt,
    hasCatalog: true,
  }
}

export const useModelStore = create<ModelStore>()((set, get) => ({
  models: FALLBACK_MODELS,
  usable: FALLBACK_MODELS,
  status: 'idle',
  fetchedAt: null,
  error: null,
  hasCatalog: false,

  load: async ({ force = false } = {}) => {
    if (inflight) return inflight
    const cached = get().hasCatalog ? null : readCache()
    if (cached) {
      set({ ...applyModels(cached.models, cached.fetchedAt), status: 'ready' })
    }
    const fetchedAt = get().fetchedAt
    const fresh =
      fetchedAt !== null && Date.now() - fetchedAt < MODEL_CACHE_TTL_MS
    if (!force && fresh) return

    if (!get().hasCatalog) set({ status: 'loading', error: null })
    inflight = (async () => {
      try {
        const models = await fetchModels()
        const now = Date.now()
        writeCache({ fetchedAt: now, models })
        set({ ...applyModels(models, now), status: 'ready', error: null })
      } catch (err) {
        set({
          // Keep serving a cached catalog; only flag the error.
          status: get().hasCatalog ? 'ready' : 'error',
          error: err instanceof Error ? err.message : 'Could not load models',
        })
      } finally {
        inflight = null
      }
    })()
    return inflight
  },

  getModel: (id) => get().models.find((m) => m.id === id),
}))
