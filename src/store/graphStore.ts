import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import { nanoid } from 'nanoid'
import type {
  Connection,
  EdgeChange,
  NodeChange,
  XYPosition,
} from '@xyflow/react'
import type {
  EdgeData,
  EdgeStyle,
  FlowEdge,
  FlowNode,
  FlowState,
  NodeData,
  NodeType,
} from '../types/flow'
import { createNode, withFixedWidth } from '../lib/nodes'
import { createDebouncedStorage } from '../lib/debouncedStorage'
import {
  FLOW_VERSION,
  cleanVariables,
  normalizeEdges,
  stripTransientNode,
} from '../lib/serialization'

export const FLOW_STORAGE_KEY = 'promptflow:flow'

/** Most steps kept for undo; older ones are dropped. */
export const HISTORY_LIMIT = 50
/** Edits to the same thing closer together than this are one undo step. */
const COALESCE_MS = 1000
/** Offset applied to each paste so copies don't sit exactly on the originals. */
const PASTE_OFFSET = 32

interface Snapshot {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

interface Clipboard extends Snapshot {
  /** Pastes so far, so repeated pastes cascade instead of stacking. */
  pastes: number
}

let lastKey = ''
let lastAt = 0
/** True when `key` was already recorded a moment ago (typing, dragging a bend). */
function isCoalesced(key: string, now = Date.now()): boolean {
  const same = key === lastKey && now - lastAt < COALESCE_MS
  lastKey = key
  lastAt = now
  return same
}
let moving = false
let resizing = false

type PersistedGraph = Pick<FlowState, 'nodes' | 'edges'> & {
  edgeStyle: EdgeStyle
  variables: Record<string, string>
}

interface GraphStore extends FlowState {
  edgeStyle: EdgeStyle
  /** Values for `{{name}}` variables used in the flow's text. */
  variables: Record<string, string>
  setVariable: (name: string, value: string) => void
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  /** Adds a node, selects it (alone), and returns it. */
  addNode: (type: NodeType, position: XYPosition) => FlowNode
  updateNodeData: (id: string, patch: Partial<NodeData>) => void
  deleteNode: (id: string) => void
  connectNodes: (connection: Connection) => void
  /** Select exactly one edge (and deselect everything else). */
  selectEdgeOnly: (id: string) => void
  /** Select exactly one node (and deselect everything else). */
  selectNodeOnly: (id: string) => void
  clearSelection: () => void
  updateEdgeData: (id: string, patch: Partial<EdgeData>) => void
  loadFlow: (
    nodes: FlowNode[],
    edges: FlowEdge[],
    edgeStyle?: EdgeStyle,
    variables?: Record<string, string>,
  ) => void
  clearFlow: () => void
  /** Undo/redo stacks of earlier graph states (never persisted). */
  past: Snapshot[]
  future: Snapshot[]
  undo: () => void
  redo: () => void
  clipboard: Clipboard | null
  /** Copy the selected nodes (and the edges between them). */
  copySelection: () => boolean
  /** Paste the copied nodes, selected, and return how many were added. */
  pasteClipboard: () => number
  /** Copy and paste the selection in one step. */
  duplicateSelection: () => number
  /** Move nodes to new positions as one undo step (used by Tidy). */
  applyPositions: (positions: Record<string, XYPosition>) => void
}

/**
 * The flow graph. Selection lives on React Flow's own `selected` flags, so
 * there is a single source of truth; run results live in `runStore`.
 */
export const useGraphStore = create<GraphStore>()(
  persist(
    (set, get) => {
      /** The state to push onto the undo stack before a change; clears redo. */
      const record = (state: GraphStore) => {
        // Any other recorded change ends a drag/resize we may have missed the
        // end of (e.g. the node was deleted mid-drag), so the next one counts.
        moving = false
        resizing = false
        return {
          past: [
            ...state.past.slice(-(HISTORY_LIMIT - 1)),
            { nodes: state.nodes, edges: state.edges },
          ],
          future: [],
        }
      }
      const deselect = (nodes: FlowNode[]) =>
        nodes.map((n) => (n.selected ? { ...n, selected: false } : n))

      return {
        nodes: [],
        edges: [],
        edgeStyle: 'curved',
        variables: {},
        past: [],
        future: [],
        clipboard: null,

        onNodesChange: (changes) =>
          set((state) => {
            const removedIds = new Set(
              changes.filter((c) => c.type === 'remove').map((c) => c.id),
            )
            // One undo step per drag / resize / delete, not one per mouse move.
            let history: Partial<GraphStore> = {}
            for (const c of changes) {
              if (c.type === 'position') {
                if (c.dragging && !moving) history = record(state)
                moving = Boolean(c.dragging)
              } else if (c.type === 'dimensions' && c.resizing !== undefined) {
                if (c.resizing && !resizing) history = record(state)
                resizing = c.resizing
              }
            }
            if (removedIds.size > 0) history = record(state)
            const nodes = applyNodeChanges(changes, state.nodes)
            if (removedIds.size === 0) return { nodes, ...history }
            const edges = state.edges.filter(
              (e) => !removedIds.has(e.source) && !removedIds.has(e.target),
            )
            return { nodes, edges, ...history }
          }),

        onEdgesChange: (changes) =>
          set((state) => ({
            edges: applyEdgeChanges(changes, state.edges),
            ...(changes.some((c) => c.type === 'remove') ? record(state) : {}),
          })),

        addNode: (type, position) => {
          const node = { ...createNode(type, position), selected: true }
          set((state) => ({
            ...record(state),
            nodes: [
              ...state.nodes.map((n) =>
                n.selected ? { ...n, selected: false } : n,
              ),
              node,
            ],
            edges: state.edges.map((e) =>
              e.selected ? { ...e, selected: false } : e,
            ),
          }))
          return node
        },

        updateNodeData: (id, patch) =>
          set((state) => ({
            ...(isCoalesced(`data:${id}`) ? {} : record(state)),
            nodes: state.nodes.map((n) =>
              n.id === id
                ? { ...n, data: { ...n.data, ...patch } as NodeData }
                : n,
            ),
          })),

        deleteNode: (id) =>
          set((state) => ({
            ...record(state),
            nodes: state.nodes.filter((n) => n.id !== id),
            edges: state.edges.filter(
              (e) => e.source !== id && e.target !== id,
            ),
          })),

        connectNodes: (connection) =>
          set((state) => ({
            ...record(state),
            edges: [
              ...state.edges,
              {
                id: nanoid(),
                source: connection.source,
                target: connection.target,
                sourceHandle: connection.sourceHandle,
                targetHandle: connection.targetHandle,
                type: 'curved' as const,
                data: {},
              } satisfies FlowEdge,
            ],
          })),

        updateEdgeData: (id, patch) =>
          set((state) => ({
            ...(isCoalesced(`edge:${id}`) ? {} : record(state)),
            edges: state.edges.map((e) =>
              e.id === id ? { ...e, data: { ...(e.data ?? {}), ...patch } } : e,
            ),
          })),

        selectEdgeOnly: (id) =>
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.selected ? { ...n, selected: false } : n,
            ),
            edges: state.edges.map((e) =>
              e.selected === (e.id === id)
                ? e
                : { ...e, selected: e.id === id },
            ),
          })),

