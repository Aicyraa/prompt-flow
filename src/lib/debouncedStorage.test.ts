import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebouncedStorage, flushPendingWrites } from './debouncedStorage'

type S = { n: number }
const value = (n: number) => ({ state: { n }, version: 1 })

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

describe('createDebouncedStorage', () => {
  it('coalesces rapid writes into one write of the latest value', () => {
    const spy = vi.spyOn(localStorage, 'setItem')
    const store = createDebouncedStorage<S>(300)
    for (let i = 1; i <= 50; i++) store.setItem('k', value(i))
    expect(localStorage.getItem('k')).toBeNull()

    vi.advanceTimersByTime(299)
    expect(localStorage.getItem('k')).toBeNull()
    vi.advanceTimersByTime(2)
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual(value(50))
    expect(spy.mock.calls.filter((c) => c[0] === 'k')).toHaveLength(1)
    spy.mockRestore()
  })

  it('restarts the quiet period on each write', () => {
    const store = createDebouncedStorage<S>(300)
    store.setItem('k', value(1))
    vi.advanceTimersByTime(200)
    store.setItem('k', value(2))
    vi.advanceTimersByTime(200)
    expect(localStorage.getItem('k')).toBeNull()
    vi.advanceTimersByTime(101)
    expect(JSON.parse(localStorage.getItem('k')!).state.n).toBe(2)
  })

  it('flush writes immediately, and flushPendingWrites reaches every storage', () => {
    const a = createDebouncedStorage<S>(300)
    const b = createDebouncedStorage<S>(300)
    a.setItem('a', value(1))
    b.setItem('b', value(2))
    a.flush()
    expect(localStorage.getItem('a')).not.toBeNull()
    expect(localStorage.getItem('b')).toBeNull()
    flushPendingWrites()
    expect(localStorage.getItem('b')).not.toBeNull()
  })

  it('reads back what was written, and null for missing or corrupt data', () => {
    const store = createDebouncedStorage<S>()
    expect(store.getItem('nope')).toBeNull()
    store.setItem('k', value(7))
    store.flush()
    expect(store.getItem('k')).toEqual(value(7))
    localStorage.setItem('bad', '{not json')
    expect(store.getItem('bad')).toBeNull()
  })

  it('removeItem cancels a pending write', () => {
    const store = createDebouncedStorage<S>(300)
    store.setItem('k', value(1))
    store.removeItem('k')
    vi.advanceTimersByTime(1000)
    expect(localStorage.getItem('k')).toBeNull()
  })

  it('never throws when storage is full', () => {
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    const store = createDebouncedStorage<S>(10)
    store.setItem('k', value(1))
    expect(() => vi.advanceTimersByTime(20)).not.toThrow()
    // the write was really attempted, so the guard is exercised
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
