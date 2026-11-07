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
