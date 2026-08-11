import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type OpenAI from 'openai'
import {
  OPENROUTER_BASE_URL,
  createOpenRouterClient,
  generateText,
} from './openrouter'

type CreateFn = OpenAI['chat']['completions']['create']

function fakeClient(create: CreateFn) {
  return {
    chat: { completions: { create } },
  } as unknown as OpenAI
}

describe('generateText', () => {
  it('returns the assistant content from the completion', async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Hello' } }],
    })
    const result = await generateText(fakeClient(create), {
      model: 'openai/gpt-4o-mini',
      temperature: 0.5,
      prompt: 'Say hi',
    })

    expect(result).toBe('Hello')
    expect(create).toHaveBeenCalledWith({
      model: 'openai/gpt-4o-mini',
      temperature: 0.5,
      messages: [{ role: 'user', content: 'Say hi' }],
    })
  })

  it('returns an empty string when content is null', async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [{ message: { content: null } }],
    })
    const result = await generateText(fakeClient(create), {
      model: 'm',
      temperature: 0,
      prompt: '',
    })
    expect(result).toBe('')
  })

  it('returns an empty string when there are no choices', async () => {
    const create = vi.fn().mockResolvedValue({ choices: [] })
    const result = await generateText(fakeClient(create), {
      model: 'm',
      temperature: 0,
      prompt: '',
    })
    expect(result).toBe('')
  })

  it('propagates client errors', async () => {
    const create = vi.fn().mockRejectedValue(new Error('rate limited'))
    await expect(
      generateText(fakeClient(create), {
        model: 'm',
        temperature: 0,
        prompt: '',
      }),
    ).rejects.toThrow('rate limited')
  })
})

describe('createOpenRouterClient', () => {
  beforeEach(() => vi.stubEnv('OPENROUTER_API_KEY', ''))
  afterEach(() => vi.unstubAllEnvs())

  it('returns null without an api key', () => {
    expect(createOpenRouterClient('')).toBeNull()
    expect(createOpenRouterClient(undefined)).toBeNull()
  })

  it('creates a client pointed at OpenRouter', () => {
    const client = createOpenRouterClient('test-key')
    expect(client).not.toBeNull()
    expect(client!.baseURL).toBe(OPENROUTER_BASE_URL)
  })
})
