import { BadOutputError } from './openrouter'

/**
 * Pulls a JSON value out of a model reply (tolerating ```json fences and
 * surrounding prose) and returns it pretty-printed. Throws BadOutputError.
 */
export function extractJson(text: string): string {
  const trimmed = text.trim()
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed)
  const candidates = [fenced?.[1]?.trim(), trimmed].filter((c): c is string =>
    Boolean(c),
  )

  // Also try the outermost {...} or [...] span, for replies with prose around it.
  const span = /[{[][\s\S]*[}\]]/.exec(trimmed)
  if (span) candidates.push(span[0])

  for (const candidate of candidates) {
    try {
      return JSON.stringify(JSON.parse(candidate), null, 2)
    } catch {
      // try the next candidate
    }
  }
  const preview = trimmed.slice(0, 60).replace(/\s+/g, ' ')
  throw new BadOutputError(
    `The model did not return valid JSON${preview ? `: “${preview}${trimmed.length > 60 ? '…' : ''}”` : '.'}`,
  )
}

export function looksLikeJson(text: string): boolean {
  const t = text.trim()
  if (!/^[{[]/.test(t)) return false
  try {
    JSON.parse(t)
    return true
  } catch {
    return false
  }
}
