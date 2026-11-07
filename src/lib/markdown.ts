import { looksLikeJson } from './json'

const FENCE = /^(\s*)(`{3,}|~{3,})/

/** Splits text into alternating prose / fenced-code segments. */
function segments(text: string): { code: boolean; text: string }[] {
  const out: { code: boolean; text: string }[] = []
  let current: string[] = []
  let fence: string | null = null
  for (const line of text.split('\n')) {
    const m = FENCE.exec(line)
    if (fence === null) {
      if (m) {
        if (current.length) out.push({ code: false, text: current.join('\n') })
        current = [line]
        fence = m[2][0]
      } else current.push(line)
    } else {
      current.push(line)
      if (m && m[2][0] === fence) {
        out.push({ code: true, text: current.join('\n') })
        current = []
        fence = null
      }
    }
  }
  if (current.length)
    out.push({ code: fence !== null, text: current.join('\n') })
  return out
}

/** A reply that is entirely one ```markdown fence: unwrap it. */
function unwrapOuterFence(text: string): string {
  const m = /^```(?:markdown|md)?[ \t]*\n([\s\S]*?)\n```[ \t]*$/i.exec(
    text.trim(),
  )
  // Only unwrap when the inner text has no further fences of its own.
  return m && !/^```/m.test(m[1]) ? m[1] : text
}

/**
 * Tidies model output into clean, portable Markdown: unwrapped from a
 * wrapping code fence, LF line endings, no trailing spaces (hard breaks are
 * kept), at most one blank line between blocks, one final newline.
 * Fenced code is never touched.
 */
export function normalizeMarkdown(raw: string): string {
  const text = unwrapOuterFence(raw.replace(/\r\n?/g, '\n').trim())
  const tidy = segments(text)
    .map((s) => {
      if (s.code) return s.text
      return s.text
        .split('\n')
        .map((l) =>
          / {2}$/.test(l) && l.trim() && !/^\s*#/.test(l)
            ? l.replace(/ +$/, '  ')
            : l.trimEnd(),
        )
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
    })
    .join('\n')
  return tidy.trim() + '\n'
}

/** Text of the first heading, without Markdown markup. */
export function firstHeading(markdown: string): string | undefined {
  const m = /^#{1,6}[ \t]+(.+?)[ \t#]*$/m.exec(markdown)
  return m?.[1].replace(/[*_`[\]]/g, '').trim() || undefined
}

export function slugify(text: string, max = 48): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '')
}

export interface OutputFile {
  filename: string
  content: string
  type: string
}

/** The download for a node's output: named after its title, typed by content. */
export function outputFile(raw: string, fallbackName = 'output'): OutputFile {
  if (looksLikeJson(raw)) {
    return {
      filename: `${fallbackName}.json`,
      content: raw.trim() + '\n',
      type: 'application/json',
    }
  }
  const content = normalizeMarkdown(raw)
  const heading = firstHeading(content)
  const slug = heading ? slugify(heading) : ''
  return {
    filename: `${slug || fallbackName}.md`,
    content,
    type: 'text/markdown',
  }
}

/**
 * Shifts every heading down `by` levels (capped at h6), leaving fenced code
 * alone, so a model's "# Title" can nest inside a larger document.
 */
export function demoteHeadings(markdown: string, by: number): string {
  return segments(markdown)
    .map((s) =>
      s.code
        ? s.text
        : s.text.replace(/^(#{1,6})(?=[ \t])/gm, (hashes) =>
            '#'.repeat(Math.min(6, hashes.length + by)),
          ),
    )
    .join('\n')
}
