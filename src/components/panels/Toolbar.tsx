import type { NodeType } from '../../types/flow'
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
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-charcoal-700 bg-charcoal-900/90 p-1.5 shadow-2xl backdrop-blur">
      {BUTTONS.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50"
        >
          <span className={`h-2 w-2 rounded-full ${ACCENT_COLORS[type]}`} />
          {label}
        </button>
      ))}
    </div>
  )
}
