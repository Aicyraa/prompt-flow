import type { NodeStatus, NodeType } from '../../types/flow'

export const ACCENT_COLORS: Record<NodeType, string> = {
  input: 'bg-emerald-400',
  prompt: 'bg-amber-400',
  llm: 'bg-violet-400',
  output: 'bg-sky-400',
}

export const STATUS_DOTS: Record<NodeStatus, string> = {
  idle: 'bg-charcoal-500',
  running: 'bg-amber-400 animate-pulse',
  done: 'bg-emerald-400',
  error: 'bg-rose-500',
}

export const STATUS_LABELS: Record<NodeStatus, string> = {
  idle: 'Idle — connect it to a prompt to run.',
  running: 'Waiting for upstream inputs, then calls the model.',
  done: 'Response sent downstream — check the output node.',
  error: 'Something went wrong during execution.',
}

export const FOCUS_RINGS: Record<NodeType, string> = {
  input: 'focus:border-emerald-400/60',
  prompt: 'focus:border-amber-400/60',
  llm: 'focus:border-violet-400/60',
  output: 'focus:border-sky-400/60',
}
