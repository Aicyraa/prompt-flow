import { useMemo } from 'react'
import { totalUsage, useRunStore } from '../../store/runStore'
import { formatRunSummary } from '../../lib/format'
import { useRunReport } from './useRunReport'

/** Tokens, cost and time for the finished run, shown under the result. */
export default function RunSummaryLine() {
  const runs = useRunStore((s) => s.nodes)
  const isRunning = useRunStore((s) => s.isRunning)
  const { download } = useRunReport()

  const text = useMemo(() => {
    const all = Object.values(runs)
    const done = all.filter((r) => r.status === 'done')
    if (done.length === 0) return ''
    const totals = totalUsage(runs)
    const starts = all.map((r) => r.startedAt).filter((t): t is number => !!t)
    const ends = all.map((r) => r.endedAt).filter((t): t is number => !!t)
    return formatRunSummary({
      steps: done.length,
      promptTokens: totals.promptTokens,
      completionTokens: totals.completionTokens,
      cost: totals.cost ?? 0,
      priced: totals.priced,
      ms:
        starts.length && ends.length
          ? Math.max(...ends) - Math.min(...starts)
          : -1,
    })
  }, [runs])

  if (isRunning || !text) return null
  return (
    <div className="nodrag mt-1.5 flex shrink-0 items-center justify-between gap-2 px-0.5 text-[11px] text-charcoal-400">
      <p className="min-w-0 truncate" title={text}>
        {text}
      </p>
      <button
        type="button"
        onClick={download}
        title="Download the whole run as one Markdown report"
        className="shrink-0 rounded px-1.5 py-0.5 text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50"
      >
        Report .md
      </button>
    </div>
  )
}
