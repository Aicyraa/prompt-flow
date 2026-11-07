import { useRef, useState } from 'react'
import type { NodeType } from '../../types/flow'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import GuideModal from '../panels/GuideModal'
import { useRunAction } from '../run/useRunAction'
import { Icon, type IconName } from '../ui/Icon'
import NodePalette from './NodePalette'
import { useFlowFile } from './useFlowFile'
import { useShortcuts } from './useShortcuts'
import { useDraggable } from './useDraggable'

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-md text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-charcoal-50'

function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: IconName
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={iconButton}
    >
      <Icon name={icon} />
    </button>
  )
}

export default function TopBar({ onAdd }: { onAdd: (type: NodeType) => void }) {
  const isRunning = useRunStore((s) => s.isRunning)
  const stopRun = useRunStore((s) => s.stop)
  const hasSeenGuide = useSettingsStore((s) => s.hasSeenGuide)
  const markGuideSeen = useSettingsStore((s) => s.markGuideSeen)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const openHistory = useSettingsStore((s) => s.openHistory)
  const collapsed = useSettingsStore((s) => s.toolbarCollapsed)
  const setCollapsed = useSettingsStore((s) => s.setToolbarCollapsed)
  const { ref, style, gripProps } = useDraggable()
  const runFlow = useRunAction()
  const { exportFlow, importFile } = useFlowFile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  // The guide opens once, automatically, on a first visit.
  const [guideOpen, setGuideOpen] = useState(!hasSeenGuide)

  const openGuide = () => setGuideOpen(true)
  const closeGuide = () => {
    setGuideOpen(false)
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
        ref={ref}
        style={style}
        aria-label="Toolbar"
        className="fixed z-20 flex max-w-[calc(100vw-1rem)] flex-wrap items-center gap-2 rounded-xl border border-charcoal-700 bg-charcoal-900/95 px-2 py-1.5 shadow-2xl backdrop-blur"
      >
        <button
          type="button"
          {...gripProps}
          title="Drag to move (double-click to reset)"
          aria-label="Move toolbar"
          className="flex h-8 w-5 cursor-grab touch-none items-center justify-center rounded text-charcoal-500 hover:text-charcoal-200 active:cursor-grabbing"
        >
          <Icon name="grip" />
        </button>

        {collapsed ? (
          <IconButton
            icon="settings"
            label="Show toolbar"
            onClick={() => setCollapsed(false)}
          />
        ) : (
          <>
            <NodePalette onAdd={onAdd} />

            <div className="flex items-center">
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
              <IconButton
                icon="settings"
                label="Settings"
                onClick={openSettings}
              />
              <IconButton
                icon="help"
                label="How PromptFlow works (?)"
                onClick={openGuide}
              />
              <IconButton
                icon="collapse"
                label="Collapse toolbar"
                onClick={() => setCollapsed(true)}
              />
            </div>
          </>
        )}
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

      {guideOpen && <GuideModal onClose={closeGuide} />}
    </>
  )
}
