import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../types/flow'
import { useFlowStore } from '../../store/flowStore'
import NodeShell from '../ui/NodeShell'
import { FOCUS_RINGS } from '../ui/nodeTheme'

export default function PromptNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)

  return (
    <NodeShell
      id={id}
      type="prompt"
      label={data.label ?? 'Prompt'}
      status={data.status}
      selected={selected}
      hasTarget
      hasSource
    >
      <textarea
        value={data.template ?? ''}
        onChange={(e) => updateNodeData(id, { template: e.target.value })}
        placeholder={'Summarize this: {{input}}'}
        rows={4}
        className={`w-full resize-none rounded-md border border-charcoal-700 bg-charcoal-800/70 p-2 font-mono text-sm text-charcoal-50 placeholder-charcoal-600 outline-none ${FOCUS_RINGS.prompt}`}
      />
      <p className="mt-1.5 text-[11px] text-charcoal-500">
        Reference upstream outputs with{' '}
        <code className="text-amber-400/80">{'{{input}}'}</code>
      </p>
    </NodeShell>
  )
}
