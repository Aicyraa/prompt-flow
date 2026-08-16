import { useEffect } from 'react'

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Add nodes',
    body: 'Pick a node type from the top toolbar — Input, Prompt, LLM, or Output. Newer nodes land on a staggered row so they stay readable.',
  },
  {
    title: 'Connect them',
    body: 'Drag from a node’s right output handle to the next node’s left input handle. Input › Prompt › LLM › Output is the classic chain.',
  },
  {
    title: 'Configure each node',
    body: 'Click a node to open its settings. Type prompt text, write a template with {{input}} placeholders, or pick a model and temperature.',
  },
  {
    title: 'Tune a connection',
    body: 'Click a connection line to select it. Drag the midpoint handle to bend the curve into the shape you want, or press Delete to remove it.',
  },
  {
    title: 'Run the flow',
    body: 'Press Run in the floating toolbar. Each node lights up as it executes, and outputs appear inline. The chain stops at the first error.',
  },
  {
    title: 'Save & share',
    body: 'Flows are saved to your browser automatically. Use Export to download a .json file and Import to bring one back.',
  },
]

export default function GuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-charcoal-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="How PromptFlow works"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-charcoal-700 bg-charcoal-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-charcoal-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-charcoal-50">
              How PromptFlow works
            </h2>
            <p className="text-[11px] text-charcoal-500">
              Six steps from blank canvas to running flow
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-charcoal-500 transition-colors hover:bg-charcoal-800 hover:text-charcoal-200"
            title="Close guide"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </header>

        <ol className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-charcoal-600 text-[10px] font-semibold text-charcoal-300">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xs font-semibold text-charcoal-100">
                  {step.title}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-charcoal-400">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <footer className="border-t border-charcoal-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-violet-400/40 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-400/10"
          >
            Got it
          </button>
        </footer>
      </div>
    </div>
  )
}