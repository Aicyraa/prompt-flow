import type { FlowEdge, FlowNode, NodeStatus, Usage } from '../types/flow'
import {
  buildRequestParams,
  classifyError,
  NoKeyError,
  type ErrorKind,
  type GenerateContext,
  type GenerateOptions,
  type GenerateResult,
  TimeoutError,
  type ModelInfo,
  type ProviderClient,
} from '../lib/openrouter'
import { generate } from '../lib/providers'
import { DEFAULT_MODEL } from '../lib/nodes'
import { extractJson } from '../lib/json'
import { findCycleNodeIds, topologicalSort } from './topologicalSort'
import { withRetry, type RetryOptions } from './retry'

export type RunnerContext = Required<Pick<GenerateContext, 'signal'>> &
  Pick<GenerateContext, 'onToken'>

export interface LlmRunner {
  (
    options: GenerateOptions,
    ctx: RunnerContext,
  ): Promise<string | GenerateResult>
}

export interface NodeStatusUpdate {
  nodeId: string
  status: NodeStatus
  output?: string
  error?: string
  errorKind?: ErrorKind
  usage?: Usage
  /** The model that produced the output (may be a fallback). */
  model?: string
}

export interface ExecuteFlowParams {
  nodes: FlowNode[]
  edges: FlowEdge[]
  client: ProviderClient | null
  generate?: LlmRunner
  /** Catalog lookup: drops unsupported params and prices usage. */
  getModel?: (id: string) => ModelInfo | undefined
  onStatus: (update: NodeStatusUpdate) => void
  /** Aborts the run; in-flight nodes end as "cancelled". */
  signal?: AbortSignal
  /** Max nodes running at once (default 3). */
  concurrency?: number
  /** Per-attempt time limit for a model call (default 120s). */
  timeoutMs?: number
  retry?: Partial<RetryOptions>
  /** Run only this node and everything downstream of it. */
  from?: string
  /** Outputs of earlier runs, used for nodes outside a partial run. */
  cached?: Record<string, string>
}

export interface FlowExecutionResult {
  succeeded: boolean
  failedNodeId?: string
  cancelled?: boolean
}

export function getUpstreamNodeIds(
  edges: FlowEdge[],
  nodeId: string,
): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source)
}

export function applyTemplate(
  template: string,
  upstream: { label: string; value: string }[],
): string {
  const inputs = upstream.map((u) => u.value).filter((v) => v.length > 0)
  const byLabel = new Map<string, string>()
  for (const u of upstream) {
    const key = u.label.trim().toLowerCase()
    if (key && key !== 'input' && !byLabel.has(key)) byLabel.set(key, u.value)
  }

  // Single pass: substituted values are never re-scanned, so upstream text
  // that happens to contain "{{...}}" is inserted literally.
  return template.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match, name: string) => {
    const key = name.toLowerCase()
    if (key === 'input') return inputs.join('\n\n')
    return byLabel.get(key) ?? match
  })
}

function resolveNodeInput(
  node: FlowNode,
  edges: FlowEdge[],
  values: Map<string, string>,
  nodes: FlowNode[],
): string {
  const upstreamIds = getUpstreamNodeIds(edges, node.id)
  const upstreamNodes = upstreamIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is FlowNode => Boolean(n))

  if (node.data.type === 'prompt') {
    return applyTemplate(
      node.data.template ?? '',
      upstreamNodes.map((n) => ({
        label: n.data.label ?? '',
        value: values.get(n.id) ?? '',
      })),
    )
  }

  return upstreamIds.map((id) => values.get(id) ?? '').join('\n\n')
}

/** The node itself plus every node reachable from it. */
export function getDownstreamIds(edges: FlowEdge[], id: string): Set<string> {
  const seen = new Set([id])
  const stack = [id]
  while (stack.length) {
    const current = stack.pop()!
    for (const e of edges) {
      if (e.source === current && !seen.has(e.target)) {
        seen.add(e.target)
        stack.push(e.target)
      }
    }
  }
  return seen
}

const STREAM_EMIT_INTERVAL_MS = 50

