import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CloseIcon } from './Icon'
import { useExitAnimation } from './useExitAnimation'

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** Tailwind max-width class for the panel. */
  widthClass?: string
}

/**
 * Accessible dialog on the native <dialog> element: it renders in the top
 * layer, traps focus, closes on Escape, and returns focus on close.
 */
export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  widthClass = 'max-w-md',
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { closing, requestClose } = useExitAnimation(onClose)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // Escape: play the exit animation instead of vanishing.
      onCancel={(e) => {
        e.preventDefault()
        requestClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
      className={`m-auto w-full bg-transparent p-4 text-charcoal-50 backdrop:bg-black/80 backdrop:backdrop-blur-sm ${
        closing ? 'backdrop:animate-fade-out' : 'backdrop:animate-fade-in'
      }`}
      style={{ maxWidth: 'none' }}
    >
      <div
        className={`${closing ? 'animate-pop-out' : 'animate-pop-in'} mx-auto flex max-h-[80vh] w-full flex-col overflow-hidden rounded-2xl border border-charcoal-700 bg-charcoal-900 shadow-2xl ${widthClass}`}
      >
        <header className="flex items-center justify-between border-b border-charcoal-800 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-sm font-semibold text-charcoal-50">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-charcoal-400">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="rounded p-1 text-charcoal-400 transition-colors hover:bg-charcoal-800 hover:text-charcoal-200"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="overflow-y-auto">{children}</div>
        {footer && (
          <footer className="border-t border-charcoal-800 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  )
}
