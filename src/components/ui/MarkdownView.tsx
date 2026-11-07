import {
  isValidElement,
  memo,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { copyText } from '../../lib/browserFile'

interface MarkdownViewProps {
  markdown: string
  className?: string
  /** `lg` is for the full-size reader; `sm` for in-node previews. */
  size?: 'sm' | 'lg'
}

type WithChildren = { children?: ReactNode }

/** Plain text of a React subtree (for copy and language detection). */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement(node)) {
    return textOf((node as ReactElement<WithChildren>).props.children)
  }
  return ''
}

function CodeBlock({ children }: WithChildren) {
  const [copied, setCopied] = useState(false)
  const code = isValidElement(children)
    ? (children as ReactElement<WithChildren & { className?: string }>)
    : null
  const language = /language-([\w+-]+)/.exec(code?.props.className ?? '')?.[1]
  const text = textOf(children).replace(/\n$/, '')

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-charcoal-700 bg-charcoal-950">
      <div className="flex items-center justify-between border-b border-charcoal-800 bg-charcoal-900/80 px-2.5 py-1">
        <span className="font-mono text-[10px] tracking-wide text-charcoal-400 uppercase">
          {language ?? 'text'}
        </span>
        <button
          type="button"
          onClick={() => {
            void copyText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="rounded px-1.5 py-0.5 text-[10px] text-charcoal-300 hover:bg-charcoal-800 hover:text-charcoal-50"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[0.92em] leading-relaxed text-charcoal-100">
        {children}
      </pre>
    </div>
  )
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 mb-3 border-b border-charcoal-700 pb-1.5 text-[1.45em] font-bold tracking-tight text-charcoal-50 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 border-b border-charcoal-800 pb-1 text-[1.2em] font-semibold text-charcoal-50 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-[1.05em] font-semibold text-violet-200 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-1 text-[1em] font-semibold text-charcoal-100 first:mt-0">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-3 mb-1 text-[0.85em] font-semibold tracking-wide text-charcoal-200 uppercase first:mt-0">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-3 mb-1 text-[0.85em] font-medium text-charcoal-300 first:mt-0">
      {children}
    </h6>
  ),
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  ul: ({ children, className }) => (
    <ul
      className={`my-2 space-y-1 ${
        className?.includes('contains-task-list')
          ? 'list-none pl-1'
          : 'list-disc pl-5 marker:text-violet-400/70 [&_ul]:list-[circle]'
      }`}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-charcoal-400">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  input: (props: ComponentProps<'input'>) => (
    <input
      {...props}
      disabled
      className="mr-1.5 translate-y-px accent-violet-400"
    />
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-charcoal-50">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-charcoal-100 italic">{children}</em>
  ),
  del: ({ children }) => <del className="text-charcoal-400">{children}</del>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-violet-300 underline decoration-violet-400/50 underline-offset-2 hover:text-violet-200"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-md border-l-2 border-violet-500/60 bg-violet-600/5 py-1 pr-3 pl-3 text-charcoal-300 [&>p]:my-1">
      {children}
    </blockquote>
  ),
  // Inline code only: fenced blocks are handled (once) by `pre`.
  code: ({ children, className }) =>
    className?.includes('language-') ? (
      <code className={`${className} font-mono`}>{children}</code>
    ) : (
      <code className="rounded border border-charcoal-700 bg-charcoal-950 px-1 py-0.5 font-mono text-[0.85em] text-violet-200">
        {children}
      </code>
    ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  hr: () => <hr className="my-4 border-charcoal-700" />,
  table: ({ children }) => (
    <div className="nowheel my-3 overflow-x-auto rounded-lg border border-charcoal-700">
      <table className="w-full border-collapse text-[0.92em] text-charcoal-200">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-charcoal-900">{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-charcoal-800 last:border-b-0 even:bg-charcoal-900/40">
      {children}
    </tr>
  ),
  th: ({ children, style }) => (
    <th
      style={style}
      className="px-2.5 py-1.5 text-left font-semibold whitespace-nowrap text-charcoal-50"
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="px-2.5 py-1.5 align-top">
      {children}
    </td>
  ),
}

export default memo(function MarkdownView({
  markdown,
  className = '',
  size = 'sm',
}: MarkdownViewProps) {
  return (
    <div
      className={`min-w-0 text-left break-words text-charcoal-200 ${
        // In a node, text follows the node's own size (set on its body); the
        // full-size reader has a fixed, comfortable one.
        size === 'lg' ? 'text-[15px]' : 'text-[1em]'
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        // LLM output is untrusted: a remote image would let it exfiltrate
        // data through the request URL, so images are never rendered.
        disallowedElements={['img']}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
})
