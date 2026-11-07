import {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  NODE_LABELS,
} from '../../lib/nodes'
import type { LlmData } from '../../types/flow'
import { useGraphStore } from '../../store/graphStore'
import { useModelStore } from '../../store/modelStore'
import { useRunStore } from '../../store/runStore'
import { useRunAction } from '../run/useRunAction'
import NodeIcon from '../ui/NodeIcon'
import { FOCUS_RINGS } from '../ui/nodeTheme'
import { CloseIcon } from '../ui/Icon'
import { Field, inputClass } from '../ui/fields'
import ModelPicker from '../models/ModelPicker'
import ModelDetails from '../models/ModelDetails'
import { supportsParam, useModelInfo } from '../models/useModelInfo'

/** Model-dependent controls; a component so the catalog hook is unconditional. */
function LlmFields({
  nodeId,
  data,
  focus,
}: {
  nodeId: string
  data: LlmData
  focus: string
}) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const model = data.model ?? DEFAULT_MODEL
  const info = useModelInfo(model)
  const efforts = info?.reasoning?.efforts ?? []

  return (
    <>
      <Field label="Model">
        {(id) => (
          <ModelPicker
            id={id}
            value={model}
            onChange={(next) => updateNodeData(nodeId, { model: next })}
            focusClass={focus.replace('focus:', 'focus-visible:')}
          />
        )}
      </Field>
      {info && info.description && (
        <details className="text-xs text-charcoal-300">
          <summary className="cursor-pointer text-charcoal-300 hover:text-charcoal-100">
            Model details
          </summary>
          <div className="mt-2">
            <ModelDetails model={info} />
          </div>
        </details>
      )}
      <Field
        label="System prompt"
        hint="Optional. Sets the agent's role and rules; the upstream text is sent as the user message."
      >
        {(id) => (
          <textarea
            id={id}
            value={data.system ?? ''}
            onChange={(e) =>
              updateNodeData(nodeId, { system: e.target.value || undefined })
            }
            rows={4}
            placeholder="You are a concise technical editor."
            className={`${inputClass} resize-none ${focus}`}
          />
        )}
      </Field>
      <Field
        label="Output format"
        hint={
          data.outputMode === 'json'
            ? 'The reply is validated and pretty-printed as JSON. Invalid JSON fails the node.'
            : undefined
        }
      >
        {(id) => (
          <select
            id={id}
            value={data.outputMode ?? 'text'}
            onChange={(e) =>
              updateNodeData(nodeId, {
                outputMode: e.target.value === 'json' ? 'json' : undefined,
              })
            }
            className={`${inputClass} ${focus}`}
          >
            <option value="text">Text</option>
            <option value="json">JSON</option>
          </select>
        )}
      </Field>
      {supportsParam(info, 'temperature') && (
        <Field label="Temperature">
          {(id) => (
            <div className="flex items-center gap-3">
              <input
                id={id}
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={data.temperature ?? DEFAULT_TEMPERATURE}
                onChange={(e) =>
                  updateNodeData(nodeId, {
                    temperature: Number(e.target.value),
                  })
                }
                className="flex-1 accent-violet-400"
              />
              <span className="w-8 text-right text-xs text-violet-300">
                {(data.temperature ?? DEFAULT_TEMPERATURE).toFixed(1)}
              </span>
            </div>
          )}
        </Field>
      )}
      {supportsParam(info, 'max_tokens') && (
        <Field
          label="Max output tokens"
          hint={
            info?.maxCompletionTokens
              ? `Model limit: ${info.maxCompletionTokens.toLocaleString()}. Leave empty for the default.`
              : 'Leave empty for the model default.'
          }
        >
          {(id) => (
            <input
              id={id}
              type="number"
              min={1}
              max={info?.maxCompletionTokens ?? undefined}
              value={data.maxTokens ?? ''}
              onChange={(e) =>
                updateNodeData(nodeId, {
                  maxTokens: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className={`${inputClass} ${focus}`}
            />
          )}
        </Field>
      )}
      {efforts.length > 0 && (
        <Field
          label="Reasoning effort"
          hint={
            info?.reasoning?.mandatory
              ? 'This model always reasons, which uses output tokens.'
              : undefined
          }
        >
          {(id) => (
            <select
              id={id}
              value={data.reasoningEffort ?? ''}
              onChange={(e) =>
                updateNodeData(nodeId, {
                  reasoningEffort: e.target.value || undefined,
                })
              }
              className={`${inputClass} ${focus}`}
            >
              <option value="">Default</option>
              {efforts.map((effort) => (
                <option key={effort} value={effort}>
                  {effort}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}
      <FallbackModels
        nodeId={nodeId}
        models={data.fallbackModels ?? []}
        primary={model}
        focus={focus}
      />
    </>
  )
}

/** Ordered backup models, tried when the primary one fails. */
function FallbackModels({
  nodeId,
  models,
  primary,
  focus,
}: {
  nodeId: string
  models: string[]
  primary: string
  focus: string
}) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const names = useModelStore((s) => s.models)
  const nameOf = (id: string) => names.find((m) => m.id === id)?.name ?? id
  const set = (next: string[]) =>
    updateNodeData(nodeId, { fallbackModels: next.length ? next : undefined })
  const move = (from: number, to: number) => {
    const next = [...models]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    set(next)
  }
  const small =
    'rounded px-1.5 py-0.5 text-xs text-charcoal-300 hover:bg-charcoal-800 hover:text-charcoal-50 disabled:opacity-30'

  return (
    <Field
      label="Fallback models"
      hint="Tried in order if the primary model is unavailable, overloaded or times out. Not used for key or credit errors."
    >
      {(id) => (
        <div className="space-y-1.5">
          {models.length > 0 && (
            <ol className="space-y-1" aria-label="Fallback order">
              {models.map((m, i) => (
                <li
                  key={m}
                  className="flex items-center gap-1 rounded-md border border-charcoal-700 bg-charcoal-800/40 py-1 pr-1 pl-2 text-xs text-charcoal-100"
                >
                  <span className="w-4 text-charcoal-400">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate">{nameOf(m)}</span>
                  <button
                    type="button"
                    className={small}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                    aria-label={`Move ${nameOf(m)} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={small}
                    disabled={i === models.length - 1}
                    onClick={() => move(i, i + 1)}
                    aria-label={`Move ${nameOf(m)} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={small}
                    onClick={() => set(models.filter((x) => x !== m))}
                    aria-label={`Remove ${nameOf(m)}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
          )}
          <ModelPicker
            id={id}
            value=""
            placeholder="Add a fallback model…"
            onChange={(next) => {
              if (next !== primary && !models.includes(next)) {
                set([...models, next])
              }
            }}
            focusClass={focus.replace('focus:', 'focus-visible:')}
          />
        </div>
      )}
    </Field>
  )
}

export default function NodeConfigPanel() {
  // The panel shows when exactly one node is selected on the canvas.
  const node = useGraphStore((s) => {
    const selected = s.nodes.filter((n) => n.selected)
    return selected.length === 1 ? selected[0] : undefined
  })
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const deleteNode = useGraphStore((s) => s.deleteNode)
  const clearSelection = useGraphStore((s) => s.clearSelection)
  const isRunning = useRunStore((s) => s.isRunning)
  const runFlow = useRunAction()

  if (!node) return null

  const data = node.data
  const focus = FOCUS_RINGS[data.type]

  return (
    <aside className="animate-slide-up absolute inset-x-2 bottom-2 z-10 flex max-h-[55vh] flex-col overflow-hidden rounded-xl border border-charcoal-700 bg-charcoal-900/95 shadow-2xl backdrop-blur md:inset-x-auto md:top-4 md:right-4 md:bottom-4 md:max-h-none md:w-72 md:animate-slide-in-right">
      <header className="flex items-center gap-2 border-b border-charcoal-800 p-3">
        <NodeIcon type={data.type} />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-charcoal-50">
            Node settings
          </h2>
          <p className="font-mono text-[10px] text-charcoal-400">{node.id}</p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="rounded p-1 text-charcoal-400 transition-colors hover:bg-charcoal-800 hover:text-charcoal-200"
          aria-label="Close panel"
          title="Close panel"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <Field label="Label">
          {(id) => (
            <input
              id={id}
              value={data.label ?? NODE_LABELS[data.type]}
              onChange={(e) =>
                updateNodeData(node.id, { label: e.target.value })
              }
              className={`${inputClass} ${focus}`}
            />
          )}
        </Field>

        {data.type === 'input' && (
          <Field label="Text" hint="Raw text fed into the chain.">
            {(id) => (
              <textarea
                id={id}
                value={data.text ?? ''}
                onChange={(e) =>
                  updateNodeData(node.id, { text: e.target.value })
                }
                rows={6}
                className={`${inputClass} resize-none font-mono ${focus}`}
              />
            )}
          </Field>
        )}

        {data.type === 'prompt' && (
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
            {(id) => (
              <textarea
                id={id}
                value={data.template ?? ''}
                onChange={(e) =>
                  updateNodeData(node.id, { template: e.target.value })
                }
                rows={6}
                placeholder={'Summarize this: {{input}}'}
                className={`${inputClass} resize-none font-mono ${focus}`}
              />
            )}
          </Field>
        )}

        {data.type === 'llm' && (
          <LlmFields nodeId={node.id} data={data} focus={focus} />
        )}

        {data.type === 'output' && (
          <p className="text-xs text-charcoal-400">
            Displays the final result of the chain once the flow runs.
          </p>
        )}
      </div>

      <footer className="space-y-2 border-t border-charcoal-800 p-3">
        <button
          type="button"
          onClick={() => void runFlow({ from: node.id })}
          disabled={isRunning}
          title="Re-run this node and everything after it, reusing earlier results"
          className="w-full rounded-md border border-violet-400/40 px-2 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run from here
        </button>
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
