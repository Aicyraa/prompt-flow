// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectKey } from './connection'
import { useSettingsStore } from './settingsStore'
import { useModelStore } from './modelStore'

const KEY = 'sk-ant-api03-SUPERSECRET'

function reset() {
  localStorage.clear()
  sessionStorage.clear()
  useSettingsStore.setState({
    byokEnabled: false,
    apiKey: '',
    provider: 'openrouter',
    keyStatus: 'unknown',
    keyInfo: null,
    keyError: null,
  })
}

beforeEach(reset)
afterEach(() => vi.unstubAllGlobals())

describe('connectKey', () => {
  it('detects Anthropic by prefix and loads that key’s models', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: [
          { id: 'claude-sonnet-x', display_name: 'Claude Sonnet X' },
          { id: 'claude-haiku-x', display_name: 'Claude Haiku X' },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    useSettingsStore.getState().setApiKey(KEY)
    await connectKey()
    const s = useSettingsStore.getState()
    expect(s.keyStatus).toBe('valid')
    expect(s.provider).toBe('anthropic')
    expect(s.byokEnabled).toBe(true)
    expect(useModelStore.getState().provider).toBe('anthropic')
    expect(useModelStore.getState().usable.map((m) => m.id)).toContain(
      'claude-sonnet-x',
    )
    const headers = (
      fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    )[1].headers as Record<string, string>
    expect(headers['x-api-key']).toBe(KEY)
  })

  it('probes providers for an unprefixed key and picks the one that accepts it', async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url).includes('api.mistral.ai')) {
        return Response.json({
          data: [
            { id: 'mistral-large-x', capabilities: { completion_chat: true } },
          ],
        })
      }
      return new Response('{}', { status: 401 })
    })
    vi.stubGlobal('fetch', fetchMock)
    useSettingsStore.getState().setApiKey('abcdEFGH1234abcdEFGH1234abcdEFGH')
    await connectKey()
    expect(useSettingsStore.getState().provider).toBe('mistral')
    expect(useSettingsStore.getState().keyStatus).toBe('valid')
  })

  it('marks a key every provider refuses as rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    )
    useSettingsStore.getState().setApiKey('abcdEFGH1234abcdEFGH1234abcdEFGH')
    await connectKey()
    expect(useSettingsStore.getState().keyStatus).toBe('rejected')
  })

  it('reports a network failure without leaking the key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    useSettingsStore.getState().setApiKey(KEY)
    await connectKey()
    const s = useSettingsStore.getState()
    expect(s.keyStatus).toBe('error')
    expect(s.keyError).not.toContain(KEY)
  })

  it('trusts a recognised prefix: a rejected sk-ant key is not probed elsewhere', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    useSettingsStore.getState().setApiKey(KEY)
    await connectKey()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(useSettingsStore.getState().keyStatus).toBe('rejected')
  })
})
