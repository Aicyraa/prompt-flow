// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { useFlowLibrary } from '../../store/flowLibraryStore'
import { useGraphStore } from '../../store/graphStore'
import { useSettingsStore } from '../../store/settingsStore'
import FlowsModal from './FlowsModal'

vi.mock('../ui/undoToast', () => ({ showUndoToast: vi.fn() }))
import { showUndoToast } from '../ui/undoToast'

function setup() {
  render(
    <ReactFlowProvider>
      <FlowsModal />
    </ReactFlowProvider>,
  )
}

const graph = () => useGraphStore.getState()
const lib = () => useFlowLibrary.getState()

beforeEach(() => {
  vi.mocked(showUndoToast).mockClear()
  localStorage.clear()
  useGraphStore.setState({
    nodes: [],
    edges: [],
    variables: {},
    past: [],
    future: [],
    clipboard: null,
  })
  useFlowLibrary.setState({ flows: [], activeId: null })
  useSettingsStore.setState({ flowsOpen: true })
})
afterEach(cleanup)

describe('FlowsModal', () => {
  it('explains saved flows when there are none, and offers to name the canvas', () => {
    setup()
    expect(screen.getByText(/Saved flows live in this browser/)).toBeTruthy()
    expect(screen.getByLabelText('Flow name')).toBeTruthy()
    expect(screen.getByText(/isn’t saved to a flow yet/)).toBeTruthy()
  })

  it('saves the canvas under a name and then autosaves into it', async () => {
    const user = userEvent.setup()
    graph().addNode('input', { x: 0, y: 0 })
    setup()
    await user.type(screen.getByLabelText('Flow name'), 'My flow')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(lib().flows[0]).toMatchObject({ name: 'My flow', nodeCount: 1 })
    expect(lib().activeId).toBe(lib().flows[0].id)
    // the name box goes away once the canvas belongs to a flow
    expect(screen.queryByLabelText('Flow name')).toBeNull()
    expect(screen.getByText(/Autosaving to “My flow”/)).toBeTruthy()
  })

  it('opens another flow and warns when that replaced an unsaved canvas', async () => {
    const user = userEvent.setup()
    graph().addNode('input', { x: 0, y: 0 })
    const saved = lib().saveAs('Saved one')
    lib().newFlow('Second')
    useFlowLibrary.setState({ activeId: null }) // leave a loose canvas
    graph().addNode('llm', { x: 0, y: 0 })
    graph().addNode('llm', { x: 5, y: 5 })
    setup()
    await user.click(screen.getByRole('button', { name: /^Saved one/ }))
    expect(lib().activeId).toBe(saved)
    expect(graph().nodes).toHaveLength(1)
    expect(showUndoToast).toHaveBeenCalledTimes(1)
    expect(useSettingsStore.getState().flowsOpen).toBe(false)
  })

  it('does not nag when nothing unsaved was replaced', async () => {
    const user = userEvent.setup()
    graph().addNode('input', { x: 0, y: 0 })
    const a = lib().saveAs('A')
    lib().newFlow('B')
    setup()
    await user.click(screen.getByRole('button', { name: /^A1 node/ }))
    expect(lib().activeId).toBe(a)
    expect(showUndoToast).not.toHaveBeenCalled()
  })

  it('renames a flow in place', async () => {
    const user = userEvent.setup()
    lib().saveAs('Old name')
    setup()
    await user.click(screen.getByRole('button', { name: 'Rename Old name' }))
    const box = screen.getByLabelText('New name')
    await user.clear(box)
    await user.type(box, 'Better name{Enter}')
    expect(lib().flows[0].name).toBe('Better name')
  })

  it('duplicates, and makes you confirm before deleting', async () => {
    const user = userEvent.setup()
    lib().saveAs('Solo')
    setup()
    await user.click(screen.getByRole('button', { name: 'Duplicate Solo' }))
    expect(lib().flows.map((f) => f.name)).toContain('Solo copy')

    await user.click(screen.getByRole('button', { name: 'Delete Solo copy' }))
    expect(lib().flows).toHaveLength(2) // first click only asks
    await user.click(
      screen.getByRole('button', { name: 'Confirm delete Solo copy' }),
    )
    expect(lib().flows.map((f) => f.name)).toEqual(['Solo'])
  })

  it('"New empty flow" starts a blank, named flow and closes', async () => {
    const user = userEvent.setup()
    graph().addNode('input', { x: 0, y: 0 })
    lib().saveAs('First')
    setup()
    await user.click(screen.getByRole('button', { name: 'New empty flow' }))
    expect(graph().nodes).toHaveLength(0)
    expect(lib().flows).toHaveLength(2)
    expect(within(document.body).queryByText('New empty flow')).not.toBeNull()
    expect(useSettingsStore.getState().flowsOpen).toBe(false)
  })
})
