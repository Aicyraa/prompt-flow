import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TEXT_SIZE,
  effectiveTextSize,
  isTextSize,
  textSizePx,
} from './textSize'

describe('text size', () => {
  it('grows from small to extra large', () => {
    const px = (['sm', 'md', 'lg', 'xl'] as const).map(textSizePx)
    expect(px).toEqual([...px].sort((a, b) => a - b))
    expect(new Set(px).size).toBe(4)
  })

  it('falls back to the default for a missing or unknown size', () => {
    expect(textSizePx(undefined)).toBe(textSizePx(DEFAULT_TEXT_SIZE))
    expect(textSizePx('huge' as never)).toBe(textSizePx(DEFAULT_TEXT_SIZE))
  })

  it('lets a node override the global setting', () => {
    expect(effectiveTextSize(undefined, 'lg')).toBe('lg')
    expect(effectiveTextSize('sm', 'lg')).toBe('sm')
  })

  it('recognises valid sizes only', () => {
    expect(isTextSize('xl')).toBe(true)
    expect(isTextSize('XL')).toBe(false)
    expect(isTextSize(14)).toBe(false)
  })
})
