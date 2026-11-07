// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
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
  it('always shows a labelled Run button and runs on click', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('runs with Ctrl+Enter, even while typing', async () => {
    const user = userEvent.setup()
    setup()
    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('disables Run and marks it busy while a run is in flight', () => {
    useRunStore.setState({ isRunning: true })
    setup()
    const btn = screen.getByRole('button', { name: /Running/ })
    expect(btn).toHaveProperty('disabled', true)
    expect(btn.getAttribute('aria-busy')).toBe('true')
  })

  it('adds nodes from the palette', async () => {
    const user = userEvent.setup()
    const onAdd = setup()
    await user.click(screen.getByRole('button', { name: 'Add Agent node' }))
    expect(onAdd).toHaveBeenCalledWith('llm')
  })

  it('shows key state and opens Settings from the chip', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /No API key/ }))
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('reflects a verified key', () => {
    useSettingsStore.setState({
      byokEnabled: true,
      apiKey: 'sk-or-v1-x',
      keyStatus: 'valid',
    })
    setup()
    expect(screen.getAllByText('Key verified').length).toBeGreaterThan(0)
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

  it('opens the guide with "?"', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.queryByText('How PromptFlow works')).toBeNull()
    await user.keyboard('?')
    expect(screen.getByText('How PromptFlow works')).toBeTruthy()
  })

  it('shows a Stop button only while running, and Esc stops the run', async () => {
    const user = userEvent.setup()
    const stop = vi.fn()
    useRunStore.setState({ isRunning: false, stop })
    const { unmount } = render(
      <ReactFlowProvider>
        <TopBar onAdd={() => {}} />
      </ReactFlowProvider>,
    )
    expect(screen.queryByRole('button', { name: /Stop/ })).toBeNull()
    await user.keyboard('{Escape}')
    expect(stop).not.toHaveBeenCalled()
    unmount()

    useRunStore.setState({ isRunning: true, stop })
    setup()
    await user.click(screen.getByRole('button', { name: /Stop/ }))
    expect(stop).toHaveBeenCalledTimes(1)
    await user.keyboard('{Escape}')
    expect(stop).toHaveBeenCalledTimes(2)
  })
})
