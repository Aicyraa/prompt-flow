import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useGraphStore } from '../store/graphStore'
import { tidyPositions } from '../lib/layout'

/** Rough node sizes for nodes React Flow hasn't measured yet. */
const FALLBACK_SIZE = {
  input: { width: 288, height: 150 },
  prompt: { width: 288, height: 190 },
  llm: { width: 320, height: 210 },
  output: { width: 380, height: 300 },
} as const

/** How long the "glide to new position" CSS class stays on the canvas. */
const GLIDE_MS = 600

/** Layout and camera actions shared by the toolbar, shortcuts and palette. */
export function useViewActions() {
  const { fitView } = useReactFlow()

  const fitAll = useCallback(
    () => void fitView({ padding: 0.2, duration: 350, maxZoom: 1.2 }),
    [fitView],
  )

  const fitSelection = useCallback(() => {
    const selected = useGraphStore.getState().nodes.filter((n) => n.selected)
    if (selected.length === 0) return fitAll()
    void fitView({
      nodes: selected,
      padding: 0.4,
      duration: 350,
      maxZoom: 1.2,
    })
  }, [fitView, fitAll])

  /** Arranges the whole flow left to right; one undo step. */
  const tidy = useCallback(() => {
    const { nodes, edges, applyPositions } = useGraphStore.getState()
    if (nodes.length < 2) return false
    const positions = tidyPositions(
      nodes.map((n) => {
        const fallback = FALLBACK_SIZE[n.data.type]
        return {
          id: n.id,
          x: n.position.x,
          y: n.position.y,
          width: n.measured?.width ?? n.width ?? fallback.width,
          height: n.measured?.height ?? n.height ?? fallback.height,
        }
      }),
      edges,
    )
    // Let nodes glide to their new spots instead of jumping.
    document.documentElement.classList.add('is-tidying')
    window.setTimeout(
      () => document.documentElement.classList.remove('is-tidying'),
      GLIDE_MS,
    )
    applyPositions(positions)
    requestAnimationFrame(() => fitAll())
    return true
  }, [fitAll])

  return { fitAll, fitSelection, tidy }
}
