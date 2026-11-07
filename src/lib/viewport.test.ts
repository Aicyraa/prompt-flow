import { describe, expect, it } from 'vitest'
import { revealViewport } from './viewport'

const container = { width: 1200, height: 800 }
const desktopPanel = { right: 332, bottom: 0 }

describe('revealViewport', () => {
  it('leaves the view alone when the node is already clear of the panel', () => {
    const node = { x: 100, y: 100, width: 288, height: 200 }
    expect(
      revealViewport({ x: 0, y: 0, zoom: 1 }, node, container, desktopPanel),
    ).toBeNull()
  })

  it('pans left just enough to clear the panel', () => {
    // right edge at 1100, free area ends at 1200 - 332 - 16 = 852
    const node = { x: 812, y: 100, width: 288, height: 200 }
    const next = revealViewport(
      { x: 0, y: 0, zoom: 1 },
      node,
      container,
      desktopPanel,
    )!
    expect(next.x).toBe(-248)
    expect(next.y).toBe(0)
    expect(next.zoom).toBe(1)
  })

  it('accounts for zoom', () => {
    const node = { x: 1000, y: 100, width: 400, height: 200 }
    // right edge on screen = 700, inside the 852px free area
    expect(
      revealViewport({ x: 0, y: 0, zoom: 0.5 }, node, container, desktopPanel),
    ).toBeNull()
  })

  it('keeps the left edge visible when the node is wider than the free area', () => {
    const node = { x: 300, y: 100, width: 900, height: 200 }
    const next = revealViewport(
      { x: 0, y: 0, zoom: 1 },
      node,
      container,
      desktopPanel,
    )!
    expect(next.x).toBe(-284) // left edge lands on the 16px margin
  })

  it('lifts a node out from under the mobile bottom sheet', () => {
    const node = { x: 50, y: 650, width: 288, height: 120 }
    const next = revealViewport({ x: 0, y: 0, zoom: 1 }, node, container, {
      right: 0,
      bottom: 480,
    })!
    expect(next.y).toBeLessThan(0)
    expect(next.x).toBe(0)
  })

  it('brings a node that is off-screen to the left back into view', () => {
    const node = { x: -400, y: 100, width: 288, height: 200 }
    const next = revealViewport(
      { x: 0, y: 0, zoom: 1 },
      node,
      container,
      desktopPanel,
    )!
    expect(next.x).toBe(416)
  })
})
