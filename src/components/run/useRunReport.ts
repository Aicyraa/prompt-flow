import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { downloadFile } from '../../lib/browserFile'
import { buildRunReport, hasReport, reportFilename } from '../../lib/report'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'

/** Download the last run as a single Markdown report. */
export function useRunReport() {
  const available = useRunStore((s) => !s.isRunning && hasReport(s.nodes))

  const download = useCallback(() => {
    const { nodes: runs, order } = useRunStore.getState()
    if (!hasReport(runs)) return
    const { nodes, variables } = useGraphStore.getState()
    const now = new Date()
    downloadFile(
      reportFilename(now),
      buildRunReport({ nodes, runs, order, variables, now }),
      'text/markdown',
    )
    toast.success('Report downloaded')
  }, [])

  return { available, download }
}
