// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import TopBar from './TopBar'

const run = vi.fn(async () => ({ succeeded: true }))

function setup(onAdd = vi.fn()) {
  render(
    <ReactFlowProvider>
      <TopBar onAdd={onAdd} />
    </ReactFlowProvider>,
  )
  return onAdd
}

beforeEach(() => {
  run.mockClear()
  useRunStore.setState({ isRunning: false, run: run as never })
  useSettingsStore.setState({
    byokEnabled: false,
    apiKey: '',
    keyStatus: 'unknown',
    hasSeenGuide: true,
    settingsOpen: false,
  })
})
afterEach(cleanup)

describe('TopBar', () => {
  it('runs with Ctrl+Enter, even while typing', async () => {
    const user = userEvent.setup()
    setup()
    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('adds nodes from the palette', async () => {
    const user = userEvent.setup()
    const onAdd = setup()
    await user.click(screen.getByRole('button', { name: 'Add Agent node' }))
    expect(onAdd).toHaveBeenCalledWith('llm')
  })

  it('opens the guide on a first visit only, and remembers it was seen', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({ hasSeenGuide: false })
    setup()
    expect(screen.getByText('How PromptFlow works')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Got it' }))
    expect(useSettingsStore.getState().hasSeenGuide).toBe(true)
    expect(screen.queryByText('How PromptFlow works')).toBeNull()
  })

  it('stops a run with Esc', async () => {
    const user = userEvent.setup()
    const stop = vi.fn()
    useRunStore.setState({ isRunning: true, stop })
    setup()
    await user.keyboard('{Escape}')
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('opens the guide with "?"', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.queryByText('How PromptFlow works')).toBeNull()
    await user.keyboard('?')
    expect(screen.getByText('How PromptFlow works')).toBeTruthy()
  })
})

describe('TopBar floating behaviour', () => {
  it('has no product-name heading and collapses/expands', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({ toolbarCollapsed: false, toolbarPos: null })
    setup()
    expect(screen.queryByText('PromptFlow')).toBeNull()
    expect(screen.queryByRole('button', { name: /^Run$|API key/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Collapse toolbar' }))
    expect(screen.queryByRole('button', { name: 'Add Agent node' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Show toolbar' }))
    expect(screen.getByRole('button', { name: 'Add Agent node' })).toBeTruthy()
  })

  it('resets the position on grip double-click', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({
      toolbarCollapsed: false,
      toolbarPos: { x: 10, y: 10 },
    })
    setup()
    await user.dblClick(screen.getByRole('button', { name: 'Move toolbar' }))
    expect(useSettingsStore.getState().toolbarPos).toBeNull()
  })

  it('moves with the grip and keeps the position', () => {
    useSettingsStore.setState({ toolbarCollapsed: false, toolbarPos: null })
    setup()
    const grip = screen.getByRole('button', { name: 'Move toolbar' })
    fireEvent.pointerDown(grip, { clientX: 100, clientY: 20, button: 0 })
    fireEvent.pointerMove(grip, { clientX: 140, clientY: 80 })
    fireEvent.pointerUp(grip)
    const pos = useSettingsStore.getState().toolbarPos
    expect(pos).not.toBeNull()
    expect(pos!.x).toBeGreaterThanOrEqual(4)
    expect(pos!.y).toBeGreaterThanOrEqual(4)
  })
})
