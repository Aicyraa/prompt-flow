import type { NodeType } from '../../types/flow'
import { useFlowStore } from '../../store/flowStore'
import { ACCENT_COLORS } from '../ui/nodeTheme'

interface ToolbarProps {
  onAdd: (type: NodeType) => void
}

const BUTTONS: { type: NodeType; label: string }[] = [
  { type: 'input', label: 'Input' },
  { type: 'prompt', label: 'Prompt' },
  { type: 'llm', label: 'LLM' },
  { type: 'output', label: 'Output' },
]

export default function Toolbar({ onAdd }: ToolbarProps) {
  const isRunning = useFlowStore((s) => s.isRunning)
  const runFlow = useFlowStore((s) => s.runFlow)

  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 p-1.5 shadow-lg backdrop-blur">
      {BUTTONS.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <span className={`h-2 w-2 rounded-full ${ACCENT_COLORS[type]}`} />
          {label}
        </button>
      ))}

      <div className="mx-1 h-6 w-px bg-slate-700" />

      <button
        type="button"
        onClick={runFlow}
        disabled={isRunning}
        className="flex items-center gap-1.5 rounded-md bg-violet-500/90 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRunning ? (
          <>
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
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
          'Run flow'
        )}
      </button>
    </div>
  )
}
