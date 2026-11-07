import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { formatAgo } from '../../lib/format'
import { useFlowLibrary } from '../../store/flowLibraryStore'
import { useGraphStore } from '../../store/graphStore'
import { useSettingsStore } from '../../store/settingsStore'
import { showUndoToast } from '../ui/undoToast'
import Modal from '../ui/Modal'
import { inputClass } from '../ui/fields'

const small =
  'rounded-md px-2 py-1 text-[11px] text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50'

/** Save, open, rename, duplicate and delete named flows. */
export default function FlowsModal() {
  const close = useSettingsStore((s) => s.closeFlows)
  const flows = useFlowLibrary((s) => s.flows)
  const activeId = useFlowLibrary((s) => s.activeId)
  const { saveAs, open, newFlow, rename, duplicate, remove } =
    useFlowLibrary.getState()
  const { fitView } = useReactFlow()

  const [name, setName] = useState('')
  const [renaming, setRenaming] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const active = flows.find((f) => f.id === activeId)
  const canvasHasWork = () => useGraphStore.getState().nodes.length > 0
  const settle = () => {
    close()
    requestAnimationFrame(() => void fitView({ padding: 0.2, duration: 300 }))
  }

  /** Switching away from a loose (unsaved) canvas replaces it: offer undo. */
  const guardLooseCanvas = (action: () => void, message: string) => {
    const loose = !active && canvasHasWork()
    action()
    if (loose) showUndoToast(message)
    settle()
  }

  return (
    <Modal
      title="Saved flows"
      subtitle={
        active
          ? `Autosaving to “${active.name}”`
          : 'Your canvas isn’t saved to a flow yet'
      }
      onClose={close}
      widthClass="max-w-lg"
      footer={
        <button
          type="button"
          onClick={() =>
            guardLooseCanvas(() => newFlow(), 'Started a new flow')
          }
          className="w-full rounded-lg border border-violet-400/40 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/10"
        >
          New empty flow
        </button>
      }
    >
      <div className="space-y-4 px-5 py-4">
        {!active && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveAs(name)
              setName('')
            }}
            className="flex gap-2"
          >
            <input
              aria-label="Flow name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this canvas to save it"
              maxLength={80}
              className={`${inputClass} focus:border-violet-400/60`}
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-violet-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
            >
              Save
            </button>
          </form>
        )}

        {flows.length === 0 ? (
          <p className="text-xs leading-relaxed text-charcoal-400">
            Saved flows live in this browser. Once a flow is saved, every change
            you make to it is saved automatically.
          </p>
        ) : (
          <ul aria-label="Saved flows" className="space-y-1.5">
            {flows.map((flow) => {
              const isActive = flow.id === activeId
              return (
                <li
                  key={flow.id}
                  className={`rounded-lg border px-3 py-2 ${
                    isActive
                      ? 'border-violet-400/40 bg-violet-400/5'
                      : 'border-charcoal-800'
                  }`}
                >
                  {renaming === flow.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        rename(flow.id, draft)
                        setRenaming(null)
                      }}
                      className="flex gap-2"
                    >
                      <input
                        autoFocus
                        aria-label="New name"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.stopPropagation()
                            setRenaming(null)
                          }
                        }}
                        maxLength={80}
                        className={`${inputClass} focus:border-violet-400/60`}
                      />
                      <button type="submit" className={small}>
                        Save
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isActive}
                        onClick={() =>
                          guardLooseCanvas(
                            () => open(flow.id),
                            `Opened “${flow.name}”, replacing your canvas`,
                          )
                        }
                        className="min-w-0 flex-1 text-left disabled:cursor-default"
                        title={
                          isActive ? 'Open on the canvas' : 'Open this flow'
                        }
                      >
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-charcoal-50">
                            {flow.name}
                          </span>
                          {isActive && (
                            <span className="rounded-full bg-violet-400/15 px-1.5 text-[10px] text-violet-300">
                              Open
                            </span>
                          )}
                        </span>
                        <span className="block text-[11px] text-charcoal-400">
                          {flow.nodeCount}{' '}
                          {flow.nodeCount === 1 ? 'node' : 'nodes'} · saved{' '}
                          {formatAgo(flow.updatedAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={small}
                        onClick={() => {
                          setRenaming(flow.id)
                          setDraft(flow.name)
                        }}
                        aria-label={`Rename ${flow.name}`}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className={small}
                        onClick={() => duplicate(flow.id)}
                        aria-label={`Duplicate ${flow.name}`}
                      >
                        Duplicate
                      </button>
                      {confirmDelete === flow.id ? (
                        <button
                          type="button"
                          className="rounded-md bg-rose-500/20 px-2 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-500/30"
                          onClick={() => {
                            remove(flow.id)
                            setConfirmDelete(null)
                          }}
                          onBlur={() => setConfirmDelete(null)}
                          autoFocus
                          aria-label={`Confirm delete ${flow.name}`}
                        >
                          Really delete?
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${small} hover:!text-rose-300`}
                          onClick={() => setConfirmDelete(flow.id)}
                          aria-label={`Delete ${flow.name}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Modal>
  )
}
