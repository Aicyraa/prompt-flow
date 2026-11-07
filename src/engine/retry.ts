import { classifyError, TimeoutError } from '../lib/openrouter'

export interface RetryOptions {
  retries: number
  baseMs: number
  /** Injectable for tests. Must reject if `signal` aborts. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
  random?: () => number
  /** True once output has started streaming: retrying would duplicate it. */
  hasStarted?: () => boolean
}

const MAX_DELAY_MS = 30_000

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** Reads a Retry-After header off an SDK error, in milliseconds. */
export function retryAfterMs(err: unknown, now = Date.now()): number | null {
  const headers = (err as { headers?: unknown } | null)?.headers
  let value: string | null | undefined
  if (headers && typeof (headers as Headers).get === 'function') {
    value = (headers as Headers).get('retry-after')
  } else if (headers && typeof headers === 'object') {
    const raw = (headers as Record<string, unknown>)['retry-after']
    value = typeof raw === 'string' ? raw : undefined
  }
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  return Number.isFinite(date) ? Math.max(0, date - now) : null
}

export function isRetryable(err: unknown): boolean {
  if (err instanceof TimeoutError) return true
  const { kind } = classifyError(err)
  if (kind === 'rate_limit' || kind === 'network') return true
  const status = (err as { status?: unknown } | null)?.status
  return typeof status === 'number' && status >= 500
}

/**
 * Runs `attempt`, retrying transient failures (429, 5xx, network, timeout)
 * with exponential backoff + jitter. Never retries once output has started.
 */
export async function withRetry<T>(
  attempt: (n: number) => Promise<T>,
  signal: AbortSignal,
  {
    retries,
    baseMs,
    sleep: wait = sleep,
    random = Math.random,
    hasStarted = () => false,
  }: RetryOptions,
): Promise<T> {
  for (let n = 0; ; n++) {
    try {
      return await attempt(n)
    } catch (err) {
      if (signal.aborted || n >= retries || hasStarted() || !isRetryable(err)) {
        throw err
      }
      const backoff = baseMs * 2 ** n * (0.75 + random() * 0.5)
      const delay = Math.min(retryAfterMs(err) ?? backoff, MAX_DELAY_MS)
      await wait(delay, signal)
    }
  }
}
