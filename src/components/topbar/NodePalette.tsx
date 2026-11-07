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
        className="flex h-8 items-center gap-1.5 rounded-md border border-charcoal-700 bg-charcoal-800/60 pr-2 pl-2.5 text-xs font-medium text-charcoal-100 transition-[color,background-color,border-color,transform] hover:border-charcoal-500 hover:bg-charcoal-800 active:scale-95"
      >
        <Icon name="plus" className="h-3.5 w-3.5 text-violet-300" />
        Add node
        <Icon
          name="chevron"
          className={`h-3.5 w-3.5 text-charcoal-400 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Add a node"
          onKeyDown={onMenuKeyDown}
          className="animate-pop-in absolute top-full left-0 z-30 mt-1.5 w-64 origin-top-left rounded-xl border border-charcoal-700 bg-charcoal-900 p-1 shadow-2xl"
        >
          {ITEMS.map(({ type, label, hint }, i) => (
            <button
              key={type}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              role="menuitem"
              onClick={() => {
                onAdd(type)
                close(false)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition-colors hover:bg-charcoal-800 focus-visible:bg-charcoal-800"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-charcoal-700 bg-charcoal-950">
                <NodeIcon type={type} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-charcoal-50">
                  {label}
                </span>
                <span className="block truncate text-[11px] text-charcoal-400">
                  {hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
