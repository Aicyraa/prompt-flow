import { z } from 'zod'
import {
  fetchModels as fetchOpenRouterModels,
  parseModels,
  type ModelInfo,
} from '../openrouter/models'
import { KeyRejectedError } from '../openrouter/key'
import { verifyKey, type KeyInfo } from '../openrouter/key'
import { OPENROUTER_BASE_URL } from '../openrouter/client'
import { PROVIDERS, type ProviderId } from './types'

function base(id: string, patch: Partial<ModelInfo> = {}): ModelInfo {
  return {
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
    ...patch,
  }
}

const rows = z.object({ data: z.array(z.record(z.unknown())) }).partial()
const str = (v: unknown) => (typeof v === 'string' ? v : undefined)
const num = (v: unknown) => (typeof v === 'number' ? v : undefined)

/** OpenAI reasoning families reject a custom temperature. */
export const OPENAI_NO_TEMPERATURE = /^(o\d|gpt-5)/

const OPENAI_CHAT = /^(gpt-|o\d|chatgpt-)/
const OPENAI_EXCLUDE =
  /(instruct|realtime|audio|transcribe|tts|image|search|embedding|moderation|codex|computer-use|diarize)/

export function parseOpenAIModels(body: unknown): ModelInfo[] {
  const parsed = rows.safeParse(body)
  return (parsed.success ? (parsed.data.data ?? []) : []).flatMap((r) => {
    const id = str(r.id)
    if (!id || !OPENAI_CHAT.test(id) || OPENAI_EXCLUDE.test(id)) return []
    const supported = ['max_tokens', 'response_format']
    if (!OPENAI_NO_TEMPERATURE.test(id)) supported.unshift('temperature')
    return [
      base(id, {
        created: num(r.created) ?? 0,
        supportedParameters: supported,
      }),
    ]
  })
}

export function parseAnthropicModels(body: unknown): ModelInfo[] {
  const parsed = rows.safeParse(body)
  return (parsed.success ? (parsed.data.data ?? []) : []).flatMap((r) => {
    const id = str(r.id)
    if (!id) return []
    const created = Date.parse(str(r.created_at) ?? '')
    return [
      base(id, {
        name: str(r.display_name) ?? id,
        created: Number.isFinite(created) ? Math.floor(created / 1000) : 0,
      }),
    ]
  })
}

