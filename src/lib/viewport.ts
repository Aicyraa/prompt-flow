export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/**
 * The viewport that brings `node` (flow coordinates) fully inside the part of
 * the canvas not covered by overlays, or null when it is already visible.
 * `covered` is how many px the right and bottom edges are hidden by panels.
 * When the node is bigger than the free area its top-left corner wins.
 */
export function revealViewport(
  viewport: Viewport,
  node: Box,
  container: { width: number; height: number },
  covered: { right: number; bottom: number },
  margin = 16,
): Viewport | null {
  const { x: vx, y: vy, zoom } = viewport
  const left = node.x * zoom + vx
  const right = (node.x + node.width) * zoom + vx
  const top = node.y * zoom + vy
  const bottom = (node.y + node.height) * zoom + vy

  const freeRight = container.width - covered.right - margin
  const freeBottom = container.height - covered.bottom - margin

  let dx = 0
  if (right > freeRight) dx = freeRight - right
  if (left + dx < margin) dx = margin - left
  let dy = 0
  if (bottom > freeBottom) dy = freeBottom - bottom
  if (top + dy < margin) dy = margin - top

  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return null
  return { x: vx + dx, y: vy + dy, zoom }
}
