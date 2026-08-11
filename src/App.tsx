import { Toaster } from 'react-hot-toast'
import Canvas from './components/Canvas'

export default function App() {
  return (
    <div className="h-full w-full bg-slate-950 text-slate-200">
      <Canvas />
      <Toaster position="bottom-right" />
    </div>
  )
}