export function parseGoogleModels(body: unknown): ModelInfo[] {
  const list =
    typeof body === 'object' && body !== null && 'models' in body
      ? (body as { models: unknown }).models
      : undefined
  if (!Array.isArray(list)) return []
  return list.flatMap((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>
    const name = str(r.name)
    const methods = Array.isArray(r.supportedGenerationMethods)
      ? r.supportedGenerationMethods
      : []
    if (!name || !methods.includes('generateContent')) return []
    const id = name.replace(/^models\//, '')
    if (!/gemini|gemma/i.test(id) || /embed|aqa|imagen|tts|image/i.test(id))
      return []
    return [
      base(id, {
        name: str(r.displayName) ?? id,
        description: str(r.description)?.slice(0, 400) ?? '',
        contextLength: num(r.inputTokenLimit) ?? 0,
        maxCompletionTokens: num(r.outputTokenLimit) ?? null,
        supportedParameters: ['temperature', 'max_tokens', 'response_format'],
      }),
    ]
  })
}

export function parseGroqModels(body: unknown): ModelInfo[] {
  const parsed = rows.safeParse(body)
  return (parsed.success ? (parsed.data.data ?? []) : []).flatMap((r) => {
    const id = str(r.id)
    if (!id || r.active === false) return []
    if (/whisper|tts|playai|guard|embed/i.test(id)) return []
    return [
      base(id, {
        created: num(r.created) ?? 0,
        contextLength: num(r.context_window) ?? 0,
        maxCompletionTokens: num(r.max_completion_tokens) ?? null,
        supportedParameters: ['temperature', 'max_tokens', 'response_format'],
      }),
    ]
  })
}

export function parseMistralModels(body: unknown): ModelInfo[] {
  const parsed = rows.safeParse(body)
  const seen = new Set<string>()
  return (parsed.success ? (parsed.data.data ?? []) : []).flatMap((r) => {
    const id = str(r.id)
    const caps = (r.capabilities ?? {}) as Record<string, unknown>
    if (!id || seen.has(id) || caps.completion_chat === false) return []
    if (/embed|moderation|ocr|transcri/i.test(id)) return []
    seen.add(id)
    return [
      base(id, {
        name: str(r.name) ?? id,
        description: str(r.description)?.slice(0, 400) ?? '',
        created: num(r.created) ?? 0,
        contextLength: num(r.max_context_length) ?? 0,
        inputModalities: caps.vision === true ? ['text', 'image'] : ['text'],
        supportedParameters: ['temperature', 'max_tokens', 'response_format'],
      }),
    ]
  })
}

/** A provider rejected the key (401/403) or answered something unusable. */
export class ListModelsError extends Error {}

async function getJson(
  url: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<unknown> {
  const res = await fetch(url, { headers, signal })
  if (res.status === 401 || res.status === 403) throw new KeyRejectedError()
  if (!res.ok) throw new ListModelsError(`Model list failed (${res.status})`)
  return res.json().catch(() => ({}))
}

export interface ListedModels {
  models: ModelInfo[]
  /** OpenRouter only: balance and limit details for the key. */
  keyInfo?: KeyInfo
}

/**
 * Lists the models a key can use. Throws KeyRejectedError when the provider
 * refuses the key, so the same call doubles as key validation.
 */
export async function listProviderModels(
  provider: ProviderId,
  apiKey: string,
  signal?: AbortSignal,
): Promise<ListedModels> {
  const baseURL = PROVIDERS[provider].baseURL
  const bearer = { Authorization: `Bearer ${apiKey}` }
  let models: ModelInfo[]
  let keyInfo: KeyInfo | undefined

  switch (provider) {
    case 'openrouter': {
      // The public catalog accepts any key, so validate it separately.
      keyInfo = await verifyKey(apiKey, signal)
      try {
        // Respects the account's provider and privacy preferences.
        models = parseModels(
          await getJson(`${OPENROUTER_BASE_URL}/models/user`, bearer, signal),
        )
      } catch (err) {
        if (err instanceof KeyRejectedError) throw err
        models = []
      }
      if (models.length === 0) models = await fetchOpenRouterModels(signal)
      break
    }
    case 'anthropic':
      models = parseAnthropicModels(
        await getJson(
          `${baseURL}/models?limit=1000`,
          {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          signal,
        ),
      )
      break
    case 'google': {
      // Page through the list; the key goes in a header, not the URL.
      const headers = { 'x-goog-api-key': apiKey }
      const all: unknown[] = []
      let token = ''
      for (let page = 0; page < 5; page++) {
        const body = (await getJson(
          `${baseURL}/models?pageSize=200${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`,
          headers,
          signal,
        )) as { models?: unknown[]; nextPageToken?: string }
        all.push(...(body.models ?? []))
        token = body.nextPageToken ?? ''
        if (!token) break
      }
      models = parseGoogleModels({ models: all })
      break
    }
    case 'openai':
      models = parseOpenAIModels(
        await getJson(`${baseURL}/models`, bearer, signal),
      )
      break
    case 'groq':
      models = parseGroqModels(
        await getJson(`${baseURL}/models`, bearer, signal),
      )
      break
    case 'mistral':
      models = parseMistralModels(
        await getJson(`${baseURL}/models`, bearer, signal),
      )
      break
  }
  if (models.length === 0) {
    throw new ListModelsError(
      `${PROVIDERS[provider].name} accepted the key but listed no usable chat models.`,
    )
  }
  models.sort((a, b) => b.created - a.created || a.id.localeCompare(b.id))
  return { models, keyInfo }
}
