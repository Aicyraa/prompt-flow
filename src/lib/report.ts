import type { FlowNode, NodeRun } from '../types/flow'
import { NODE_LABELS } from './nodes'
import { formatRunSummary, formatUsage } from './format'
import { demoteHeadings, normalizeMarkdown } from './markdown'
import { findFlowVariables } from './variables'

export interface ReportInput {
  nodes: FlowNode[]
  /** Run state keyed by node id. */
  runs: Record<string, NodeRun>
  /** Node ids in the order they started. */
  order: string[]
  variables: Record<string, string>
  now?: Date
}

const STATUS_WORD: Record<string, string> = {
  done: 'Completed',
  error: 'Failed',
  cancelled: 'Stopped',
}

const label = (n: FlowNode) => n.data.label?.trim() || NODE_LABELS[n.data.type]

/** Model text, tidied and nested so its own headings don't break the report. */
const embed = (text: string, by: number) =>
  demoteHeadings(normalizeMarkdown(text), by).trimEnd()

/** Whether a run produced anything worth reporting. */
export function hasReport(runs: Record<string, NodeRun>): boolean {
  return Object.values(runs).some((r) => r.status === 'done')
}

/**
 * A whole run as one Markdown document: the result first, then every step in
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
  const steps = order.filter((id) => runs[id] && byId.has(id))
  const all = steps.map((id) => runs[id])

  const failed = all.some((r) => r.status === 'error')
  const stopped = all.some((r) => r.status === 'cancelled')
  const status = STATUS_WORD[failed ? 'error' : stopped ? 'cancelled' : 'done']

  let promptTokens = 0
  let completionTokens = 0
  let cost = 0
  let priced = true
  for (const r of all) {
    if (!r.usage) continue
    promptTokens += r.usage.promptTokens
    completionTokens += r.usage.completionTokens
    if (r.usage.cost === undefined) priced = false
    else cost += r.usage.cost
  }
  const starts = all.map((r) => r.startedAt).filter((t): t is number => !!t)
  const ends = all.map((r) => r.endedAt).filter((t): t is number => !!t)

  const lines: string[] = ['# PromptFlow run report', '']
  lines.push(
    `- **Date:** ${now.toISOString().replace('T', ' ').slice(0, 16)} UTC`,
  )
  lines.push(
    `- **Status:** ${status} · ${formatRunSummary({
      steps: all.filter((r) => r.status === 'done').length,
      promptTokens,
      completionTokens,
      cost,
      priced,
      ms:
        starts.length && ends.length
          ? Math.max(...ends) - Math.min(...starts)
          : -1,
    })}`,
  )
  const used = findFlowVariables(nodes).filter((n) => variables[n]?.trim())
  if (used.length > 0) {
    lines.push('- **Variables:**')
    for (const name of used) {
      const value = variables[name].replace(/\s*\n\s*/g, ' ').trim()
      lines.push(`  - \`${name}\`: ${value}`)
    }
  }
  lines.push('')

  const results = steps.filter(
    (id) => byId.get(id)!.data.type === 'output' && runs[id].output?.trim(),
  )
  if (results.length > 0) {
    lines.push('## Result', '')
    for (const id of results) {
      if (results.length > 1) lines.push(`### ${label(byId.get(id)!)}`, '')
      lines.push(embed(runs[id].output!, results.length > 1 ? 3 : 2), '')
    }
  }

  const middle = steps.filter((id) => byId.get(id)!.data.type !== 'output')
  if (middle.length > 0) {
    lines.push('## Steps', '')
    middle.forEach((id, i) => {
      const node = byId.get(id)!
      const run = runs[id]
      const meta = [
        NODE_LABELS[node.data.type],
        run.model,
        formatUsage(
          run.usage,
          run.startedAt && run.endedAt
            ? run.endedAt - run.startedAt
            : undefined,
        ),
      ].filter(Boolean)
      lines.push(
        `### ${i + 1}. ${label(node)}`,
        '',
        `*${meta.join(' · ')}*`,
        '',
      )
      if (run.status === 'error') {
        lines.push(`> **Failed:** ${run.error ?? 'Unknown error'}`, '')
      } else if (run.status === 'cancelled') {
        lines.push('> **Stopped** before this step finished.', '')
      }
      if (run.output?.trim()) lines.push(embed(run.output, 3), '')
    })
  }

  return normalizeMarkdown(lines.join('\n'))
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
