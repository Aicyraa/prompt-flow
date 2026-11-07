// @vitest-environment jsdom
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { useRunStore } from '../../store/runStore'
import OutputNode from './OutputNode'

const run = vi.fn(async () => ({ succeeded: true }))

const props = {
  id: 'o1',
  data: { type: 'output', label: 'Output' },
  selected: false,
}

function setup() {
  render(
    <ReactFlowProvider>
      {/* Only the props OutputNode reads; the rest of NodeProps is irrelevant here. */}
      <OutputNode
        {...(props as unknown as ComponentProps<typeof OutputNode>)}
      />
    </ReactFlowProvider>,
  )
}

beforeEach(() => {
  run.mockClear()
  useRunStore.setState({ isRunning: false, run: run as never })
})
afterEach(cleanup)

describe('OutputNode run controls', () => {
  it('runs the flow from the node header', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('swaps Run for Stop while running', async () => {
    const user = userEvent.setup()
    const stop = vi.fn()
    useRunStore.setState({ isRunning: true, stop })
    setup()
    expect(screen.queryByRole('button', { name: 'Run' })).toBeNull()
    await user.click(screen.getByRole('button', { name: /Stop/ }))
    expect(stop).toHaveBeenCalledTimes(1)
  })
})

describe('OutputNode streaming and summary', () => {
  it('shows an upstream node’s partial text while it is still generating', async () => {
    const { useGraphStore } = await import('../../store/graphStore')
    useGraphStore.setState({
      nodes: [],
      edges: [{ id: 'e1', source: 'llm1', target: 'o1' }],
    })
    useRunStore.setState({
      isRunning: true,
      nodes: { llm1: { status: 'running', output: 'Partial **answer**' } },
    })
    setup()
    expect(await screen.findByText('Generating…')).toBeTruthy()
    expect(screen.getByText(/Partial/)).toBeTruthy()
    expect(screen.queryByText(/Run the flow to see/)).toBeNull()
  })

  it('shows tokens, cost and steps for the finished run', async () => {
    const { useGraphStore } = await import('../../store/graphStore')
    useGraphStore.setState({ nodes: [], edges: [] })
    useRunStore.setState({
      isRunning: false,
      nodes: {
        llm1: {
          status: 'done',
          output: 'x',
          startedAt: 1000,
          endedAt: 3000,
          usage: { promptTokens: 100, completionTokens: 50, cost: 0.002 },
        },
        o1: {
          status: 'done',
          output: 'Final text',
          startedAt: 3000,
          endedAt: 3100,
        },
      },
    })
    setup()
    expect(
      await screen.findByText(
        /2 steps · 150 tokens \(100 in \/ 50 out\) · \$0\.002/,
      ),
    ).toBeTruthy()
  })
})

describe('OutputNode stopping', () => {
  it('shows a disabled "Stopping…" button while the run winds down', () => {
    useRunStore.setState({ isRunning: true, stopping: true })
    setup()
    const button = screen.getByRole('button', { name: /Stopping/ })
    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
  })
})
