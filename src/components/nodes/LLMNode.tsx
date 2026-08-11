import toast from 'react-hot-toast'
import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../types/flow'
import { useFlowStore } from '../../store/flowStore'
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, MODEL_OPTIONS } from '../../lib/nodes'
import { createOpenRouterClient, generateText, TEST_PROMPT } from '../../lib/openrouter'
import NodeShell from '../ui/NodeShell'
import { FOCUS_RINGS } from '../ui/nodeTheme'

export default function LLMNode({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)
  const isRunning = data.status === 'running'

  const handleRun = async () => {
    const client = createOpenRouterClient()
    if (!client) {
      updateNodeData(id, {
        status: 'error',
        error: 'No OpenRouter API key found. Add OPENROUTER_API_KEY to .env.',
      })
      toast.error('Missing OpenRouter API key')
      return
    }
    updateNodeData(id, { status: 'running', error: undefined, output: undefined })
    try {
      const output = await generateText(client, {
        model: data.model ?? DEFAULT_MODEL,
        temperature: data.temperature ?? DEFAULT_TEMPERATURE,
        prompt: TEST_PROMPT,
      })
      updateNodeData(id, { output, status: 'done' })
      toast.success('LLM response received')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      updateNodeData(id, { error: message, status: 'error' })
      toast.error(`LLM call failed: ${message}`)
    }
  }

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
      <label className="mb-1 block text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        Model
      </label>
      <select
        value={data.model ?? MODEL_OPTIONS[0]}
        onChange={(e) => updateNodeData(id, { model: e.target.value })}
        className={`mb-3 w-full rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1.5 text-sm text-slate-100 outline-none ${FOCUS_RINGS.llm}`}
      >
        {MODEL_OPTIONS.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
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

      <button
        type="button"
        onClick={handleRun}
        disabled={isRunning}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-violet-700/50 bg-violet-500/10 px-2 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRunning ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
            Running…
          </>
        ) : (
          'Run test'
        )}
      </button>

      {data.error && (
        <p className="mt-2 rounded-md border border-rose-900/60 bg-rose-950/40 p-2 text-xs break-words text-rose-300">
          {data.error}
        </p>
      )}

      {data.output && !data.error && (
        <pre className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-700 bg-slate-800/70 p-2 text-xs whitespace-pre-wrap text-slate-100">
          {data.output}
        </pre>
      )}
    </NodeShell>
  )
}
