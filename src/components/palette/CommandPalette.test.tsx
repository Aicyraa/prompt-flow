// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import CommandPalette from './CommandPalette'

function setup(onAdd = vi.fn()) {
  render(
    <ReactFlowProvider>
      <CommandPalette onAdd={onAdd} />
    </ReactFlowProvider>,
  )
  return onAdd
}

const search = () => screen.getByRole('combobox', { name: 'Search commands' })
const options = () => screen.getAllByRole('option')

beforeEach(() => {
  useGraphStore.setState({
    nodes: [],
    edges: [],
    past: [],
    future: [],
    clipboard: null,
  })
  useRunStore.setState({ isRunning: false, nodes: {} })
  useSettingsStore.setState({
    paletteOpen: true,
    settingsOpen: false,
    historyOpen: false,
    guideOpen: false,
    showMinimap: true,
  })
})
afterEach(cleanup)

describe('CommandPalette', () => {
  it('opens focused on the search box, listing grouped commands', () => {
    setup()
    expect(document.activeElement).toBe(search())
    expect(screen.getByText('Add')).toBeTruthy()
    expect(screen.getByRole('option', { name: /Add Agent node/ })).toBeTruthy()
    expect(screen.getByRole('option', { name: /Run flow/ })).toBeTruthy()
  })

  it('hides commands that cannot run right now', () => {
    setup()
    // empty canvas, nothing to undo, not running
    expect(screen.queryByRole('option', { name: /^Undo/ })).toBeNull()
    expect(screen.queryByRole('option', { name: /Tidy layout/ })).toBeNull()
    expect(screen.queryByRole('option', { name: /Stop run/ })).toBeNull()
  })

  it('filters as you type and runs the top match with Enter, then closes', async () => {
    const user = userEvent.setup()
    const onAdd = setup()
    await user.type(search(), 'add agent')
    expect(options()).toHaveLength(1)
    await user.keyboard('{Enter}')
    expect(onAdd).toHaveBeenCalledWith('llm')
    expect(useSettingsStore.getState().paletteOpen).toBe(false)
  })

  it('moves the highlight with the arrow keys', async () => {
    const user = userEvent.setup()
    setup()
    expect(options()[0].getAttribute('aria-selected')).toBe('true')
    await user.keyboard('{ArrowDown}')
    expect(options()[1].getAttribute('aria-selected')).toBe('true')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(options()[options().length - 1].getAttribute('aria-selected')).toBe(
      'true',
    )
  })

  it('opens settings from a click', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('option', { name: /Open settings/ }))
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
    expect(useSettingsStore.getState().paletteOpen).toBe(false)
  })

  it('finds a node by name and selects it', async () => {
    const user = userEvent.setup()
    const node = useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    useGraphStore.getState().updateNodeData(node.id, { label: 'Summariser' })
    useGraphStore.getState().clearSelection()
    setup()
    await user.type(search(), 'summar')
    await user.keyboard('{Enter}')
    expect(useGraphStore.getState().nodes[0].selected).toBe(true)
  })

  it('says so when nothing matches', async () => {
    const user = userEvent.setup()
    setup()
    await user.type(search(), 'zzzzqq')
    expect(screen.getByText(/Nothing matches/)).toBeTruthy()
    expect(
      within(screen.getByRole('listbox')).queryAllByRole('option'),
    ).toHaveLength(0)
  })

  it('toggles the minimap command label', async () => {
    const user = userEvent.setup()
    setup()
    await user.type(search(), 'minimap')
    await user.keyboard('{Enter}')
    expect(useSettingsStore.getState().showMinimap).toBe(false)
  })
})
