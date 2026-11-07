import { useMemo, useState } from 'react'
import { copyText, downloadFile } from '../../lib/browserFile'
import { outputFile } from '../../lib/markdown'
import Modal from '../ui/Modal'
import MarkdownView from '../ui/LazyMarkdown'

interface OutputModalProps {
  markdown: string
  filename?: string
  onClose: () => void
}

const btn =
  'rounded-md border border-charcoal-700 px-2.5 py-1.5 text-xs font-medium text-charcoal-200 transition-colors hover:bg-charcoal-800'

export default function OutputModal({
  markdown,
  filename = 'output',
  onClose,
}: OutputModalProps) {
  const [raw, setRaw] = useState(false)
  const file = useMemo(
    () => outputFile(markdown, filename),
    [markdown, filename],
  )
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
            onClick={() => void copyText(file.content)}
            className={btn}
          >
            Copy
          </button>
          <button
            type="button"
            onClick={() => downloadFile(file.filename, file.content, file.type)}
            className={btn}
          >
            Download {file.filename}
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
            {file.content}
          </pre>
        ) : (
          <MarkdownView
            markdown={
              file.type === 'application/json'
                ? '```json\n' + file.content + '```'
                : file.content
            }
            size="lg"
          />
        )}
      </div>
    </Modal>
  )
}
