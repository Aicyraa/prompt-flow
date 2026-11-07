import type { NodeStatus as Status } from '../../types/flow'
import { Icon } from './Icon'
import { STATUS_LABELS } from './nodeTheme'

/**
 * A node's run state as a small glyph (nothing at all while idle). Each state
 * has its own shape, so it never relies on colour alone, and the word is kept
 * for screen readers and the tooltip.
 */
export default function NodeStatus({ status }: { status: Status }) {
  if (status === 'idle') return null
  const label = STATUS_LABELS[status]

  return (
    <span
      role="status"
      title={label}
      className="flex h-4 w-4 items-center justify-center"
    >
      <span className="sr-only">{label}</span>
      {status === 'running' && (
        <Icon name="spinner" className="h-3.5 w-3.5 text-amber-400" />
      )}
      {status === 'done' && (
        // pathLength lets the tick draw itself in once, when the node finishes.
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 text-emerald-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path
            d="m4.5 10.5 3.5 3.5 7.5-8"
            pathLength={1}
            strokeDasharray={1}
            className="animate-draw-in"
          />
        </svg>
      )}
      {status === 'error' && (
        <Icon name="alert" className="h-3.5 w-3.5 text-rose-400" />
      )}
      {status === 'cancelled' && (
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-[3px] border-2 border-charcoal-300"
        />
      )}
    </span>
  )
}
