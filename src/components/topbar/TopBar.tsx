import { useRef, useState } from 'react'
import type { NodeType } from '../../types/flow'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import GuideModal from '../panels/GuideModal'
import { useRunAction } from '../run/useRunAction'
import { Icon, type IconName } from '../ui/Icon'
import KeyStatusChip from './KeyStatusChip'
import NodePalette from './NodePalette'
import { useFlowFile } from './useFlowFile'
import { useShortcuts } from './useShortcuts'

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
      <header className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-2 border-b border-charcoal-800 bg-charcoal-900/90 px-3 py-2 backdrop-blur md:flex-nowrap">
        <span className="mr-auto text-sm font-semibold tracking-tight text-charcoal-50 md:mr-0">
          PromptFlow
        </span>

        <div className="order-last flex basis-full justify-center overflow-x-auto md:order-none md:min-w-0 md:flex-1 md:basis-auto">
          <NodePalette onAdd={onAdd} />
        </div>

        <KeyStatusChip />

        <button
          type="button"
          onClick={() => void runFlow()}
          disabled={isRunning}
          aria-busy={isRunning}
          title="Run flow (Ctrl/⌘+Enter)"
          className="flex items-center gap-1.5 rounded-md bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name={isRunning ? 'spinner' : 'play'} className="h-3.5 w-3.5" />
          {isRunning ? 'Running…' : 'Run'}
        </button>

        {isRunning && (
          <button
            type="button"
            onClick={stopRun}
            title="Stop the run (Esc)"
            className="flex items-center gap-1.5 rounded-md border border-rose-400/50 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-950/50"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-sm bg-current"
            />
            Stop
          </button>
        )}

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
