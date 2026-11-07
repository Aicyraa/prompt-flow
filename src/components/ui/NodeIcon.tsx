import type { ReactNode } from 'react'
import type { NodeType } from '../../types/flow'

const PATHS: Record<NodeType, ReactNode> = {
  // arrow entering a frame
  input: (
    <path d="M3 10h9M8.5 6.5 12 10l-3.5 3.5M12 4h3.5A1.5 1.5 0 0 1 17 5.5v9a1.5 1.5 0 0 1-1.5 1.5H12" />
  ),
  // quote / text lines
  prompt: <path d="M4 5.5h12M4 10h12M4 14.5h7" />,
  // spark
  llm: (
    <path d="M10 2.5 11.8 8.2 17.5 10l-5.7 1.8L10 17.5l-1.8-5.7L2.5 10l5.7-1.8L10 2.5Z" />
  ),
  // arrow leaving a frame
  output: (
    <path d="M8 10h9M13.5 6.5 17 10l-3.5 3.5M8 4H4.5A1.5 1.5 0 0 0 3 5.5v9A1.5 1.5 0 0 0 4.5 16H8" />
  ),
}

const NODE_ICON_TONE: Record<NodeType, string> = {
  input: 'text-emerald-400',
  prompt: 'text-amber-400',
  llm: 'text-violet-400',
  output: 'text-sky-400',
}

/** Per-node-type stroke icon, tinted by the node's accent. */
export default function NodeIcon({
  type,
  className = 'h-4 w-4',
}: {
  type: NodeType
  className?: string
}) {
  return (
    <svg
      className={`${className} ${NODE_ICON_TONE[type]}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[type]}
    </svg>
  )
}
