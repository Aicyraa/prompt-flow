import { z } from 'zod'
import { OPENROUTER_BASE_URL } from './client'

/** Slim projection of an OpenRouter catalog entry. */
export interface ModelInfo {
  id: string
  name: string
  description: string
  contextLength: number
  /** USD per token; null when variable or unknown. */
  promptPrice: number | null
  completionPrice: number | null
  inputModalities: string[]
  outputModalities: string[]
  supportedParameters: string[]
  maxCompletionTokens: number | null
  reasoning: {
    mandatory: boolean
    efforts: string[]
    defaultEffort: string | null
  } | null
  created: number
  expirationDate: string | null
  knowledgeCutoff: string | null
  tokenizer: string | null
  /** False when the model does not list the chat-completions endpoint. */
  supportsChat: boolean
}

const CHAT_ENDPOINT = '/api/v1/chat/completions'
const MAX_DESCRIPTION = 400

// Every field is optional/defaulted: a catalog shape change should degrade
// gracefully rather than break the picker.
const rawModelSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().optional(),
    description: z.string().nullish(),
    created: z.number().optional(),
    context_length: z.number().nullish(),
    architecture: z
      .object({
        input_modalities: z.array(z.string()).optional(),
        output_modalities: z.array(z.string()).optional(),
        tokenizer: z.string().nullish(),
      })
      .partial()
      .nullish(),
    pricing: z
      .object({
        prompt: z.union([z.string(), z.number()]).nullish(),
        completion: z.union([z.string(), z.number()]).nullish(),
      })
      .partial()
      .nullish(),
    top_provider: z
      .object({ max_completion_tokens: z.number().nullish() })
      .partial()
      .nullish(),
    supported_parameters: z.array(z.string()).optional(),
    reasoning: z
      .object({
        mandatory: z.boolean().optional(),
        supported_efforts: z.array(z.string()).nullish(),
        default_effort: z.string().nullish(),
      })
      .nullish(),
    endpoints: z.array(z.string()).optional(),
    expiration_date: z.string().nullish(),
    knowledge_cutoff: z.string().nullish(),
  })
  .passthrough()

function price(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  // OpenRouter uses "-1" for variable pricing (e.g. routers).
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** Parse a `/models` response body. Malformed rows are dropped. */
export function parseModels(body: unknown): ModelInfo[] {
  const rows =
    typeof body === 'object' && body !== null && 'data' in body
      ? (body as { data: unknown }).data
      : undefined
  if (!Array.isArray(rows)) return []

  const models: ModelInfo[] = []
  for (const row of rows) {
    const parsed = rawModelSchema.safeParse(row)
    if (!parsed.success) continue
    const m = parsed.data
    models.push({
      id: m.id,
      name: m.name ?? m.id,
      description: (m.description ?? '').slice(0, MAX_DESCRIPTION),
      contextLength: m.context_length ?? 0,
      promptPrice: price(m.pricing?.prompt),
      completionPrice: price(m.pricing?.completion),
      inputModalities: m.architecture?.input_modalities ?? ['text'],
      outputModalities: m.architecture?.output_modalities ?? ['text'],
      supportedParameters: m.supported_parameters ?? [],
      maxCompletionTokens: m.top_provider?.max_completion_tokens ?? null,
      reasoning: m.reasoning
        ? {
            mandatory: m.reasoning.mandatory ?? false,
            efforts: m.reasoning.supported_efforts ?? [],
            defaultEffort: m.reasoning.default_effort ?? null,
          }
        : null,
      created: m.created ?? 0,
      expirationDate: m.expiration_date ?? null,
      knowledgeCutoff: m.knowledge_cutoff ?? null,
      tokenizer: m.architecture?.tokenizer ?? null,
      supportsChat: m.endpoints ? m.endpoints.includes(CHAT_ENDPOINT) : true,
    })
  }
  return models
}

/** Models PromptFlow can actually call: chat completions with text output. */
export function isUsableModel(model: ModelInfo): boolean {
  return model.supportsChat && model.outputModalities.includes('text')
}

/** The public catalog needs no API key. */
export async function fetchModels(signal?: AbortSignal): Promise<ModelInfo[]> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/models`, { signal })
  if (!res.ok) throw new Error(`Model catalog request failed (${res.status})`)
  const models = parseModels(await res.json())
  if (models.length === 0) throw new Error('Model catalog was empty')
  return models
}

/** USD per 1M tokens, formatted for display. */
export function formatPrice(perToken: number | null): string {
  if (perToken === null) return 'varies'
  const perMillion = perToken * 1_000_000
  if (perMillion === 0) return 'free'
  return `$${perMillion < 1 ? perMillion.toFixed(2) : perMillion.toFixed(perMillion < 10 ? 2 : 0)}`
}

export function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${+(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`
  return String(tokens)
}

export function isFree(model: ModelInfo): boolean {
  return model.promptPrice === 0 && model.completionPrice === 0
}

/** Expires within 60 days. */
export function isExpiringSoon(model: ModelInfo, now = Date.now()): boolean {
  if (!model.expirationDate) return false
  const t = Date.parse(model.expirationDate)
  return Number.isFinite(t) && t - now < 60 * 24 * 60 * 60 * 1000
}
