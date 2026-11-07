import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useReactFlow } from '@xyflow/react'
import { downloadFile } from '../../lib/browserFile'
import { parseFlowStrict, serializeFlow } from '../../lib/serialization'
import { useGraphStore } from '../../store/graphStore'
import { showUndoToast } from '../ui/undoToast'

/** Import/export of the flow as a JSON file. */
export function useFlowFile() {
  const loadFlow = useGraphStore((s) => s.loadFlow)
  const { fitView } = useReactFlow()

  const exportFlow = useCallback(() => {
    const { nodes, edges, edgeStyle, variables } = useGraphStore.getState()
    downloadFile(
      `promptflow-${new Date().toISOString().slice(0, 10)}.json`,
      serializeFlow(nodes, edges, edgeStyle, variables),
      'application/json',
    )
    toast.success('Flow exported')
  }, [])

  const importFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const parsed = parseFlowStrict(String(reader.result ?? ''))
        if (!parsed) {
          toast.error('That file is not a valid PromptFlow export.')
          return
        }
        const replaced = useGraphStore.getState().nodes.length > 0
        loadFlow(parsed.nodes, parsed.edges, parsed.edgeStyle, parsed.variables)
        if (replaced) showUndoToast('Flow imported, replacing your canvas')
        else toast.success('Flow imported')
        requestAnimationFrame(
          () => void fitView({ padding: 0.2, duration: 300 }),
        )
      }
      reader.onerror = () => toast.error('Could not read that file.')
      reader.readAsText(file)
    },
    [loadFlow, fitView],
  )

  /** Opens the file picker, then imports the chosen flow. */
  const pickFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) importFile(file)
    }
    input.click()
  }, [importFile])

  return { exportFlow, importFile, pickFile }
}
