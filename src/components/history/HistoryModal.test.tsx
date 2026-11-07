// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useHistoryStore, type HistoryEntry } from '../../store/historyStore'
import { useSettingsStore } from '../../store/settingsStore'
import HistoryModal from './HistoryModal'

const run = (
  id: string,
  result: string,
  over: Partial<HistoryEntry> = {},
): HistoryEntry => ({
  id,
  startedAt: Date.parse('2026-03-01T10:00:00Z') + (id === 'old' ? 0 : 60_000),
  durationMs: 1500,
  outcome: 'completed',
  nodes: [
    {
      id: `${id}-llm`,
      label: 'Agent',
      type: 'llm',
      status: 'done',
      model: 'a/model',
      usage: { promptTokens: 100, completionTokens: 50, cost: 0.002 },
      ms: 1200,
      output: result,
    },
    {
      id: `${id}-out`,
      label: 'Output',
      type: 'output',
      status: 'done',
      output: result,
    },
  ],
  ...over,
})

beforeEach(() => {
  useSettingsStore.setState({ historyOpen: true, saveHistory: true })
  useHistoryStore.setState({
    entries: [
      run('new', 'line one\nline TWO\nline three'),
      run('old', 'line one\nline two\nline three'),
    ],
  })
})
afterEach(cleanup)

describe('HistoryModal', () => {
  it('renders nothing while closed', () => {
    useSettingsStore.setState({ historyOpen: false })
    const { container } = render(<HistoryModal />)
    expect(container.firstChild).toBeNull()
  })

  it('shows an empty state', () => {
    useHistoryStore.setState({ entries: [] })
    render(<HistoryModal />)
    expect(screen.getByText(/No runs yet/)).toBeTruthy()
  })

  it('lists runs and shows the newest run result and steps', () => {
    render(<HistoryModal />)
    expect(
      within(screen.getByRole('list', { name: 'Runs' })).getAllByRole('button'),
    ).toHaveLength(2)
    const details = screen.getByRole('region', { name: 'Run details' })
    expect(within(details).getByText(/line TWO/)).toBeTruthy()
    expect(within(details).getByText(/a\/model/)).toBeTruthy()
  })

  it('switches to another run', async () => {
    const user = userEvent.setup()
    render(<HistoryModal />)
    const [, older] = within(
      screen.getByRole('list', { name: 'Runs' }),
    ).getAllByRole('button')
    await user.click(older)
    expect(
      within(screen.getByRole('region', { name: 'Run details' })).getByText(
        /line two/,
      ),
    ).toBeTruthy()
  })

  it('compares two runs with a line diff', async () => {
    const user = userEvent.setup()
    render(<HistoryModal />)
    await user.selectOptions(
      screen.getByLabelText('Compare with'),
      screen.getAllByRole('option')[1],
    )
    const diff = screen.getByLabelText('Difference between the two results')
    expect(diff.textContent).toContain('− line two')
    expect(diff.textContent).toContain('+ line TWO')
  })

  it('deletes a run and clears all', async () => {
    const user = userEvent.setup()
    render(<HistoryModal />)
    await user.click(screen.getByRole('button', { name: 'Delete run' }))
    expect(useHistoryStore.getState().entries.map((e) => e.id)).toEqual(['old'])
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(useHistoryStore.getState().entries).toEqual([])
  })

  it('says when saving is turned off', () => {
    useSettingsStore.setState({ saveHistory: false })
    render(<HistoryModal />)
    expect(screen.getByText('Saving is turned off in Settings')).toBeTruthy()
  })
})
