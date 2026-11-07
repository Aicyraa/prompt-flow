import { DEFAULT_MODEL } from '../../lib/nodes'
import type { ModelInfo } from '../../lib/openrouter'
import { useModelStore } from '../../store/modelStore'

/** Catalog entry for a node's model, if the catalog knows it. */
export function useModelInfo(
  modelId: string | undefined,
): ModelInfo | undefined {
  const id = modelId ?? DEFAULT_MODEL
  return useModelStore((s) => s.models.find((m) => m.id === id))
}

/** Unknown model (no catalog yet) is treated as supporting the parameter. */
export function supportsParam(
  model: ModelInfo | undefined,
  param: string,
): boolean {
  return !model || model.supportedParameters.includes(param)
}
