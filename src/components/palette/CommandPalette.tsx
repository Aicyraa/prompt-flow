import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { NodeType } from '../../types/flow'
import { useSettingsStore } from '../../store/settingsStore'
import { Icon } from '../ui/Icon'
import { filterCommands } from './commands'
import { useCommands } from './useCommands'

/** Ctrl/⌘+K: search and run any action, or jump to a node by name. */
export default function CommandPalette({
  onAdd,
}: {
  onAdd: (type: NodeType) => void
}) {
  const close = useSettingsStore((s) => s.closePalette)
  const commands = useCommands(onAdd)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = useMemo(
    () => filterCommands(commands, query),
    [commands, query],
  )
  const index = Math.min(active, Math.max(0, results.length - 1))

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    // Browsers focus the first field of a modal dialog; do it explicitly so
    // typing works the same everywhere.
    inputRef.current?.focus()
  }, [])

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView?.({ block: 'nearest' })
  }, [index, results])

  const runAt = (i: number) => {
    const command = results[i]
    if (!command) return
    close()
    command.run()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      className="m-0 mx-auto mt-[12vh] w-full max-w-xl bg-transparent p-4 text-charcoal-50 backdrop:animate-fade-in backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      style={{ maxWidth: '36rem' }}
    >
      <div className="animate-pop-in overflow-hidden rounded-2xl border border-charcoal-700 bg-charcoal-900 shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-charcoal-800 px-4">
          <Icon name="search" className="h-4 w-4 shrink-0 text-charcoal-400" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={
              results[index] ? `${listId}-${results[index].id}` : undefined
            }
            aria-label="Search commands"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((index + 1) % Math.max(1, results.length))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive(
                  (index - 1 + results.length) % Math.max(1, results.length),
                )
              } else if (e.key === 'Enter') {
                e.preventDefault()
                runAt(index)
              }
            }}
            placeholder="Type a command or a node name…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-sm text-charcoal-50 outline-none placeholder:text-charcoal-500"
          />
          <kbd className="hidden rounded border border-charcoal-700 px-1.5 py-0.5 text-[10px] text-charcoal-400 sm:block">
            Esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Commands"
          className="max-h-[50vh] overflow-y-auto p-1.5"
        >
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-charcoal-400">
              Nothing matches “{query}”.
            </li>
          )}
          {results.map((command, i) => {
            const newGroup = !query && results[i - 1]?.group !== command.group
            return (
              <li key={command.id} role="presentation">
                {newGroup && (
                  <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-charcoal-500 uppercase">
                    {command.group}
                  </p>
                )}
                <div
                  id={`${listId}-${command.id}`}
                  role="option"
                  aria-selected={i === index}
                  onMouseMove={() => setActive(i)}
                  onClick={() => runAt(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm ${
                    i === index
                      ? 'bg-charcoal-800 text-charcoal-50'
                      : 'text-charcoal-200'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {command.title}
                  </span>
                  {query && (
                    <span className="shrink-0 text-[10px] text-charcoal-500">
                      {command.group}
                    </span>
                  )}
                  {command.shortcut && (
                    <kbd className="shrink-0 rounded border border-charcoal-700 px-1.5 py-0.5 text-[10px] text-charcoal-400">
                      {command.shortcut}
                    </kbd>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </dialog>
  )
}
