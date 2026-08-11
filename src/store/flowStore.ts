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
import type { FlowEdge, FlowNode, NodeData, NodeType } from '../types/flow'
import { createNode } from '../lib/nodes'
import { FLOW_VERSION } from '../lib/serialization'
import { createOpenRouterClient } from '../lib/openrouter'
import { executeFlow } from '../engine/executeFlow'

export const FLOW_STORAGE_KEY = 'promptflow:flow'

interface FlowStore {
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNodeId: string | null
  isRunning: boolean
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  addNode: (type: NodeType, position: XYPosition) => void
  updateNodeData: (id: string, patch: Partial<NodeData>) => void
  deleteNode: (id: string) => void
  connectNodes: (connection: Connection) => void
  selectNode: (id: string | null) => void
  clearFlow: () => void
  runFlow: () => Promise<void>
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isRunning: false,

      onNodesChange: (changes) =>
        set((state) => {
          const removedIds = changes
            .filter((c) => c.type === 'remove')
            .map((c) => c.id)
          const nodes = applyNodeChanges(changes, state.nodes)
          const edges =
            removedIds.length === 0
              ? state.edges
              : state.edges.filter(
                  (e) =>
                    !removedIds.includes(e.source) &&
                    !removedIds.includes(e.target),
                )
          return { nodes, edges }
        }),

      onEdgesChange: (changes) =>
        set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

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
              type: 'smoothstep',
            } satisfies FlowEdge,
          ],
        })),

      selectNode: (id) => set({ selectedNodeId: id }),

      clearFlow: () => set({ nodes: [], edges: [], selectedNodeId: null }),

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
      partialize: (state) => ({
        nodes: state.nodes.map(({ selected: _selected, ...node }) => node),
        edges: state.edges,
      }),
    },
  ),
)
