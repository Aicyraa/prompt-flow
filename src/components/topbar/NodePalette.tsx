import type { NodeType } from '../../types/flow'
import NodeIcon from '../ui/NodeIcon'

const BUTTONS: { type: NodeType; label: string }[] = [
  { type: 'input', label: 'Input' },
  { type: 'prompt', label: 'Prompt' },
  { type: 'llm', label: 'Agent' },
  { type: 'output', label: 'Output' },
]

export default function NodePalette({
  onAdd,
}: {
  onAdd: (type: NodeType) => void
}) {
  return (
    <div
      role="group"
      aria-label="Add a node"
      className="flex items-center gap-0.5"
    >
      {BUTTONS.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type)}
          title={`Add ${label} node`}
          aria-label={`Add ${label} node`}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-charcoal-200 transition-[color,background-color,transform] active:scale-95 hover:bg-charcoal-800 hover:text-charcoal-50"
        >
          <NodeIcon type={type} />
          {label}
        </button>
      ))}
    </div>
  )
}
