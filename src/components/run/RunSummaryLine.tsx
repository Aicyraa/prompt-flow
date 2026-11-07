import { useMemo } from 'react'
import { totalUsage, useRunStore } from '../../store/runStore'
import { formatRunSummary } from '../../lib/format'

/** Tokens, cost and time for the finished run, shown under the result. */
export default function RunSummaryLine() {
  const runs = useRunStore((s) => s.nodes)
  const isRunning = useRunStore((s) => s.isRunning)

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
    <p
      className="mt-1.5 shrink-0 px-0.5 text-[11px] text-charcoal-400"
      title="Totals for the last run"
    >
      {text}
    </p>
  )
}
