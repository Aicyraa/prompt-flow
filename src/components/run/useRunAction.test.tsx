// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, renderHook } from '@testing-library/react'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useRunAction } from './useRunAction'

const run = vi.fn()

beforeEach(() => {
  run.mockReset()
  useRunStore.setState({ run: run as never })
  useSettingsStore.setState({ settingsOpen: false })
})
afterEach(cleanup)

describe('useRunAction', () => {
  it('opens Settings when the provider rejects the key mid-run', async () => {
    run.mockResolvedValue({
      succeeded: false,
      failedNodeId: 'n1',
      error: 'The provider rejected the API key.',
      errorKind: 'invalid_key',
    })
    const { result } = renderHook(() => useRunAction())
    await result.current()
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('leaves Settings closed for an ordinary failure', async () => {
    run.mockResolvedValue({
      succeeded: false,
      failedNodeId: 'n1',
      error: 'Rate limited',
      errorKind: 'rate_limit',
    })
    const { result } = renderHook(() => useRunAction())
    await result.current()
    expect(useSettingsStore.getState().settingsOpen).toBe(false)
  })

  it('passes options through, so a node can retry just itself and what follows', async () => {
    run.mockResolvedValue({ succeeded: true })
    const { result } = renderHook(() => useRunAction())
    await result.current({ from: 'n2' })
    expect(run).toHaveBeenCalledWith({ from: 'n2' })
  })
})
