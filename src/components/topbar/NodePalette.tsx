import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { NodeType } from '../../types/flow'
import { Icon } from '../ui/Icon'
import NodeIcon from '../ui/NodeIcon'

const ITEMS: { type: NodeType; label: string; hint: string }[] = [
  { type: 'input', label: 'Input', hint: 'Raw text to start a chain' },
  {
    type: 'prompt',
    label: 'Prompt',
    hint: 'Template that wraps upstream text',
  },
  { type: 'llm', label: 'Agent', hint: 'Call a model with the prompt' },
  { type: 'output', label: 'Output', hint: 'Show and export the result' },
]

/** "Add node" dropdown: one button, four node types. */
export default function NodePalette({
  onAdd,
}: {
  onAdd: (type: NodeType) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    itemRefs.current[0]?.focus()
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(index + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(index - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`flex h-8 items-center gap-1.5 rounded-md pr-2 pl-2 text-xs font-medium transition-[color,background-color,transform] active:scale-95 ${
          open
            ? 'bg-charcoal-800 text-charcoal-50'
            : 'text-charcoal-200 hover:bg-charcoal-800 hover:text-charcoal-50'
        }`}
      >
        <Icon
          name="plus"
          className={`h-3.5 w-3.5 text-violet-300 transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
        />
        Add node
        <Icon
          name="chevron"
          className={`h-3.5 w-3.5 text-charcoal-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* No surrounding card: each choice floats on its own below the bar. */}
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Add a node"
          onKeyDown={onMenuKeyDown}
          className="absolute top-full left-0 z-30 mt-2 flex flex-col items-start gap-1.5"
        >
          {ITEMS.map(({ type, label, hint }, i) => (
            <button
              key={type}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              role="menuitem"
              title={hint}
              onClick={() => {
                onAdd(type)
                close(false)
              }}
              style={{ animationDelay: `${i * 45}ms` }}
              className="group animate-pop-in flex origin-top-left items-center gap-2.5 rounded-full bg-charcoal-900/95 py-1.5 pr-4 pl-1.5 text-left shadow-lg shadow-black/40 outline-none backdrop-blur transition-[background-color,transform] hover:bg-charcoal-800 focus-visible:bg-charcoal-800 focus-visible:ring-2 focus-visible:ring-violet-400/60 active:scale-95"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-charcoal-950 transition-transform group-hover:scale-110">
                <NodeIcon type={type} />
              </span>
              <span className="text-xs font-medium text-charcoal-50">
                {label}
              </span>
              <span className="sr-only">{hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
