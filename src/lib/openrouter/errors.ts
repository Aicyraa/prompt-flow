export type ErrorKind =
  | 'no_key'
  | 'invalid_key'
  | 'no_credits'
  | 'rate_limit'
  | 'model_unavailable'
  | 'bad_param'
  | 'network'
  | 'timeout'
  | 'bad_output'
  | 'unknown'

export interface ClassifiedError {
  kind: ErrorKind
  message: string
}

/** Strip anything that looks like an API key from text. */
export function redactSecrets(text: string): string {
  return text
    .replace(/sk-or-[A-Za-z0-9_-]+/g, 'sk-or-…')
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, 'sk-ant-…')
    .replace(/sk-[A-Za-z0-9_-]{16,}/g, 'sk-…')
    .replace(/AIza[A-Za-z0-9_-]{20,}/g, 'AIza…')
    .replace(/gsk_[A-Za-z0-9]{16,}/g, 'gsk_…')
}

export class NoKeyError extends Error {
  constructor() {
    super('No API key. Add yours in Settings.')
  }
}

export class TimeoutError extends Error {
  constructor(public readonly ms: number) {
    super(`The model took longer than ${Math.round(ms / 1000)}s to respond.`)
  }
}

export class BadOutputError extends Error {}

export function classifyError(err: unknown): ClassifiedError {
  if (err instanceof NoKeyError) {
    return { kind: 'no_key', message: err.message }
  }
  if (err instanceof BadOutputError) {
    return { kind: 'bad_output', message: err.message }
  }
  if (err instanceof TimeoutError) {
    return { kind: 'timeout', message: err.message }
  }
  const raw = err instanceof Error ? err.message : 'Execution failed'
  const message = redactSecrets(raw)
  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status?: unknown }).status)
      : undefined

  switch (status) {
    case 401:
    case 403:
      return {
        kind: 'invalid_key',
        message: 'The provider rejected the API key. Check it in Settings.',
      }
    case 402:
      return {
        kind: 'no_credits',
        message: 'Out of credits or quota. Add credits and retry.',
      }
    case 404:
      return {
        kind: 'model_unavailable',
        message: 'That model is unavailable. Pick another one.',
      }
    case 429:
      return {
        kind: 'rate_limit',
        message: 'Rate limited by the provider. Wait a moment and retry.',
      }
    case 400:
    case 422:
      return { kind: 'bad_param', message }
  }
  if (err instanceof TypeError || /connection|network|fetch/i.test(raw)) {
    return {
      kind: 'network',
      message: 'Could not reach the provider. Check your connection.',
    }
  }
  return { kind: 'unknown', message }
}
