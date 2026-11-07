import type { LlmData } from '../../types/flow'
import { DEFAULT_TEMPERATURE } from '../nodes'
import type { ModelInfo } from './models'

export interface RequestParams {
  temperature?: number
  maxTokens?: number
  reasoningEffort?: string
  jsonResponse?: boolean
}

/**
 * Build request params from node settings, dropping anything the model
 * doesn't support. With no catalog entry we send temperature (the old
 * behaviour) and nothing else.
 */
export function buildRequestParams(
  data: Pick<
    LlmData,
    'temperature' | 'maxTokens' | 'reasoningEffort' | 'outputMode'
  >,
  model: ModelInfo | undefined,
): RequestParams {
  const params: RequestParams = {}
  const supports = (p: string) =>
    !model || model.supportedParameters.includes(p)

  if (supports('temperature')) {
    params.temperature = data.temperature ?? DEFAULT_TEMPERATURE
  }
  if (
    data.maxTokens &&
    data.maxTokens > 0 &&
    (!model || supports('max_tokens'))
  ) {
    params.maxTokens = model?.maxCompletionTokens
      ? Math.min(data.maxTokens, model.maxCompletionTokens)
      : data.maxTokens
  }
  if (
    data.reasoningEffort &&
    model?.reasoning &&
    model.reasoning.efforts.includes(data.reasoningEffort)
  ) {
    params.reasoningEffort = data.reasoningEffort
  }
  // Only ask for JSON mode when the catalog confirms support; otherwise the
  // engine relies on a prompt instruction plus validation.
  if (
    data.outputMode === 'json' &&
    model?.supportedParameters.includes('response_format')
  ) {
    params.jsonResponse = true
  }
  return params
}
