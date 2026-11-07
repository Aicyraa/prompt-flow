import { describe, expect, it } from 'vitest'
import { classifyError, redactSecrets } from './errors'

const withStatus = (status: number, message = 'x') =>
  Object.assign(new Error(message), { status })

describe('classifyError', () => {
  it.each([
    [401, 'invalid_key'],
    [402, 'no_credits'],
    [404, 'model_unavailable'],
    [429, 'rate_limit'],
    [400, 'bad_param'],
  ] as const)('maps HTTP %i to %s', (status, kind) => {
    expect(classifyError(withStatus(status)).kind).toBe(kind)
  })

  it('treats fetch failures as network errors', () => {
    expect(classifyError(new TypeError('Failed to fetch')).kind).toBe('network')
  })

  it('passes unknown error messages through', () => {
    expect(classifyError(new Error('boom'))).toEqual({
      kind: 'unknown',
      message: 'boom',
    })
  })

  it('never leaks an API key in the message', () => {
    const { message } = classifyError(
      withStatus(400, 'bad request for key sk-or-v1-SECRET123_abc'),
    )
    expect(message).not.toContain('SECRET123')
  })
})

describe('redactSecrets', () => {
  it('replaces every key-looking token', () => {
    expect(redactSecrets('a sk-or-v1-aaa b sk-or-v1-bbb')).toBe(
      'a sk-or-… b sk-or-…',
    )
  })
})
