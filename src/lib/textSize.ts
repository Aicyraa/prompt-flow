import type { NodeTextSize } from '../types/flow'

export const DEFAULT_TEXT_SIZE: NodeTextSize = 'md'

/** Text inside nodes (not the surrounding chrome) at each size, in px. */
export const TEXT_SIZES: { value: NodeTextSize; label: string; px: number }[] =
  [
    { value: 'sm', label: 'Small', px: 11 },
    { value: 'md', label: 'Medium', px: 13 },
    { value: 'lg', label: 'Large', px: 16 },
    { value: 'xl', label: 'Extra large', px: 20 },
  ]

const SIZE_PX = Object.fromEntries(TEXT_SIZES.map((s) => [s.value, s.px]))

export function textSizePx(size: NodeTextSize | undefined): number {
  return SIZE_PX[size ?? DEFAULT_TEXT_SIZE] ?? SIZE_PX[DEFAULT_TEXT_SIZE]
}

/** A node's own size wins; otherwise the global default. */
export function effectiveTextSize(
  own: NodeTextSize | undefined,
  global: NodeTextSize,
): NodeTextSize {
  return own ?? global
}

/** Type guard for values read from saved files or settings. */
export function isTextSize(value: unknown): value is NodeTextSize {
  return TEXT_SIZES.some((s) => s.value === value)
}
