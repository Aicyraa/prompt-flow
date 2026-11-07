import toast from 'react-hot-toast'
import { KeyRejectedError } from '../lib/openrouter'
import { DEFAULT_MODEL } from '../lib/nodes'
import { identifyKey, PROVIDERS } from '../lib/providers'
import { useGraphStore } from './graphStore'
import { useModelStore } from './modelStore'
import { useSettingsStore } from './settingsStore'

let attempt = 0

/** Newest model first (the catalog is sorted that way): a sensible default. */
function pickDefault(ids: string[]): string | undefined {
  return ids[0]
}

/**
 * Agent nodes still pointing at models the new key cannot use (typically the
 * OpenRouter defaults after switching provider) are moved to an available one.
 */
function remapUnavailableModels(ids: string[]) {
  const available = new Set(ids)
  const fallback = pickDefault(ids)
  if (!fallback) return 0
  const { nodes, updateNodeData } = useGraphStore.getState()
  let changed = 0
  for (const node of nodes) {
    if (node.data.type !== 'llm') continue
    const current = node.data.model ?? DEFAULT_MODEL
    if (available.has(current)) continue
    updateNodeData(node.id, {
      model: fallback,
      fallbackModels: (node.data.fallbackModels ?? []).filter((m) =>
        available.has(m),
      ),
    })
    changed++
  }
  return changed
}

/**
 * Identifies the saved key's provider, validates it and loads the models it
 * can use. Safe to call repeatedly; only the latest call applies its result.
 */
export async function connectKey(): Promise<void> {
  const settings = useSettingsStore.getState()
  const key = settings.apiKey
  if (!key) return
  const mine = ++attempt
  useSettingsStore.setState({ keyStatus: 'checking', keyError: null })
  try {
    const found = await identifyKey(key)
    if (mine !== attempt || useSettingsStore.getState().apiKey !== key) return
    useSettingsStore.setState({
      provider: found.provider,
      keyStatus: 'valid',
      keyInfo: found.keyInfo ?? null,
      byokEnabled: true,
    })
    useModelStore.getState().setCatalog(found.provider, found.models)
    const moved = remapUnavailableModels(found.models.map((m) => m.id))
    if (moved > 0) {
      toast(
        `Switched ${moved} agent node${moved === 1 ? '' : 's'} to a model your ${PROVIDERS[found.provider].name} key can use.`,
      )
    }
  } catch (err) {
    if (mine !== attempt || useSettingsStore.getState().apiKey !== key) return
    if (err instanceof KeyRejectedError) {
      useSettingsStore.setState({ keyStatus: 'rejected', keyInfo: null })
    } else {
      useSettingsStore.setState({
        keyStatus: 'error',
        keyError:
          err instanceof Error && err.message
            ? err.message
            : 'Could not check the key. Try again.',
      })
    }
  }
}

/** Loads the model list for the current key (cache first), or the public one. */
export async function syncModels(opts: { force?: boolean } = {}) {
  const { byokEnabled, apiKey, provider } = useSettingsStore.getState()
  if (byokEnabled && apiKey) {
    await useModelStore.getState().load({ ...opts, provider, apiKey })
  } else {
    await useModelStore.getState().load(opts)
  }
}
