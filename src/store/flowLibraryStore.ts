import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createDebouncedStorage } from '../lib/debouncedStorage'
import { parseFlowStrict, serializeFlow } from '../lib/serialization'
import { useGraphStore } from './graphStore'

export const FLOW_LIBRARY_STORAGE_KEY = 'promptflow:flows'
/** Wait for a quiet moment before writing edits back to the open flow. */
const AUTOSAVE_MS = 600

export interface SavedFlow {
  id: string
  name: string
  updatedAt: number
  nodeCount: number
  /** The flow as an export file (see `serializeFlow`). */
  json: string
}

interface FlowLibrary {
  flows: SavedFlow[]
  /** The saved flow the canvas is autosaving into, or null for a loose canvas. */
  activeId: string | null
  /** Save what is on the canvas as a new flow and keep autosaving into it. */
  saveAs: (name: string) => string
  /** Replace the canvas with a saved flow. False if it no longer exists. */
  open: (id: string) => boolean
  /** Start an empty flow (the open one is saved first). */
  newFlow: (name?: string) => string
  rename: (id: string, name: string) => void
  duplicate: (id: string) => string | undefined
  remove: (id: string) => void
  /** Write the canvas into the open flow (no-op without one, or if unchanged). */
  syncActive: () => void
}

function snapshot(): { json: string; nodeCount: number } {
  const { nodes, edges, edgeStyle, variables } = useGraphStore.getState()
  return {
    json: serializeFlow(nodes, edges, edgeStyle, variables),
    nodeCount: nodes.length,
  }
}

function cleanName(name: string, fallback: string): string {
  return name.trim().slice(0, 80) || fallback
}

function nextUntitled(flows: SavedFlow[]): string {
  const taken = new Set(flows.map((f) => f.name))
  for (let n = 1; ; n++) {
    const name = n === 1 ? 'Untitled flow' : `Untitled flow ${n}`
    if (!taken.has(name)) return name
  }
}

export const useFlowLibrary = create<FlowLibrary>()(
  persist(
    (set, get) => ({
      flows: [],
      activeId: null,

      syncActive: () => {
        const { activeId, flows } = get()
        const current = flows.find((f) => f.id === activeId)
        if (!current) return
        const snap = snapshot()
        if (snap.json === current.json) return
        set({
          flows: flows.map((f) =>
            f.id === current.id ? { ...f, ...snap, updatedAt: Date.now() } : f,
          ),
        })
      },

      saveAs: (name) => {
        const id = nanoid()
        const flow: SavedFlow = {
          id,
          name: cleanName(name, nextUntitled(get().flows)),
          updatedAt: Date.now(),
          ...snapshot(),
        }
        set((s) => ({ flows: [flow, ...s.flows], activeId: id }))
        return id
      },

      open: (id) => {
        const target = get().flows.find((f) => f.id === id)
        const parsed = target && parseFlowStrict(target.json)
        if (!target || !parsed) return false
        get().syncActive() // never lose edits to the flow we are leaving
        useGraphStore
          .getState()
          .loadFlow(
            parsed.nodes,
            parsed.edges,
            parsed.edgeStyle,
            parsed.variables,
          )
        set({ activeId: id })
        return true
      },

      newFlow: (name) => {
        get().syncActive()
        useGraphStore.getState().loadFlow([], [])
        return get().saveAs(name ?? '')
      },

      rename: (id, name) =>
        set((s) => ({
          flows: s.flows.map((f) =>
            f.id === id ? { ...f, name: cleanName(name, f.name) } : f,
          ),
        })),

      duplicate: (id) => {
        const source = get().flows.find((f) => f.id === id)
        if (!source) return undefined
        get().syncActive()
        const latest = get().flows.find((f) => f.id === id) ?? source
        const copy: SavedFlow = {
          ...latest,
          id: nanoid(),
          name: cleanName(`${latest.name} copy`, latest.name),
          updatedAt: Date.now(),
        }
        set((s) => ({ flows: [copy, ...s.flows] }))
        return copy.id
      },

      remove: (id) =>
        set((s) => ({
          flows: s.flows.filter((f) => f.id !== id),
          // The canvas stays as it is; it just stops autosaving anywhere.
          activeId: s.activeId === id ? null : s.activeId,
        })),
    }),
    {
      name: FLOW_LIBRARY_STORAGE_KEY,
      version: 1,
      storage: createDebouncedStorage(300),
      partialize: (s) => ({ flows: s.flows, activeId: s.activeId }),
    },
  ),
)

let stopAutosave: (() => void) | null = null

/**
 * Keeps the open flow in step with the canvas. Call once at startup; returns
 * a function that stops it.
 */
export function startFlowAutosave(): () => void {
  stopAutosave?.()
  let timer: ReturnType<typeof setTimeout> | undefined
  const unsubscribe = useGraphStore.subscribe((state, prev) => {
    if (
      state.nodes === prev.nodes &&
      state.edges === prev.edges &&
      state.variables === prev.variables
    ) {
      return
    }
    clearTimeout(timer)
    timer = setTimeout(
      () => useFlowLibrary.getState().syncActive(),
      AUTOSAVE_MS,
    )
  })
  stopAutosave = () => {
    clearTimeout(timer)
    unsubscribe()
    stopAutosave = null
  }
  return stopAutosave
}
