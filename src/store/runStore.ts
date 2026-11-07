import { create } from 'zustand'
import type { NodeRun, Usage } from '../types/flow'
import { resolveApiKey, type ErrorKind } from '../lib/openrouter'
import {
  executeFlow,
  getDownstreamIds,
  type NodeStatusUpdate,
} from '../engine/executeFlow'
import { estimateCost, type CostEstimate } from '../engine/estimate'
import { preflight } from '../engine/preflight'
import { nanoid } from 'nanoid'
import { useGraphStore } from './graphStore'
import { truncateOutput, useHistoryStore } from './historyStore'
import { createProviderClient } from '../lib/providers'
import { useModelStore } from './modelStore'
import { useSettingsStore } from './settingsStore'

export interface RunSummary {
  succeeded: boolean
  failedNodeId?: string
  error?: string
  /** The user stopped the run. */
  cancelled?: boolean
  /** Why the failed node failed, so callers can react (e.g. a rejected key). */
  errorKind?: string
  /** Set when the run was blocked before starting. */
  blocked?: ErrorKind | 'cost'
}

export interface RunOptions {
  /** Run only this node and everything downstream (uses cached upstream). */
  from?: string
  /** Skip the "this may be expensive" confirmation. */
  skipCostCheck?: boolean
}

interface RunStore {
  /** Execution state keyed by node id. Transient: never persisted. */
  nodes: Record<string, NodeRun>
  /** Node ids in the order they started, for the run log. */
  order: string[]
  isRunning: boolean
  /** Stop was requested; the in-flight calls are still winding down. */
  stopping: boolean
  /** Set while waiting for the user to confirm an expensive run. */
  pendingConfirm: { estimate: CostEstimate; options: RunOptions } | null
  apply: (update: NodeStatusUpdate) => void
  reset: () => void
  /** Runs the current graph. Resolves null if a run is already in flight. */
  run: (options?: RunOptions) => Promise<RunSummary | null>
  /** Aborts the run in flight. */
  stop: () => void
  dismissConfirm: () => void
}

let controller: AbortController | null = null

export const useRunStore = create<RunStore>()((set, get) => ({
  nodes: {},
  order: [],
  isRunning: false,
  stopping: false,
  pendingConfirm: null,

  apply: (update) =>
    set((state) => {
      const prev = state.nodes[update.nodeId]
      const now = Date.now()
      return {
        order: state.order.includes(update.nodeId)
          ? state.order
          : [...state.order, update.nodeId],
        nodes: {
          ...state.nodes,
          [update.nodeId]: {
            status: update.status,
            output: update.output,
            error: update.error,
            errorKind: update.errorKind,
            usage: update.usage,
            model: update.model,
            startedAt: prev?.startedAt ?? now,
            endedAt: update.status === 'running' ? undefined : now,
          },
        },
      }
    }),

  reset: () => set({ nodes: {}, order: [] }),

  stop: () => {
    if (!controller || controller.signal.aborted) return
    set({ stopping: true })
    controller.abort()
  },

  dismissConfirm: () => set({ pendingConfirm: null }),

  run: async (options = {}) => {
    if (get().isRunning) return null

    const { nodes, edges } = useGraphStore.getState()
    const settings = useSettingsStore.getState()
    const apiKey = resolveApiKey(settings)
    // Without the user's own key only the dev OpenRouter fallback applies.
    const provider = settings.byokEnabled ? settings.provider : 'openrouter'
    const { hasCatalog, models, getModel } = useModelStore.getState()

    const issues = preflight({
      nodes,
      hasKey: Boolean(apiKey),
      catalog: hasCatalog ? models : null,
    })
    if (issues.length > 0) {
      set({ nodes: {}, order: [], pendingConfirm: null })
      for (const issue of issues) {
        if (issue.nodeId) {
          get().apply({
            nodeId: issue.nodeId,
            status: 'error',
            error: issue.message,
            errorKind: issue.kind,
          })
        }
      }
      return {
        succeeded: false,
        failedNodeId: issues.find((i) => i.nodeId)?.nodeId,
        error: issues[0].message,
        blocked: issues[0].kind,
      }
    }

    const scope = options.from
      ? getDownstreamIds(edges, options.from)
      : undefined

    const threshold = useSettingsStore.getState().costThresholdUsd
    if (threshold > 0 && !options.skipCostCheck) {
      const estimate = estimateCost(nodes, edges, getModel, scope)
      if (estimate.expected > threshold) {
        set({ pendingConfirm: { estimate, options } })
        return { succeeded: false, blocked: 'cost' }
      }
    }

    // A partial run keeps earlier results (they feed the nodes being rerun).
    const previous = get().nodes
    const cached: Record<string, string> = {}
    for (const [id, run] of Object.entries(previous)) {
      if (run.status === 'done' && run.output !== undefined)
        cached[id] = run.output
    }
    if (scope) {
      const kept = Object.fromEntries(
        Object.entries(previous).filter(([id]) => !scope.has(id)),
      )
      set({
        isRunning: true,
        pendingConfirm: null,
        nodes: kept,
        order: get().order.filter((id) => !scope.has(id)),
      })
    } else {
      set({ isRunning: true, pendingConfirm: null, nodes: {}, order: [] })
    }

    controller = new AbortController()
    const startedAt = Date.now()
    try {
      const { succeeded, failedNodeId, cancelled } = await executeFlow({
        nodes,
        edges,
        client: createProviderClient(provider, apiKey),
        getModel,
        onStatus: get().apply,
        signal: controller.signal,
        from: options.from,
        cached,
      })
      if (useSettingsStore.getState().saveHistory) {
        recordHistory({
          startedAt,
          outcome: cancelled ? 'stopped' : succeeded ? 'completed' : 'failed',
          from: options.from,
          only: scope,
        })
      }
      return {
        succeeded,
        failedNodeId,
        cancelled,
        error: failedNodeId ? get().nodes[failedNodeId]?.error : undefined,
        errorKind: failedNodeId
          ? get().nodes[failedNodeId]?.errorKind
          : undefined,
      }
    } finally {
      controller = null
      set({ isRunning: false, stopping: false })
    }
  },
}))

