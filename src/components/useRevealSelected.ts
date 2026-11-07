import { useEffect, type RefObject } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useGraphStore } from '../store/graphStore'
import { revealViewport } from '../lib/viewport'
import { PANEL_WIDTH_PX } from './panels/panelLayout'

const DESKTOP_QUERY = '(min-width: 768px)'

/**
 * When a node is selected, the settings panel opens over part of the canvas.
 * Slide the canvas just enough that the selected node stays visible beside it.
 */
export function useRevealSelected(container: RefObject<HTMLElement | null>) {
  const selectedId = useGraphStore((s) => {
    const picked = s.nodes.filter((n) => n.selected)
    return picked.length === 1 ? picked[0].id : undefined
  })
  const { getNode, getViewport, setViewport } = useReactFlow()

  useEffect(() => {
    const el = container.current
    if (!selectedId || !el) return
    const node = getNode(selectedId)
    if (!node) return
    const rect = el.getBoundingClientRect()
    const desktop =
      typeof window.matchMedia === 'function' &&
      window.matchMedia(DESKTOP_QUERY).matches
    const next = revealViewport(
      getViewport(),
      {
        x: node.position.x,
        y: node.position.y,
        width: node.measured?.width ?? node.width ?? 288,
        height: node.measured?.height ?? node.height ?? 160,
      },
      { width: rect.width, height: rect.height },
      // Desktop: a docked side panel. Mobile: a bottom sheet up to 60% tall.
      desktop
        ? { right: PANEL_WIDTH_PX, bottom: 0 }
        : { right: 0, bottom: rect.height * 0.6 },
    )
    if (next) void setViewport(next, { duration: 260 })
    // Only when the selected node changes, not on every drag or edit.
  }, [selectedId, container, getNode, getViewport, setViewport])
}
