import { describe, expect, it, vi } from 'vitest'
import { TimeoutError } from '../lib/openrouter'
import { isRetryable, retryAfterMs, withRetry } from './retry'

const withStatus = (status: number, headers?: unknown) =>
  Object.assign(new Error('x'), { status, headers })
const live = () => new AbortController().signal
const opts = { retries: 3, baseMs: 100, random: () => 0.5 }

describe('isRetryable', () => {
  it.each([429, 500, 502, 503])('retries HTTP %i', (s) => {
    expect(isRetryable(withStatus(s))).toBe(true)
  })
  it.each([400, 401, 402, 404])('does not retry HTTP %i', (s) => {
    expect(isRetryable(withStatus(s))).toBe(false)
  })
  it('retries network failures and timeouts', () => {
    expect(isRetryable(new TypeError('Failed to fetch'))).toBe(true)
    expect(isRetryable(new TimeoutError(1000))).toBe(true)
  })
})

describe('retryAfterMs', () => {
  it('reads seconds from a plain header object or a Headers instance', () => {
    expect(retryAfterMs(withStatus(429, { 'retry-after': '3' }))).toBe(3000)
    expect(
      retryAfterMs(withStatus(429, new Headers({ 'Retry-After': '2' }))),
    ).toBe(2000)
  })
  it('reads an HTTP date', () => {
    const now = Date.parse('2026-01-01T00:00:00Z')
    expect(
      retryAfterMs(
        withStatus(429, { 'retry-after': 'Thu, 01 Jan 2026 00:00:05 GMT' }),
        now,
      ),
    ).toBe(5000)
  })
  it('returns null when absent', () => {
    expect(retryAfterMs(withStatus(429))).toBeNull()
  })
})

describe('withRetry', () => {
  it('retries transient errors with exponential backoff, then succeeds', async () => {
    const sleep = vi.fn(async (_ms: number) => {})
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(withStatus(503))
      .mockRejectedValueOnce(withStatus(429))
      .mockResolvedValue('ok')
    await expect(withRetry(attempt, live(), { ...opts, sleep })).resolves.toBe(
      'ok',
    )
    expect(attempt).toHaveBeenCalledTimes(3)
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([100, 200])
  })

  it('honours Retry-After over the computed backoff', async () => {
    const sleep = vi.fn(async (_ms: number) => {})
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(withStatus(429, { 'retry-after': '7' }))
      .mockResolvedValue('ok')
    await withRetry(attempt, live(), { ...opts, sleep })
    expect(sleep.mock.calls[0][0]).toBe(7000)
  })

  it('caps very long Retry-After waits', async () => {
    const sleep = vi.fn(async (_ms: number) => {})
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(withStatus(429, { 'retry-after': '600' }))
      .mockResolvedValue('ok')
    await withRetry(attempt, live(), { ...opts, sleep })
    expect(sleep.mock.calls[0][0]).toBe(30_000)
  })

  it('gives up after the retry limit and throws the last error', async () => {
    const sleep = vi.fn(async (_ms: number) => {})
    const attempt = vi.fn().mockRejectedValue(withStatus(503))
    await expect(
      withRetry(attempt, live(), { ...opts, retries: 2, sleep }),
    ).rejects.toMatchObject({ status: 503 })
    expect(attempt).toHaveBeenCalledTimes(3)
  })

  it('does not retry non-transient errors', async () => {
    const attempt = vi.fn().mockRejectedValue(withStatus(401))
    await expect(withRetry(attempt, live(), opts)).rejects.toMatchObject({
      status: 401,
    })
    expect(attempt).toHaveBeenCalledTimes(1)
  })

  it('does not retry once output has started streaming', async () => {
    const attempt = vi.fn().mockRejectedValue(withStatus(503))
    await expect(
      withRetry(attempt, live(), { ...opts, hasStarted: () => true }),
    ).rejects.toBeDefined()
    expect(attempt).toHaveBeenCalledTimes(1)
  })

  it('does not retry after an abort', async () => {
    const controller = new AbortController()
    controller.abort()
    const attempt = vi.fn().mockRejectedValue(withStatus(503))
    await expect(
      withRetry(attempt, controller.signal, opts),
    ).rejects.toBeDefined()
    expect(attempt).toHaveBeenCalledTimes(1)
  })
})
