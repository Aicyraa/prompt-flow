import { memo, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewProps {
  markdown: string
  className?: string
}

const components = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mb-2 mt-3 text-lg font-bold text-charcoal-50 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mb-1.5 mt-3 text-base font-semibold text-charcoal-50 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mb-1 mt-2.5 text-sm font-semibold text-charcoal-100 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-1.5 text-[13px] leading-relaxed text-charcoal-200">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-1.5 list-disc space-y-0.5 pl-5 text-[13px] text-charcoal-200">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-1.5 list-decimal space-y-0.5 pl-5 text-[13px] text-charcoal-200">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-charcoal-50">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => (
    <em className="text-charcoal-100 italic">{children}</em>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-violet-300 underline decoration-violet-400/50 underline-offset-2 hover:text-violet-200"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-2 border-l-2 border-violet-500/50 pl-3 text-[13px] text-charcoal-300 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="rounded border border-charcoal-700 bg-charcoal-950 px-1 py-0.5 font-mono text-[11px] text-violet-200">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-charcoal-700 bg-charcoal-950 p-2.5 text-[12px] text-charcoal-100">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-3 border-charcoal-700" />,
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-[12px] text-charcoal-200">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border border-charcoal-700 bg-charcoal-900 px-2 py-1 text-left font-semibold text-charcoal-50">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border border-charcoal-700 px-2 py-1">{children}</td>
  ),
}

export default memo(function MarkdownView({
  markdown,
  className = '',
}: MarkdownViewProps) {
  return (
    <div className={`break-words ${className}`}>
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
