import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { useSettingsStore } from '../../store/settingsStore'

const MARGIN = 4

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

/** Drag a fixed-position element by a grip; the position persists in settings. */
export function useDraggable() {
  const pos = useSettingsStore((s) => s.toolbarPos)
  const setPos = useSettingsStore((s) => s.setToolbarPos)
  const ref = useRef<HTMLElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)

  const place = useCallback((x: number, y: number) => {
    const el = ref.current
    if (!el) return { x, y }
    return {
      x: clamp(x, MARGIN, window.innerWidth - el.offsetWidth - MARGIN),
      y: clamp(y, MARGIN, window.innerHeight - el.offsetHeight - MARGIN),
    }
  }, [])

  // Keep a saved position on-screen after a resize or a smaller viewport.
  useLayoutEffect(() => {
    if (!pos) return
    const next = place(pos.x, pos.y)
    if (next.x !== pos.x || next.y !== pos.y) setPos(next)
  }, [pos, place, setPos])

  useEffect(() => {
    const onResize = () => {
      const current = useSettingsStore.getState().toolbarPos
      if (current) setPos(place(current.x, current.y))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [place, setPos])

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el || e.button !== 0) return
    const rect = el.getBoundingClientRect()
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return
    setPos(place(e.clientX - drag.current.dx, e.clientY - drag.current.dy))
  }
  const end = (e: PointerEvent<HTMLElement>) => {
    drag.current = null
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const style: CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { left: '50%', top: MARGIN * 2, transform: 'translateX(-50%)' }

  return {
    ref,
    style,
    gripProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onDoubleClick: () => setPos(null),
    },
  }
}
