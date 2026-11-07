import { describe, expect, it } from 'vitest'
import { formatUsage } from './format'

describe('formatUsage', () => {
  it('joins tokens, cost and duration', () => {
    expect(
      formatUsage(
        { promptTokens: 1000, completionTokens: 234, cost: 0.00123 },
        2300,
      ),
    ).toBe('1,234 tokens · $0.0012 · 2.3s')
  })
  it('omits unknown parts', () => {
    expect(formatUsage({ promptTokens: 5, completionTokens: 5 })).toBe(
      '10 tokens',
    )
    expect(formatUsage(undefined, 500)).toBe('0.5s')
    expect(formatUsage()).toBe('')
  })
  it('abbreviates large token counts', () => {
    expect(formatUsage({ promptTokens: 120_000, completionTokens: 0 })).toBe(
      '120K tokens',
    )
  })
})
