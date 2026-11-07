import { lazy, Suspense, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Toaster } from 'react-hot-toast'
import Canvas from './components/Canvas'
import { syncModels } from './store/connection'
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
  // Load the model list once (cached for 24h, refreshed in the background).
  useEffect(() => {
    void syncModels()
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
            background: '#161310',
            color: '#DED8CF',
            border: '1px solid #2E2822',
            fontSize: '13px',
            maxWidth: '360px',
          },
        }}
      />
    </div>
  )
}
