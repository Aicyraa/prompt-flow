import type { MergeData, MergeSeparator } from '../types/flow'

export const MERGE_SEPARATORS: { value: MergeSeparator; label: string }[] = [
  { value: 'blank', label: 'Blank line' },
  { value: 'line', label: 'New line' },
  { value: 'rule', label: 'Horizontal rule' },
  { value: 'custom', label: 'Custom…' },
]

const SEPARATORS: Record<Exclude<MergeSeparator, 'custom'>, string> = {
  blank: '\n\n',
  line: '\n',
  rule: '\n\n---\n\n',
}

export interface MergePart {
  label: string
  text: string
}

/** The text between branches for these settings. */
export function separatorText(
  data: Pick<MergeData, 'separator' | 'customSeparator'>,
): string {
  const kind = data.separator ?? 'blank'
  if (kind === 'custom') {
    // "\n" typed in the settings field means a real newline.
    return (data.customSeparator ?? '').replace(/\\n/g, '\n')
  }
  return SEPARATORS[kind]
}

/** Joins branch texts in the order given; empty branches are skipped. */
export function mergeTexts(
  parts: MergePart[],
  data: Pick<MergeData, 'separator' | 'customSeparator' | 'labelled'>,
): string {
  const separator = separatorText(data)
  return parts
    .filter((p) => p.text.trim().length > 0)
    .map((p) => (data.labelled ? `**${p.label}**\n\n${p.text}` : p.text))
    .join(separator)
}

/** Branches read top to bottom, then left to right, as they appear on the canvas. */
export function byCanvasPosition<
  T extends { position: { x: number; y: number } },
>(nodes: T[]): T[] {
  return [...nodes].sort(
    (a, b) => a.position.y - b.position.y || a.position.x - b.position.x,
  )
}
