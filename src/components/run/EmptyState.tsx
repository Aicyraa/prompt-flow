import type { ReactNode } from 'react'
import { useReactFlow } from '@xyflow/react'
import { resolveApiKey } from '../../lib/openrouter'
import { TEMPLATES } from '../../lib/templates'
import { Icon } from '../ui/Icon'
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
  const openGuide = useSettingsStore((s) => s.openGuide)
  const { fitView } = useReactFlow()

  if (!isEmpty) return null
  const hasKey = Boolean(resolveApiKey({ byokEnabled, apiKey }))

  const start = (build: (typeof TEMPLATES)[number]['build']) => {
    const { nodes, edges, variables } = build()
    loadFlow(nodes, edges, undefined, variables)
    requestAnimationFrame(() => void fitView({ padding: 0.25, duration: 300 }))
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-y-auto p-4">
      <section
        aria-labelledby="empty-title"
        className="animate-pop-in pointer-events-auto w-full max-w-md rounded-2xl border border-charcoal-700 bg-charcoal-900/95 p-5 shadow-2xl"
      >
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <div>
            <h2
              id="empty-title"
              className="text-sm font-semibold text-charcoal-50"
            >
              Let&rsquo;s build your first flow
            </h2>
            <p className="text-[11px] text-charcoal-400">
              Three steps, about a minute.
            </p>
          </div>
        </div>

        <ol className="mt-4 space-y-4">
          <Step n={1} done={hasKey} title="Add your API key">
            {hasKey ? (
              <p className="text-[11px] text-charcoal-400">
                Key added. You can change it any time in Settings.
              </p>
            ) : (
              <>
                <p className="text-[11px] leading-relaxed text-charcoal-400">
                  OpenRouter, OpenAI, Anthropic, Google, Groq or Mistral. It
                  stays in this browser.
                </p>
                <button
                  type="button"
                  onClick={openSettings}
                  className="mt-1.5 rounded-md border border-violet-400/40 px-2.5 py-1 text-[11px] font-medium text-violet-300 transition-colors hover:bg-violet-500/10"
                >
                  Add key
                </button>
              </>
            )}
          </Step>

          <Step n={2} title="Pick a starting point">
            <ul className="mt-1.5 space-y-1.5">
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
            <p className="mt-2 text-[11px] text-charcoal-400">
              Or build your own with <strong>Add node</strong> in the toolbar.
            </p>
          </Step>

          <Step n={3} title="Press Run" muted>
            <p className="text-[11px] text-charcoal-400">
              Use the Run button on the Output node, or Ctrl/⌘+Enter.
            </p>
          </Step>
        </ol>

        <button
          type="button"
          onClick={openGuide}
          className="mt-4 text-[11px] text-charcoal-300 underline decoration-charcoal-600 underline-offset-2 transition-colors hover:text-charcoal-50"
        >
          Take the quick tour
        </button>
      </section>
    </div>
  )
}

/** One numbered row of the checklist; a tick replaces the number when done. */
function Step({
  n,
  title,
  done = false,
  muted = false,
  children,
}: {
  n: number
  title: string
  done?: boolean
  /** A later step that isn't actionable yet. */
  muted?: boolean
  children: ReactNode
}) {
  return (
    <li className={`flex gap-3 ${muted ? 'opacity-70' : ''}`}>
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
          done
            ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
            : 'border-charcoal-600 text-charcoal-300'
        }`}
      >
        {done ? <Icon name="check" className="h-3 w-3" /> : n}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-xs font-semibold text-charcoal-100">
          {title}
          {done && <span className="sr-only"> (done)</span>}
        </h3>
        {children}
      </div>
    </li>
  )
}
