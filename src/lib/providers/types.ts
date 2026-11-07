export type ProviderId =
  'openrouter' | 'openai' | 'anthropic' | 'google' | 'groq' | 'mistral'

export interface ProviderMeta {
  id: ProviderId
  name: string
  baseURL: string
  /** Key prefix that identifies this provider; null when keys are unprefixed. */
  keyPrefix: string | null
  keyPlaceholder: string
}

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    keyPrefix: 'sk-or-',
    keyPlaceholder: 'sk-or-v1-…',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-…',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-…',
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIza…',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_…',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    baseURL: 'https://api.mistral.ai/v1',
    keyPrefix: null,
    keyPlaceholder: 'Mistral key',
  },
}

/** Most specific prefixes first ("sk-" is a prefix of the others). */
const PREFIX_ORDER: ProviderId[] = [
  'openrouter',
  'anthropic',
  'groq',
  'google',
  'openai',
]

/** Providers whose key format we recognise outright; null when ambiguous. */
export function detectByPrefix(key: string): ProviderId | null {
  const k = key.trim()
  for (const id of PREFIX_ORDER) {
    const prefix = PROVIDERS[id].keyPrefix
    if (prefix && k.startsWith(prefix)) return id
  }
  return null
}

/** Probe order when the prefix doesn't identify the provider. */
export const PROBE_ORDER: ProviderId[] = [
  'mistral',
  'openai',
  'groq',
  'google',
  'anthropic',
  'openrouter',
]
