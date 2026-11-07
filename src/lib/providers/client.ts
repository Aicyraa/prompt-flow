import type { ProviderClient } from '../openrouter/client'
import { PROVIDERS, type ProviderId } from './types'

export function createProviderClient(
  provider: ProviderId,
  apiKey: string | undefined,
): ProviderClient | null {
  if (!apiKey) return null
  return { provider, apiKey, baseURL: PROVIDERS[provider].baseURL }
}
