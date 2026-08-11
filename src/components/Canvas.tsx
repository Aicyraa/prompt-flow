import { useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type Connection,
  type IsValidConnection,
  type OnConnect,
} from '@xyflow/react'
import type { NodeType } from '../types/flow'
import { canConnect } from '../lib/connections'
import { useFlowStore } from '../store/flowStore'
import InputNode from './nodes/InputNode'
import PromptNode from './nodes/PromptNode'
import LLMNode from './nodes/LLMNode'
import OutputNode from './nodes/OutputNode'
import Toolbar from './panels/Toolbar'
import NodeConfigPanel from './panels/NodeConfigPanel'

const nodeTypes = {
  input: InputNode,
  prompt: PromptNode,
  llm: LLMNode,
  output: OutputNode,
}

const defaultEdgeOptions = { type: 'smoothstep' }

export default function Canvas() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const onConnect = useFlowStore((s) => s.connectNodes)
  const selectNode = useFlowStore((s) => s.selectNode)
  const { screenToFlowPosition } = useReactFlow()

  const addNode = useCallback(
    (type: NodeType) => {
      const offset = useFlowStore.getState().nodes.length % 5
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 + offset * 28,
        y: window.innerHeight / 2 + offset * 28,
      })
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
    ({ nodes: selected }: { nodes: { id: string }[] }) => {
      selectNode(selected[0]?.id ?? null)
    },
    [selectNode],
  )

  return (
    <div className="relative h-full w-full">
      <Toolbar onAdd={addNode} />
      <NodeConfigPanel />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
        className="h-full w-full"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#334155"
        />
        <Controls />
      </ReactFlow>
    </div>
  )
}
