export interface KeySettings {
  byokEnabled: boolean
  apiKey: string
}

/**
 * Which key a run uses. With BYOK on it is the user's key. With BYOK off
 * there is no hosted key, so only a dev-build env fallback is allowed: Vite
 * inlines env vars into the bundle, so it must never apply in production.
 */
export function resolveApiKey(
  settings: KeySettings,
  devKey: string | undefined = import.meta.env.DEV
    ? import.meta.env.VITE_OPENROUTER_API_KEY
    : undefined,
): string | undefined {
  if (settings.byokEnabled) return settings.apiKey.trim() || undefined
  return devKey || undefined
}

export function maskKey(key: string): string {
  if (key.length <= 10) return '•'.repeat(key.length)
  return `${key.slice(0, 7)}…${key.slice(-4)}`
}
