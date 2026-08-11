import { useFlowStore } from '../../store/flowStore'
import { MODEL_OPTIONS, NODE_LABELS } from '../../lib/nodes'
import { ACCENT_COLORS, FOCUS_RINGS } from '../ui/nodeTheme'
import type { ReactNode } from 'react'

const inputCls =
  'w-full rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1.5 text-sm text-slate-100 outline-none'

interface FieldProps {
  label: string
  children: ReactNode
  hint?: ReactNode
}

function Field({ label, children, hint }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

export default function NodeConfigPanel() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId)
  const node = useFlowStore((s) =>
    s.nodes.find((n) => n.id === selectedNodeId),
  )
  const updateNodeData = useFlowStore((s) => s.updateNodeData)
  const deleteNode = useFlowStore((s) => s.deleteNode)
  const selectNode = useFlowStore((s) => s.selectNode)

  if (!node) return null

  const type = node.data.type
  const data = node.data
  const accent = ACCENT_COLORS[type]
  const focus = FOCUS_RINGS[type]

  const update = (patch: Record<string, unknown>) =>
    updateNodeData(node.id, patch)

  return (
    <aside className="absolute top-4 right-4 bottom-4 z-10 flex w-72 flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl backdrop-blur">
      <header className="flex items-center gap-2 border-b border-slate-800 p-3">
        <span className={`h-4 w-1 rounded-full ${accent}`} />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-slate-100">
            Node settings
          </h2>
          <p className="font-mono text-[10px] text-slate-500">{node.id}</p>
        </div>
        <button
          type="button"
          onClick={() => selectNode(null)}
          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          title="Close panel"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <Field label="Label">
          <input
            value={data.label ?? NODE_LABELS[type]}
            onChange={(e) => update({ label: e.target.value })}
            className={`${inputCls} ${focus}`}
          />
        </Field>

        {type === 'input' && (
          <Field label="Text" hint="Raw text fed into the chain.">
            <textarea
              value={data.text ?? ''}
              onChange={(e) => update({ text: e.target.value })}
              rows={6}
              className={`${inputCls} resize-none font-mono ${focus}`}
            />
          </Field>
        )}

        {type === 'prompt' && (
          <Field
            label="Template"
            hint={
              <>
                Wrap an upstream output in{' '}
                <code className="text-amber-400/80">{'{{input}}'}</code> to
                insert it.
              </>
            }
          >
            <textarea
              value={data.template ?? ''}
              onChange={(e) => update({ template: e.target.value })}
              rows={6}
              placeholder={'Summarize this: {{input}}'}
              className={`${inputCls} resize-none font-mono ${focus}`}
            />
          </Field>
        )}

        {type === 'llm' && (
          <>
            <Field label="Model">
              <select
                value={data.model ?? MODEL_OPTIONS[0]}
                onChange={(e) => update({ model: e.target.value })}
                className={`${inputCls} ${focus}`}
              >
                {MODEL_OPTIONS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Temperature">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={data.temperature ?? 0.7}
                  onChange={(e) =>
                    update({ temperature: Number(e.target.value) })
                  }
                  className="flex-1 accent-violet-400"
                />
                <span className="w-8 text-right text-xs text-violet-300">
                  {(data.temperature ?? 0.7).toFixed(1)}
                </span>
              </div>
            </Field>
          </>
        )}

        {type === 'output' && (
          <p className="text-xs text-slate-500">
            Displays the final result of the chain once the flow runs.
          </p>
        )}
      </div>

      <footer className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={() => deleteNode(node.id)}
          className="w-full rounded-md border border-rose-900/60 bg-rose-950/40 px-2 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-900/40"
        >
          Delete node
        </button>
      </footer>
    </aside>
  )
}
