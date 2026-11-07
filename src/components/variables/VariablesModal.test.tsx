// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import VariablesModal from './VariablesModal'

function addPrompt(template: string, label?: string) {
  const g = useGraphStore.getState()
  const n = g.addNode('prompt', { x: 0, y: 0 })
  g.updateNodeData(n.id, { template, ...(label ? { label } : {}) })
}

const run = vi.fn(async () => ({ succeeded: true }))

beforeEach(() => {
  run.mockClear()
  useGraphStore.setState({
    nodes: [],
    edges: [],
    variables: {},
    past: [],
    future: [],
    clipboard: null,
  })
  useRunStore.setState({ isRunning: false, run: run as never })
  useSettingsStore.setState({ variablesOpen: true })
})
afterEach(cleanup)

describe('VariablesModal', () => {
  it('renders nothing while closed', () => {
    useSettingsStore.setState({ variablesOpen: false })
    render(<VariablesModal />)
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
  })

  it('explains how variables work when the flow has none', () => {
    render(<VariablesModal />)
    expect(screen.getByText('No variables yet.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Run flow' })).toBeNull()
  })

  it('shows a field per variable and stores what you type', async () => {
    const user = userEvent.setup()
    addPrompt('Write about {{topic}} in {{tone}}: {{input}}')
    render(<VariablesModal />)
    await user.type(screen.getByLabelText('{{topic}}'), 'cats')
    expect(useGraphStore.getState().variables.topic).toBe('cats')
    expect(screen.getByLabelText('{{tone}}')).toBeTruthy()
    expect(screen.getAllByText(/Used in Prompt/).length).toBe(2)
  })

  it('only offers Run once every variable has a value', async () => {
    const user = userEvent.setup()
    addPrompt('{{a}} {{b}}')
    render(<VariablesModal />)
    const runButton = screen.getByRole('button', {
      name: 'Run flow',
    }) as HTMLButtonElement
    expect(runButton.disabled).toBe(true)
    await user.type(screen.getByLabelText('{{a}}'), 'x')
    expect(runButton.disabled).toBe(true)
    await user.type(screen.getByLabelText('{{b}}'), 'y')
    expect(runButton.disabled).toBe(false)
    await user.click(runButton)
    expect(run).toHaveBeenCalledTimes(1)
    expect(useSettingsStore.getState().variablesOpen).toBe(false)
  })

  it('does not list a {{Label}} that points at another node', () => {
    const g = useGraphStore.getState()
    const a = g.addNode('input', { x: 0, y: 0 })
    g.updateNodeData(a.id, { label: 'Article', text: 'x' })
    addPrompt('Summarise {{Article}} for {{audience}}')
    render(<VariablesModal />)
    expect(screen.queryByLabelText('{{Article}}')).toBeNull()
    expect(screen.getByLabelText('{{audience}}')).toBeTruthy()
  })
})
