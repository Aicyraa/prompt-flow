import { useMemo, useState } from 'react'
import { copyText } from '../../lib/browserFile'
import { diffLines } from '../../lib/diff'
import { formatUsage } from '../../lib/format'
import {
  entryResult,
  useHistoryStore,
  type HistoryEntry,
} from '../../store/historyStore'
import { useSettingsStore } from '../../store/settingsStore'
import Modal from '../ui/Modal'
import MarkdownView from '../ui/LazyMarkdown'
import { STATUS_DOTS, STATUS_LABELS } from '../ui/nodeTheme'
import type { NodeStatus } from '../../types/flow'

const OUTCOME: Record<HistoryEntry['outcome'], { label: string; dot: string }> =
  {
    completed: { label: 'Completed', dot: 'bg-emerald-400' },
    failed: { label: 'Failed', dot: 'bg-rose-500' },
    stopped: { label: 'Stopped', dot: 'bg-charcoal-300' },
  }

const btn =
  'rounded-md border border-charcoal-700 px-2.5 py-1.5 text-xs font-medium text-charcoal-200 transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-50'

const heading =
  'mb-1 text-[11px] font-medium tracking-wide text-charcoal-400 uppercase'

const when = (ms: number) =>
  new Date(ms).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function totals(entry: HistoryEntry) {
  let tokens = 0
  let cost = 0
  let priced = true
  for (const n of entry.nodes) {
    if (!n.usage) continue
    tokens += n.usage.promptTokens + n.usage.completionTokens
    if (n.usage.cost === undefined) priced = false
    else cost += n.usage.cost
  }
  return { tokens, cost: priced ? cost : undefined }
}

export default function HistoryModal() {
  const open = useSettingsStore((s) => s.historyOpen)
  if (!open) return null
  return <HistoryDialog />
}

function HistoryDialog() {
  const close = useSettingsStore((s) => s.closeHistory)
  const saveHistory = useSettingsStore((s) => s.saveHistory)
  const entries = useHistoryStore((s) => s.entries)
  const remove = useHistoryStore((s) => s.remove)
  const clear = useHistoryStore((s) => s.clear)

  const [selectedId, setSelectedId] = useState<string | undefined>(
    entries[0]?.id,
  )
  const [compareId, setCompareId] = useState('')
  const selected = entries.find((e) => e.id === selectedId) ?? entries[0]
  const other = entries.find((e) => e.id === compareId)

  const diff = useMemo(
    () =>
      selected && other
        ? diffLines(entryResult(other), entryResult(selected))
        : null,
    [selected, other],
  )

  return (
    <Modal
      title="Run history"
      subtitle={
        saveHistory
          ? `Last ${entries.length} run${entries.length === 1 ? '' : 's'}, saved in this browser`
          : 'Saving is turned off in Settings'
      }
      onClose={close}
      widthClass="max-w-4xl"
      footer={
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-charcoal-400">
            Inputs and outputs stay in this browser and are never exported.
          </p>
          <button
            type="button"
            onClick={clear}
            disabled={!entries.length}
            className={btn}
          >
            Clear all
          </button>
        </div>
      }
    >
      {entries.length === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-charcoal-400">
          No runs yet. Run a flow and it will appear here.
        </p>
      ) : (
        <div className="grid md:grid-cols-[14rem_1fr]">
          <ul
            aria-label="Runs"
            className="max-h-48 divide-y divide-charcoal-800 overflow-y-auto border-b border-charcoal-800 md:max-h-[60vh] md:border-r md:border-b-0"
          >
            {entries.map((e) => {
              const t = totals(e)
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(e.id)
                      setCompareId('')
                    }}
                    aria-current={selected?.id === e.id}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-charcoal-800 ${
                      selected?.id === e.id ? 'bg-charcoal-800' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2 text-charcoal-100">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${OUTCOME[e.outcome].dot}`}
                      />
                      {when(e.startedAt)}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-charcoal-400">
                      {OUTCOME[e.outcome].label}
                      {e.from ? ` · from ${e.from}` : ''}
                      {' · '}
                      {formatUsage(
                        t.tokens
                          ? {
                              promptTokens: t.tokens,
                              completionTokens: 0,
                              cost: t.cost,
                            }
                          : undefined,
                        e.durationMs,
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {selected && (
            <section
              aria-label="Run details"
              className="min-w-0 space-y-4 px-5 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void copyText(entryResult(selected))}
                  disabled={!entryResult(selected)}
                  className={btn}
                >
                  Copy result
                </button>
                <button
                  type="button"
                  onClick={() => {
                    remove(selected.id)
                    setSelectedId(undefined)
                    setCompareId('')
                  }}
                  className={btn}
                >
                  Delete run
                </button>
                {entries.length > 1 && (
                  <label className="ml-auto flex items-center gap-1.5 text-[11px] text-charcoal-300">
                    Compare with
                    <select
                      value={compareId}
                      onChange={(e) => setCompareId(e.target.value)}
                      className="rounded border border-charcoal-700 bg-charcoal-800 px-1.5 py-1 text-xs text-charcoal-100"
                    >
                      <option value="">None</option>
                      {entries
                        .filter((e) => e.id !== selected.id)
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {when(e.startedAt)}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </div>

              {diff ? (
                <div>
                  <h3 className={heading}>Result: older → this run</h3>
                  <pre
                    aria-label="Difference between the two results"
                    className="max-h-72 overflow-auto rounded-md border border-charcoal-700 bg-charcoal-950 p-2 font-mono text-[12px] leading-relaxed"
                  >
                    {diff.map((line, i) => (
                      <span
                        key={i}
                        className={`block whitespace-pre-wrap ${
                          line.type === 'add'
                            ? 'bg-emerald-950/60 text-emerald-200'
                            : line.type === 'del'
                              ? 'bg-rose-950/60 text-rose-200 line-through decoration-rose-400/40'
                              : 'text-charcoal-300'
                        }`}
                      >
                        {line.type === 'add'
                          ? '+ '
                          : line.type === 'del'
                            ? '− '
                            : '  '}
                        {line.text}
                      </span>
                    ))}
                  </pre>
                </div>
              ) : (
                <div>
                  <h3 className={heading}>Result</h3>
                  <div className="max-h-60 overflow-y-auto rounded-md border border-charcoal-700 bg-charcoal-800/40 p-3">
                    {entryResult(selected) ? (
                      <MarkdownView markdown={entryResult(selected)} />
                    ) : (
                      <p className="text-xs text-charcoal-400">
                        This run produced no output.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className={heading}>Steps</h3>
                <ol className="divide-y divide-charcoal-800 rounded-md border border-charcoal-800">
                  {selected.nodes.map((n) => (
                    <li key={n.id} className="px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOTS[n.status as NodeStatus] ?? 'bg-charcoal-500'}`}
                        />
                        <span className="flex-1 truncate text-charcoal-100">
                          {n.label}
                        </span>
                        <span className="text-charcoal-300">
                          {STATUS_LABELS[n.status as NodeStatus] ?? n.status}
                        </span>
                      </div>
                      {(n.model || n.usage || n.ms !== undefined) && (
                        <p className="mt-0.5 ml-4 text-[11px] text-charcoal-400">
                          {[n.model, formatUsage(n.usage, n.ms)]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      {n.error && (
                        <p className="mt-0.5 ml-4 text-[11px] break-words text-rose-300">
                          {n.error}
                        </p>
                      )}
                      {n.truncated && (
                        <p className="mt-0.5 ml-4 text-[11px] text-charcoal-400">
                          Output was shortened for storage.
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  )
}
