import type { ReactNode } from 'react'
import { Handle, NodeResizer, Position } from '@xyflow/react'
import type { NodeType } from '../../types/flow'
import { useGraphStore } from '../../store/graphStore'
import { selectNodeRun, useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useRunAction } from '../run/useRunAction'
import { effectiveTextSize, textSizePx } from '../../lib/textSize'
import { CloseIcon, Icon } from './Icon'
import NodeIcon from './NodeIcon'
import NodeStatus from './NodeStatus'

interface NodeShellProps {
  id: string
  type: NodeType
  label: string
  selected?: boolean
  hasTarget?: boolean
  hasSource?: boolean
  /** Smallest size the user can drag the node down to, in px. */
  minWidth?: number
  minHeight?: number
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
  minWidth = 220,
  minHeight = 110,
  actions,
  children,
}: NodeShellProps) {
  const deleteNode = useGraphStore((s) => s.deleteNode)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const isRunning = useRunStore((s) => s.isRunning)
  const runFlow = useRunAction()
  const { status, error, errorKind } = useRunStore(selectNodeRun(id))
  const ownSize = useGraphStore(
    (st) => st.nodes.find((n) => n.id === id)?.data.fontSize,
  )
  const globalSize = useSettingsStore((st) => st.nodeTextSize)
  const fontPx = textSizePx(effectiveTextSize(ownSize, globalSize))

  return (
    // The wrapper plays the one-off entrance; the shell keeps its own
    // run-state animation without the two fighting over `animation`.
    // Fade only: React Flow measures the connection handles once, on mount,
    // and a scale here would bake a wrong position into every edge.
    <div className="animate-fade-in h-full w-full">
      <div
        className={`relative flex h-full w-full min-w-0 flex-col rounded-xl border-2 bg-charcoal-900/95 shadow-2xl transition-[border-color,box-shadow] duration-150 ${
          status === 'running' ? 'animate-running-glow' : ''
        } ${
          status === 'error'
            ? 'border-rose-500/60'
            : selected
              ? 'border-indigo-400/60 shadow-indigo-500/10'
              : 'border-charcoal-700 hover:border-charcoal-500'
        }`}
      >
        <NodeResizer
          minWidth={minWidth}
          minHeight={minHeight}
          maxWidth={1000}
          maxHeight={1000}
          isVisible={selected}
          color="#a78bfa"
          lineClassName="react-flow__resize-line"
          handleClassName="react-flow__resize-handle"
        />
        <div className="flex items-center gap-2 border-b border-charcoal-800 py-2 pr-2 pl-3">
          <NodeIcon type={type} />
          <span className="flex-1 truncate text-xs font-semibold tracking-wide text-charcoal-100 uppercase">
            {label}
          </span>
          <NodeStatus status={status} />
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
        </div>

        {/* The node's text size applies here; text inside is sized in em. */}
        <div
          className="flex min-h-0 flex-1 flex-col p-3"
          style={{ fontSize: fontPx }}
        >
          {children}
          {status === 'error' && error && (
            <div
              role="alert"
              className="animate-fade-up nodrag mt-3 cursor-text rounded-md border border-rose-500/40 bg-rose-950/40 p-2 text-[11px] leading-relaxed text-rose-200 select-text"
            >
              <p className="flex gap-1.5">
                <Icon name="alert" className="mt-px h-3.5 w-3.5 shrink-0" />
                <span className="break-words">{error}</span>
              </p>
              {errorKind && KEY_ERRORS.has(errorKind) ? (
                <button
                  type="button"
                  onClick={openSettings}
                  className="mt-1.5 rounded border border-rose-400/40 px-2 py-0.5 font-medium text-rose-100 hover:bg-rose-900/40"
                >
                  Open settings
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void runFlow({ from: id })}
                  disabled={isRunning}
                  title="Re-run this node and everything after it, reusing earlier results"
                  className="mt-1.5 rounded border border-rose-400/40 px-2 py-0.5 font-medium text-rose-100 hover:bg-rose-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

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
    </div>
  )
}
