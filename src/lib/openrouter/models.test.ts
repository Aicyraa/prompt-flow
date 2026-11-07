import { describe, expect, it } from 'vitest'
import {
  formatContext,
  formatPrice,
  isFree,
  isUsableModel,
  parseModels,
} from './models'

const row = (over: Record<string, unknown> = {}) => ({
  id: 'acme/model-1',
  name: 'Acme: Model 1',
  description: 'A model.',
  created: 1700000000,
  context_length: 128000,
  architecture: {
    input_modalities: ['text', 'image'],
    output_modalities: ['text'],
    tokenizer: 'GPT',
  },
  pricing: { prompt: '0.00000015', completion: '0.0000006' },
  top_provider: { max_completion_tokens: 16384 },
  supported_parameters: ['temperature', 'max_tokens'],
  endpoints: ['/api/v1/chat/completions'],
  ...over,
})

describe('parseModels', () => {
  it('maps a full catalog row to a slim ModelInfo', () => {
    const [m] = parseModels({ data: [row()] })
    expect(m).toMatchObject({
      id: 'acme/model-1',
      name: 'Acme: Model 1',
      contextLength: 128000,
      promptPrice: 0.00000015,
      completionPrice: 0.0000006,
      inputModalities: ['text', 'image'],
      maxCompletionTokens: 16384,
      supportsChat: true,
      reasoning: null,
    })
  })

  it('drops malformed rows instead of failing', () => {
    const models = parseModels({ data: [row(), { name: 'no id' }, 42, null] })
    expect(models.map((m) => m.id)).toEqual(['acme/model-1'])
  })

  it('tolerates missing optional fields and unknown extras', () => {
    const [m] = parseModels({ data: [{ id: 'a/b', brand_new_field: {} }] })
    expect(m).toMatchObject({
      id: 'a/b',
      name: 'a/b',
      contextLength: 0,
      supportedParameters: [],
      supportsChat: true,
    })
  })

  it('treats variable pricing (-1) as unknown', () => {
    const [m] = parseModels({
      data: [row({ pricing: { prompt: '-1', completion: '-1' } })],
    })
    expect(m.promptPrice).toBeNull()
  })

  it('parses reasoning capabilities', () => {
    const [m] = parseModels({
      data: [
        row({
          reasoning: {
            mandatory: true,
            supported_efforts: ['low', 'high'],
            default_effort: 'low',
          },
        }),
      ],
    })
    expect(m.reasoning).toEqual({
      mandatory: true,
      efforts: ['low', 'high'],
      defaultEffort: 'low',
    })
  })

  it('truncates long descriptions', () => {
    const [m] = parseModels({ data: [row({ description: 'x'.repeat(2000) })] })
    expect(m.description).toHaveLength(400)
  })

  it('returns [] for a non-catalog body', () => {
    expect(parseModels({ nope: true })).toEqual([])
    expect(parseModels(null)).toEqual([])
  })
})

describe('isUsableModel', () => {
  it('requires the chat endpoint and text output', () => {
    const [chat] = parseModels({ data: [row()] })
    const [noChat] = parseModels({
      data: [row({ endpoints: ['/api/v1/videos'] })],
    })
    const [noText] = parseModels({
      data: [row({ architecture: { output_modalities: ['image'] } })],
    })
    expect(isUsableModel(chat)).toBe(true)
    expect(isUsableModel(noChat)).toBe(false)
    expect(isUsableModel(noText)).toBe(false)
  })
})

describe('formatters', () => {
  it('formats price per million tokens', () => {
    expect(formatPrice(0.00000015)).toBe('$0.15')
    expect(formatPrice(0.000003)).toBe('$3.00')
    expect(formatPrice(0.00003)).toBe('$30')
    expect(formatPrice(0)).toBe('free')
    expect(formatPrice(null)).toBe('varies')
  })

  it('formats context length', () => {
    expect(formatContext(128000)).toBe('128K')
    expect(formatContext(1_000_000)).toBe('1M')
    expect(formatContext(512)).toBe('512')
  })

  it('detects free models', () => {
    const [free] = parseModels({
      data: [row({ pricing: { prompt: '0', completion: '0' } })],
    })
    expect(isFree(free)).toBe(true)
  })
})
