// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('animates in once and pulses only while running', () => {
    const shell = () =>
      screen.getByText('body').parentElement!.parentElement as HTMLElement
    const { rerender } = setup()
    expect(shell().parentElement!.className).toContain('animate-pop-in')
    expect(shell().className).not.toContain('animate-running-glow')

    useRunStore.setState({ nodes: { n1: { status: 'running' } } })
    rerender(
      <ReactFlowProvider>
        <NodeShell id="n1" type="llm" label="LLM">
          <p>body</p>
        </NodeShell>
      </ReactFlowProvider>,
    )
    expect(shell().className).toContain('animate-running-glow')
    // The entrance lives on the wrapper so a status change never replays it.
    expect(shell().parentElement!.className).toContain('animate-pop-in')
  })
})

describe('NodeShell retry', () => {
  const failed = (errorKind: string, error = 'Something broke') =>
    useRunStore.setState({
      isRunning: false,
      nodes: { n1: { status: 'error', error, errorKind } },
    })

  it('offers Retry on a failed node and re-runs from that node', async () => {
    const user = userEvent.setup()
    const run = vi.fn(async () => ({ succeeded: true }))
    failed('rate_limit', 'Rate limited')
    useRunStore.setState({ run: run as never })
    setup()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(run).toHaveBeenCalledWith({ from: 'n1' })
  })

  it('shows Open settings instead of Retry for key problems', () => {
    failed('invalid_key', 'Key rejected')
    setup()
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
  })

  it('disables Retry while another run is in flight', () => {
    failed('timeout', 'Too slow')
    useRunStore.setState({ isRunning: true })
    setup()
    expect(
      (screen.getByRole('button', { name: 'Retry' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })
})
