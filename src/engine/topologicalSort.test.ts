import { describe, expect, it } from 'vitest'
import { topologicalSort } from './topologicalSort'

const edge = (source: string, target: string) => ({ source, target })

describe('topologicalSort', () => {
  it('orders nodes so dependencies come first', () => {
    const ids = ['llm', 'input', 'output']
    const order = topologicalSort(ids, [
      edge('input', 'llm'),
      edge('llm', 'output'),
    ])
    expect(order.indexOf('input')).toBeLessThan(order.indexOf('llm'))
    expect(order.indexOf('llm')).toBeLessThan(order.indexOf('output'))
  })

  it('preserves relative order within independent chains', () => {
    const ids = ['a1', 'b1', 'b2', 'a2']
    const order = topologicalSort(ids, [edge('a1', 'a2'), edge('b1', 'b2')])
    expect(order.indexOf('a1')).toBeLessThan(order.indexOf('a2'))
    expect(order.indexOf('b1')).toBeLessThan(order.indexOf('b2'))
  })

  it('returns an empty array for an empty graph', () => {
    expect(topologicalSort([], [])).toEqual([])
  })

  it('includes nodes without edges', () => {
    const order = topologicalSort(['a', 'b'], [])
    expect(order).toHaveLength(2)
    expect(order).toContain('a')
    expect(order).toContain('b')
  })

  it('ignores edges that reference missing nodes', () => {
    const order = topologicalSort(
      ['a'],
      [edge('ghost', 'a'), edge('a', 'ghost')],
    )
    expect(order).toEqual(['a'])
  })

  it('still includes every node when a cycle exists (defensive)', () => {
    const ids = ['a', 'b', 'c']
    const order = topologicalSort(ids, [edge('a', 'b'), edge('b', 'a')])
    expect(order.sort()).toEqual(['a', 'b', 'c'])
  })
})
