import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../types/flow'
import NodeShell from '../ui/NodeShell'

export default function OutputNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode>) {
  const output = data.output?.trim()

  return (
    <NodeShell
      id={id}
      type="output"
      label={data.label ?? 'Output'}
      status={data.status}
      selected={selected}
      hasTarget
    >
      {output ? (
        <pre className="max-h-48 overflow-y-auto rounded-md border border-slate-700 bg-slate-800/70 p-2 text-sm whitespace-pre-wrap text-slate-100">
          {output}
        </pre>
      ) : (
        <p className="rounded-md border border-dashed border-slate-700 p-3 text-center text-xs text-slate-500">
          Connect a source to see the result here
        </p>
      )}
    </NodeShell>
  )
}
