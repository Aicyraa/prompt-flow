import { describe, expect, it } from 'vitest'
import { buildRequestParams } from './params'
import { parseModels } from './models'

const model = (over: Record<string, unknown> = {}) =>
  parseModels({
    data: [
      {
        id: 'a/b',
        supported_parameters: ['temperature', 'max_tokens'],
        top_provider: { max_completion_tokens: 1000 },
        ...over,
      },
    ],
  })[0]

describe('buildRequestParams', () => {
  it('sends the default temperature when the model is unknown', () => {
    expect(buildRequestParams({}, undefined)).toEqual({ temperature: 0.7 })
  })

  it('omits temperature for models that do not support it', () => {
    const m = model({ supported_parameters: ['max_tokens'] })
    expect(buildRequestParams({ temperature: 0.2 }, m)).toEqual({})
  })

  it('clamps max tokens to the model limit', () => {
    expect(buildRequestParams({ maxTokens: 5000 }, model()).maxTokens).toBe(
      1000,
    )
    expect(buildRequestParams({ maxTokens: 200 }, model()).maxTokens).toBe(200)
  })

  it('only sends a reasoning effort the model supports', () => {
    const m = model({
      reasoning: { supported_efforts: ['low', 'high'] },
    })
    expect(buildRequestParams({ reasoningEffort: 'high' }, m)).toMatchObject({
      reasoningEffort: 'high',
    })
    expect(
      buildRequestParams({ reasoningEffort: 'medium' }, m).reasoningEffort,
    ).toBeUndefined()
    expect(
      buildRequestParams({ reasoningEffort: 'high' }, model()).reasoningEffort,
    ).toBeUndefined()
  })
})

describe('buildRequestParams JSON mode', () => {
  it('requests native JSON only when the model supports response_format', () => {
    const yes = model({
      supported_parameters: ['temperature', 'response_format'],
    })
    expect(buildRequestParams({ outputMode: 'json' }, yes).jsonResponse).toBe(
      true,
    )
    expect(
      buildRequestParams({ outputMode: 'json' }, model()).jsonResponse,
    ).toBeUndefined()
    expect(
      buildRequestParams({ outputMode: 'json' }, undefined).jsonResponse,
    ).toBeUndefined()
    expect(
      buildRequestParams({ outputMode: 'text' }, yes).jsonResponse,
    ).toBeUndefined()
  })
})
