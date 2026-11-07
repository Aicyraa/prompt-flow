import { useState } from 'react'
import { copyText, downloadFile } from '../../lib/browserFile'
import Modal from '../ui/Modal'
import MarkdownView from '../ui/LazyMarkdown'

interface OutputModalProps {
  markdown: string
  onClose: () => void
}

const btn =
  'rounded-md border border-charcoal-700 px-2.5 py-1.5 text-xs font-medium text-charcoal-200 transition-colors hover:bg-charcoal-800'

export default function OutputModal({ markdown, onClose }: OutputModalProps) {
  const [raw, setRaw] = useState(false)
  return (
    <Modal
      title="Output"
      subtitle={raw ? 'Raw text' : 'Rendered Markdown'}
      onClose={onClose}
      widthClass="max-w-3xl"
      footer={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyText(markdown)}
            className={btn}
          >
            Copy
          </button>
          <button
            type="button"
            onClick={() => downloadFile('output.md', markdown, 'text/markdown')}
            className={btn}
          >
            Download .md
          </button>
          <button
            type="button"
            onClick={() => setRaw((v) => !v)}
            aria-pressed={raw}
            className={`${btn} ml-auto`}
          >
            {raw ? 'Show rendered' : 'Show raw'}
          </button>
        </div>
      }
    >
      <div className="px-5 py-4">
        {raw ? (
          <pre className="font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap text-charcoal-100">
            {markdown}
          </pre>
        ) : (
          <MarkdownView markdown={markdown} />
        )}
      </div>
    </Modal>
  )
}
