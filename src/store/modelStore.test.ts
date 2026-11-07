import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FALLBACK_MODELS,
  MODEL_CACHE_KEY,
  MODEL_CACHE_TTL_MS,
  useModelStore,
} from './modelStore'

const body = {
  data: [
    {
      id: 'a/chat',
      name: 'A Chat',
      endpoints: ['/api/v1/chat/completions'],
      architecture: { output_modalities: ['text'] },
      supported_parameters: ['temperature'],
    },
    {
      id: 'a/video',
      endpoints: ['/api/v1/videos'],
      architecture: { output_modalities: ['video'] },
    },
  ],
}

const reset = () =>
  useModelStore.setState({
    models: FALLBACK_MODELS,
    usable: FALLBACK_MODELS,
    status: 'idle',
    fetchedAt: null,
    error: null,
    hasCatalog: false,
  })

beforeEach(() => {
  localStorage.clear()
  reset()
})
afterEach(() => vi.unstubAllGlobals())

describe('modelStore', () => {
  it('fetches, filters to usable models, and caches', async () => {
    const fetchMock = vi.fn(async () => Response.json(body))
    vi.stubGlobal('fetch', fetchMock)

    await useModelStore.getState().load()

    const s = useModelStore.getState()
    expect(s.status).toBe('ready')
    expect(s.models.map((m) => m.id)).toEqual(['a/chat', 'a/video'])
    expect(s.usable.map((m) => m.id)).toEqual(['a/chat'])
    expect(localStorage.getItem(MODEL_CACHE_KEY)).toContain('a/chat')
  })

  it('uses a fresh cache without hitting the network', async () => {
    const fetchMock = vi.fn(async () => Response.json(body))
    vi.stubGlobal('fetch', fetchMock)
    await useModelStore.getState().load()
    reset()
    fetchMock.mockClear()

    await useModelStore.getState().load()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(useModelStore.getState().usable[0].id).toBe('a/chat')
  })

  it('serves a stale cache and revalidates in the background', async () => {
    const fetchMock = vi.fn(async () => Response.json(body))
    vi.stubGlobal('fetch', fetchMock)
    await useModelStore.getState().load()
    const cached = JSON.parse(localStorage.getItem(MODEL_CACHE_KEY)!)
    cached.fetchedAt = Date.now() - MODEL_CACHE_TTL_MS - 1000
    localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(cached))
    reset()
    fetchMock.mockClear()

    const pending = useModelStore.getState().load()
    expect(useModelStore.getState().hasCatalog).toBe(true)
    await pending

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('falls back to the built-in list when the first fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('x', { status: 500 })),
    )
    await useModelStore.getState().load()
    const s = useModelStore.getState()
    expect(s.status).toBe('error')
    expect(s.hasCatalog).toBe(false)
    expect(s.usable).toBe(FALLBACK_MODELS)
  })

  it('keeps the cached catalog when a refresh fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(body)),
    )
    await useModelStore.getState().load()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('x', { status: 500 })),
    )
    await useModelStore.getState().load({ force: true })
    const s = useModelStore.getState()
    expect(s.status).toBe('ready')
    expect(s.error).toBeTruthy()
    expect(s.usable.map((m) => m.id)).toEqual(['a/chat'])
  })
})
