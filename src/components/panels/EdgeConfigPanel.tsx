import { useFlowStore } from '../../store/flowStore'
import { EDGE_STYLES, type EdgeStyle } from '../../types/flow'

export default function EdgeConfigPanel() {
  const selectedEdgeId = useFlowStore((s) => s.selectedEdgeId)
  const edgeStyle = useFlowStore((s) => s.edgeStyle)
  const setEdgeStyle = useFlowStore((s) => s.setEdgeStyle)
  const selectEdge = useFlowStore((s) => s.selectEdge)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)

  if (!selectedEdgeId) return null

  return (
    <aside className="absolute top-4 right-4 bottom-4 z-10 flex w-72 flex-col overflow-hidden rounded-xl border border-charcoal-700 bg-charcoal-900/95 shadow-2xl backdrop-blur">
      <header className="flex items-center gap-2 border-b border-charcoal-800 p-3">
        <span className="h-4 w-1 rounded-full bg-violet-400" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-charcoal-50">
            Connection settings
          </h2>
          <p className="font-mono text-[10px] text-charcoal-600">
            {selectedEdgeId}
          </p>
        </div>
        <button
          type="button"
          onClick={() => selectEdge(null)}
          className="rounded p-1 text-charcoal-500 transition-colors hover:bg-charcoal-800 hover:text-charcoal-200"
          title="Close panel"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium tracking-wide text-charcoal-400 uppercase">
            Edge style
          </label>
          <p className="mb-2 text-[11px] text-charcoal-500">
            Applies to the whole flow and is saved with it.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {EDGE_STYLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setEdgeStyle(value)}
                className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                  edgeStyle === value
                    ? 'border-violet-400/70 bg-violet-500/15 text-violet-200'
                    : 'border-charcoal-700 bg-charcoal-800/70 text-charcoal-400 hover:border-charcoal-600 hover:text-charcoal-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-charcoal-800 bg-charcoal-800/40 p-2.5">
          <p className="text-[11px] leading-relaxed text-charcoal-500">
            <span className="font-semibold text-charcoal-300">Curved</span>{' '}
            draws a wavy, adjustable line with an arrowhead. Other styles draw
            directly between handles.
          </p>
        </div>
      </div>

      <footer className="border-t border-charcoal-800 p-3">
        <button
          type="button"
          onClick={() =>
            onEdgesChange([{ id: selectedEdgeId, type: 'remove' }])
          }
          className="w-full rounded-md border border-rose-900/60 bg-rose-950/40 px-2 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-900/40"
        >
          Delete connection
        </button>
      </footer>
    </aside>
  )
}

export type { EdgeStyle }
