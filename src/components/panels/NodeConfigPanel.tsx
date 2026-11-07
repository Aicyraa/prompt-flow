import {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  NODE_LABELS,
} from '../../lib/nodes'
import type { LlmData } from '../../types/flow'
import { useGraphStore } from '../../store/graphStore'
import { useModelStore } from '../../store/modelStore'
import { selectNodeRun, useRunStore } from '../../store/runStore'
import { useRunAction } from '../run/useRunAction'
import NodeIcon from '../ui/NodeIcon'
import { FOCUS_RINGS } from '../ui/nodeTheme'
import { CloseIcon, Icon } from '../ui/Icon'
import { Field, inputClass, Section } from '../ui/fields'
import { STATUS_DOTS, STATUS_LABELS } from '../ui/nodeTheme'
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

  const hasGeneration =
    supportsParam(info, 'temperature') ||
    supportsParam(info, 'max_tokens') ||
    efforts.length > 0

  return (
    <>
      <Section title="Model">
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
          <details className="group rounded-md border border-charcoal-800 bg-charcoal-950/40 text-xs text-charcoal-300">
            <summary className="flex cursor-pointer list-none items-center justify-between px-2.5 py-1.5 text-charcoal-300 hover:text-charcoal-100">
              Model details
              <Icon
                name="chevron"
                className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="px-2.5 pb-2.5">
              <ModelDetails model={info} />
            </div>
          </details>
        )}
      </Section>

      <Section title="Instructions">
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
              className={`${inputClass} resize-y ${focus}`}
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
      </Section>

      {hasGeneration && (
        <Section title="Generation">
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
                  <span className="w-10 rounded-md border border-charcoal-700 bg-charcoal-950 py-0.5 text-center font-mono text-xs text-violet-300">
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
        </Section>
      )}

      <Section title="Reliability">
        <FallbackModels
          nodeId={nodeId}
          models={data.fallbackModels ?? []}
          primary={model}
          focus={focus}
        />
      </Section>
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
  const duplicateSelection = useGraphStore((s) => s.duplicateSelection)
  const clearSelection = useGraphStore((s) => s.clearSelection)
  const isRunning = useRunStore((s) => s.isRunning)
  const status = useRunStore((s) =>
    node ? selectNodeRun(node.id)(s).status : 'idle',
  )
  const runFlow = useRunAction()

  if (!node) return null

  const data = node.data
  const focus = FOCUS_RINGS[data.type]
  const title = data.label?.trim() || NODE_LABELS[data.type]

  return (
    <aside
      aria-label="Node settings"
      className="animate-slide-up absolute inset-x-2 bottom-2 z-10 flex max-h-[60vh] flex-col overflow-hidden rounded-2xl border border-charcoal-700 bg-charcoal-900 shadow-2xl md:inset-x-auto md:top-3 md:right-3 md:bottom-3 md:max-h-none md:w-80 md:animate-slide-in-right"
    >
      <header className="flex items-center gap-3 border-b border-charcoal-800 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-charcoal-700 bg-charcoal-950">
          <NodeIcon type={data.type} className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-charcoal-50">
            {title}
          </h2>
          <p className="flex items-center gap-1.5 text-[11px] text-charcoal-400">
            <span>{NODE_LABELS[data.type]} node</span>
            {status !== 'idle' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status]}`}
                  />
                  {STATUS_LABELS[status]}
                </span>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="rounded-md p-1.5 text-charcoal-400 transition-colors hover:bg-charcoal-800 hover:text-charcoal-200"
          aria-label="Close panel"
          title="Close panel"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="flex-1 divide-y divide-charcoal-800 overflow-y-auto">
        <Section title="General">
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
                  rows={7}
                  className={`${inputClass} resize-y font-mono ${focus}`}
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
                  <code className="rounded bg-charcoal-950 px-1 text-amber-400/90">
                    {'{{input}}'}
                  </code>{' '}
                  to insert it.
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
                  rows={7}
                  placeholder={'Summarize this: {{input}}'}
                  className={`${inputClass} resize-y font-mono ${focus}`}
                />
              )}
            </Field>
          )}
          {data.type === 'output' && (
            <p className="text-xs leading-relaxed text-charcoal-400">
              Displays the final result of the chain once the flow runs. Drag
              its corners to resize it.
            </p>
          )}
        </Section>

        {data.type === 'llm' && (
          <LlmFields nodeId={node.id} data={data} focus={focus} />
        )}
      </div>

      <footer className="flex gap-2 border-t border-charcoal-800 bg-charcoal-900 p-3">
        <button
          type="button"
          onClick={() => void runFlow({ from: node.id })}
          disabled={isRunning}
          title="Re-run this node and everything after it, reusing earlier results"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition-[background-color,transform] hover:bg-violet-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="play" className="h-3 w-3" />
          Run from here
        </button>
        <button
          type="button"
          onClick={() => duplicateSelection()}
          title="Duplicate node (Ctrl/⌘+D)"
          aria-label="Duplicate node"
          className="flex items-center rounded-lg border border-charcoal-700 px-2.5 py-2 text-charcoal-200 transition-colors hover:bg-charcoal-800"
        >
          <Icon name="copy" className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => deleteNode(node.id)}
          title="Delete node"
          className="flex items-center gap-1.5 rounded-lg border border-rose-900/60 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-950/60"
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
          Delete
        </button>
      </footer>
    </aside>
  )
}
