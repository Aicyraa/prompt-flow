import { KeyRejectedError } from '../openrouter/key'
import { listProviderModels, type ListedModels } from './models'
import { detectByPrefix, PROBE_ORDER, type ProviderId } from './types'

export interface Identified extends ListedModels {
  provider: ProviderId
}

/**
 * Works out which provider a key belongs to and which models it can use.
 * A recognised prefix is tried first; otherwise (or if that provider says no)
 * the remaining providers are probed. Throws KeyRejectedError when every
 * provider refuses the key, or the last non-auth error otherwise.
 */
export async function identifyKey(
  apiKey: string,
  signal?: AbortSignal,
): Promise<Identified> {
  const key = apiKey.trim()
  const first = detectByPrefix(key)
  const order = first
    ? [first, ...PROBE_ORDER.filter((p) => p !== first)]
    : PROBE_ORDER

  let lastError: unknown = new KeyRejectedError()
  for (const provider of order) {
    try {
      return { provider, ...(await listProviderModels(provider, key, signal)) }
    } catch (err) {
      if (signal?.aborted) throw err
      // A recognised prefix is trusted: its answer (bad key or outage) stands.
      if (first && provider === first) throw err
      // Elsewhere a rejection is the expected "wrong provider"; keep a real
      // failure (network, empty list) so it can be reported instead.
      if (!(err instanceof KeyRejectedError)) lastError = err
    }
  }
  throw lastError
}
