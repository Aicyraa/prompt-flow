// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import NodeShell from './NodeShell'

const setup = () =>
  render(
    <ReactFlowProvider>
      <NodeShell id="n1" type="llm" label="LLM" hasTarget hasSource>
        <p>body</p>
      </NodeShell>
    </ReactFlowProvider>,
  )

beforeEach(() => {
  useRunStore.setState({ nodes: {}, order: [] })
  useSettingsStore.setState({ settingsOpen: false })
})
afterEach(cleanup)

describe('NodeShell', () => {
  it('shows status as text, not only a colour dot', () => {
    useRunStore.setState({ nodes: { n1: { status: 'running' } } })
    setup()
    expect(screen.getByText('Running')).toBeTruthy()
  })

  it('shows the error on the node with an accessible alert', () => {
    useRunStore.setState({
      nodes: { n1: { status: 'error', error: 'Rate limited by OpenRouter.' } },
    })
    setup()
    expect(screen.getByRole('alert').textContent).toContain('Rate limited')
    expect(screen.queryByRole('button', { name: 'Open settings' })).toBeNull()
  })

  it('offers Open settings for key errors', async () => {
    const user = userEvent.setup()
    useRunStore.setState({
      nodes: {
        n1: { status: 'error', error: 'No API key.', errorKind: 'no_key' },
      },
    })
    setup()
    await user.click(screen.getByRole('button', { name: 'Open settings' }))
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('labels the connection handles', () => {
    setup()
    expect(
      document.querySelector('[aria-label="Input connection"]'),
    ).toBeTruthy()
    expect(
      document.querySelector('[aria-label="Output connection"]'),
    ).toBeTruthy()
  })
})
