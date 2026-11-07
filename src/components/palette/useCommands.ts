import { useMemo } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { NodeType } from '../../types/flow'
import { NODE_LABELS } from '../../lib/nodes'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useRunAction } from '../run/useRunAction'
import { useRunReport } from '../run/useRunReport'
import { useFlowFile } from '../topbar/useFlowFile'
import { useViewActions } from '../useViewActions'
import { showUndoToast } from '../ui/undoToast'
import type { Command } from './commands'

const NODE_TYPES: NodeType[] = ['input', 'prompt', 'llm', 'merge', 'output']
const NODE_KEYWORDS: Record<NodeType, string> = {
  input: 'text start source',
  prompt: 'template',
  llm: 'llm model ai',
  merge: 'join combine branches concat',
  output: 'result end',
}

/** Every action the command palette can run, built from live app state. */
export function useCommands(onAdd: (type: NodeType) => void): Command[] {
  const nodes = useGraphStore((s) => s.nodes)
  const hasSelection = nodes.some((n) => n.selected)
  const canUndo = useGraphStore((s) => s.past.length > 0)
  const canRedo = useGraphStore((s) => s.future.length > 0)
  const undo = useGraphStore((s) => s.undo)
  const redo = useGraphStore((s) => s.redo)
  const duplicateSelection = useGraphStore((s) => s.duplicateSelection)
  const selectNodeOnly = useGraphStore((s) => s.selectNodeOnly)
  const clearFlow = useGraphStore((s) => s.clearFlow)
  const isRunning = useRunStore((s) => s.isRunning)
  const stop = useRunStore((s) => s.stop)
  const showMinimap = useSettingsStore((s) => s.showMinimap)
  const toggleMinimap = useSettingsStore((s) => s.toggleMinimap)
  const openSettings = useSettingsStore((s) => s.openSettings)
  const openHistory = useSettingsStore((s) => s.openHistory)
  const openGuide = useSettingsStore((s) => s.openGuide)
  const openVariables = useSettingsStore((s) => s.openVariables)
  const runFlow = useRunAction()
  const report = useRunReport()
  const { exportFlow, pickFile } = useFlowFile()
  const { tidy, fitAll, fitSelection } = useViewActions()
  const { fitView } = useReactFlow()

  return useMemo<Command[]>(() => {
    const add: Command[] = NODE_TYPES.map((type) => ({
      id: `add-${type}`,
      title: `Add ${NODE_LABELS[type]} node`,
      group: 'Add',
      keywords: NODE_KEYWORDS[type],
      run: () => onAdd(type),
    }))

    const goTo: Command[] = nodes.map((n) => ({
      id: `goto-${n.id}`,
      title: `Go to: ${n.data.label?.trim() || NODE_LABELS[n.data.type]}`,
      group: 'Go to',
      keywords: `${NODE_LABELS[n.data.type]} node`,
      run: () => {
        selectNodeOnly(n.id)
        void fitView({ nodes: [n], padding: 0.6, maxZoom: 1, duration: 350 })
      },
    }))

    return [
      ...add,
      {
        id: 'run',
        title: 'Run flow',
        group: 'Flow',
        shortcut: 'Ctrl+Enter',
        keywords: 'execute start',
        enabled: !isRunning,
        run: () => void runFlow(),
      },
      {
        id: 'stop',
        title: 'Stop run',
        group: 'Flow',
        shortcut: 'Esc',
        keywords: 'cancel abort',
        enabled: isRunning,
        run: stop,
      },
      {
        id: 'undo',
        title: 'Undo',
        group: 'Flow',
        shortcut: 'Ctrl+Z',
        enabled: canUndo,
        run: undo,
      },
      {
        id: 'redo',
        title: 'Redo',
        group: 'Flow',
        shortcut: 'Ctrl+Shift+Z',
        enabled: canRedo,
        run: redo,
      },
      {
        id: 'duplicate',
        title: 'Duplicate selected nodes',
        group: 'Flow',
        shortcut: 'Ctrl+D',
        keywords: 'copy clone',
        enabled: hasSelection,
        run: () => void duplicateSelection(),
      },
      {
        id: 'clear',
        title: 'Clear the canvas',
        group: 'Flow',
        keywords: 'delete everything new empty',
        enabled: nodes.length > 0,
        run: () => {
          clearFlow()
          showUndoToast('Canvas cleared')
        },
      },
      {
        id: 'tidy',
        title: 'Tidy layout',
        group: 'View',
        keywords: 'arrange auto align organise organize',
        enabled: nodes.length > 1,
        run: () => void tidy(),
      },
      {
        id: 'fit',
        title: 'Fit everything in view',
        group: 'View',
        shortcut: 'Shift+F',
        keywords: 'zoom',
        enabled: nodes.length > 0,
        run: fitAll,
      },
      {
        id: 'fit-selection',
        title: 'Zoom to selected nodes',
        group: 'View',
        shortcut: 'F',
        keywords: 'fit focus',
        enabled: hasSelection,
        run: fitSelection,
      },
      {
        id: 'minimap',
        title: showMinimap ? 'Hide minimap' : 'Show minimap',
        group: 'View',
        keywords: 'map overview',
        run: toggleMinimap,
      },
      ...goTo,
      {
        id: 'export',
        title: 'Export flow as JSON',
        group: 'App',
        run: exportFlow,
      },
      {
        id: 'import',
        title: 'Import flow from JSON…',
        group: 'App',
        keywords: 'open load',
        run: pickFile,
      },
      {
        id: 'report',
        title: 'Download run report (.md)',
        group: 'Flow',
        keywords: 'export markdown summary result',
        enabled: report.available,
        run: report.download,
      },
      {
        id: 'variables',
        title: 'Edit variables',
        group: 'Flow',
        keywords: 'values placeholders parameters fill',
        run: openVariables,
      },
      {
        id: 'history',
        title: 'Open run history',
        group: 'App',
        run: openHistory,
      },
      {
        id: 'settings',
        title: 'Open settings',
        group: 'App',
        keywords: 'api key provider models',
        run: openSettings,
      },
      {
        id: 'guide',
        title: 'How PromptFlow works',
        group: 'App',
        shortcut: '?',
        keywords: 'help guide tutorial',
        run: openGuide,
      },
    ]
  }, [
    nodes,
    hasSelection,
    canUndo,
    canRedo,
    isRunning,
    showMinimap,
    onAdd,
    runFlow,
    stop,
    undo,
    redo,
    duplicateSelection,
    selectNodeOnly,
    clearFlow,
    toggleMinimap,
    exportFlow,
    pickFile,
    openHistory,
    openSettings,
    openGuide,
    openVariables,
    report.available,
    report.download,
    tidy,
    fitAll,
    fitSelection,
    fitView,
  ])
}
