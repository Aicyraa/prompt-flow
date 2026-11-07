import type { NodeProps } from '@xyflow/react'
import type { FlowNode, OutputData } from '../../types/flow'
import NodeShell from '../ui/NodeShell'
import OutputPreview from '../ui/OutputPreview'
import { selectNodeRun, useRunStore } from '../../store/runStore'

export default function OutputNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode & { data: OutputData }>) {
  const output = useRunStore(selectNodeRun(id)).output?.trim()

  return (
    <NodeShell
      id={id}
      type="output"
      label={data.label ?? 'Output'}
      selected={selected}
      hasTarget
      width={288}
    >
      {output ? (
        <OutputPreview markdown={output} />
      ) : (
        <p className="rounded-md border border-dashed border-charcoal-700 p-3 text-center text-xs text-charcoal-400">
          Run the flow to see the result here
        </p>
      )}
    </NodeShell>
  )
}
