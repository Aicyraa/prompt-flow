import toast from 'react-hot-toast'
import { useGraphStore } from '../../store/graphStore'

/**
 * Tells the user their canvas was just replaced and offers to bring it back.
 * Cheaper and less annoying than a confirm dialog before every import.
 */
export function showUndoToast(message: string) {
  toast(
    (t) => (
      <span className="flex items-center gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={() => {
            useGraphStore.getState().undo()
            toast.dismiss(t.id)
          }}
          className="rounded border border-charcoal-500 px-2 py-0.5 text-xs font-semibold text-violet-300 hover:bg-charcoal-800"
        >
          Undo
        </button>
      </span>
    ),
    { duration: 8000 },
  )
}
