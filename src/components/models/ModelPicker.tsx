import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ModelInfo } from '../../lib/openrouter'
import { useModelStore } from '../../store/modelStore'
import { useSettingsStore } from '../../store/settingsStore'
import ModelBadges from './ModelBadge'
import {
  DEFAULT_FILTERS,
  filterModels,
  type ModelFilters,
  type SortKey,
} from './modelFilter'

const MAX_RENDERED = 100
const POPOVER_WIDTH = 352
const POPOVER_MAX_HEIGHT = 384

interface ModelPickerProps {
  value: string
  onChange: (modelId: string) => void
  /** Id for the trigger so an external <label htmlFor> can point at it. */
  id?: string
  /** Shown on the trigger when `value` is empty (e.g. an "add" picker). */
  placeholder?: string
  /** Tailwind classes for the trigger's focus border. */
  focusClass?: string
}

interface Placement {
  left: number
  top?: number
  bottom?: number
}

function place(trigger: HTMLElement): Placement {
  const r = trigger.getBoundingClientRect()
  const left = Math.min(
    Math.max(8, r.left),
    Math.max(8, window.innerWidth - POPOVER_WIDTH - 8),
  )
  const roomBelow = window.innerHeight - r.bottom
  return roomBelow >= 280
    ? { left, top: r.bottom + 4 }
    : { left, bottom: window.innerHeight - r.top + 4 }
}