/** Errors that another model could plausibly avoid. */
function canFallBack(err: unknown): boolean {
  const { kind } = classifyError(err)
  return (
    kind !== 'invalid_key' &&
    kind !== 'no_credits' &&
    kind !== 'no_key' &&
    kind !== 'bad_output'
  )
}

/** A child signal that also aborts after `ms` with a TimeoutError. */
function withTimeout(parent: AbortSignal, ms: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new TimeoutError(ms)), ms)
  const onAbort = () => controller.abort(parent.reason)
  if (parent.aborted) onAbort()
  else parent.addEventListener('abort', onAbort, { once: true })
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer)
      parent.removeEventListener('abort', onAbort)
    },
  }
}

export async function executeFlow(
  params: ExecuteFlowParams,
): Promise<FlowExecutionResult> {
  const { nodes, edges, client, onStatus } = params
  const concurrency = Math.max(1, params.concurrency ?? 3)
  const timeoutMs = params.timeoutMs ?? 120_000
  const retry: RetryOptions = { retries: 3, baseMs: 1000, ...params.retry }
  const runner: LlmRunner =
    params.generate ?? ((options, ctx) => generate(client!, options, ctx))

  const cycleIds = findCycleNodeIds(
    nodes.map((n) => n.id),
    edges,
  )
  if (cycleIds.length > 0) {
    for (const nodeId of cycleIds) {
      onStatus({
        nodeId,
        status: 'error',
        error: 'This node is part of a cycle. Remove a connection to run.',
      })
    }
    return { succeeded: false, failedNodeId: cycleIds[0] }
  }

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const active = params.from
    ? getDownstreamIds(edges, params.from)
    : new Set(nodes.map((n) => n.id))
  const order = topologicalSort(
    nodes.map((n) => n.id),
    edges,
  ).filter((id) => active.has(id))
  const orderIndex = new Map(order.map((id, i) => [id, i]))

  const values = new Map<string, string>()
  for (const [id, value] of Object.entries(params.cached ?? {})) {
    if (!active.has(id)) values.set(id, value)
  }

  // Internal controller: aborts on Stop (external) or on the first failure,
  // so sibling branches stop spending tokens.
  const internal = new AbortController()
  const { signal } = internal
  const onExternalAbort = () => internal.abort(params.signal?.reason)
  if (params.signal?.aborted) onExternalAbort()
  else params.signal?.addEventListener('abort', onExternalAbort, { once: true })

  let failedNodeId: string | undefined

  async function runNode(id: string): Promise<boolean> {
    const node = byId.get(id)!
    onStatus({ nodeId: id, status: 'running' })
    let partial = ''

    try {
      const upstreamIds = getUpstreamNodeIds(edges, id)
      const missing = upstreamIds.some((u) => !active.has(u) && !values.has(u))
      if (missing) {
        throw new Error(
          'Upstream results are missing. Run the whole flow first, then use Run from here.',
        )
      }

      if (node.data.type === 'input') {
        const value = node.data.text ?? ''
        values.set(id, value)
        onStatus({ nodeId: id, status: 'done', output: value })
        return true
      }

      const inputText = resolveNodeInput(node, edges, values, nodes)

      if (node.data.type === 'prompt') {
        values.set(id, inputText)
        onStatus({ nodeId: id, status: 'done', output: inputText })
        return true
      }

      if (node.data.type === 'output') {
        onStatus({ nodeId: id, status: 'done', output: inputText })
        return true
      }

      // LLM node
      if (!inputText.trim()) throw new Error('LLM node has no incoming prompt')
      if (!client && !params.generate) throw new NoKeyError()

      const primary = node.data.model ?? DEFAULT_MODEL
      const models = [primary, ...(node.data.fallbackModels ?? [])].filter(
        (m, i, all) => all.indexOf(m) === i,
      )
      const jsonMode = node.data.outputMode === 'json'
      const system = [
        node.data.system?.trim(),
        jsonMode
          ? 'Respond with only a single valid JSON value. No prose and no code fences.'
          : undefined,
      ]
        .filter(Boolean)
        .join('\n\n')

      let started = false
      let lastEmit = 0
      const onToken = (text: string) => {
        started = true
        partial = text
        const now = Date.now()
        if (now - lastEmit >= STREAM_EMIT_INTERVAL_MS) {
          lastEmit = now
          onStatus({ nodeId: id, status: 'running', output: text })
        }
      }

      let raw: string | GenerateResult | undefined
      let usedModel = primary
      let usedInfo: ModelInfo | undefined
      for (let i = 0; i < models.length; i++) {
        const model = models[i]
        const info = params.getModel?.(model)
        const options: GenerateOptions = {
          model,
          prompt: inputText,
          ...(system ? { system } : {}),
          ...buildRequestParams(node.data, info),
        }
        const isLast = i === models.length - 1
        // With a fallback available, don't spend long retrying the primary.
        const attemptRetry = isLast
          ? retry
          : { ...retry, retries: Math.min(retry.retries, 1) }
        try {
          raw = await withRetry(
            async () => {
              const attempt = withTimeout(signal, timeoutMs)
              try {
                return await runner(options, {
                  signal: attempt.signal,
                  onToken,
                })
              } catch (err) {
                // Surface our own timeout instead of the SDK's abort error.
                if (
                  attempt.signal.reason instanceof TimeoutError &&
                  !signal.aborted
                ) {
                  throw attempt.signal.reason
                }
                throw err
              } finally {
                attempt.dispose()
              }
            },
            signal,
            { ...attemptRetry, hasStarted: () => started },
          )
          usedModel = model
          usedInfo = info
          break
        } catch (err) {
          if (isLast || signal.aborted || started || !canFallBack(err))
            throw err
          // Discard any partial text and try the next model.
          partial = ''
          onStatus({ nodeId: id, status: 'running' })
        }
      }

      const result: GenerateResult =
        typeof raw === 'string' ? { text: raw } : raw!
      if (jsonMode) result.text = extractJson(result.text)
      const info = usedInfo
      let usage = result.usage
      if (usage && usage.cost === undefined && info) {
        const { promptPrice, completionPrice } = info
        if (promptPrice !== null && completionPrice !== null) {
          usage = {
            ...usage,
            cost:
              usage.promptTokens * promptPrice +
              usage.completionTokens * completionPrice,
          }
        }
      }
      values.set(id, result.text)
      onStatus({
        nodeId: id,
        status: 'done',
        output: result.text,
        model: usedModel,
        ...(usage ? { usage } : {}),
      })
      return true
    } catch (err) {
      if (signal.aborted) {
        onStatus({
          nodeId: id,
          status: 'cancelled',
          ...(partial ? { output: partial } : {}),
        })
        return false
      }
      const { message, kind } = classifyError(err)
      onStatus({
        nodeId: id,
        status: 'error',
        error: message,
        errorKind: kind,
        ...(partial ? { output: partial } : {}),
      })
      failedNodeId ??= id
      internal.abort()
      return false
    }
  }

  // Dependency-driven scheduler: a node starts once all its active upstream
  // nodes are done, with at most `concurrency` model calls in flight.
  const waiting = new Map<string, number>()
  for (const id of order) {
    waiting.set(
      id,
      edges.filter((e) => e.target === id && active.has(e.source)).length,
    )
  }
  const ready = order.filter((id) => waiting.get(id) === 0)
  let running = 0

  await new Promise<void>((resolve) => {
    const pump = () => {
      while (!signal.aborted && running < concurrency && ready.length > 0) {
        const id = ready.shift()!
        running++
        void runNode(id).then((ok) => {
          running--
          if (ok) {
            for (const e of edges) {
              if (e.source !== id || !active.has(e.target)) continue
              const left = (waiting.get(e.target) ?? 0) - 1
              waiting.set(e.target, left)
              if (left === 0) {
                ready.push(e.target)
                ready.sort((a, b) => orderIndex.get(a)! - orderIndex.get(b)!)
              }
            }
          }
          pump()
        })
      }
      if (running === 0 && (signal.aborted || ready.length === 0)) resolve()
    }
    pump()
  })

  params.signal?.removeEventListener('abort', onExternalAbort)
  const cancelled =
    Boolean(params.signal?.aborted) && failedNodeId === undefined
  return {
    succeeded: failedNodeId === undefined && !cancelled,
    failedNodeId,
    ...(cancelled ? { cancelled } : {}),
  }
}
