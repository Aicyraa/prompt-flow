import { useCallback, useEffect, useRef, useState } from 'react'

/** How long exit animations run (keep in step with the keyframes). */
export const EXIT_MS = 140

/** True when the user asked for less motion (or the browser can't say). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Lets something play an exit animation before it goes away. Call
 * `requestClose` instead of closing straight away; `closing` is true while the
 * animation runs, then `onDone` fires. With reduced motion it closes at once.
 */
export function useExitAnimation(onDone: () => void, ms = EXIT_MS) {
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => () => clearTimeout(timer.current), [])

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    if (prefersReducedMotion()) {
      done.current()
      return
    }
    closingRef.current = true
    setClosing(true)
    timer.current = setTimeout(() => done.current(), ms)
  }, [ms])

  return { closing, requestClose }
}
