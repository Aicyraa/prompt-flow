// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import Modal from './Modal'
import { EXIT_MS, useExitAnimation } from './useExitAnimation'
import { renderHook } from '@testing-library/react'

function stubMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  )
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useExitAnimation', () => {
  it('holds "closing" for the animation, then finishes once', () => {
    stubMotion(false)
    const done = vi.fn()
    const { result } = renderHook(() => useExitAnimation(done))
    act(() => result.current.requestClose())
    expect(result.current.closing).toBe(true)
    expect(done).not.toHaveBeenCalled()
    act(() => result.current.requestClose()) // a second request is ignored
    act(() => void vi.advanceTimersByTime(EXIT_MS + 10))
    expect(done).toHaveBeenCalledTimes(1)
  })

  it('closes immediately when the user prefers reduced motion', () => {
    stubMotion(true)
    const done = vi.fn()
    const { result } = renderHook(() => useExitAnimation(done))
    act(() => result.current.requestClose())
    expect(done).toHaveBeenCalledTimes(1)
    expect(result.current.closing).toBe(false)
  })

  it('does not fire after it was unmounted mid-animation', () => {
    stubMotion(false)
    const done = vi.fn()
    const { result, unmount } = renderHook(() => useExitAnimation(done))
    act(() => result.current.requestClose())
    unmount()
    vi.advanceTimersByTime(EXIT_MS * 2)
    expect(done).not.toHaveBeenCalled()
  })
})

describe('Modal exit', () => {
  const setup = (onClose = vi.fn()) => {
    render(
      <Modal title="Hello" onClose={onClose}>
        <p>body</p>
      </Modal>,
    )
    return onClose
  }

  it('fades out on the close button before calling onClose', () => {
    stubMotion(false)
    const onClose = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }))
    expect(onClose).not.toHaveBeenCalled()
    expect(document.querySelector('.animate-pop-out')).not.toBeNull()
    act(() => void vi.advanceTimersByTime(EXIT_MS + 10))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('treats Escape (the dialog "cancel" event) the same way', () => {
    stubMotion(false)
    const onClose = setup()
    const event = new Event('cancel', { cancelable: true })
    act(() => void document.querySelector('dialog')!.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(true) // we handle closing ourselves
    act(() => void vi.advanceTimersByTime(EXIT_MS + 10))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes at once with reduced motion', () => {
    stubMotion(true)
    const onClose = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
