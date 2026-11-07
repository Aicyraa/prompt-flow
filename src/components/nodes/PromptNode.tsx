import type { NodeProps } from '@xyflow/react'
import type { FlowNode, PromptData } from '../../types/flow'
import { useGraphStore } from '../../store/graphStore'
import NodeShell from '../ui/NodeShell'
import { FOCUS_RINGS } from '../ui/nodeTheme'

export default function PromptNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode & { data: PromptData }>) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)

  return (
    <NodeShell
      id={id}
      type="prompt"
      label={data.label ?? 'Prompt'}
      selected={selected}
      hasTarget
      hasSource
    >
      <textarea
        value={data.template ?? ''}
        onChange={(e) => updateNodeData(id, { template: e.target.value })}
        placeholder={'Summarize this: {{input}}'}
        rows={4}
        className={`w-full resize-none rounded-md border border-charcoal-700 bg-charcoal-800/70 p-2 font-mono text-sm text-charcoal-50 placeholder-charcoal-400 outline-none ${FOCUS_RINGS.prompt}`}
      />
      <p className="mt-1.5 text-[11px] text-charcoal-400">
        Reference upstream outputs with{' '}
        <code className="text-amber-400/80">{'{{input}}'}</code>
      </p>
    </NodeShell>
  )
}
