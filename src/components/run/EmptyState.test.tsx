// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { useGraphStore } from '../../store/graphStore'
import { useSettingsStore } from '../../store/settingsStore'
import EmptyState from './EmptyState'

const setup = () =>
  render(
    <ReactFlowProvider>
      <EmptyState />
    </ReactFlowProvider>,
  )

beforeEach(() => {
  useGraphStore.setState({ nodes: [], edges: [] })
  useSettingsStore.setState({
    byokEnabled: false,
    apiKey: '',
    settingsOpen: false,
  })
})
afterEach(cleanup)

describe('EmptyState', () => {
  it('loads a template into the canvas and disappears', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByRole('button', { name: /Summarise text/ }))
    const { nodes, edges } = useGraphStore.getState()
    expect(nodes.map((n) => n.data.type)).toEqual([
      'input',
      'prompt',
      'llm',
      'output',
    ])
    expect(edges).toHaveLength(3)
    expect(container.querySelector('section')).toBeNull()
  })

  it('stays hidden once the canvas has nodes', () => {
    useGraphStore.getState().addNode('input', { x: 0, y: 0 })
    const { container } = setup()
    expect(container.querySelector('section')).toBeNull()
  })

  it('offers an Add key action when there is no key', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Add key' }))
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('hides the key prompt when a key is set', () => {
    useSettingsStore.setState({ byokEnabled: true, apiKey: 'sk-or-v1-x' })
    setup()
    expect(screen.queryByRole('button', { name: 'Add key' })).toBeNull()
  })

  it('presents three steps, with the key step marked done once a key exists', () => {
    const { rerender } = setup()
    const items = () =>
      screen.getAllByRole('listitem').filter((li) => li.querySelector('h3'))
    expect(items().map((li) => li.querySelector('h3')!.textContent)).toEqual([
      'Add your API key',
      'Pick a starting point',
      'Press Run',
    ])
    expect(screen.queryByText('(done)')).toBeNull()

    useSettingsStore.setState({ byokEnabled: true, apiKey: 'sk-or-v1-x' })
    rerender(
      <ReactFlowProvider>
        <EmptyState />
      </ReactFlowProvider>,
    )
    expect(screen.getByText('(done)')).toBeTruthy()
    expect(screen.getByText(/Key added/)).toBeTruthy()
  })

  it('offers a short tour that opens the guide', async () => {
    const user = userEvent.setup()
    useSettingsStore.setState({ guideOpen: false })
    setup()
    await user.click(
      screen.getByRole('button', { name: 'Take the quick tour' }),
    )
    expect(useSettingsStore.getState().guideOpen).toBe(true)
  })
})
