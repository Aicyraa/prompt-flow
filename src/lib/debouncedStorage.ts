import type { PersistStorage, StorageValue } from 'zustand/middleware'

export interface DebouncedStorage<S> extends PersistStorage<S> {
  /** Writes any pending state immediately. */
  flush: () => void
}

const registry = new Set<() => void>()
let listening = false

/** Writes everything pending (used on page hide, and by tests). */
export function flushPendingWrites() {
  registry.forEach((flush) => flush())
}

function listenOnce() {
  if (listening || typeof window === 'undefined' || !window.addEventListener) {
    return
  }
  listening = true
  // pagehide is the reliable "tab is going away" signal; hidden covers mobile.
  window.addEventListener('pagehide', flushPendingWrites)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingWrites()
  })
}

/**
 * localStorage persistence that coalesces rapid updates. Zustand hands us the
 * state object, so serialisation also waits for the quiet period instead of
 * running on every keystroke. Storage errors (quota, blocked) are swallowed:
 * persistence is best-effort and must never break editing.
 */
export function createDebouncedStorage<S>(delayMs = 300): DebouncedStorage<S> {
  const pending = new Map<string, StorageValue<S>>()
  let timer: ReturnType<typeof setTimeout> | undefined

  const flush = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    for (const [name, value] of pending) {
      try {
        localStorage.setItem(name, JSON.stringify(value))
      } catch {
        // storage full or unavailable
      }
    }
    pending.clear()
  }
  registry.add(flush)
  listenOnce()

  return {
    getItem: (name) => {
      try {
        const raw = localStorage.getItem(name)
        return raw ? (JSON.parse(raw) as StorageValue<S>) : null
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      pending.set(name, value)
      if (timer !== undefined) clearTimeout(timer)
      timer = setTimeout(flush, delayMs)
    },
    removeItem: (name) => {
      pending.delete(name)
      try {
        localStorage.removeItem(name)
      } catch {
        // ignore
      }
    },
    flush,
  }
}
