import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { useReactFlow, type EdgeProps, type EdgeChange } from '@xyflow/react'
import type { FlowEdge } from '../../types/flow'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import {
  buildCurvedPath,
  bendForOffset,
  type Point,
} from '../../lib/edgeGeometry'

export default function CurvedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  target: targetId,
  data,
  selected,
}: EdgeProps<FlowEdge>) {
  // Data is "flowing" along an edge while the node it feeds is running.
  const flowing = useRunStore((s) => s.nodes[targetId]?.status === 'running')
  // New edges draw themselves in once, then drop the dash trick.
  const [drawn, setDrawn] = useState(false)
  const updateEdgeData = useGraphStore((s) => s.updateEdgeData)
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange)
  const selectEdgeOnly = useGraphStore((s) => s.selectEdgeOnly)
  const { screenToFlowPosition } = useReactFlow()

  // Selection is React Flow's own `selected` flag (the single source of truth).
  const active = Boolean(selected)
  const source: Point = { x: sourceX, y: sourceY }
  const target: Point = { x: targetX, y: targetY }
  const bend = Number(data?.bend ?? 0)
  const distance = Math.hypot(targetX - sourceX, targetY - sourceY)
  const { d, mid, normal, chordMid } = buildCurvedPath(source, target, bend)

  const handleDelete = useCallback(() => {
    onEdgesChange([{ id, type: 'remove' } as EdgeChange<FlowEdge>])
  }, [id, onEdgesChange])

  const handleSelect = useCallback(
    (e: PointerEvent<SVGPathElement>) => {
      e.stopPropagation()
      e.preventDefault()
      selectEdgeOnly(id)
    },
    [id, selectEdgeOnly],
  )

  const dragRef = useRef<{ startOffset: number } | null>(null)
  const onPointerDown = useCallback(
    (e: PointerEvent<SVGCircleElement>) => {
      // `nopan/nodrag` plus stop+prevent stops React Flow from starting a pan
      // or toggling canvas selection while we adjust the bend.
      e.stopPropagation()
      e.preventDefault()
      const start = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const offset =
        (start.x - chordMid.x) * normal.x + (start.y - chordMid.y) * normal.y
      dragRef.current = { startOffset: offset }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [screenToFlowPosition, chordMid, normal],
  )
  const onPointerMove = useCallback(
    (e: PointerEvent<SVGCircleElement>) => {
      if (!dragRef.current) return
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const offset =
        (p.x - chordMid.x) * normal.x + (p.y - chordMid.y) * normal.y
      const next = bendForOffset(distance, offset)
      updateEdgeData(id, { bend: next })
    },
    [id, updateEdgeData, screenToFlowPosition, chordMid, normal, distance],
  )
  const onPointerUp = useCallback((e: PointerEvent<SVGCircleElement>) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  const stroke = active ? '#a782f7' : flowing ? '#fbbf24' : '#726657'
  const strokeWidth = active ? 2.5 : 1.5
  const arrowId = `arrow-${id}`

  return (
    <g style={{ pointerEvents: 'all' }}>
      {/* Arrowhead marker, tinted to match the current edge color */}
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 Z" fill={stroke} />
        </marker>
      </defs>

      {/* Visible flowy edge (non-interactive so the hit path beneath receives clicks) */}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        markerEnd={`url(#${arrowId})`}
        pointerEvents="none"
        // pathLength=1 lets the draw-in use one dash unit for the whole line.
        pathLength={drawn ? undefined : 1}
        strokeDasharray={drawn ? (flowing ? '6 6' : undefined) : 1}
        className={
          drawn
            ? flowing
              ? 'animate-dash-flow'
              : undefined
            : 'animate-draw-in'
        }
        onAnimationEnd={() => setDrawn(true)}
        style={{ transition: 'stroke 200ms, stroke-width 200ms' }}
      />

      {/* Wide invisible hit path so lines are easy to click/select.
          An opaque stroke with opacity 0 is still "painted" for hit testing,
          giving a generous touch target without obscuring anything. */}
      <path
        d={d}
        fill="none"
        stroke="#000"
        strokeWidth={24}
        strokeLinecap="round"
        opacity={0}
        pointerEvents="stroke"
        className="cursor-pointer"
        onMouseDown={handleSelect}
      />

      {active && (
        <>
          {/* Draggable bend handle at the arc midpoint */}
          <circle
            cx={mid.x}
            cy={mid.y}
            r={6}
            fill="transparent"
            stroke="#a782f7"
            strokeWidth={1.5}
            pointerEvents="all"
            className="cursor-grab nopan nodrag active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
          {/* Delete button, placed just off the midpoint */}
          <circle
            cx={mid.x}
            cy={mid.y - 20}
            r={8}
            fill="transparent"
            stroke="#f43f5e"
            strokeWidth={1.5}
            pointerEvents="all"
            className="cursor-pointer nopan nodrag"
            onClick={handleDelete}
          />
          <text
            x={mid.x}
            y={mid.y - 20 + 1.5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#fca5a5"
            pointerEvents="none"
          >
            ×
          </text>
        </>
      )}
    </g>
  )
}
