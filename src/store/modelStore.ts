import { create } from 'zustand'
import { fetchModels, isUsableModel, type ModelInfo } from '../lib/openrouter'
import { listProviderModels, type ProviderId } from '../lib/providers'
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

const cacheKey = (provider: ProviderId) =>
  provider === 'openrouter' ? MODEL_CACHE_KEY : `${MODEL_CACHE_KEY}:${provider}`

function readCache(provider: ProviderId): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(provider))
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

function writeCache(provider: ProviderId, entry: CacheEntry) {
  try {
    localStorage.setItem(cacheKey(provider), JSON.stringify(entry))
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
  /** Provider the loaded catalog belongs to. */
  provider: ProviderId
  /**
   * Stale-while-revalidate: use the cache immediately, refresh if old.
   * With no key the public OpenRouter catalog is used.
   */
  load: (opts?: LoadOptions) => Promise<void>
  /** Replace the catalog with models just fetched for a key. */
  setCatalog: (provider: ProviderId, models: ModelInfo[]) => void
  getModel: (id: string) => ModelInfo | undefined
}

export interface LoadOptions {
  force?: boolean
  provider?: ProviderId
  apiKey?: string
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
  provider: 'openrouter',

  setCatalog: (provider, models) => {
    const now = Date.now()
    writeCache(provider, { fetchedAt: now, models })
    set({ ...applyModels(models, now), provider, status: 'ready', error: null })
  },

  load: async ({ force = false, provider = 'openrouter', apiKey } = {}) => {
    if (inflight) return inflight
    // A catalog from another provider must never be reused for this one.
    if (get().provider !== provider) {
      set({
        models: provider === 'openrouter' ? FALLBACK_MODELS : [],
        usable: provider === 'openrouter' ? FALLBACK_MODELS : [],
        fetchedAt: null,
        hasCatalog: false,
        provider,
      })
    }
    const cached = get().hasCatalog ? null : readCache(provider)
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
        const models =
          provider === 'openrouter' && !apiKey
            ? await fetchModels()
            : (await listProviderModels(provider, apiKey ?? '')).models
        // The user may have switched provider while this was in flight.
        if (get().provider !== provider) return
        const now = Date.now()
        writeCache(provider, { fetchedAt: now, models })
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