function recordHistory({
  startedAt,
  outcome,
  from,
  only,
}: {
  startedAt: number
  outcome: 'completed' | 'failed' | 'stopped'
  from?: string
  /** Limit to these node ids (a partial run). */
  only?: Set<string>
}) {
  const { nodes: graphNodes } = useGraphStore.getState()
  const { nodes: runs, order } = useRunStore.getState()
  const label = (id: string) => {
    const n = graphNodes.find((g) => g.id === id)
    return n ? (n.data.label ?? n.data.type) : id
  }
  useHistoryStore.getState().add({
    id: nanoid(),
    startedAt,
    durationMs: Date.now() - startedAt,
    outcome,
    from: from ? label(from) : undefined,
    nodes: order
      .filter(
        (id) =>
          runs[id] &&
          (!only || only.has(id)) &&
          graphNodes.some((g) => g.id === id),
      )
      .map((id) => {
        const run = runs[id]
        return {
          id,
          label: label(id),
          type: graphNodes.find((g) => g.id === id)!.data.type,
          status: run.status,
          ...truncateOutput(run.output),
          error: run.error,
          model: run.model,
          usage: run.usage,
          ms:
            run.startedAt && run.endedAt
              ? run.endedAt - run.startedAt
              : undefined,
        }
      }),
  })
}

const IDLE: NodeRun = { status: 'idle' }

/** Selector helper: a node's run state, defaulting to idle. */
export const selectNodeRun =
  (id: string) =>
  (state: RunStore): NodeRun =>
    state.nodes[id] ?? IDLE

/** Total tokens and cost across the nodes of the current run. */
export function totalUsage(nodes: Record<string, NodeRun>): Usage & {
  priced: boolean
} {
  let promptTokens = 0
  let completionTokens = 0
  let cost = 0
  let priced = true
  for (const run of Object.values(nodes)) {
    if (!run.usage) continue
    promptTokens += run.usage.promptTokens
    completionTokens += run.usage.completionTokens
    if (run.usage.cost === undefined) priced = false
    else cost += run.usage.cost
  }
  return { promptTokens, completionTokens, cost, priced }
}
