import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  detectByPrefix,
  generate,
  parseGoogleModels,
  parseMistralModels,
  parseOpenAIModels,
  createProviderClient,
} from '.'

afterEach(() => vi.unstubAllGlobals())

function sse(lines: unknown[]) {
  const body = lines.map((l) => `data: ${JSON.stringify(l)}\n\n`).join('')
  return new Response(body, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('detectByPrefix', () => {
  it.each([
    ['sk-or-v1-abc', 'openrouter'],
    ['sk-ant-api03-abc', 'anthropic'],
    ['sk-proj-abc', 'openai'],
    ['AIzaSyABC', 'google'],
    ['gsk_abc', 'groq'],
  ])('%s -> %s', (key, id) => expect(detectByPrefix(key)).toBe(id))

  it('returns null for unprefixed (Mistral-style) keys', () => {
    expect(detectByPrefix('abcdEFGH1234')).toBeNull()
  })
})

describe('model parsers', () => {
  it('keeps OpenAI chat models and drops embeddings, audio and image models', () => {
    const ids = parseOpenAIModels({
      data: [
        { id: 'gpt-4o' },
        { id: 'o3-mini' },
        { id: 'text-embedding-3-small' },
        { id: 'whisper-1' },
        { id: 'dall-e-3' },
        { id: 'gpt-4o-realtime-preview' },
      ],
    })
    expect(ids.map((m) => m.id)).toEqual(['gpt-4o', 'o3-mini'])
    expect(ids[1].supportedParameters).not.toContain('temperature')
    expect(ids[0].supportedParameters).toContain('temperature')
  })

  it('keeps Gemini models that can generate content', () => {
    const models = parseGoogleModels({
      models: [
        {
          name: 'models/gemini-x',
          displayName: 'Gemini X',
          inputTokenLimit: 1000000,
          outputTokenLimit: 8192,
          supportedGenerationMethods: ['generateContent'],
        },
        {
          name: 'models/text-embedding',
          supportedGenerationMethods: ['embedContent'],
        },
      ],
    })
    expect(models).toHaveLength(1)
    expect(models[0]).toMatchObject({
      id: 'gemini-x',
      contextLength: 1000000,
      maxCompletionTokens: 8192,
    })
  })

  it('drops non-chat Mistral models', () => {
    const models = parseMistralModels({
      data: [
        { id: 'mistral-large', capabilities: { completion_chat: true } },
        { id: 'mistral-embed', capabilities: { completion_chat: false } },
      ],
    })
    expect(models.map((m) => m.id)).toEqual(['mistral-large'])
  })
})

describe('generate', () => {
  it('streams from Anthropic with browser-access headers and reports usage', async () => {
    const fn = vi.fn(async () =>
      sse([
        { type: 'message_start', message: { usage: { input_tokens: 7 } } },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hi' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: '!' },
        },
        { type: 'message_delta', usage: { output_tokens: 3 } },
      ]),
    )
    vi.stubGlobal('fetch', fn)
    const onToken = vi.fn()
    const client = createProviderClient('anthropic', 'sk-ant-x')!
    const out = await generate(
      client,
      {
        model: 'claude-x',
        prompt: 'hello',
        system: 'be brief',
        temperature: 0.2,
      },
      { onToken },
    )
    expect(out.text).toBe('Hi!')
    expect(out.usage).toEqual({
      promptTokens: 7,
      completionTokens: 3,
      cost: undefined,
    })
    expect(onToken).toHaveBeenLastCalledWith('Hi!')
    const [url, init] = fn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    const headers = init.headers as Record<string, string>
    expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true')
    const body = JSON.parse(init.body as string)
    expect(body.system).toBe('be brief')
    expect(body.max_tokens).toBeGreaterThan(0)
  })

  it('streams from Gemini, sending the key in a header not the URL', async () => {
    const fn = vi.fn(async () =>
      sse([
        { candidates: [{ content: { parts: [{ text: 'Hel' }] } }] },
        {
          candidates: [{ content: { parts: [{ text: 'lo' }] } }],
          usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 2 },
        },
      ]),
    )
    vi.stubGlobal('fetch', fn)
    const client = createProviderClient('google', 'AIzaSECRET')!
    const out = await generate(client, {
      model: 'gemini-x',
      prompt: 'hi',
      jsonResponse: true,
    })
    expect(out.text).toBe('Hello')
    expect(out.usage?.promptTokens).toBe(4)
    const [url, init] = fn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).not.toContain('AIzaSECRET')
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe(
      'AIzaSECRET',
    )
    expect(
      JSON.parse(init.body as string).generationConfig.responseMimeType,
    ).toBe('application/json')
  })

  it('uses max_completion_tokens for OpenAI and omits OpenRouter-only fields', async () => {
    const fn = vi.fn(async () =>
      sse([{ choices: [{ delta: { content: 'ok' } }] }]),
    )
    vi.stubGlobal('fetch', fn)
    const client = createProviderClient('openai', 'sk-test')!
    await generate(client, {
      model: 'gpt-x',
      prompt: 'p',
      maxTokens: 50,
      reasoningEffort: 'high',
    })
    const body = JSON.parse(
      (fn.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
    )
    expect(body.max_completion_tokens).toBe(50)
    expect(body.max_tokens).toBeUndefined()
    expect(body.reasoning).toBeUndefined()
    expect(body.usage).toBeUndefined()
  })
})
