import { useCallback, useRef, useState } from 'react'
import { useFlowStore } from '../../store/flowStore'
import { serializeFlow, parseFlow } from '../../lib/serialization'
import toast from 'react-hot-toast'
import GuideModal from './GuideModal'

const PANEL_WIDTH = 252
const CIRCLE = 44
const EDGE_MARGIN = 4

function clampToViewport(x: number, y: number, width: number, height: number) {
  const maxX = Math.max(EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN)
  const maxY = Math.max(EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN)
  return {
    x: Math.min(Math.max(x, EDGE_MARGIN), maxX),
    y: Math.min(Math.max(y, EDGE_MARGIN), maxY),
  }
}

export default function ExtendedToolbar() {
  const [pos, setPos] = useState(() => ({
    x: window.innerWidth / 2 - CIRCLE / 2,
    y: window.innerHeight - 88,
  }))
  const [open, setOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    startX: number
    startY: number
    origX: number
    origY: number
    moved: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [guideOpen, setGuideOpen] = useState(false)

  const isRunning = useFlowStore((s) => s.isRunning)
  const runFlow = useFlowStore((s) => s.runFlow)
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const edgeStyle = useFlowStore((s) => s.edgeStyle)
  const loadFlow = useFlowStore((s) => s.loadFlow)

  // `pos` starts at bottom-center, then keeps whatever the user dragged it to.
  const position = pos

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: position.x,
        origY: position.y,
        moved: 0,
      }
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [position.x, position.y],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    drag.moved = Math.hypot(dx, dy)
    const el = containerRef.current
    const width = el?.offsetWidth ?? CIRCLE
    const height = el?.offsetHeight ?? CIRCLE
    setPos(clampToViewport(drag.origX + dx, drag.origY + dy, width, height))
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current
      dragRef.current = null
      setDragging(false)
      if (drag && drag.moved < 5) {
        setOpen((v) => !v)
      }
      e.currentTarget.releasePointerCapture(e.pointerId)
    },
    [],
  )

  const handleExport = useCallback(() => {
    const json = serializeFlow(nodes, edges, edgeStyle)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `promptflow-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Flow exported')
  }, [nodes, edges, edgeStyle])

  const handleImportFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const parsed = parseFlow(String(reader.result ?? ''))
        if (!parsed.nodes.length && !parsed.edges.length) {
          const json = String(reader.result ?? '').trim()
          if (json && json !== '{"version":2,"nodes":[],"edges":[]}') {
            toast.error('That file is not a valid PromptFlow export.')
            return
          }
        }
        loadFlow(parsed.nodes, parsed.edges, parsed.edgeStyle)
        toast.success('Flow imported')
      }
      reader.onerror = () => toast.error('Could not read that file.')
      reader.readAsText(file)
    },
    [loadFlow],
  )

  const containerWidth = CIRCLE + (open ? PANEL_WIDTH : 0)

  return (
    <>
      <div
        ref={containerRef}
        className="absolute z-30"
        style={{
          left: position.x,
          top: position.y,
          touchAction: 'none',
        }}
      >
        <div
          className={`flex items-center overflow-hidden rounded-full border border-charcoal-700 bg-charcoal-900/95 shadow-2xl backdrop-blur transition-[width] duration-300 ease-[cubic-bezier(.2,.9,.25,1)] ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ width: containerWidth, height: CIRCLE }}
        >
          {/* Toggle circle — drag to move, tap to expand */}
          <button
            type="button"
            aria-label="Toggle actions"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-charcoal-300 transition-colors hover:text-charcoal-50"
          >
            <svg
              className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M4 10h6" />
              <path d="M13 4v12" />
            </svg>
          </button>

          {/* Expanding action bar */}
          <div
            className="flex items-center overflow-hidden transition-opacity duration-300"
            style={{ opacity: open ? 1 : 0, width: open ? PANEL_WIDTH : 0 }}
          >
            <div className="mx-1 h-6 w-px shrink-0 bg-charcoal-700" />

            <button
              type="button"
              onClick={runFlow}
              disabled={isRunning}
              className="flex h-full w-[84px] shrink-0 items-center justify-center gap-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 4.5v11l9-5.5-9-5.5Z" />
                </svg>
              )}
              {isRunning ? 'Run…' : 'Run'}
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="flex h-full w-[40px] shrink-0 items-center justify-center text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50"
              title="Export flow as JSON"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3v10" />
                <path d="M6 9l4 4 4-4" />
                <path d="M4 16h12" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-full w-[40px] shrink-0 items-center justify-center text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50"
              title="Import flow from JSON"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13V3" />
                <path d="M6 7l4-4 4 4" />
                <path d="M4 16h12" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="flex h-full w-[40px] shrink-0 items-center justify-center text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50"
              title="How PromptFlow works"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 14v-4" />
                <path d="M10 8h.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImportFile(file)
          e.target.value = ''
        }}
      />

      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}
    </>
  )
}