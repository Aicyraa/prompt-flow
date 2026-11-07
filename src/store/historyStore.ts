import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { NodeType, Usage } from '../types/flow'

export const HISTORY_STORAGE_KEY = 'promptflow:history'
export const MAX_HISTORY_ENTRIES = 20
export const MAX_OUTPUT_CHARS = 20_000

export interface HistoryNode {
  id: string
  label: string
  type: NodeType
  status: string
  output?: string
  /** True when `output` was cut to MAX_OUTPUT_CHARS. */
  truncated?: boolean
  error?: string
  model?: string
  usage?: Usage
  ms?: number
}

export interface HistoryEntry {
  id: string
  startedAt: number
  durationMs: number
  outcome: 'completed' | 'failed' | 'stopped'
  /** Label of the node a partial run started from. */
  from?: string
  nodes: HistoryNode[]
}

interface HistoryStore {
  entries: HistoryEntry[]
  add: (entry: HistoryEntry) => void
  remove: (id: string) => void
  clear: () => void
}

export function truncateOutput(output: string | undefined) {
  if (output === undefined) return {}
  return output.length > MAX_OUTPUT_CHARS
    ? { output: output.slice(0, MAX_OUTPUT_CHARS), truncated: true }
    : { output }
}

/** The text a run produced: Output node results, else the last finished node. */
export function entryResult(entry: HistoryEntry): string {
  const outputs = entry.nodes.filter((n) => n.type === 'output' && n.output)
  if (outputs.length) return outputs.map((n) => n.output).join('\n\n---\n\n')
  const last = [...entry.nodes].reverse().find((n) => n.output)
  return last?.output ?? ''
}

// Storage can be full or blocked; history is best-effort and must never break a run.
const safeStorage = createJSONStorage<{ entries: HistoryEntry[] }>(() => ({
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // quota exceeded: keep the in-memory history only
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}))

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) =>
        set((s) => ({
          entries: [entry, ...s.entries].slice(0, MAX_HISTORY_ENTRIES),
        })),
      remove: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: HISTORY_STORAGE_KEY,
      version: 1,
      storage: safeStorage,
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
)
