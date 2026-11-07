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

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-md text-charcoal-300 transition-[color,background-color,transform] active:scale-90 hover:bg-charcoal-800 hover:text-charcoal-50'

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
        aria-label="Toolbar"
        className="relative z-20 flex h-12 shrink-0 items-center gap-2 border-b border-charcoal-800 bg-charcoal-900 px-3"
      >
        <NodePalette onAdd={onAdd} />

        <div className="ml-auto flex items-center">
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

      {guideOpen && <GuideModal onClose={closeGuide} />}
    </>
  )
}
