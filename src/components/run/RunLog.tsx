import { useEffect, useMemo, useState } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { totalUsage, useRunStore } from '../../store/runStore'
import { formatUsage } from '../../lib/format'
import { useSettingsStore } from '../../store/settingsStore'
import { useRunAction } from './useRunAction'
import { Icon } from '../ui/Icon'
import { STATUS_DOTS, STATUS_LABELS } from '../ui/nodeTheme'

const KEY_ERRORS = new Set(['no_key', 'invalid_key'])

function duration(startedAt?: number, endedAt?: number): string {
  if (!startedAt || !endedAt) return ''
  return `${((endedAt - startedAt) / 1000).toFixed(1)}s`
}

/** Per-node timeline of the last run, with full error text. */
export default function RunLog() {
  const order = useRunStore((s) => s.order)
  const runs = useRunStore((s) => s.nodes)
  const isRunning = useRunStore((s) => s.isRunning)
  const stopping = useRunStore((s) => s.stopping)
  const runFlow = useRunAction()
  const graphNodes = useGraphStore((s) => s.nodes)
  const labels = useMemo(
    () =>
      Object.fromEntries(
        graphNodes.map((n) => [n.id, n.data.label ?? n.data.type]),
      ),
    [graphNodes],
  )
  const selectNodeOnly = useGraphStore((s) => s.selectNodeOnly)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const [open, setOpen] = useState(false)

  const entries = order.filter((id) => runs[id])
  const failed = entries.filter((id) => runs[id].status === 'error')
  const done = entries.filter((id) => runs[id].status === 'done').length
  const hasError = failed.length > 0
  const stopped = entries.filter((id) => runs[id].status === 'cancelled').length
  const totals = totalUsage(runs)

  // Surface failures without the user having to find the log.
  useEffect(() => {
    if (hasError) setOpen(true)
  }, [hasError])

  const summary = stopping
    ? 'Stopping the run…'
    : isRunning
      ? `Running… ${done} done`
      : hasError
        ? `Flow stopped: ${runs[failed[0]].error ?? 'error'}`
        : stopped > 0
          ? `Run stopped after ${done} steps`
          : entries.length > 0
            ? `Flow completed: ${done} steps`
            : ''

  if (entries.length === 0 && !isRunning) return null

  return (
    <div className="animate-fade-up absolute inset-x-2 top-2 z-10 md:inset-x-auto md:top-auto md:bottom-4 md:left-16 md:w-80">
      {/* Announces progress to assistive tech without moving focus. */}
      <div role="status" aria-live="polite" className="sr-only">
        {summary}
      </div>

      <div className="overflow-hidden rounded-xl border border-charcoal-700 bg-charcoal-900/95 shadow-2xl backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-charcoal-100 hover:bg-charcoal-800"
        >
          <Icon
            name={isRunning ? 'spinner' : hasError ? 'alert' : 'check'}
            className={`h-3.5 w-3.5 ${hasError ? 'text-rose-400' : isRunning ? 'text-amber-400' : stopped > 0 ? 'text-charcoal-300' : 'text-emerald-400'}`}
          />
          <span className="flex-1 font-medium">
            Run log
            <span className="ml-2 font-normal text-charcoal-300">
              {stopping
                ? 'stopping…'
                : isRunning
                  ? `${done}/${entries.length}`
                  : hasError
                    ? `${failed.length} failed`
                    : stopped > 0
                      ? 'stopped'
                      : `${done} done`}
              {!isRunning &&
                totals.promptTokens + totals.completionTokens > 0 && (
                  <span className="ml-2 text-charcoal-400">
                    {formatUsage(
                      totals.priced ? totals : { ...totals, cost: undefined },
                    )}
                  </span>
                )}
            </span>
          </span>
          <span aria-hidden="true" className="text-charcoal-400">
            {open ? '▾' : '▴'}
          </span>
        </button>

        {open && (
          <ol className="animate-fade-in max-h-64 divide-y divide-charcoal-800 overflow-y-auto border-t border-charcoal-800">
            {entries.map((id) => {
              const run = runs[id]
              return (
                <li key={id} className="animate-fade-up px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOTS[run.status]}`}
                    />
                    <button
                      type="button"
                      onClick={() => selectNodeOnly(id)}
                      className="min-w-0 flex-1 truncate text-left text-charcoal-100 underline-offset-2 hover:underline"
                      title="Show this node"
                    >
                      {labels[id] ?? id}
                    </button>
                    <span className="text-charcoal-300">
                      {STATUS_LABELS[run.status]}
                    </span>
                    <span className="w-9 text-right text-charcoal-400 tabular-nums">
                      {duration(run.startedAt, run.endedAt)}
                    </span>
                  </div>
                  {(run.usage || run.model) && (
                    <p className="mt-0.5 ml-4 text-[11px] text-charcoal-400">
                      {[run.model, formatUsage(run.usage)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                  {run.status === 'error' && run.error && (
                    <p className="mt-1 ml-4 text-[11px] leading-relaxed break-words text-rose-300 select-text">
                      {run.error}
                      {run.errorKind && KEY_ERRORS.has(run.errorKind) ? (
                        <button
                          type="button"
                          onClick={openSettings}
                          className="ml-2 underline"
                        >
                          Open settings
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void runFlow({ from: id })}
                          disabled={isRunning}
                          title="Re-run this node and everything after it, reusing earlier results"
                          className="ml-2 underline disabled:opacity-50"
                        >
                          Retry
                        </button>
                      )}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
