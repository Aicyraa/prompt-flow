import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import { nanoid } from 'nanoid'
import toast from 'react-hot-toast'
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
import { createNode } from '../lib/nodes'
import { FLOW_VERSION } from '../lib/serialization'
import { createOpenRouterClient } from '../lib/openrouter'
import { executeFlow } from '../engine/executeFlow'

export const FLOW_STORAGE_KEY = 'promptflow:flow'

interface FlowStore extends FlowState {
  selectedNodeId: string | null
  selectedEdgeId: string | null
  isRunning: boolean
  edgeStyle: EdgeStyle
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  addNode: (type: NodeType, position: XYPosition) => void
  updateNodeData: (id: string, patch: Partial<NodeData>) => void
  deleteNode: (id: string) => void
   connectNodes: (connection: Connection) => void
  selectNode: (id: string | null) => void
  selectEdge: (id: string | null) => void
  updateEdgeData: (id: string, patch: Partial<EdgeData>) => void
  setEdgeStyle: (style: EdgeStyle) => void
  loadFlow: (nodes: FlowNode[], edges: FlowEdge[], edgeStyle?: EdgeStyle) => void
  clearFlow: () => void
  runFlow: () => Promise<void>
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      isRunning: false,
      edgeStyle: 'curved',

      onNodesChange: (changes) =>
        set((state) => {
          const removedIds = changes
            .filter((c) => c.type === 'remove')
            .map((c) => c.id)
          const nodes = applyNodeChanges(changes, state.nodes)
          const removedEdgeIds = new Set(
            changes.filter((c) => c.type === 'remove').map((c) => c.id),
          )
          const edges =
            removedIds.length === 0
              ? state.edges
              : state.edges.filter(
                  (e) =>
                    !removedIds.includes(e.source) &&
                    !removedIds.includes(e.target),
                )
          const selectedEdgeId =
            state.selectedEdgeId && removedEdgeIds.has(state.selectedEdgeId)
              ? null
              : state.selectedEdgeId
          return { nodes, edges, selectedEdgeId }
        }),

      onEdgesChange: (changes) =>
        set((state) => {
          const edges = applyEdgeChanges(changes, state.edges)
          const removed = new Set(
            changes.filter((c) => c.type === 'remove').map((c) => c.id),
          )
          const selectedEdgeId =
            state.selectedEdgeId && removed.has(state.selectedEdgeId)
              ? null
              : state.selectedEdgeId
          return { edges, selectedEdgeId }
        }),

      addNode: (type, position) =>
        set((state) => ({ nodes: [...state.nodes, createNode(type, position)] })),

      updateNodeData: (id, patch) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
          ),
        })),

      deleteNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId:
            state.selectedNodeId === id ? null : state.selectedNodeId,
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
              type: get().edgeStyle,
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

      setEdgeStyle: (style) =>
        set((state) => ({
          edgeStyle: style,
          // Re-style every existing edge so the change applies globally.
          edges: state.edges.map((e) => ({ ...e, type: style })),
        })),

      selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),

      selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  loadFlow: (nodes, edges, edgeStyle = 'curved') =>
    set({
      nodes,
      edges,
      selectedNodeId: null,
      selectedEdgeId: null,
      edgeStyle,
    }),

      clearFlow: () =>
        set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null }),

      runFlow: async () => {
        if (get().isRunning) return

        set({
          isRunning: true,
          nodes: get().nodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              status: 'idle',
              output: undefined,
              error: undefined,
            },
          })),
        })

        const client = createOpenRouterClient()
        try {
          const { succeeded, failedNodeId } = await executeFlow({
            nodes: get().nodes,
            edges: get().edges,
            client,
            onStatus: (update) =>
              set((state) => ({
                nodes: state.nodes.map((n) =>
                  n.id === update.nodeId
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          status: update.status,
                          output: update.output,
                          error: update.error,
                        },
                      }
                    : n,
                ),
              })),
          })

          if (succeeded) {
            toast.success('Flow completed')
          } else {
            const failed = get().nodes.find((n) => n.id === failedNodeId)
            toast.error(`Flow stopped: ${failed?.data.error ?? 'Unknown error'}`)
          }
        } finally {
          set({ isRunning: false })
        }
      },
    }),
    {
      name: FLOW_STORAGE_KEY,
      version: FLOW_VERSION,
      migrate: (persisted: unknown) => {
        // zustand passes the stored state slice; older stores or the wrapper
        // format may nest it under a `state` key, so normalize both shapes.
        const raw = (
          persisted && typeof persisted === 'object' ? persisted : {}
        ) as {
          nodes?: FlowNode[]
          edges?: FlowEdge[]
          edgeStyle?: string
          state?: {
            nodes?: FlowNode[]
            edges?: FlowEdge[]
            edgeStyle?: string
          }
        }
        const inner = raw.state ?? raw
        const nodes: FlowNode[] = inner.nodes ?? []
        const edges: FlowEdge[] = (inner.edges ?? []).map(
          (e: { type?: string; data?: Record<string, unknown> }) =>
            ({
              ...e,
              type:
                e.type === 'smoothstep' ||
                e.type === 'default' ||
                e.type === 'auto'
                  ? ('curved' as const)
                  : e.type,
              data: { bend: 0, ...(e.data ?? {}) },
            }) as FlowEdge,
        )
        return {
          nodes,
          edges,
          edgeStyle:
            inner.edgeStyle === 'auto'
              ? 'curved'
              : (inner.edgeStyle ?? 'curved'),
        }
      },
      partialize: (state) => ({
        nodes: state.nodes.map(({ selected: _selected, ...node }) => node),
        edges: state.edges,
        edgeStyle: state.edgeStyle,
      }),
    },
  ),
)
