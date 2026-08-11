import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../types/flow'
import { useFlowStore } from '../../store/flowStore'
import NodeShell from '../ui/NodeShell'
import { FOCUS_RINGS } from '../ui/nodeTheme'

export default function InputNode({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)

  return (
    <NodeShell
      id={id}
      type="input"
      label={data.label ?? 'Input'}
      status={data.status}
      selected={selected}
      hasSource
    >
      <textarea
        value={data.text ?? ''}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="Type raw text…"
        rows={3}
        className={`w-full resize-none rounded-md border border-slate-700 bg-slate-800/70 p-2 font-mono text-sm text-slate-100 placeholder-slate-500 outline-none ${FOCUS_RINGS.input}`}
      />
    </NodeShell>
  )
}
