import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useRunStore, type RunOptions } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'

/** Runs the flow and reports the outcome; opens Settings if no key is set. */
export function useRunAction() {
  const run = useRunStore((s) => s.run)
  const openSettings = useSettingsStore((s) => s.openSettings)

  return useCallback(
    async (options?: RunOptions) => {
      const summary = await run(options)
      if (!summary) return
      if (summary.blocked === 'cost') return // the confirm dialog takes over
      if (summary.blocked === 'no_key') {
        toast.error('Add an API key to run models.')
        openSettings()
      } else if (summary.cancelled) {
        toast('Run stopped')
      } else if (summary.succeeded) {
        toast.success('Flow completed')
      } else {
        toast.error(`Flow stopped: ${summary.error ?? 'Unknown error'}`)
      }
    },
    [run, openSettings],
  )
}