export default function ModelPicker({
  value,
  onChange,
  id,
  placeholder,
  focusClass = 'focus-visible:border-violet-400/60',
}: ModelPickerProps) {
  const usable = useModelStore((s) => s.usable)
  const status = useModelStore((s) => s.status)
  const hasCatalog = useModelStore((s) => s.hasCatalog)
  const load = useModelStore((s) => s.load)
  const favourites = useSettingsStore((s) => s.favouriteModels)
  const recents = useSettingsStore((s) => s.recentModels)
  const toggleFavourite = useSettingsStore((s) => s.toggleFavourite)
  const pushRecent = useSettingsStore((s) => s.pushRecent)

  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<ModelFilters>(DEFAULT_FILTERS)
  const [active, setActive] = useState(0)
  const [placement, setPlacement] = useState<Placement>({ left: 8 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const selected = useMemo(
    () => usable.find((m) => m.id === value),
    [usable, value],
  )
  const missing = hasCatalog && !selected && value !== ''

  const pinned = useMemo(
    () => [...favourites, ...recents.filter((r) => !favourites.includes(r))],
    [favourites, recents],
  )
  const results = useMemo(
    () => filterModels(usable, filters, pinned),
    [usable, filters, pinned],
  )
  const shown = results.slice(0, MAX_RENDERED)

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const openPicker = () => {
    if (triggerRef.current) setPlacement(place(triggerRef.current))
    setFilters(DEFAULT_FILTERS)
    setActive(0)
    setOpen(true)
    void load()
  }

  const choose = (model: ModelInfo) => {
    onChange(model.id)
    pushRecent(model.id)
    close()
  }

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (popoverRef.current?.contains(t) || triggerRef.current?.contains(t)) {
        return
      }
      setOpen(false)
    }
    const dismiss = () => setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', dismiss)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', dismiss)
    }
  }, [open])

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const model = shown[active]
      if (model) choose(model)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  useEffect(() => {
    if (!open) return
    document
      .getElementById(`${listId}-${active}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open, listId])

  const optionId = (i: number) => `${listId}-${i}`

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openPicker())}
        className={`nodrag flex w-full items-center justify-between gap-2 rounded-md border bg-charcoal-800/70 px-2 py-1.5 text-left text-sm text-charcoal-50 outline-none ${
          missing ? 'border-amber-400/60' : 'border-charcoal-700'
        } ${focusClass}`}
      >
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate ${value ? '' : 'text-charcoal-400'}`}
          >
            {selected?.name ?? (value || placeholder)}
          </span>
          {missing && (
            <span className="block text-[10px] text-amber-300">
              Not in the OpenRouter catalog. Pick another.
            </span>
          )}
        </span>
        <span aria-hidden="true" className="text-charcoal-400">
          ▾
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="nodrag nowheel fixed z-[60] flex flex-col overflow-hidden rounded-xl border border-charcoal-700 bg-charcoal-900 shadow-2xl"
            style={{
              ...placement,
              width: POPOVER_WIDTH,
              maxHeight: POPOVER_MAX_HEIGHT,
            }}
          >
            <div className="space-y-2 border-b border-charcoal-800 p-2">
              <input
                ref={searchRef}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={
                  shown.length ? optionId(active) : undefined
                }
                aria-label="Search models"
                value={filters.query}
                onChange={(e) => {
                  setFilters({ ...filters, query: e.target.value })
                  setActive(0)
                }}
                onKeyDown={onSearchKeyDown}
                placeholder="Search models…"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-md border border-charcoal-700 bg-charcoal-800/70 px-2 py-1.5 text-sm text-charcoal-50 outline-none placeholder:text-charcoal-400 focus:border-violet-400/60"
              />
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {(
                  [
                    ['freeOnly', 'Free'],
                    ['reasoningOnly', 'Reasoning'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-1 text-charcoal-300"
                  >
                    <input
                      type="checkbox"
                      checked={filters[key]}
                      onChange={(e) => {
                        setFilters({ ...filters, [key]: e.target.checked })
                        setActive(0)
                      }}
                      className="accent-violet-400"
                    />
                    {label}
                  </label>
                ))}
                <label className="ml-auto flex items-center gap-1 text-charcoal-300">
                  Sort
                  <select
                    value={filters.sort}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        sort: e.target.value as SortKey,
                      })
                      setActive(0)
                    }}
                    className="rounded border border-charcoal-700 bg-charcoal-800 px-1 py-0.5 text-charcoal-100"
                  >
                    <option value="newest">Newest</option>
                    <option value="cheapest">Cheapest</option>
                    <option value="context">Context</option>
                    <option value="name">Name</option>
                  </select>
                </label>
              </div>
            </div>

            <ul
              id={listId}
              role="listbox"
              aria-label="Models"
              className="min-h-0 flex-1 overflow-y-auto p-1"
            >
              {shown.map((model, i) => (
                <li key={model.id} role="presentation" className="flex">
                  <div
                    id={optionId(i)}
                    role="option"
                    aria-selected={model.id === value}
                    onClick={() => choose(model)}
                    onMouseMove={() => setActive(i)}
                    className={`min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1.5 ${
                      i === active ? 'bg-charcoal-800' : ''
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm text-charcoal-50">
                        {model.name}
                      </span>
                      {model.id === value && (
                        <span className="text-[10px] text-emerald-300">
                          selected
                        </span>
                      )}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-charcoal-400">
                      {model.id}
                    </span>
                    <ModelBadges model={model} />
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => toggleFavourite(model.id)}
                    aria-label={
                      favourites.includes(model.id)
                        ? `Remove ${model.name} from favourites`
                        : `Add ${model.name} to favourites`
                    }
                    aria-pressed={favourites.includes(model.id)}
                    className="px-2 text-sm text-charcoal-400 hover:text-amber-300"
                  >
                    {favourites.includes(model.id) ? '★' : '☆'}
                  </button>
                </li>
              ))}
              {shown.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-charcoal-400">
                  {status === 'loading'
                    ? 'Loading models…'
                    : 'No models match.'}
                </li>
              )}
            </ul>

            <p className="border-t border-charcoal-800 px-3 py-1.5 text-[10px] text-charcoal-400">
              {status === 'error' && !hasCatalog
                ? 'Could not load the catalog; showing a short built-in list.'
                : results.length > MAX_RENDERED
                  ? `Showing ${MAX_RENDERED} of ${results.length}. Refine your search.`
                  : `${results.length} models`}
            </p>
          </div>,
          document.body,
        )}
    </>
  )
}
