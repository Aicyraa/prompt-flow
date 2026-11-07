import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type IsValidConnection,
  type OnConnect,
} from '@xyflow/react'
import type { FlowEdge, NodeType } from '../types/flow'
import { canConnect } from '../lib/connections'
import { useGraphStore } from '../store/graphStore'
import { useSettingsStore } from '../store/settingsStore'
import InputNode from './nodes/InputNode'
import PromptNode from './nodes/PromptNode'
import LLMNode from './nodes/LLMNode'
import MergeNode from './nodes/MergeNode'
import OutputNode from './nodes/OutputNode'
import CurvedEdge from './edges/CurvedEdge'
import TopBar from './topbar/TopBar'
import EmptyState from './run/EmptyState'
import RunLog from './run/RunLog'
import NodeConfigPanel from './panels/NodeConfigPanel'
import { useEditShortcuts } from './useEditShortcuts'
import { useRevealSelected } from './useRevealSelected'
import { useViewShortcuts } from './useViewShortcuts'
import { PANEL_WIDTH_PX } from './panels/panelLayout'

// Opened rarely, so it loads on demand.
const CommandPalette = lazy(() => import('./palette/CommandPalette'))
const FlowsModal = lazy(() => import('./flows/FlowsModal'))

const MINIMAP_COLORS: Record<string, string> = {
  input: '#34d399',
  prompt: '#fbbf24',
  llm: '#a78bfa',
  merge: '#2dd4bf',
  output: '#38bdf8',
}

const nodeTypes = {
  input: InputNode,
  prompt: PromptNode,
  llm: LLMNode,
  merge: MergeNode,
  output: OutputNode,
}

// Bezier is the only line style — every edge is the wavy CurvedEdge.
const edgeTypes = {
  curved: CurvedEdge,
} as const

const defaultEdgeOptions = { type: 'curved' } as const

export default function Canvas() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const onNodesChange = useGraphStore((s) => s.onNodesChange)
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange)
  const onConnect = useGraphStore((s) => s.connectNodes)
  const { screenToFlowPosition } = useReactFlow()

  const containerRef = useRef<HTMLDivElement>(null)
  useEditShortcuts()
  useRevealSelected(containerRef)
  useViewShortcuts()
  const showMinimap = useSettingsStore((s) => s.showMinimap)
  const paletteOpen = useSettingsStore((s) => s.paletteOpen)
  const flowsOpen = useSettingsStore((s) => s.flowsOpen)
  // The settings panel docks on the right; keep the minimap clear of it.
  const panelOpen = useGraphStore(
    (s) => s.nodes.filter((n) => n.selected).length === 1,
  )

  // New nodes chain onto the single selected node (and connect to it when
  // allowed); otherwise they appear at the centre of the visible canvas.
  const addNode = useCallback(
    (type: NodeType) => {
      const state = useGraphStore.getState()
      const selected = state.nodes.filter((n) => n.selected)
      const prev = selected.length === 1 ? selected[0] : undefined

      let position
      if (prev) {
        position = { x: prev.position.x + 340, y: prev.position.y }
      } else {
        const rect = containerRef.current?.getBoundingClientRect()
        const cx = (rect?.left ?? 0) + (rect?.width ?? window.innerWidth) / 2
        const cy = (rect?.top ?? 0) + (rect?.height ?? window.innerHeight) / 2
        const jitter = (state.nodes.length % 5) * 24
        position = screenToFlowPosition({
          x: cx - 144 + jitter,
          y: cy - 60 + jitter,
        })
      }

      const node = state.addNode(type, position)
      if (
        prev &&
        canConnect(
          { id: prev.id, type: prev.data.type },
          { id: node.id, type: node.data.type },
          state.edges,
        )
      ) {
        state.connectNodes({
          source: prev.id,
          target: node.id,
          sourceHandle: null,
          targetHandle: null,
        })
      }
    },
    [screenToFlowPosition],
  )

  const isValidConnection: IsValidConnection = useCallback((connection) => {
    const { nodes, edges } = useGraphStore.getState()
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

  // Delete the selected edge with the keyboard. React Flow's native keydown
  // selection is unreliable for our custom curved edges (see edge-interaction
  // note in styles/index.css), so we own the Delete shortcut here.
  const selectedEdgeId = useGraphStore(
    (s) => s.edges.find((e) => e.selected)?.id,
  )
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
      onEdgesChange([
        { id: selectedEdgeId, type: 'remove' } as EdgeChange<FlowEdge>,
      ])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedEdgeId, onEdgesChange])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <TopBar onAdd={addNode} />
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        <NodeConfigPanel />
        <EmptyState />
        <RunLog />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
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
          {showMinimap && nodes.length > 0 && (
            <MiniMap
              pannable
              zoomable
              ariaLabel="Flow minimap"
              nodeColor={(n) => MINIMAP_COLORS[n.type ?? ''] ?? '#726657'}
              nodeStrokeWidth={0}
              bgColor="#161310"
              maskColor="rgba(15, 12, 10, 0.7)"
              maskStrokeColor="#726657"
              maskStrokeWidth={1}
              className="!rounded-lg !border !border-charcoal-700"
              style={{
                width: 170,
                height: 110,
                marginRight: panelOpen ? PANEL_WIDTH_PX + 8 : 12,
                marginBottom: 12,
                transition: 'margin-right 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />
          )}
        </ReactFlow>
      </div>
      {flowsOpen && (
        <Suspense fallback={null}>
          <FlowsModal />
        </Suspense>
      )}
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette onAdd={addNode} />
        </Suspense>
      )}
    </div>
  )
}
