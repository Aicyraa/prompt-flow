export type ThemePref = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export const THEME_PREFS: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'Match my system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/** What "system" means right now. */
export function systemTheme(): Theme {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

export function resolveTheme(
  pref: ThemePref,
  system: Theme = systemTheme(),
): Theme {
  return pref === 'system' ? system : pref
}

/** Puts the theme on <html> (read by the CSS) and tints the browser UI. */
export function applyTheme(pref: ThemePref): Theme {
  const theme = resolveTheme(pref)
  const root = document.documentElement
  root.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'light' ? '#FBF9F5' : '#161310')
  return theme
}
