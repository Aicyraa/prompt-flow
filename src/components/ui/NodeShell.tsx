import type { ReactNode } from 'react'
import { Handle, NodeResizer, Position } from '@xyflow/react'
import type { NodeStatus, NodeType } from '../../types/flow'
import { useFlowStore } from '../../store/flowStore'
import { ACCENT_COLORS, STATUS_DOTS } from './nodeTheme'

interface NodeShellProps {
  id: string
  type: NodeType
  label: string
  status?: NodeStatus
  selected?: boolean
  hasTarget?: boolean
  hasSource?: boolean
  resizable?: boolean
  width?: number
  children: ReactNode
}

export default function NodeShell({
  id,
  type,
  label,
  status = 'idle',
  selected = false,
  hasTarget = false,
  hasSource = false,
  resizable = false,
  width,
  children,
}: NodeShellProps) {
  const deleteNode = useFlowStore((s) => s.deleteNode)

  return (
    <div
      className={`relative rounded-xl border-2 bg-charcoal-900/95 shadow-2xl transition-[border-color,box-shadow] duration-150 ${
        selected
          ? 'border-indigo-400/60 shadow-indigo-500/10'
          : 'border-charcoal-700 hover:border-charcoal-500'
      }`}
      style={width != null ? { width } : resizable ? { width: 288 } : undefined}
    >
      {resizable && (
        <NodeResizer
          minWidth={200}
          minHeight={120}
          maxWidth={720}
          maxHeight={560}
          isVisible={selected}
          color="#38bdf8"
          lineClassName="react-flow__resize-line"
          handleClassName="react-flow__resize-handle"
        />
      )}
      <header className="flex items-center gap-2 border-b border-charcoal-800 py-2 pr-2 pl-3">
        <span className={`h-4 w-1 rounded-full ${ACCENT_COLORS[type]}`} />
        <span className="flex-1 truncate text-xs font-semibold tracking-wide text-charcoal-100 uppercase">
          {label}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${STATUS_DOTS[status]}`}
          title={status}
        />
        <button
          type="button"
          onClick={() => deleteNode(id)}
          className="rounded p-0.5 text-charcoal-500 transition-colors hover:bg-charcoal-800 hover:text-rose-400"
          title="Delete node"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </header>

      <div className="p-3">{children}</div>

      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className="!-left-[5px]"
        />
      )}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Right}
          className="!-right-[5px]"
        />
      )}
    </div>
  )
}
