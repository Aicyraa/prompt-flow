import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { copyText, downloadFile } from '../../lib/browserFile'
import { looksLikeJson } from '../../lib/json'
const OutputModal = lazy(() => import('../panels/OutputModal'))
import MarkdownView from './LazyMarkdown'
import { Icon } from './Icon'

interface OutputPreviewProps {
  markdown: string
  /** Tailwind max-height class for the clipped preview. */
  heightClass?: string
  filename?: string
}

const action =
  'flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50'

/** Clipped Markdown preview with expand, copy and download actions. */
export default function OutputPreview({
  markdown,
  heightClass = 'max-h-44',
  filename = 'output.md',
}: OutputPreviewProps) {
  const [open, setOpen] = useState(false)
  const [clipped, setClipped] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  // JSON replies read better as a code block than as Markdown paragraphs.
  const display = looksLikeJson(markdown)
    ? '```json\n' + markdown + '\n```'
    : markdown

  useLayoutEffect(() => {
    const el = bodyRef.current
    if (el) setClipped(el.scrollHeight > el.clientHeight + 1)
  }, [markdown])

  return (
    <div className="nodrag">
      <div className="relative overflow-hidden rounded-md border border-charcoal-700 bg-charcoal-800/70">
        <div ref={bodyRef} className={`${heightClass} overflow-hidden p-2.5`}>
          <MarkdownView markdown={display} />
        </div>
        {clipped && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-charcoal-900 to-transparent"
          />
        )}
      </div>
      <div className="mt-1 flex items-center gap-0.5">
        <button type="button" onClick={() => setOpen(true)} className={action}>
          <Icon name="expand" className="h-3.5 w-3.5" />
          {clipped ? 'Show all' : 'Expand'}
        </button>
        <button
          type="button"
          onClick={() => void copyText(markdown)}
          className={action}
        >
          <Icon name="copy" className="h-3.5 w-3.5" />
          Copy
        </button>
        <button
          type="button"
          onClick={() => downloadFile(filename, markdown, 'text/markdown')}
          className={action}
        >
          <Icon name="download" className="h-3.5 w-3.5" />
          .md
        </button>
      </div>
      {open && (
        <Suspense fallback={null}>
          <OutputModal markdown={markdown} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
