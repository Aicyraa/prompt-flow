import {
  lazy,
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { copyText, downloadFile } from '../../lib/browserFile'
import { looksLikeJson } from '../../lib/json'
import { outputFile } from '../../lib/markdown'
const OutputModal = lazy(() => import('../panels/OutputModal'))
import MarkdownView from './LazyMarkdown'
import { Icon } from './Icon'

interface OutputPreviewProps {
  markdown: string
  /** Tailwind max-height class for the clipped preview (ignored with `fill`). */
  heightClass?: string
  /** Base name for downloads when the text has no heading to name it after. */
  filename?: string
  /** Fill the parent's height and scroll inside, instead of clipping. */
  fill?: boolean
}

const action =
  'flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50'

/** Markdown preview with expand, copy and download actions. */
export default function OutputPreview({
  markdown,
  heightClass = 'max-h-44',
  filename = 'output',
  fill = false,
}: OutputPreviewProps) {
  const [open, setOpen] = useState(false)
  const [clipped, setClipped] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const file = useMemo(
    () => outputFile(markdown, filename),
    [markdown, filename],
  )
  // JSON replies read better as a code block than as Markdown paragraphs.
  const display = looksLikeJson(markdown)
    ? '```json\n' + markdown + '\n```'
    : file.content

  useLayoutEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const measure = () => setClipped(el.scrollHeight > el.clientHeight + 1)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    // The node can be resized, which changes how much is clipped.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [display])

  return (
    <div className={`nodrag ${fill ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
      <div
        className={`relative overflow-hidden rounded-md border border-charcoal-700 bg-charcoal-800/70 ${
          fill ? 'min-h-0 flex-1' : ''
        }`}
      >
        <div
          ref={bodyRef}
          // nowheel: scrolling the text must not zoom or pan the canvas.
          className={`nowheel p-2.5 ${
            fill ? 'h-full overflow-auto' : `${heightClass} overflow-hidden`
          }`}
        >
          <MarkdownView markdown={display} />
        </div>
        {clipped && !fill && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-charcoal-900 to-transparent"
          />
        )}
      </div>
      <div className="mt-1 flex shrink-0 items-center gap-0.5">
        <button type="button" onClick={() => setOpen(true)} className={action}>
          <Icon name="expand" className="h-3.5 w-3.5" />
          {clipped && !fill ? 'Show all' : 'Expand'}
        </button>
        <button
          type="button"
          onClick={() => void copyText(file.content)}
          className={action}
        >
          <Icon name="copy" className="h-3.5 w-3.5" />
          Copy
        </button>
        <button
          type="button"
          onClick={() => downloadFile(file.filename, file.content, file.type)}
          title={`Download ${file.filename}`}
          className={action}
        >
          <Icon name="download" className="h-3.5 w-3.5" />
          {file.filename.endsWith('.json') ? '.json' : '.md'}
        </button>
      </div>
      {open && (
        <Suspense fallback={null}>
          <OutputModal
            markdown={markdown}
            filename={filename}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
