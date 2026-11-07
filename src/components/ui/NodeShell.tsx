import type { ReactNode } from 'react'
import { Handle, NodeResizer, Position } from '@xyflow/react'
import type { NodeType } from '../../types/flow'
import { useGraphStore } from '../../store/graphStore'
import { selectNodeRun, useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import { CloseIcon, Icon } from './Icon'
import NodeIcon from './NodeIcon'
import { STATUS_DOTS, STATUS_LABELS } from './nodeTheme'

interface NodeShellProps {
  id: string
  type: NodeType
  label: string
  selected?: boolean
  hasTarget?: boolean
  hasSource?: boolean
  resizable?: boolean
  width?: number
  /** Extra controls rendered in the header, before the delete button. */
  actions?: ReactNode
  children: ReactNode
}

const KEY_ERRORS = new Set(['no_key', 'invalid_key'])

export default function NodeShell({
  id,
  type,
  label,
  selected = false,
  hasTarget = false,
  hasSource = false,
  resizable = false,
  width,
  actions,
  children,
}: NodeShellProps) {
  const deleteNode = useGraphStore((s) => s.deleteNode)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const { status, error, errorKind } = useRunStore(selectNodeRun(id))

  return (
    <div
      className={`relative rounded-xl border-2 bg-charcoal-900/95 shadow-2xl transition-[border-color,box-shadow] duration-150 ${
        status === 'error'
          ? 'border-rose-500/60'
          : selected
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
        <NodeIcon type={type} />
        <span className="flex-1 truncate text-xs font-semibold tracking-wide text-charcoal-100 uppercase">
          {label}
        </span>
        <span
          className="flex items-center gap-1 text-[10px] text-charcoal-300"
          title={status}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${STATUS_DOTS[status]}`}
          />
          {STATUS_LABELS[status]}
        </span>
        {actions}
        <button
          type="button"
          onClick={() => deleteNode(id)}
          className="rounded p-0.5 text-charcoal-400 transition-colors hover:bg-charcoal-800 hover:text-rose-400"
          title="Delete node"
          aria-label="Delete node"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="p-3">
        {children}
        {status === 'error' && error && (
          <div
            role="alert"
            className="nodrag mt-3 cursor-text rounded-md border border-rose-500/40 bg-rose-950/40 p-2 text-[11px] leading-relaxed text-rose-200 select-text"
          >
            <p className="flex gap-1.5">
              <Icon name="alert" className="mt-px h-3.5 w-3.5 shrink-0" />
              <span className="break-words">{error}</span>
            </p>
            {errorKind && KEY_ERRORS.has(errorKind) && (
              <button
                type="button"
                onClick={openSettings}
                className="mt-1.5 rounded border border-rose-400/40 px-2 py-0.5 font-medium text-rose-100 hover:bg-rose-900/40"
              >
                Open settings
              </button>
            )}
          </div>
        )}
      </div>

      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          aria-label="Input connection"
          className="!-left-[5px]"
        />
      )}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Right}
          aria-label="Output connection"
          className="!-right-[5px]"
        />
      )}
    </div>
  )
}
