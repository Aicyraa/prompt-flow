import { z } from 'zod'
import { OPENROUTER_BASE_URL } from './client'

export interface KeyInfo {
  label?: string
  usage?: number
  limit?: number | null
  limitRemaining?: number | null
  isFreeTier?: boolean
}

export class KeyRejectedError extends Error {
  constructor() {
    super('The provider rejected this API key.')
  }
}

// Shape not guaranteed by docs we can see; parse leniently.
const keySchema = z
  .object({
    data: z
      .object({
        label: z.string().nullish(),
        usage: z.number().nullish(),
        limit: z.number().nullish(),
        limit_remaining: z.number().nullish(),
        is_free_tier: z.boolean().nullish(),
      })
      .partial()
      .nullish(),
  })
  .partial()

export async function verifyKey(
  apiKey: string,
  signal?: AbortSignal,
): Promise<KeyInfo> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/key`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal,
  })
  if (res.status === 401 || res.status === 403) throw new KeyRejectedError()
  if (!res.ok) throw new Error(`Key check failed (${res.status})`)
  const parsed = keySchema.safeParse(await res.json().catch(() => ({})))
  const d = parsed.success ? parsed.data.data : undefined
  return {
    label: d?.label ?? undefined,
    usage: d?.usage ?? undefined,
    limit: d?.limit,
    limitRemaining: d?.limit_remaining,
    isFreeTier: d?.is_free_tier ?? undefined,
  }
}
