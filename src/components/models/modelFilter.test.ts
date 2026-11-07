import { describe, expect, it } from 'vitest'
import { parseModels } from '../../lib/openrouter'
import { DEFAULT_FILTERS, filterModels } from './modelFilter'

const models = parseModels({
  data: [
    {
      id: 'o/old',
      name: 'Old Model',
      created: 1,
      pricing: { prompt: '0.00001', completion: '0.00001' },
      context_length: 8000,
    },
    {
      id: 'o/new',
      name: 'New Model',
      created: 9,
      pricing: { prompt: '0.000001', completion: '0.000001' },
      context_length: 128000,
    },
    {
      id: 'o/free:free',
      name: 'Free One',
      created: 5,
      pricing: { prompt: '0', completion: '0' },
      reasoning: { mandatory: false, supported_efforts: ['low'] },
    },
  ],
})

const ids = (list: { id: string }[]) => list.map((m) => m.id)

describe('filterModels', () => {
  it('sorts newest first by default', () => {
    expect(ids(filterModels(models, DEFAULT_FILTERS))).toEqual([
      'o/new',
      'o/free:free',
      'o/old',
    ])
  })

  it('searches name and id with all tokens required', () => {
    expect(
      ids(filterModels(models, { ...DEFAULT_FILTERS, query: 'model new' })),
    ).toEqual(['o/new'])
    expect(
      ids(filterModels(models, { ...DEFAULT_FILTERS, query: 'free:free' })),
    ).toEqual(['o/free:free'])
  })

  it('applies free and reasoning filters', () => {
    expect(
      ids(filterModels(models, { ...DEFAULT_FILTERS, freeOnly: true })),
    ).toEqual(['o/free:free'])
    expect(
      ids(filterModels(models, { ...DEFAULT_FILTERS, reasoningOnly: true })),
    ).toEqual(['o/free:free'])
  })

  it('sorts by price and context', () => {
    expect(
      ids(filterModels(models, { ...DEFAULT_FILTERS, sort: 'cheapest' }))[0],
    ).toBe('o/free:free')
    expect(
      ids(filterModels(models, { ...DEFAULT_FILTERS, sort: 'context' }))[0],
    ).toBe('o/new')
  })

  it('pins favourites/recents first only when not searching', () => {
    expect(ids(filterModels(models, DEFAULT_FILTERS, ['o/old']))[0]).toBe(
      'o/old',
    )
    expect(
      ids(
        filterModels(models, { ...DEFAULT_FILTERS, query: 'model' }, ['o/old']),
      )[0],
    ).toBe('o/new')
  })
})
