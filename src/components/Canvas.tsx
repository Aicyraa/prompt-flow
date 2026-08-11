import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import { BackgroundVariant } from '@xyflow/react'

export default function Canvas() {
  const [nodes, , onNodesChange] = useNodesState([])
  const [edges, , onEdgesChange] = useEdgesState([])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      proOptions={{ hideAttribution: true }}
      className="h-full w-full"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
      <Controls />
    </ReactFlow>
  )
}
