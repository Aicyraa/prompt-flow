import type { FlowNode, NodeRun, NodeType, Usage } from '../types/flow'
import type { HistoryEntry } from '../store/historyStore'
import { NODE_LABELS } from './nodes'
import { formatRunSummary, formatUsage } from './format'
import { demoteHeadings, normalizeMarkdown } from './markdown'
import { findFlowVariables } from './variables'

/** One finished (or failed) step, however it was recorded. */
export interface ReportStep {
  label: string
  type: NodeType
  status: string
  output?: string
  error?: string
  model?: string
  usage?: Usage
  /** How long the step took. */
  ms?: number
  /** The saved output was cut short (history keeps the first part only). */
  truncated?: boolean
}

interface ReportDocument {
  steps: ReportStep[]
  date: Date
  /** Overall status wording. */
  status: 'Completed' | 'Failed' | 'Stopped'
  /** Whole-run time; unknown is fine. */
  totalMs?: number
  variables?: [string, string][]
  /** Label of the node a partial run started from. */
  from?: string
}

const label = (n: FlowNode) => n.data.label?.trim() || NODE_LABELS[n.data.type]

/** Model text, tidied and nested so its own headings don't break the report. */
const embed = (text: string, by: number) =>
  demoteHeadings(normalizeMarkdown(text), by).trimEnd()

/** Whether a run produced anything worth reporting. */
export function hasReport(runs: Record<string, NodeRun>): boolean {
  return Object.values(runs).some((r) => r.status === 'done')
}

/** The report Markdown for any list of steps. */
function renderReport(doc: ReportDocument): string {
  const { steps } = doc

  let promptTokens = 0
  let completionTokens = 0
  let cost = 0
  let priced = true
  for (const step of steps) {
    if (!step.usage) continue
    promptTokens += step.usage.promptTokens
    completionTokens += step.usage.completionTokens
    if (step.usage.cost === undefined) priced = false
    else cost += step.usage.cost
  }

  const lines: string[] = ['# PromptFlow run report', '']
  lines.push(
    `- **Date:** ${doc.date.toISOString().replace('T', ' ').slice(0, 16)} UTC`,
  )
  lines.push(
    `- **Status:** ${doc.status} · ${formatRunSummary({
      steps: steps.filter((s) => s.status === 'done').length,
      promptTokens,
      completionTokens,
      cost,
      priced,
      ms: doc.totalMs ?? -1,
    })}`,
  )
  if (doc.from) lines.push(`- **Partial run:** started from “${doc.from}”`)
  if (doc.variables && doc.variables.length > 0) {
    lines.push('- **Variables:**')
    for (const [name, raw] of doc.variables) {
      lines.push(`  - \`${name}\`: ${raw.replace(/\s*\n\s*/g, ' ').trim()}`)
    }
  }
  if (steps.some((s) => s.truncated)) {
    lines.push(
      '- **Note:** some outputs were shortened when this run was saved to history.',
    )
  }
  lines.push('')

  const results = steps.filter((s) => s.type === 'output' && s.output?.trim())
  if (results.length > 0) {
    lines.push('## Result', '')
    for (const step of results) {
      if (results.length > 1) lines.push(`### ${step.label}`, '')
      lines.push(embed(step.output!, results.length > 1 ? 3 : 2), '')
    }
  }

  const middle = steps.filter((s) => s.type !== 'output')
  if (middle.length > 0) {
    lines.push('## Steps', '')
    middle.forEach((step, i) => {
      const meta = [
        NODE_LABELS[step.type],
        step.model,
        formatUsage(step.usage, step.ms),
      ].filter(Boolean)
      lines.push(`### ${i + 1}. ${step.label}`, '', `*${meta.join(' · ')}*`, '')
      if (step.status === 'error') {
        lines.push(`> **Failed:** ${step.error ?? 'Unknown error'}`, '')
      } else if (step.status === 'cancelled') {
        lines.push('> **Stopped** before this step finished.', '')
      }
      if (step.output?.trim()) lines.push(embed(step.output, 3), '')
    })
  }

  return normalizeMarkdown(lines.join('\n'))
}

export interface ReportInput {
  nodes: FlowNode[]
  /** Run state keyed by node id. */
  runs: Record<string, NodeRun>
  /** Node ids in the order they started. */
  order: string[]
  variables: Record<string, string>
  now?: Date
}

/**
 * The last run as one Markdown document: the result first, then every step in
 * the order it ran, with the model, tokens and cost for each.
 */
export function buildRunReport({
  nodes,
  runs,
  order,
  variables,
  now = new Date(),
}: ReportInput): string {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const ids = order.filter((id) => runs[id] && byId.has(id))
  const all = ids.map((id) => runs[id])

  const steps: ReportStep[] = ids.map((id) => {
    const node = byId.get(id)!
    const run = runs[id]
    return {
      label: label(node),
      type: node.data.type,
      status: run.status,
      output: run.output,
      error: run.error,
      model: run.model,
      usage: run.usage,
      ms:
        run.startedAt && run.endedAt ? run.endedAt - run.startedAt : undefined,
    }
  })

  const starts = all.map((r) => r.startedAt).filter((t): t is number => !!t)
  const ends = all.map((r) => r.endedAt).filter((t): t is number => !!t)
  const failed = all.some((r) => r.status === 'error')
  const stopped = all.some((r) => r.status === 'cancelled')

  const used = findFlowVariables(nodes).filter((n) => variables[n]?.trim())
  return renderReport({
    steps,
    date: now,
    status: failed ? 'Failed' : stopped ? 'Stopped' : 'Completed',
    totalMs:
      starts.length && ends.length
        ? Math.max(...ends) - Math.min(...starts)
        : undefined,
    variables: used.map((name) => [name, variables[name]]),
  })
}

const OUTCOME: Record<HistoryEntry['outcome'], ReportDocument['status']> = {
  completed: 'Completed',
  failed: 'Failed',
  stopped: 'Stopped',
}

/** A past run from the history, as the same kind of report. */
export function buildHistoryReport(entry: HistoryEntry): string {
  return renderReport({
    steps: entry.nodes.map((n) => ({
      label: n.label,
      type: n.type,
      status: n.status,
      output: n.output,
      error: n.error,
      model: n.model,
      usage: n.usage,
      ms: n.ms,
      truncated: n.truncated,
    })),
    date: new Date(entry.startedAt),
    status: OUTCOME[entry.outcome],
    totalMs: entry.durationMs,
    from: entry.from,
  })
}

/** `promptflow-report-2026-11-07-1405.md` */
export function reportFilename(now = new Date()): string {
  const stamp = now
    .toISOString()
    .slice(0, 16)
    .replace('T', '-')
    .replace(':', '')
  return `promptflow-report-${stamp}.md`
}
