// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
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

describe('TopBar layout', () => {
  it('is a fixed bar with no product name, grip or collapse control', () => {
    setup()
    expect(screen.getByRole('banner', { name: 'Toolbar' })).toBeTruthy()
    expect(screen.queryByText('PromptFlow')).toBeNull()
    expect(screen.queryByRole('button', { name: /Move toolbar/ })).toBeNull()
    expect(
      screen.queryByRole('button', { name: /Collapse toolbar/ }),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: /^Run$|API key/ })).toBeNull()
  })
})

describe('Add node dropdown', () => {
  it('lists the four node types only while open', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.queryByRole('menu')).toBeNull()
    const trigger = screen.getByRole('button', { name: /Add node/ })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    await user.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const items = within(screen.getByRole('menu')).getAllByRole('menuitem')
    expect(items.map((i) => i.textContent)).toEqual([
      expect.stringContaining('Input'),
      expect.stringContaining('Prompt'),
      expect.stringContaining('Agent'),
      expect.stringContaining('Output'),
    ])
  })

  it('adds the chosen node and closes', async () => {
    const user = userEvent.setup()
    const onAdd = setup()
    await user.click(screen.getByRole('button', { name: /Add node/ }))
    await user.click(screen.getByRole('menuitem', { name: /Agent/ }))
    expect(onAdd).toHaveBeenCalledWith('llm')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('moves with the arrow keys, and Escape closes and refocuses the button', async () => {
    const user = userEvent.setup()
    setup()
    const trigger = screen.getByRole('button', { name: /Add node/ })
    await user.click(trigger)
    expect(document.activeElement).toBe(
      screen.getByRole('menuitem', { name: /Input/ }),
    )
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(
      screen.getByRole('menuitem', { name: /Prompt/ }),
    )
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(document.activeElement).toBe(
      screen.getByRole('menuitem', { name: /Output/ }),
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when clicking elsewhere', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Add node/ }))
    await user.click(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })
})
