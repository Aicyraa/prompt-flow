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
  normalizeEdges,
  stripTransientNode,
} from '../lib/serialization'

export const FLOW_STORAGE_KEY = 'promptflow:flow'

type PersistedGraph = Pick<FlowState, 'nodes' | 'edges'> & {
  edgeStyle: EdgeStyle
}

interface GraphStore extends FlowState {
  edgeStyle: EdgeStyle
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
  ) => void
  clearFlow: () => void
}

/**
 * The flow graph. Selection lives on React Flow's own `selected` flags, so
 * there is a single source of truth; run results live in `runStore`.
 */
export const useGraphStore = create<GraphStore>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      edgeStyle: 'curved',

      onNodesChange: (changes) =>
        set((state) => {
          const removedIds = new Set(
            changes.filter((c) => c.type === 'remove').map((c) => c.id),
          )
          const nodes = applyNodeChanges(changes, state.nodes)
          if (removedIds.size === 0) return { nodes }
          const edges = state.edges.filter(
            (e) => !removedIds.has(e.source) && !removedIds.has(e.target),
          )
          return { nodes, edges }
        }),

      onEdgesChange: (changes) =>
        set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

      addNode: (type, position) => {
        const node = { ...createNode(type, position), selected: true }
        set((state) => ({
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
          nodes: state.nodes.map((n) =>
            n.id === id
              ? { ...n, data: { ...n.data, ...patch } as NodeData }
              : n,
          ),
        })),

      deleteNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        })),

      connectNodes: (connection) =>
        set((state) => ({
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
            e.selected === (e.id === id) ? e : { ...e, selected: e.id === id },
          ),
        })),

      selectNodeOnly: (id) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.selected === (n.id === id) ? n : { ...n, selected: n.id === id },
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

      loadFlow: (nodes, edges, edgeStyle = 'curved') =>
        set({
          nodes: nodes.map(withFixedWidth),
          edges: normalizeEdges(edges, nodes),
          edgeStyle,
        }),

      clearFlow: () => set({ nodes: [], edges: [] }),
    }),
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
          state?: { nodes?: FlowNode[]; edges?: FlowEdge[] }
        }
        const inner = raw.state ?? raw
        const nodes: FlowNode[] = (inner.nodes ?? [])
          .map(withFixedWidth)
          .map(stripTransientNode)
        const edges = normalizeEdges(inner.edges ?? [], nodes)
        return { nodes, edges, edgeStyle: 'curved' as const }
      },
      partialize: (state) => ({
        // Selection and any legacy run results are never persisted.
        nodes: state.nodes.map(stripTransientNode),
        edges: state.edges.map(({ selected: _selected, ...edge }) => edge),
        edgeStyle: state.edgeStyle,
      }),
    },
  ),
)
