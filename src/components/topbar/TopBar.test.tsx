// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { useGraphStore } from '../../store/graphStore'
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

describe('TopBar view tools', () => {
  it('opens the command palette from the search button', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({ paletteOpen: false })
    setup()
    await user.click(screen.getByRole('button', { name: 'Search commands' }))
    expect(useSettingsStore.getState().paletteOpen).toBe(true)
  })

  it('toggles the minimap', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({ showMinimap: true })
    setup()
    await user.click(screen.getByRole('button', { name: 'Hide minimap' }))
    expect(useSettingsStore.getState().showMinimap).toBe(false)
    expect(screen.getByRole('button', { name: 'Show minimap' })).toBeTruthy()
  })

  it('keeps Tidy disabled until there is something to arrange', () => {
    useGraphStore.setState({ nodes: [], edges: [] })
    setup()
    expect(
      (screen.getByRole('button', { name: 'Tidy layout' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it('tidies a messy flow in one undoable step', async () => {
    const user = userEvent.setup()
    useGraphStore.setState({
      nodes: [],
      edges: [],
      past: [],
      future: [],
      clipboard: null,
    })
    const g = useGraphStore.getState()
    const a = g.addNode('input', { x: 900, y: 500 })
    const b = g.addNode('llm', { x: 0, y: 0 })
    g.connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    setup()
    await user.click(screen.getByRole('button', { name: 'Tidy layout' }))
    const [na, nb] = useGraphStore.getState().nodes
    expect(na.position.x).toBeLessThan(nb.position.x)
    useGraphStore.getState().undo()
    expect(useGraphStore.getState().nodes[0].position).toEqual({
      x: 900,
      y: 500,
    })
  })
})

describe('TopBar variables', () => {
  it('opens the variables dialog', async () => {
    const user = userEvent.setup()
    useGraphStore.setState({ nodes: [], edges: [], variables: {} })
    useSettingsStore.setState({ variablesOpen: false })
    setup()
    await user.click(screen.getByRole('button', { name: 'Variables' }))
    expect(useSettingsStore.getState().variablesOpen).toBe(true)
  })

  it('says how many variables still need a value', () => {
    useGraphStore.setState({ nodes: [], edges: [], variables: { a: 'x' } })
    const g = useGraphStore.getState()
    const n = g.addNode('prompt', { x: 0, y: 0 })
    g.updateNodeData(n.id, { template: '{{a}} {{b}} {{c}}' })
    setup()
    expect(
      screen.getByRole('button', { name: 'Variables (2 need a value)' }),
    ).toBeTruthy()
  })
})
