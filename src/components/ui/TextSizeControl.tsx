import type { NodeTextSize } from '../../types/flow'
import { DEFAULT_TEXT_SIZE, TEXT_SIZES } from '../../lib/textSize'

interface TextSizeControlProps {
  /** Accessible name for the group. */
  label: string
  /** `undefined` means "use the default" (only when `allowDefault`). */
  value: NodeTextSize | undefined
  onChange: (size: NodeTextSize | undefined) => void
  /** Adds a "Default" choice that clears an override. */
  allowDefault?: boolean
}

const SHORT: Record<NodeTextSize, string> = {
  sm: 'S',
  md: 'M',
  lg: 'L',
  xl: 'XL',
}

/** A segmented picker: [Default] S M L XL. */
export default function TextSizeControl({
  label,
  value,
  onChange,
  allowDefault = false,
}: TextSizeControlProps) {
  const options: {
    key: string
    size: NodeTextSize | undefined
    text: string
  }[] = [
    ...(allowDefault
      ? [{ key: 'default', size: undefined, text: 'Default' }]
      : []),
    ...TEXT_SIZES.map((s) => ({
      key: s.value,
      size: s.value as NodeTextSize | undefined,
      text: SHORT[s.value],
    })),
  ]
  const current = allowDefault ? value : (value ?? DEFAULT_TEXT_SIZE)

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex overflow-hidden rounded-md border border-charcoal-700 bg-charcoal-800/70"
    >
      {options.map(({ key, size, text }) => {
        const selected = current === size
        const full = size
          ? TEXT_SIZES.find((s) => s.value === size)!.label
          : 'Use the default size'
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={full}
            title={full}
            onClick={() => onChange(size)}
            className={`flex-1 border-l border-charcoal-700 px-2 py-1.5 text-xs font-medium transition-colors first:border-l-0 ${
              selected
                ? 'bg-violet-600 text-white'
                : 'text-charcoal-200 hover:bg-charcoal-700/60'
            }`}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}
