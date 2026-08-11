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
import type { FlowEdge, FlowNode, NodeData, NodeType } from '../types/flow'
import { createNode } from '../lib/nodes'
import { FLOW_VERSION } from '../lib/serialization'

export const FLOW_STORAGE_KEY = 'promptflow:flow'

interface FlowStore {
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNodeId: string | null
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  addNode: (type: NodeType, position: XYPosition) => void
  updateNodeData: (id: string, patch: Partial<NodeData>) => void
  deleteNode: (id: string) => void
  connectNodes: (connection: Connection) => void
  selectNode: (id: string | null) => void
  clearFlow: () => void
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,

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
