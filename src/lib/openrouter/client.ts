import type { Usage } from '../../types/flow'
import type { ProviderId } from '../providers/types'

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export const TEST_PROMPT =
  'Say "Hello from PromptFlow" in exactly one sentence.'

export interface GenerateOptions {
  model: string
  /** Omitted when the model does not support it. */
  temperature?: number
  maxTokens?: number
  reasoningEffort?: string
  /** Ask for a JSON object (only set when the model supports it). */
  jsonResponse?: boolean
  system?: string
  prompt: string
}

export interface GenerateContext {
  signal?: AbortSignal
  /** Called with the full text so far each time new tokens arrive. */
  onToken?: (textSoFar: string) => void
}

export interface GenerateResult {
  text: string
  usage?: Usage
}

/** Everything needed to call a provider; the key never leaves this object. */
export interface ProviderClient {
  readonly provider: ProviderId
  readonly apiKey: string
  readonly baseURL: string
}

export type OpenRouterClient = ProviderClient

export function createOpenRouterClient(
  apiKey: string | undefined,
): ProviderClient | null {
  if (!apiKey) return null
  return { provider: 'openrouter', apiKey, baseURL: OPENROUTER_BASE_URL }
}

/** An HTTP error from OpenRouter, shaped for `classifyError` and retries. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly headers: Headers,
  ) {
    super(message)
  }
}

export async function toApiError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`
  try {
    const body = (await res.json()) as { error?: { message?: string } }
    if (body.error?.message) message = body.error.message
  } catch {
    // non-JSON error body: keep the generic message
  }
  return new ApiError(message, res.status, res.headers)
}

interface StreamChunk {
  choices?: { delta?: { content?: string | null } }[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    cost?: number
  } | null
  error?: { message?: string; code?: number | string }
}

/** Yields the JSON payload of each `data:` line in a server-sent-event stream. */
export async function* readSse<T = StreamChunk>(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<T> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      const lines = buffer.split(/\r?\n/)
      buffer = done ? '' : (lines.pop() ?? '')
      for (const line of done ? [...lines, buffer] : lines) {
        // Lines starting with ":" are keep-alive comments.
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') return
        if (!payload) continue
        try {
          yield JSON.parse(payload) as T
        } catch {
          // ignore a malformed fragment rather than failing the whole reply
        }
      }
      if (done) return
    }
  } finally {
    reader.releaseLock()
  }
}

/** Streams a completion from an OpenAI-compatible API (OpenRouter, OpenAI, Groq, Mistral). */
export async function generateText(
  client: ProviderClient,
  {
    model,
    temperature,
    maxTokens,
    reasoningEffort,
    jsonResponse,
    system,
    prompt,
  }: GenerateOptions,
  { signal, onToken }: GenerateContext = {},
): Promise<GenerateResult> {
  const inBrowser = typeof window !== 'undefined' && 'location' in window
  const { provider } = client
  const isOpenRouter = provider === 'openrouter'
  // Newer OpenAI models reject max_tokens; Mistral and others reject extras.
  const tokenField =
    provider === 'openai' ? 'max_completion_tokens' : 'max_tokens'
  const res = await fetch(`${client.baseURL}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${client.apiKey}`,
      'Content-Type': 'application/json',
      // Optional OpenRouter attribution headers.
      ...(isOpenRouter
        ? {
            'X-Title': 'PromptFlow',
            ...(inBrowser ? { 'HTTP-Referer': window.location.origin } : {}),
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
      stream: true,
      ...(provider !== 'mistral'
        ? { stream_options: { include_usage: true } }
        : {}),
      ...(temperature !== undefined ? { temperature } : {}),
      ...(maxTokens !== undefined ? { [tokenField]: maxTokens } : {}),
      ...(jsonResponse ? { response_format: { type: 'json_object' } } : {}),
      ...(isOpenRouter && reasoningEffort
        ? { reasoning: { effort: reasoningEffort } }
        : {}),
      ...(isOpenRouter ? { usage: { include: true } } : {}),
    }),
  })
  if (!res.ok) throw await toApiError(res)
  if (!res.body) throw new Error('The response had no body.')

  let text = ''
  let usage: Usage | undefined
  for await (const chunk of readSse(res.body)) {
    if (chunk.error) {
      // OpenRouter reports mid-stream failures as an error chunk.
      throw Object.assign(new Error(chunk.error.message ?? 'Stream failed'), {
        status: Number(chunk.error.code) || undefined,
      })
    }
    const delta = chunk.choices?.[0]?.delta?.content
    if (delta) {
      text += delta
      onToken?.(text)
    }
    if (chunk.usage) {
      usage = {
        promptTokens: chunk.usage.prompt_tokens ?? 0,
        completionTokens: chunk.usage.completion_tokens ?? 0,
        cost:
          typeof chunk.usage.cost === 'number' ? chunk.usage.cost : undefined,
      }
    }
  }
  return { text, usage }
}
