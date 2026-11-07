import type { Usage } from '../../types/flow'
import {
  readSse,
  toApiError,
  type GenerateContext,
  type GenerateOptions,
  type GenerateResult,
  type ProviderClient,
} from '../openrouter/client'

interface GeminiChunk {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] }
  }[]
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }
  error?: { message?: string; code?: number }
}

/** Streams a reply from the Gemini API. */
export async function generateGoogle(
  client: ProviderClient,
  {
    model,
    temperature,
    maxTokens,
    jsonResponse,
    system,
    prompt,
  }: GenerateOptions,
  { signal, onToken }: GenerateContext = {},
): Promise<GenerateResult> {
  const generationConfig = {
    ...(temperature !== undefined ? { temperature } : {}),
    ...(maxTokens !== undefined ? { maxOutputTokens: maxTokens } : {}),
    ...(jsonResponse ? { responseMimeType: 'application/json' } : {}),
  }
  const res = await fetch(
    `${client.baseURL}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      signal,
      headers: {
        'x-goog-api-key': client.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        ...(Object.keys(generationConfig).length ? { generationConfig } : {}),
      }),
    },
  )
  if (!res.ok) throw await toApiError(res)
  if (!res.body) throw new Error('The response had no body.')

  let text = ''
  let usage: Usage | undefined
  for await (const chunk of readSse<GeminiChunk>(res.body)) {
    if (chunk.error) {
      throw Object.assign(new Error(chunk.error.message ?? 'Stream failed'), {
        status: chunk.error.code,
      })
    }
    for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
      if (part.text && !part.thought) {
        text += part.text
        onToken?.(text)
      }
    }
    if (chunk.usageMetadata) {
      usage = {
        promptTokens: chunk.usageMetadata.promptTokenCount ?? 0,
        completionTokens: chunk.usageMetadata.candidatesTokenCount ?? 0,
        cost: undefined,
      }
    }
  }
  return { text, usage }
}
