import { useMemo } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { FlowNode, MergeData } from '../../types/flow'
import { byCanvasPosition, MERGE_SEPARATORS } from '../../lib/merge'
import { useGraphStore } from '../../store/graphStore'
import { selectNodeRun, useRunStore } from '../../store/runStore'
import NodeShell from '../ui/NodeShell'
import OutputPreview from '../ui/OutputPreview'

export default function MergeNode({
  id,
  data,
  selected,
}: NodeProps<FlowNode & { data: MergeData }>) {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const { status, output } = useRunStore(selectNodeRun(id))

  // The branches feeding this node, in the order they are joined.
  const inputs = useMemo(() => {
    const ids = new Set(
      edges.filter((e) => e.target === id).map((e) => e.source),
    )
    return byCanvasPosition(nodes.filter((n) => ids.has(n.id)))
  }, [nodes, edges, id])

  const separator =
    MERGE_SEPARATORS.find((s) => s.value === (data.separator ?? 'blank'))
      ?.label ?? 'Blank line'

  return (
    <NodeShell
      id={id}
      type="merge"
      label={data.label ?? 'Merge'}
      selected={selected}
      hasTarget
      hasSource
      width={288}
    >
      {inputs.length === 0 ? (
        <p className="rounded-md border border-dashed border-charcoal-700 p-2.5 text-center text-xs text-charcoal-400">
          Connect two or more branches to join them
        </p>
      ) : (
        <ol
          aria-label="Joined in this order"
          className="space-y-1 text-xs text-charcoal-200"
        >
          {inputs.map((n, i) => (
            <li
              key={n.id}
              className="flex items-center gap-2 rounded-md bg-charcoal-800/60 px-2 py-1"
            >
              <span className="w-3 text-charcoal-500">{i + 1}</span>
              <span className="truncate">
                {n.data.label?.trim() || n.data.type}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-1.5 text-[11px] text-charcoal-400">
        {separator}
        {data.labelled ? ' · names above each part' : ''} · select the node to
        change
      </p>
      {status !== 'running' && output && (
        <div className="mt-3">
          <OutputPreview
            markdown={output}
            heightClass="max-h-24"
            filename="merged"
          />
        </div>
      )}
    </NodeShell>
  )
}
