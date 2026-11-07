import type { NodeProps } from '@xyflow/react'
import type { FlowNode, OutputData } from '../../types/flow'
import NodeShell from '../ui/NodeShell'
import OutputPreview from '../ui/OutputPreview'
import { useGraphStore } from '../../store/graphStore'
import { selectNodeRun, useRunStore } from '../../store/runStore'
import RunSummaryLine from '../run/RunSummaryLine'
import { useRunAction } from '../run/useRunAction'
import { Icon } from '../ui/Icon'

export default function OutputNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode & { data: OutputData }>) {
  const own = useRunStore(selectNodeRun(id)).output?.trim()
  // While an upstream node is still streaming, show its text as it arrives
  // instead of waiting for the run to finish.
  const upstream = useGraphStore((s) =>
    s.edges
      .filter((e) => e.target === id)
      .map((e) => e.source)
      .join('|'),
  )
  const live = useRunStore((s) => {
    for (const source of upstream.split('|')) {
      const run = s.nodes[source]
      if (run?.status === 'running' && run.output) return run.output.trim()
    }
    return undefined
  })
  const streaming = !own && Boolean(live)
  const output = own || live
  const isRunning = useRunStore((s) => s.isRunning)
  const stopRun = useRunStore((s) => s.stop)
  const runFlow = useRunAction()

  return (
    <NodeShell
      id={id}
      type="output"
      label={data.label ?? 'Output'}
      selected={selected}
      hasTarget
      resizable
      actions={
        isRunning ? (
          <button
            type="button"
            onClick={stopRun}
            title="Stop the run (Esc)"
            className="nodrag flex items-center gap-1 rounded-md border border-rose-400/50 px-2 py-0.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-950/50"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-sm bg-current"
            />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void runFlow()}
            title="Run flow (Ctrl/⌘+Enter)"
            className="nodrag flex items-center gap-1 rounded-md bg-violet-500 px-2 py-0.5 text-[11px] font-semibold text-white transition-[background-color,transform] hover:bg-violet-400 active:scale-95"
          >
            <Icon name="play" className="h-3 w-3" />
            Run
          </button>
        )
      }
    >
      {output ? (
        <>
          <OutputPreview
            markdown={output}
            fill
            filename="output"
            streaming={streaming}
          />
          {!streaming && <RunSummaryLine />}
        </>
      ) : (
        <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-charcoal-700 p-3 text-center text-xs text-charcoal-400">
          Run the flow to see the result here
        </p>
      )}
    </NodeShell>
  )
}
