import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type IsValidConnection,
  type OnConnect,
} from '@xyflow/react'
import type { FlowEdge, NodeType } from '../types/flow'
import { canConnect } from '../lib/connections'
import { useFlowStore } from '../store/flowStore'
import InputNode from './nodes/InputNode'
import PromptNode from './nodes/PromptNode'
import LLMNode from './nodes/LLMNode'
import OutputNode from './nodes/OutputNode'
import CurvedEdge from './edges/CurvedEdge'
import Toolbar from './panels/Toolbar'
import ExtendedToolbar from './panels/ExtendedToolbar'
import NodeConfigPanel from './panels/NodeConfigPanel'

const nodeTypes = {
  input: InputNode,
  prompt: PromptNode,
  llm: LLMNode,
  output: OutputNode,
}

// Bezier is the only line style — every edge is the wavy CurvedEdge.
const edgeTypes = {
  curved: CurvedEdge,
} as const

const defaultEdgeOptions = { type: 'curved' } as const

export default function Canvas() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const onConnect = useFlowStore((s) => s.connectNodes)
   const selectNode = useFlowStore((s) => s.selectNode)
   const selectEdge = useFlowStore((s) => s.selectEdge)
   const { screenToFlowPosition } = useReactFlow()

  const addNode = useCallback(
    (type: NodeType) => {
      const count = useFlowStore.getState().nodes.length
      // Place new nodes on a horizontal spread so they don't stack on top of
      // each other (each node is wide). Vertical alternates slightly for a
      // staggered, readable layout.
      const stride = 320
      const x = window.innerWidth / 2 + count * stride - stride
      const y = window.innerHeight / 2 + (count % 2 === 0 ? 0 : 40)
      const position = screenToFlowPosition({ x, y })
      useFlowStore.getState().addNode(type, position)
    },
    [screenToFlowPosition],
  )

  const isValidConnection: IsValidConnection = useCallback((connection) => {
    const { nodes, edges } = useFlowStore.getState()
    const source = nodes.find((n) => n.id === connection.source)
    const target = nodes.find((n) => n.id === connection.target)
    if (!source || !target) return false
    return canConnect(
      { id: source.id, type: source.data.type },
      { id: target.id, type: target.data.type },
      edges,
    )
  }, [])

  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (isValidConnection(connection)) {
        onConnect(connection)
      } else {
        toast.error('That connection isn’t allowed.')
      }
    },
    [isValidConnection, onConnect],
  )

  const handleSelectionChange = useCallback(
    ({ nodes: selected, edges: selectedEdges }: { nodes: { id: string }[]; edges: { id: string }[] }) => {
      // Selecting a node clears edge selection; selecting an edge clears node selection.
      if (selectedEdges && selectedEdges.length > 0) {
        selectEdge(selectedEdges[0].id ?? null)
        return
      }
      if (selected && selected.length > 0) {
        selectNode(selected[0].id ?? null)
      }
    },
    [selectNode, selectEdge],
  )

  // Delete the selected edge with the keyboard. React Flow's native keydown
  // selection is unreliable for our custom curved edges (see edge-interaction
  // note in styles/index.css), so we own the Delete shortcut here.
  const selectedEdgeId = useFlowStore((s) => s.selectedEdgeId)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const active = document.activeElement
      const inInput =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).contentEditable === 'true')
      if (inInput) return
      if (!selectedEdgeId) return
      e.preventDefault()
      onEdgesChange([{ id: selectedEdgeId, type: 'remove' } as EdgeChange<FlowEdge>])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedEdgeId, onEdgesChange])

  return (
    <div className="relative h-full w-full">
      <Toolbar onAdd={addNode} />
      <ExtendedToolbar />
      <NodeConfigPanel />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        onSelectionChange={handleSelectionChange}
        onPaneClick={() => selectEdge(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
        className="h-full w-full"
      >
         <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.25}
          color="#443B30"
        />
        <Controls />
      </ReactFlow>
    </div>
  )
}
