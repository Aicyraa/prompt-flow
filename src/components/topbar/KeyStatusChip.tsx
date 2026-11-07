import { resolveApiKey } from '../../lib/openrouter'
import { useSettingsStore } from '../../store/settingsStore'
import { Icon } from '../ui/Icon'

/** Always-visible API key state; click to open Settings. */
export default function KeyStatusChip() {
  const byokEnabled = useSettingsStore((s) => s.byokEnabled)
  const apiKey = useSettingsStore((s) => s.apiKey)
  const keyStatus = useSettingsStore((s) => s.keyStatus)
  const openSettings = useSettingsStore((s) => s.openSettings)

  const hasKey = Boolean(resolveApiKey({ byokEnabled, apiKey }))
  let label = 'No API key'
  let tone = 'border-amber-400/50 text-amber-300'
  if (hasKey && keyStatus === 'rejected') {
    label = 'Key rejected'
    tone = 'border-rose-400/50 text-rose-300'
  } else if (hasKey && keyStatus === 'valid') {
    label = 'Key verified'
    tone = 'border-emerald-400/50 text-emerald-300'
  } else if (hasKey) {
    label = 'Key set'
    tone = 'border-charcoal-600 text-charcoal-200'
  }

  return (
    <button
      type="button"
      onClick={openSettings}
      title="API key and settings"
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-charcoal-800 ${tone}`}
    >
      <Icon name="key" className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </button>
  )
}
