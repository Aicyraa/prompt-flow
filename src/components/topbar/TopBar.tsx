import { useRef } from 'react'
import type { NodeType } from '../../types/flow'
import { useFlowLibrary } from '../../store/flowLibraryStore'
import { useGraphStore } from '../../store/graphStore'
import { missingVariables } from '../../lib/variables'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import GuideModal from '../panels/GuideModal'
import { useRunAction } from '../run/useRunAction'
import { Icon, type IconName } from '../ui/Icon'
import NodePalette from './NodePalette'
import { useFlowFile } from './useFlowFile'
import { useShortcuts } from './useShortcuts'
import { useViewActions } from '../useViewActions'

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-md text-charcoal-300 transition-[color,background-color,transform] active:scale-90 hover:bg-charcoal-800 hover:text-charcoal-50'

function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: IconName
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`${iconButton} disabled:pointer-events-none disabled:opacity-30`}
    >
      <Icon name={icon} />
    </button>
  )
}

export default function TopBar({ onAdd }: { onAdd: (type: NodeType) => void }) {
  const isRunning = useRunStore((s) => s.isRunning)
  const stopRun = useRunStore((s) => s.stop)
  const markGuideSeen = useSettingsStore((s) => s.markGuideSeen)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const openHistory = useSettingsStore((s) => s.openHistory)
  const canUndo = useGraphStore((s) => s.past.length > 0)
  const canRedo = useGraphStore((s) => s.future.length > 0)
  const undo = useGraphStore((s) => s.undo)
  const redo = useGraphStore((s) => s.redo)
  const runFlow = useRunAction()
  const { exportFlow, importFile } = useFlowFile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const guideOpen = useSettingsStore((s) => s.guideOpen)
  const openGuide = useSettingsStore((s) => s.openGuide)
  const closeGuide = useSettingsStore((s) => s.closeGuide)
  const openPalette = useSettingsStore((s) => s.openPalette)
  const showMinimap = useSettingsStore((s) => s.showMinimap)
  const toggleMinimap = useSettingsStore((s) => s.toggleMinimap)
  const nodeCount = useGraphStore((s) => s.nodes.length)
  const openVariables = useSettingsStore((s) => s.openVariables)
  const openFlows = useSettingsStore((s) => s.openFlows)
  const flowName = useFlowLibrary(
    (s) => s.flows.find((f) => f.id === s.activeId)?.name,
  )
  const missingCount = useGraphStore(
    (s) => missingVariables(s.nodes, s.variables).length,
  )
  const { tidy } = useViewActions()

  const dismissGuide = () => {
    closeGuide()
    markGuideSeen()
  }
  useShortcuts({
    run: () => void runFlow(),
    stop: isRunning ? stopRun : undefined,
    openGuide,
  })

  return (
    <>
      <header
        aria-label="Toolbar"
        className="relative z-20 flex h-12 shrink-0 items-center gap-2 border-b border-charcoal-800 bg-charcoal-900 px-3"
      >
        <button
          type="button"
          onClick={openFlows}
          title="Saved flows"
          aria-label={
            flowName ? `Saved flows (open: ${flowName})` : 'Saved flows'
          }
          className="flex h-8 max-w-44 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-charcoal-200 transition-[color,background-color,transform] hover:bg-charcoal-800 hover:text-charcoal-50 active:scale-95"
        >
          <Icon
            name="folder"
            className="h-3.5 w-3.5 shrink-0 text-charcoal-400"
          />
          <span className="truncate">{flowName ?? 'Flows'}</span>
        </button>
        <NodePalette onAdd={onAdd} />

        <div className="flex items-center">
          <IconButton
            icon="undo"
            label="Undo (Ctrl/⌘+Z)"
            onClick={undo}
            disabled={!canUndo}
          />
          <IconButton
            icon="redo"
            label="Redo (Ctrl/⌘+Shift+Z)"
            onClick={redo}
            disabled={!canRedo}
          />
          <IconButton
            icon="layout"
            label="Tidy layout"
            onClick={() => void tidy()}
            disabled={nodeCount < 2}
          />
        </div>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={openPalette}
            // The shortcut lives in the tooltip: visible text must match the accessible name.
            title="Search commands (Ctrl/⌘+K)"
            aria-label="Search commands"
            className="mr-1 flex h-8 items-center gap-2 rounded-md border border-charcoal-700 px-2.5 text-xs text-charcoal-400 transition-colors hover:border-charcoal-500 hover:text-charcoal-200"
          >
            <Icon name="search" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <IconButton
            icon="map"
            label={showMinimap ? 'Hide minimap' : 'Show minimap'}
            onClick={toggleMinimap}
          />
          <div className="relative">
            <IconButton
              icon="variable"
              label={
                missingCount > 0
                  ? `Variables (${missingCount} need a value)`
                  : 'Variables'
              }
              onClick={openVariables}
            />
            {missingCount > 0 && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400"
              />
            )}
          </div>
          <IconButton
            icon="download"
            label="Export flow as JSON"
            onClick={exportFlow}
          />
          <IconButton
            icon="upload"
            label="Import flow from JSON"
            onClick={() => fileInputRef.current?.click()}
          />
          <IconButton
            icon="history"
            label="Run history"
            onClick={openHistory}
          />
          <IconButton icon="settings" label="Settings" onClick={openSettings} />
          <IconButton
            icon="help"
            label="How PromptFlow works (?)"
            onClick={openGuide}
          />
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Import flow file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) importFile(file)
          e.target.value = ''
        }}
      />

      {guideOpen && <GuideModal onClose={dismissGuide} />}
    </>
  )
}
