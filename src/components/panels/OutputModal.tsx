import { useEffect } from 'react'
import MarkdownView from '../ui/MarkdownView'

interface OutputModalProps {
  markdown: string
  onClose: () => void
}

export default function OutputModal({ markdown, onClose }: OutputModalProps) {
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
      aria-label="Output preview"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-charcoal-700 bg-charcoal-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-charcoal-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-charcoal-50">Output</h2>
            <p className="text-[11px] text-charcoal-500">
              Rendered Markdown — copy what you need
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-charcoal-500 transition-colors hover:bg-charcoal-800 hover:text-charcoal-200"
            title="Close output"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4">
          <MarkdownView markdown={markdown} />
        </div>
      </div>
    </div>
  )
}