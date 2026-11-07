import { describe, expect, it } from 'vitest'
import { diffLines, hasChanges } from './diff'

describe('diffLines', () => {
  it('marks identical text as unchanged', () => {
    const d = diffLines('a\nb', 'a\nb')
    expect(d.every((l) => l.type === 'same')).toBe(true)
    expect(hasChanges(d)).toBe(false)
  })

  it('detects added, removed, and kept lines in order', () => {
    expect(diffLines('a\nb\nc', 'a\nc\nd')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'del', text: 'b' },
      { type: 'same', text: 'c' },
      { type: 'add', text: 'd' },
    ])
  })

  it('handles empty sides', () => {
    expect(diffLines('', 'x')).toEqual([
      { type: 'del', text: '' },
      { type: 'add', text: 'x' },
    ])
  })

  it('falls back to a full replace for very large inputs', () => {
    const big = Array.from({ length: 500 }, (_, i) => `line ${i}`).join('\n')
    const d = diffLines(big, big + '\nextra')
    expect(d.filter((l) => l.type === 'same')).toHaveLength(0)
  })
})
