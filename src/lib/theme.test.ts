// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, resolveTheme, systemTheme } from './theme'

function stubSystem(light: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((q: string) => ({
      matches: light && q.includes('light'),
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  )
}

beforeEach(() => {
  document.head.innerHTML = '<meta name="theme-color" content="#161310">'
  delete document.documentElement.dataset.theme
})
afterEach(() => vi.unstubAllGlobals())

describe('theme', () => {
  it('follows the system only when asked to', () => {
    expect(resolveTheme('light', 'dark')).toBe('light')
    expect(resolveTheme('dark', 'light')).toBe('dark')
    expect(resolveTheme('system', 'light')).toBe('light')
    expect(resolveTheme('system', 'dark')).toBe('dark')
  })

  it('reads the system preference, defaulting to dark', () => {
    stubSystem(true)
    expect(systemTheme()).toBe('light')
    stubSystem(false)
    expect(systemTheme()).toBe('dark')
    vi.unstubAllGlobals()
    expect(systemTheme()).toBe('dark') // no matchMedia at all
  })

  it('sets the theme on <html> and tints the browser chrome', () => {
    stubSystem(true)
    expect(applyTheme('system')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(
      document
        .querySelector('meta[name="theme-color"]')!
        .getAttribute('content'),
    ).toBe('#FBF9F5')
    expect(applyTheme('dark')).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
