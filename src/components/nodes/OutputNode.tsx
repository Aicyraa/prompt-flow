import { useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../types/flow'
import NodeShell from '../ui/NodeShell'
import MarkdownView from '../ui/MarkdownView'
import OutputModal from '../panels/OutputModal'
import { useFlowStore } from '../../store/flowStore'

export default function OutputNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode>) {
  const [modalOpen, setModalOpen] = useState(false)
  const output = data.output?.trim()
  const selectNode = useFlowStore((s) => s.selectNode)

  return (
    <NodeShell
      id={id}
      type="output"
      label={data.label ?? 'Output'}
      status={data.status}
      selected={selected}
      hasTarget
      resizable
    >
      {output ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              selectNode(id)
              setModalOpen(true)
            }}
            className="group relative block w-full rounded-md border border-charcoal-700 bg-charcoal-800/70 text-left outline-none transition-colors hover:border-sky-400/50 focus-visible:border-sky-400/60"
            title="Open full view"
          >
            <div className="max-h-44 overflow-hidden p-2.5">
              <MarkdownView markdown={output} />
            </div>
            <span className="pointer-events-none absolute inset-0 flex items-start justify-end bg-gradient-to-b from-transparent via-charcoal-900/40 to-charcoal-900/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-md border border-sky-400/40 bg-charcoal-950/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-sky-300 uppercase">
                Expand ⇱
              </span>
            </span>
          </button>

          {modalOpen && (
            <OutputModal
              markdown={output}
              onClose={() => setModalOpen(false)}
            />
          )}
        </>
      ) : (
        <p className="rounded-md border border-dashed border-charcoal-700 p-3 text-center text-xs text-charcoal-500">
          Connect a source to see the result here
        </p>
      )}
    </NodeShell>
  )
}