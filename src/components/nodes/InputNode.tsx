import type { NodeProps } from '@xyflow/react'
import type { FlowNode, InputData } from '../../types/flow'
import { useGraphStore } from '../../store/graphStore'
import NodeShell from '../ui/NodeShell'
import { FOCUS_RINGS } from '../ui/nodeTheme'

export default function InputNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode & { data: InputData }>) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)

  return (
    <NodeShell
      id={id}
      type="input"
      label={data.label ?? 'Input'}
      selected={selected}
      hasSource
      width={288}
    >
      <textarea
        value={data.text ?? ''}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="Type raw text…"
        rows={3}
        className={`w-full resize-none rounded-md border border-charcoal-700 bg-charcoal-800/70 p-2 font-mono text-sm text-charcoal-50 placeholder-charcoal-400 outline-none ${FOCUS_RINGS.input}`}
      />
    </NodeShell>
  )
}
