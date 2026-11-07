// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'react-hot-toast'
import { useGraphStore } from '../../store/graphStore'
import { showUndoToast } from './undoToast'

beforeEach(() => {
  // jsdom has no matchMedia, which react-hot-toast reads for reduced motion.
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  )
  useGraphStore.setState({
    nodes: [],
    edges: [],
    past: [],
    future: [],
    clipboard: null,
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('showUndoToast', () => {
  it('offers Undo that brings the replaced canvas back', async () => {
    const user = userEvent.setup()
    const g = useGraphStore.getState()
    g.addNode('input', { x: 0, y: 0 })
    g.addNode('llm', { x: 10, y: 0 })
    g.clearFlow()
    expect(useGraphStore.getState().nodes).toHaveLength(0)

    render(<Toaster />)
    act(() => showUndoToast('Canvas cleared'))
    expect(await screen.findByText('Canvas cleared')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(useGraphStore.getState().nodes).toHaveLength(2)
  })
})
