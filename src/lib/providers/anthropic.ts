import type { Usage } from '../../types/flow'
import {
  readSse,
  toApiError,
  type GenerateContext,
  type GenerateOptions,
  type GenerateResult,
  type ProviderClient,
} from '../openrouter/client'

const DEFAULT_MAX_TOKENS = 4096

interface AnthropicEvent {
  type?: string
  message?: { usage?: { input_tokens?: number; output_tokens?: number } }
  delta?: { type?: string; text?: string }
  usage?: { input_tokens?: number; output_tokens?: number }
  error?: { message?: string }
}

/** Streams a reply from the Anthropic Messages API. */
export async function generateAnthropic(
  client: ProviderClient,
  { model, temperature, maxTokens, system, prompt }: GenerateOptions,
  { signal, onToken }: GenerateContext = {},
): Promise<GenerateResult> {
  const res = await fetch(`${client.baseURL}/messages`, {
    method: 'POST',
    signal,
    headers: {
      'x-api-key': client.apiKey,
      'anthropic-version': '2023-06-01',
      // Required for calls made straight from a browser.
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
      stream: true,
      ...(system ? { system } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw await toApiError(res)
  if (!res.body) throw new Error('The response had no body.')

  let text = ''
  let promptTokens = 0
  let completionTokens = 0
  let sawUsage = false
  for await (const event of readSse<AnthropicEvent>(res.body)) {
    if (event.type === 'error') {
      throw new Error(event.error?.message ?? 'Stream failed')
    }
    if (event.type === 'message_start' && event.message?.usage) {
      promptTokens = event.message.usage.input_tokens ?? promptTokens
      completionTokens = event.message.usage.output_tokens ?? completionTokens
      sawUsage = true
    }
    if (event.type === 'message_delta' && event.usage) {
      completionTokens = event.usage.output_tokens ?? completionTokens
      sawUsage = true
    }
    if (event.type === 'content_block_delta' && event.delta?.text) {
      text += event.delta.text
      onToken?.(text)
    }
  }
  const usage: Usage | undefined = sawUsage
    ? { promptTokens, completionTokens, cost: undefined }
    : undefined
  return { text, usage }
}
