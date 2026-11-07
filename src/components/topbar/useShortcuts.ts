import { useEffect } from 'react'

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return Boolean(
    el &&
    (el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.tagName === 'SELECT' ||
      el.isContentEditable),
  )
}

interface Shortcuts {
  run: () => void
  /** Called on Escape while a run is in flight. */
  stop?: () => void
  openGuide: () => void
}

/** Ctrl/⌘+Enter runs the flow; "?" opens the guide (when not typing). */
export function useShortcuts({ run, stop, openGuide }: Shortcuts) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        run()
      } else if (e.key === 'Escape' && stop) {
        stop()
      } else if (e.key === '?' && !isTyping(e.target)) {
        e.preventDefault()
        openGuide()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [run, stop, openGuide])
}
