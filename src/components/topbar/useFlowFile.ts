import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useReactFlow } from '@xyflow/react'
import { downloadFile } from '../../lib/browserFile'
import { parseFlowStrict, serializeFlow } from '../../lib/serialization'
import { useGraphStore } from '../../store/graphStore'

/** Import/export of the flow as a JSON file. */
export function useFlowFile() {
  const loadFlow = useGraphStore((s) => s.loadFlow)
  const { fitView } = useReactFlow()

  const exportFlow = useCallback(() => {
    const { nodes, edges, edgeStyle } = useGraphStore.getState()
    downloadFile(
      `promptflow-${new Date().toISOString().slice(0, 10)}.json`,
      serializeFlow(nodes, edges, edgeStyle),
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
        loadFlow(parsed.nodes, parsed.edges, parsed.edgeStyle)
        toast.success('Flow imported')
        requestAnimationFrame(
          () => void fitView({ padding: 0.2, duration: 300 }),
        )
      }
      reader.onerror = () => toast.error('Could not read that file.')
      reader.readAsText(file)
    },
    [loadFlow, fitView],
  )

  return { exportFlow, importFile }
}
