import type { NodeProps } from '@xyflow/react'
import type { FlowNode, LlmData } from '../../types/flow'
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE } from '../../lib/nodes'
import { useGraphStore } from '../../store/graphStore'
import { selectNodeRun, useRunStore } from '../../store/runStore'
import NodeShell from '../ui/NodeShell'
import OutputPreview from '../ui/OutputPreview'
import ModelPicker from '../models/ModelPicker'
import { supportsParam, useModelInfo } from '../models/useModelInfo'
import { FOCUS_RINGS } from '../ui/nodeTheme'
import { formatUsage } from '../../lib/format'

export default function LLMNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode & { data: LlmData }>) {
  const updateNodeData = useGraphStore((s) => s.updateNodeData)
  const {
    status,
    output,
    usage,
    startedAt,
    endedAt,
    model: usedModel,
  } = useRunStore(selectNodeRun(id))
  const model = data.model ?? DEFAULT_MODEL
  const info = useModelInfo(model)

  const summary = [
    supportsParam(info, 'temperature')
      ? `temp ${(data.temperature ?? DEFAULT_TEMPERATURE).toFixed(1)}`
      : null,
    data.maxTokens ? `max ${data.maxTokens}` : null,
    data.reasoningEffort ? `reasoning ${data.reasoningEffort}` : null,
    data.system?.trim() ? 'system prompt' : null,
    data.outputMode === 'json' ? 'JSON' : null,
    data.fallbackModels?.length
      ? `${data.fallbackModels.length} fallback${data.fallbackModels.length > 1 ? 's' : ''}`
      : null,
  ].filter(Boolean)

  return (
    <NodeShell
      id={id}
      type="llm"
      label={data.label ?? 'Agent'}
      selected={selected}
      hasTarget
      hasSource
    >
      <label
        htmlFor={`${id}-model`}
        className="mb-1 block text-[11px] font-medium tracking-wide text-charcoal-400 uppercase"
      >
        Model
      </label>
      <ModelPicker
        id={`${id}-model`}
        value={model}
        onChange={(next) => updateNodeData(id, { model: next })}
        focusClass={FOCUS_RINGS.llm.replace('focus:', 'focus-visible:')}
      />
      <p className="mt-1.5 text-[11px] text-charcoal-400">
        {summary.length ? `${summary.join(' · ')} · ` : ''}
        select the node to edit all settings
      </p>

      {status === 'running' && output && (
        <p
          aria-live="off"
          className="nodrag mt-3 line-clamp-4 rounded-md border border-charcoal-700 bg-charcoal-800/70 p-2 text-[12px] leading-relaxed whitespace-pre-wrap text-charcoal-200"
        >
          {output}
        </p>
      )}

      {status !== 'running' && output && (
        <div className="mt-3">
          <OutputPreview
            markdown={output}
            heightClass="max-h-24"
            filename="llm-response.md"
          />
          {status === 'done' && (
            <p className="mt-0.5 px-1.5 text-[11px] text-charcoal-400">
              {usedModel && usedModel !== model && (
                <span className="mr-1 text-amber-300">
                  via fallback {usedModel} ·
                </span>
              )}
              {formatUsage(
                usage,
                startedAt && endedAt ? endedAt - startedAt : undefined,
              )}
            </p>
          )}
        </div>
      )}
    </NodeShell>
  )
}
