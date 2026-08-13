import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../types/flow'
import { DEFAULT_TEMPERATURE, MODEL_OPTIONS } from '../../lib/nodes'
import { useFlowStore } from '../../store/flowStore'
import NodeShell from '../ui/NodeShell'
import { FOCUS_RINGS, STATUS_LABELS } from '../ui/nodeTheme'

export default function LLMNode({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)

  return (
    <NodeShell
      id={id}
      type="llm"
      label={data.label ?? 'LLM'}
      status={data.status}
      selected={selected}
      hasTarget
      hasSource
    >
      <label className="mb-1 block text-[11px] font-medium tracking-wide text-charcoal-400 uppercase">
        Model
      </label>
      <select
        value={data.model ?? MODEL_OPTIONS[0]}
        onChange={(e) => updateNodeData(id, { model: e.target.value })}
        className={`mb-3 w-full rounded-md border border-charcoal-700 bg-charcoal-800/70 px-2 py-1.5 text-sm text-charcoal-50 outline-none ${FOCUS_RINGS.llm}`}
      >
        {MODEL_OPTIONS.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium tracking-wide text-charcoal-400 uppercase">
          Temperature
        </label>
        <span className="text-xs text-violet-300">
          {(data.temperature ?? DEFAULT_TEMPERATURE).toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={0.1}
        value={data.temperature ?? DEFAULT_TEMPERATURE}
        onChange={(e) =>
          updateNodeData(id, { temperature: Number(e.target.value) })
        }
        className="mt-1 w-full accent-violet-400"
      />

      <p className="mt-3 text-[11px] text-charcoal-500">
        {STATUS_LABELS[data.status ?? 'idle']}
      </p>
    </NodeShell>
  )
}