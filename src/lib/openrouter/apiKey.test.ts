import { describe, expect, it } from 'vitest'
import { maskKey, resolveApiKey } from './apiKey'

describe('resolveApiKey', () => {
  it('uses the trimmed user key when BYOK is on', () => {
    expect(
      resolveApiKey({ byokEnabled: true, apiKey: '  sk-or-x ' }, 'dev'),
    ).toBe('sk-or-x')
  })

  it('does not fall back to the dev key when BYOK is on but empty', () => {
    expect(
      resolveApiKey({ byokEnabled: true, apiKey: '' }, 'dev'),
    ).toBeUndefined()
  })

  it('uses only the dev key when BYOK is off', () => {
    expect(
      resolveApiKey({ byokEnabled: false, apiKey: 'sk-or-x' }, 'dev'),
    ).toBe('dev')
    expect(
      resolveApiKey({ byokEnabled: false, apiKey: 'sk-or-x' }, undefined),
    ).toBeUndefined()
  })
})

describe('maskKey', () => {
  it('shows only the prefix and last four characters', () => {
    expect(maskKey('sk-or-v1-abcdef123456')).toBe('sk-or-v…3456')
    expect(maskKey('short')).toBe('•••••')
  })
})
