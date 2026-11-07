import { afterEach, describe, expect, it, vi } from 'vitest'
import { classifyError } from './errors'
import { retryAfterMs } from '../../engine/retry'
import {
  ApiError,
  OPENROUTER_BASE_URL,
  createOpenRouterClient,
  generateText,
  readSse,
} from './client'

const client = { apiKey: 'sk-or-v1-test', baseURL: OPENROUTER_BASE_URL }

/** A streaming Response whose body arrives in the given byte chunks. */
function sseResponse(parts: string[], init: ResponseInit = {}) {
  const enc = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const p of parts) controller.enqueue(enc.encode(p))
      controller.close()
    },
  })
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
    ...init,
  })
}

const data = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`
const delta = (content: string | null) =>
  data({ choices: [{ delta: { content } }] })

function mockFetch(res: Response | (() => Response)) {
  const fn = vi.fn(async () => (typeof res === 'function' ? res() : res))
  vi.stubGlobal('fetch', fn)
  return fn
}
const sentBody = (fn: ReturnType<typeof mockFetch>) =>
  JSON.parse(
    (fn.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
  )

afterEach(() => vi.unstubAllGlobals())

describe('generateText', () => {
  it('streams tokens, reports partial text, and returns text and usage', async () => {
    const fn = mockFetch(
      sseResponse([
        delta('Hel'),
        delta('lo'),
        data({
          choices: [],
          usage: { prompt_tokens: 5, completion_tokens: 2, cost: 0.001 },
        }),
        'data: [DONE]\n\n',
      ]),
    )
    const onToken = vi.fn()
    const result = await generateText(
      client,
      { model: 'openai/gpt-4o-mini', temperature: 0.5, prompt: 'Say hi' },
      { onToken },
    )

    expect(result).toEqual({
      text: 'Hello',
      usage: { promptTokens: 5, completionTokens: 2, cost: 0.001 },
    })
    expect(onToken.mock.calls.map((c) => c[0])).toEqual(['Hel', 'Hello'])

    const [url, init] = fn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${OPENROUTER_BASE_URL}/chat/completions`)
    expect(init.method).toBe('POST')
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer sk-or-v1-test')
    expect(headers['X-Title']).toBe('PromptFlow')
    expect(sentBody(fn)).toMatchObject({
      model: 'openai/gpt-4o-mini',
      temperature: 0.5,
      stream: true,
      messages: [{ role: 'user', content: 'Say hi' }],
    })
  })

  it('passes the abort signal to fetch', async () => {
    const fn = mockFetch(sseResponse(['data: [DONE]\n\n']))
    const controller = new AbortController()
    await generateText(
      client,
      { model: 'm', prompt: 'x' },
      { signal: controller.signal },
    )
    expect(
      (fn.mock.calls[0] as unknown as [string, RequestInit])[1].signal,
    ).toBe(controller.signal)
  })

  it('sends a system message first and JSON response format when asked', async () => {
    const fn = mockFetch(sseResponse([]))
    await generateText(client, {
      model: 'm',
      prompt: 'user text',
      system: 'be brief',
      jsonResponse: true,
    })
    const body = sentBody(fn)
    expect(body.messages).toEqual([
      { role: 'system', content: 'be brief' },
      { role: 'user', content: 'user text' },
    ])
    expect(body.response_format).toEqual({ type: 'json_object' })
  })

  it('omits unsupported params and sends max_tokens / reasoning when set', async () => {
    const fn = mockFetch(sseResponse([]))
    await generateText(client, {
      model: 'm',
      prompt: 'x',
      maxTokens: 100,
      reasoningEffort: 'low',
    })
    const body = sentBody(fn)
    expect(body).not.toHaveProperty('temperature')
    expect(body).not.toHaveProperty('response_format')
    expect(body.max_tokens).toBe(100)
    expect(body.reasoning).toEqual({ effort: 'low' })
  })

  it('returns an empty string for null deltas and empty streams', async () => {
    mockFetch(sseResponse([delta(null), 'data: [DONE]\n\n']))
    const result = await generateText(client, { model: 'm', prompt: '' })
    expect(result).toEqual({ text: '', usage: undefined })
  })

  it('turns a mid-stream error chunk into a thrown error with its status', async () => {
    mockFetch(
      sseResponse([
        delta('par'),
        data({ error: { message: 'upstream down', code: 502 } }),
      ]),
    )
    await expect(
      generateText(client, { model: 'm', prompt: 'x' }),
    ).rejects.toMatchObject({ message: 'upstream down', status: 502 })
  })

  it('throws an ApiError carrying status and headers for HTTP failures', async () => {
    mockFetch(
      () =>
        new Response('{"error":{"message":"slow down"}}', {
          status: 429,
          headers: { 'retry-after': '4', 'content-type': 'application/json' },
        }),
    )
    const err = await generateText(client, { model: 'm', prompt: 'x' }).catch(
      (e) => e,
    )
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 429, message: 'slow down' })
    // the engine's classification and Retry-After handling work on it directly
    expect(classifyError(err).kind).toBe('rate_limit')
    expect(retryAfterMs(err)).toBe(4000)
  })

  it('uses a generic message for non-JSON error bodies', async () => {
    mockFetch(() => new Response('<html>bad gateway</html>', { status: 502 }))
    await expect(
      generateText(client, { model: 'm', prompt: 'x' }),
    ).rejects.toMatchObject({
      status: 502,
      message: 'Request failed (502)',
    })
  })

  it('propagates network failures as TypeErrors (classified as network)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )
    const err = await generateText(client, { model: 'm', prompt: 'x' }).catch(
      (e) => e,
    )
    expect(classifyError(err).kind).toBe('network')
  })

  it('never puts the key anywhere but the Authorization header', async () => {
    const fn = mockFetch(sseResponse([]))
    await generateText(client, { model: 'm', prompt: 'x' })
    const [url, init] = fn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).not.toContain('sk-or')
    expect(init.body as string).not.toContain('sk-or')
  })
})

