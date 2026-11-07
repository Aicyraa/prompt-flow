// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import RunLog from './RunLog'

beforeEach(() => {
  useGraphStore.setState({ nodes: [], edges: [] })
  useRunStore.setState({ nodes: {}, order: [], isRunning: false })
  useSettingsStore.setState({ settingsOpen: false })
})
afterEach(cleanup)

describe('RunLog', () => {
  it('renders nothing before any run', () => {
    const { container } = render(<RunLog />)
    expect(container.firstChild).toBeNull()
  })

  it('auto-opens on failure with the full error and a settings action', async () => {
    const user = userEvent.setup()
    const node = useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    render(<RunLog />)

    act(() => {
      useRunStore.getState().apply({ nodeId: node.id, status: 'running' })
      useRunStore.getState().apply({
        nodeId: node.id,
        status: 'error',
        error: 'OpenRouter rejected the API key. Check it in Settings.',
        errorKind: 'invalid_key',
      })
    })

    expect(
      screen.getAllByText(/OpenRouter rejected the API key/).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('status').textContent).toMatch(/Flow stopped/)
    await user.click(screen.getByRole('button', { name: 'Open settings' }))
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('lists completed steps in run order and selects a node on click', async () => {
    const user = userEvent.setup()
    const a = useGraphStore.getState().addNode('input', { x: 0, y: 0 })
    useGraphStore.getState().addNode('output', { x: 10, y: 0 })
    useRunStore.getState().apply({ nodeId: a.id, status: 'done' })
    render(<RunLog />)

    await user.click(screen.getByRole('button', { name: /Run log/ }))
    await user.click(screen.getByRole('button', { name: 'Input' }))
    const selected = useGraphStore.getState().nodes.filter((n) => n.selected)
    expect(selected.map((n) => n.id)).toEqual([a.id])
  })
})

describe('RunLog stopping and retry', () => {
  it('says the run is stopping', () => {
    const node = useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    useRunStore.setState({ isRunning: true, stopping: true })
    useRunStore.getState().apply({ nodeId: node.id, status: 'running' })
    render(<RunLog />)
    expect(screen.getByRole('status').textContent).toMatch(/Stopping/)
  })

  it('retries a failed step from the log', async () => {
    const user = userEvent.setup()
    const node = useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    const run = vi.fn(async () => ({ succeeded: true }))
    useRunStore.setState({ run: run as never, isRunning: false })
    render(<RunLog />)
    act(() => {
      useRunStore.getState().apply({
        nodeId: node.id,
        status: 'error',
        error: 'Rate limited',
        errorKind: 'rate_limit',
      })
    })
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(run).toHaveBeenCalledWith({ from: node.id })
  })
})