        selectNodeOnly: (id) =>
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.selected === (n.id === id)
                ? n
                : { ...n, selected: n.id === id },
            ),
            edges: state.edges.map((e) =>
              e.selected ? { ...e, selected: false } : e,
            ),
          })),

        clearSelection: () =>
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.selected ? { ...n, selected: false } : n,
            ),
            edges: state.edges.map((e) =>
              e.selected ? { ...e, selected: false } : e,
            ),
          })),

        loadFlow: (nodes, edges, edgeStyle = 'curved', variables = {}) =>
          set((state) => ({
            ...record(state),
            nodes: nodes.map(withFixedWidth),
            edges: normalizeEdges(edges, nodes),
            edgeStyle,
            variables,
          })),

        // Values are run inputs, not graph structure, so they are not undoable.
        setVariable: (name, value) =>
          set((state) => ({
            variables: { ...state.variables, [name]: value },
          })),

        clearFlow: () =>
          set((state) => ({ ...record(state), nodes: [], edges: [] })),

        undo: () =>
          set((state) => {
            const previous = state.past[state.past.length - 1]
            if (!previous) return state
            lastKey = ''
            return {
              nodes: deselect(previous.nodes),
              edges: previous.edges.map((e) =>
                e.selected ? { ...e, selected: false } : e,
              ),
              past: state.past.slice(0, -1),
              future: [
                { nodes: state.nodes, edges: state.edges },
                ...state.future,
              ],
            }
          }),

        redo: () =>
          set((state) => {
            const next = state.future[0]
            if (!next) return state
            lastKey = ''
            return {
              nodes: deselect(next.nodes),
              edges: next.edges.map((e) =>
                e.selected ? { ...e, selected: false } : e,
              ),
              past: [
                ...state.past.slice(-(HISTORY_LIMIT - 1)),
                { nodes: state.nodes, edges: state.edges },
              ],
              future: state.future.slice(1),
            }
          }),

        copySelection: () => {
          const { nodes, edges } = get()
          const picked = nodes.filter((n) => n.selected)
          if (picked.length === 0) return false
          const ids = new Set(picked.map((n) => n.id))
          set({
            clipboard: {
              nodes: picked.map(stripTransientNode),
              edges: edges.filter(
                (e) => ids.has(e.source) && ids.has(e.target),
              ),
              pastes: 0,
            },
          })
          return true
        },

        pasteClipboard: () => {
          const clip = get().clipboard
          if (!clip || clip.nodes.length === 0) return 0
          const shift = PASTE_OFFSET * (clip.pastes + 1)
          const idMap = new Map(clip.nodes.map((n) => [n.id, nanoid()]))
          const pasted: FlowNode[] = clip.nodes.map((n) => ({
            ...n,
            id: idMap.get(n.id)!,
            position: { x: n.position.x + shift, y: n.position.y + shift },
            selected: true,
            data: { ...n.data },
          }))
          const pastedEdges: FlowEdge[] = clip.edges.map((e) => ({
            ...e,
            id: nanoid(),
            source: idMap.get(e.source)!,
            target: idMap.get(e.target)!,
            selected: false,
          }))
          set((state) => ({
            ...record(state),
            nodes: [...deselect(state.nodes), ...pasted],
            edges: [
              ...state.edges.map((e) =>
                e.selected ? { ...e, selected: false } : e,
              ),
              ...pastedEdges,
            ],
            clipboard: { ...clip, pastes: clip.pastes + 1 },
          }))
          return pasted.length
        },

        applyPositions: (positions) =>
          set((state) => ({
            ...record(state),
            nodes: state.nodes.map((n) =>
              positions[n.id] ? { ...n, position: positions[n.id] } : n,
            ),
          })),

        duplicateSelection: () => {
          // Duplicating must not replace what the user copied on purpose.
          const keep = get().clipboard
          const { copySelection, pasteClipboard } = get()
          const added = copySelection() ? pasteClipboard() : 0
          set({ clipboard: keep })
          return added
        },
      }
    },
    {
      name: FLOW_STORAGE_KEY,
      version: FLOW_VERSION,
      // Typing in a node fires a store update per keystroke; write once when quiet.
      storage: createDebouncedStorage<PersistedGraph>(300),
      migrate: (persisted: unknown) => {
        // zustand passes the stored state slice; older stores or the wrapper
        // format may nest it under a `state` key, so normalize both shapes.
        const raw = (
          persisted && typeof persisted === 'object' ? persisted : {}
        ) as {
          nodes?: FlowNode[]
          edges?: FlowEdge[]
          variables?: unknown
          state?: {
            nodes?: FlowNode[]
            edges?: FlowEdge[]
            variables?: unknown
          }
        }
        const inner = raw.state ?? raw
        const nodes: FlowNode[] = (inner.nodes ?? [])
          .map(withFixedWidth)
          .map(stripTransientNode)
        const edges = normalizeEdges(inner.edges ?? [], nodes)
        return {
          nodes,
          edges,
          edgeStyle: 'curved' as const,
          variables: cleanVariables(inner.variables),
        }
      },
      partialize: (state) => ({
        // Selection and any legacy run results are never persisted.
        nodes: state.nodes.map(stripTransientNode),
        edges: state.edges.map(({ selected: _selected, ...edge }) => edge),
        edgeStyle: state.edgeStyle,
        variables: state.variables,
      }),
    },
  ),
)
