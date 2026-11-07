import { lazy, Suspense } from 'react'

// The Markdown renderer (react-markdown + remark-gfm) is a large dependency
// tree that only matters once there is output to show, so it loads on demand.
const MarkdownView = lazy(() => import('./MarkdownView'))

/** Renders Markdown, showing the raw text until the renderer has loaded. */
export default function LazyMarkdown({
  markdown,
  className = '',
}: {
  markdown: string
  className?: string
}) {
  return (
    <Suspense
      fallback={
        <div
          className={`text-[13px] leading-relaxed break-words whitespace-pre-wrap text-charcoal-200 ${className}`}
        >
          {markdown}
        </div>
      }
    >
      <MarkdownView markdown={markdown} className={className} />
    </Suspense>
  )
}
