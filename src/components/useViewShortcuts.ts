import { useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useViewActions } from './useViewActions'

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

/** Ctrl/⌘+K opens the command palette; F fits the view (or the selection). */
export function useViewShortcuts() {
  const { fitAll, fitSelection } = useViewActions()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        e.key.toLowerCase() === 'k'
      ) {
        // Works while typing too: it is how you get out of a text box.
        e.preventDefault()
        useSettingsStore.getState().togglePalette()
        return
      }
      if (
        e.key.toLowerCase() === 'f' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isTyping(e.target) &&
        !document.querySelector('dialog[open]')
      ) {
        e.preventDefault()
        if (e.shiftKey) fitAll()
        else fitSelection()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fitAll, fitSelection])
}
