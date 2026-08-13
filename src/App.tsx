import { ReactFlowProvider } from '@xyflow/react'
import { Toaster } from 'react-hot-toast'
import Canvas from './components/Canvas'

export default function App() {
  return (
    <div className="h-full w-full bg-charcoal-950 text-charcoal-100">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
      <Toaster position="bottom-right" />
    </div>
  )
}
