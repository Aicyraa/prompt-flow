// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import CostConfirmModal from './CostConfirmModal'

const run = vi.fn(async () => ({ succeeded: true }))

beforeEach(() => {
  run.mockClear()
  useSettingsStore.setState({ settingsOpen: false })
  useRunStore.setState({
    run: run as never,
    pendingConfirm: {
      estimate: { expected: 0.4321, max: 2, unpriced: 1 },
      options: { from: 'n1' },
    },
  })
})
afterEach(cleanup)

describe('CostConfirmModal', () => {
  it('shows the estimate and the unpriced-model caveat', () => {
    render(<CostConfirmModal />)
    expect(screen.getByText(/about \$0\.43/)).toBeTruthy()
    expect(screen.getByText(/no published price/)).toBeTruthy()
  })

  it('"Run anyway" reruns with the same options and skips the check', async () => {
    const user = userEvent.setup()
    render(<CostConfirmModal />)
    await user.click(screen.getByRole('button', { name: 'Run anyway' }))
    expect(run).toHaveBeenCalledWith({ from: 'n1', skipCostCheck: true })
  })

  it('Cancel dismisses without running', async () => {
    const user = userEvent.setup()
    render(<CostConfirmModal />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(run).not.toHaveBeenCalled()
    expect(useRunStore.getState().pendingConfirm).toBeNull()
  })

  it('renders nothing when nothing is pending', () => {
    useRunStore.setState({ pendingConfirm: null })
    const { container } = render(<CostConfirmModal />)
    expect(container.firstChild).toBeNull()
  })
})
