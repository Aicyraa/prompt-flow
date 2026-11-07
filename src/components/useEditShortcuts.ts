import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useGraphStore } from '../store/graphStore'

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

/**
 * Canvas editing shortcuts: undo/redo, copy/paste, duplicate. They never fire
 * while typing, so the browser's own text undo and copy keep working.
 */
export function useEditShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || isTyping(e.target)) return
      const store = useGraphStore.getState()
      const key = e.key.toLowerCase()

      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        store.undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        store.redo()
      } else if (key === 'c') {
        if (store.copySelection()) e.preventDefault()
      } else if (key === 'v') {
        if (store.pasteClipboard() > 0) e.preventDefault()
      } else if (key === 'd') {
        // Ctrl+D is "bookmark" in browsers; claim it only when there is a selection.
        if (store.nodes.some((n) => n.selected)) {
          e.preventDefault()
          if (store.duplicateSelection() > 0)
            toast('Duplicated', { duration: 1200 })
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
