import { formatUsd } from '../../engine/estimate'
import { useRunStore } from '../../store/runStore'
import { useRunAction } from './useRunAction'
import Modal from '../ui/Modal'

/** Asks before a run whose estimated cost is above the user's threshold. */
export default function CostConfirmModal() {
  const pending = useRunStore((s) => s.pendingConfirm)
  const dismiss = useRunStore((s) => s.dismissConfirm)
  const runFlow = useRunAction()
  if (!pending) return null

  const { estimate, options } = pending
  return (
    <Modal
      title="This run may cost more than usual"
      subtitle="Estimated from prompt size and model prices"
      onClose={dismiss}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-lg border border-charcoal-700 px-3 py-1.5 text-xs font-medium text-charcoal-200 hover:bg-charcoal-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void runFlow({ ...options, skipCostCheck: true })}
            className="flex-1 rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-400"
          >
            Run anyway
          </button>
        </div>
      }
    >
      <div className="space-y-2 px-5 py-4 text-xs text-charcoal-200">
        <p>
          Expected cost: <strong>about {formatUsd(estimate.expected)}</strong>
        </p>
        {estimate.unpriced > 0 && (
          <p className="text-charcoal-300">
            {estimate.unpriced} model{estimate.unpriced > 1 ? 's have' : ' has'}{' '}
            no published price and {estimate.unpriced > 1 ? 'are' : 'is'} not
            included.
          </p>
        )}
        <p className="text-charcoal-300">
          Reasoning models can use many more tokens than shown. You can change
          or turn off this check in Settings.
        </p>
      </div>
    </Modal>
  )
}
