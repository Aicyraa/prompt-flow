import { lazy, Suspense, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Toaster } from 'react-hot-toast'
import Canvas from './components/Canvas'
import { syncModels } from './store/connection'
import { startFlowAutosave } from './store/flowLibraryStore'
import { applyTheme } from './lib/theme'
import { useRunStore } from './store/runStore'
import { useSettingsStore } from './store/settingsStore'

// Dialogs the user may never open load on demand, keeping the first paint small.
const SettingsModal = lazy(() => import('./components/settings/SettingsModal'))
const HistoryModal = lazy(() => import('./components/history/HistoryModal'))
const CostConfirmModal = lazy(() => import('./components/run/CostConfirmModal'))
const VariablesModal = lazy(
  () => import('./components/variables/VariablesModal'),
)

function Dialogs() {
  const settingsOpen = useSettingsStore((s) => s.settingsOpen)
  const historyOpen = useSettingsStore((s) => s.historyOpen)
  const variablesOpen = useSettingsStore((s) => s.variablesOpen)
  const costPending = useRunStore((s) => s.pendingConfirm !== null)
  return (
    <Suspense fallback={null}>
      {settingsOpen && <SettingsModal />}
      {historyOpen && <HistoryModal />}
      {variablesOpen && <VariablesModal />}
      {costPending && <CostConfirmModal />}
    </Suspense>
  )
}

export default function App() {
  const theme = useSettingsStore((s) => s.theme)
  // Apply the chosen theme, and follow the system while set to "system".
  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyTheme('system')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [theme])

  // Load the model list once (cached for 24h, refreshed in the background).
  useEffect(() => {
    void syncModels()
    // Keep the open saved flow in step with the canvas.
    return startFlowAutosave()
  }, [])

  return (
    <div className="h-full w-full bg-charcoal-950 text-charcoal-100">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
      <Dialogs />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'rgb(var(--charcoal-900))',
            color: 'rgb(var(--charcoal-100))',
            border: '1px solid rgb(var(--charcoal-700))',
            fontSize: '13px',
            maxWidth: '360px',
          },
        }}
      />
    </div>
  )
}