describe('readSse', () => {
  const collect = async (parts: string[]) => {
    const res = sseResponse(parts)
    const out: unknown[] = []
    for await (const chunk of readSse(res.body!)) out.push(chunk)
    return out
  }

  it('reassembles events split across network chunks', async () => {
    const full = `data: {"a":1}\n\ndata: {"b":2}\n\n`
    expect(
      await collect([full.slice(0, 9), full.slice(9, 20), full.slice(20)]),
    ).toEqual([{ a: 1 }, { b: 2 }])
  })

  it('ignores keep-alive comments and blank lines, and stops at [DONE]', async () => {
    expect(
      await collect([
        ': OPENROUTER PROCESSING\n\n',
        'data: {"a":1}\n\n',
        'data: [DONE]\n\n',
        'data: {"late":1}\n\n',
      ]),
    ).toEqual([{ a: 1 }])
  })

  it('handles CRLF line endings and a final event with no trailing newline', async () => {
    expect(await collect(['data: {"a":1}\r\n\r\n', 'data: {"b":2}'])).toEqual([
      { a: 1 },
      { b: 2 },
    ])
  })

  it('skips malformed JSON instead of failing the stream', async () => {
    expect(await collect(['data: {oops\n\n', 'data: {"ok":true}\n\n'])).toEqual(
      [{ ok: true }],
    )
  })

  it('does not split multi-byte characters across chunks', async () => {
    const bytes = new TextEncoder().encode('data: {"t":"héllo ✓"}\n\n')
    // feed raw bytes split mid-character via a custom stream
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(bytes.slice(0, 14))
        c.enqueue(bytes.slice(14))
        c.close()
      },
    })
    const out: unknown[] = []
    for await (const chunk of readSse(body)) out.push(chunk)
    expect(out).toEqual([{ t: 'héllo ✓' }])
  })
})

describe('createOpenRouterClient', () => {
  it('returns null without an api key', () => {
    expect(createOpenRouterClient('')).toBeNull()
    expect(createOpenRouterClient(undefined)).toBeNull()
  })

  it('creates a client pointed at OpenRouter', () => {
    expect(createOpenRouterClient('test-key')).toEqual({
      apiKey: 'test-key',
      baseURL: OPENROUTER_BASE_URL,
    })
  })
})
