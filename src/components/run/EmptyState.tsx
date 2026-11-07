import { useReactFlow } from '@xyflow/react'
import { resolveApiKey } from '../../lib/openrouter'
import { TEMPLATES } from '../../lib/templates'
import Logo from '../ui/Logo'
import { useGraphStore } from '../../store/graphStore'
import { useSettingsStore } from '../../store/settingsStore'

/** Shown over an empty canvas: example flows and the next step. */
export default function EmptyState() {
  const isEmpty = useGraphStore((s) => s.nodes.length === 0)
  const loadFlow = useGraphStore((s) => s.loadFlow)
  const byokEnabled = useSettingsStore((s) => s.byokEnabled)
  const apiKey = useSettingsStore((s) => s.apiKey)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const { fitView } = useReactFlow()

  if (!isEmpty) return null
  const hasKey = Boolean(resolveApiKey({ byokEnabled, apiKey }))

  const start = (build: (typeof TEMPLATES)[number]['build']) => {
    const { nodes, edges } = build()
    loadFlow(nodes, edges)
    requestAnimationFrame(() => void fitView({ padding: 0.25, duration: 300 }))
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
      <section
        aria-labelledby="empty-title"
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-charcoal-700 bg-charcoal-900/95 p-5 shadow-2xl"
      >
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <h2
            id="empty-title"
            className="text-sm font-semibold text-charcoal-50"
          >
            Build a prompt chain
          </h2>
        </div>
        <p className="mt-1 text-xs text-charcoal-300">
          Start from an example, or add nodes from the toolbar.
        </p>
        <ul className="mt-3 space-y-2">
          {TEMPLATES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => start(t.build)}
                className="w-full rounded-lg border border-charcoal-700 px-3 py-2 text-left transition-colors hover:border-violet-400/50 hover:bg-charcoal-800"
              >
                <span className="block text-xs font-medium text-charcoal-50">
                  {t.title}
                </span>
                <span className="block text-[11px] text-charcoal-400">
                  {t.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {!hasKey && (
          <p className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-amber-400/30 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200">
            Running models needs an API key.
            <button
              type="button"
              onClick={openSettings}
              className="shrink-0 rounded border border-amber-400/40 px-2 py-0.5 font-medium hover:bg-amber-900/30"
            >
              Add key
            </button>
          </p>
        )}
      </section>
    </div>
  )
}
