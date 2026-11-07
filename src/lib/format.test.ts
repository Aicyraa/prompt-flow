import { describe, expect, it } from 'vitest'
import { formatAgo, formatRunSummary, formatUsage } from './format'

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

describe('formatRunSummary', () => {
  const base = {
    steps: 3,
    promptTokens: 800,
    completionTokens: 434,
    cost: 0.0012,
    priced: true,
    ms: 4200,
  }

  it('lists steps, split tokens, cost and time', () => {
    expect(formatRunSummary(base)).toBe(
      '3 steps · 1,234 tokens (800 in / 434 out) · $0.0012 · 4.2s',
    )
  })

  it('says cost is unknown instead of showing a partial total', () => {
    expect(formatRunSummary({ ...base, priced: false })).toContain(
      'cost unknown',
    )
    expect(formatRunSummary({ ...base, priced: false })).not.toContain('$')
  })

  it('omits token and cost parts when no model ran', () => {
    expect(
      formatRunSummary({
        ...base,
        steps: 1,
        promptTokens: 0,
        completionTokens: 0,
      }),
    ).toBe('1 step · 4.2s')
  })
})

describe('formatAgo', () => {
  const now = Date.UTC(2026, 10, 7, 12, 0, 0)
  const ago = (ms: number) => formatAgo(now - ms, now)

  it('speaks in human units', () => {
    expect(ago(10_000)).toBe('just now')
    expect(ago(5 * 60_000)).toBe('5 min ago')
    expect(ago(3 * 3_600_000)).toBe('3 h ago')
    expect(ago(26 * 3_600_000)).toBe('1 day ago')
    expect(ago(3 * 86_400_000)).toBe('3 days ago')
  })

  it('falls back to a date after a week, and never goes negative', () => {
    expect(ago(30 * 86_400_000)).toMatch(/\d/)
    expect(formatAgo(now + 5000, now)).toBe('just now')
  })
})
