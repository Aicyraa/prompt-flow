import { describe, expect, it } from 'vitest'
import type { Edge } from '@xyflow/react'
import { canConnect, wouldCreateCycle } from './connections'

const edge = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
})

describe('canConnect', () => {
  it('allows a valid input -> llm connection', () => {
    expect(
      canConnect({ id: 'a', type: 'input' }, { id: 'b', type: 'llm' }, []),
    ).toBe(true)
  })

  it('rejects connections where the target has no incoming handle', () => {
    expect(
      canConnect({ id: 'a', type: 'input' }, { id: 'b', type: 'input' }, []),
    ).toBe(false)
  })

  it('rejects connections where the source has no outgoing handle', () => {
    expect(
      canConnect({ id: 'a', type: 'output' }, { id: 'b', type: 'prompt' }, []),
    ).toBe(false)
  })

  it('rejects self-connections', () => {
    expect(
      canConnect({ id: 'a', type: 'llm' }, { id: 'a', type: 'llm' }, []),
    ).toBe(false)
  })

  it('rejects duplicate parallel edges between the same pair', () => {
    const edges = [edge('a', 'b')]
    expect(
      canConnect({ id: 'a', type: 'input' }, { id: 'b', type: 'llm' }, edges),
    ).toBe(false)
  })

  it('allows multiple incoming edges from different sources', () => {
    const edges = [edge('a', 'c')]
    expect(
      canConnect({ id: 'b', type: 'prompt' }, { id: 'c', type: 'llm' }, edges),
    ).toBe(true)
  })

  it('rejects connections that would create a cycle', () => {
    const edges = [edge('a', 'b')]
    expect(
      canConnect({ id: 'b', type: 'llm' }, { id: 'a', type: 'prompt' }, edges),
    ).toBe(false)
  })
})

describe('wouldCreateCycle', () => {
  it('returns true when a path from target back to source exists', () => {
    const edges = [edge('a', 'b'), edge('b', 'c')]
    expect(wouldCreateCycle('c', 'a', edges)).toBe(true)
  })

  it('returns false when no path from target back to source exists', () => {
    const edges = [edge('a', 'b'), edge('c', 'd')]
    expect(wouldCreateCycle('d', 'b', edges)).toBe(false)
  })
})
