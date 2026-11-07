import { describe, expect, it } from 'vitest'
import { createNode } from './nodes'
import { buildRunReport, hasReport, reportFilename } from './report'
import type { FlowNode, NodeData, NodeRun } from '../types/flow'

const at = { x: 0, y: 0 }
function make(
  type: 'input' | 'prompt' | 'llm' | 'output',
  id: string,
  data: Partial<NodeData> = {},
): FlowNode {
  const n = createNode(type, at)
  n.id = id
  n.data = { ...n.data, ...data } as NodeData
  return n
}

const now = new Date('2026-11-07T14:05:30Z')

const nodes = [
  make('input', 'i', { label: 'Question', text: 'Why is the sky {{colour}}?' }),
  make('llm', 'l', { label: 'Answerer' }),
  make('output', 'o', {}),
]
const runs: Record<string, NodeRun> = {
  i: {
    status: 'done',
    output: 'Why is the sky blue?',
    startedAt: 0,
    endedAt: 1,
  },
  l: {
    status: 'done',
    output: '# Rayleigh scattering\n\nShort waves scatter more.',
    model: 'openai/gpt-4o-mini',
    usage: { promptTokens: 20, completionTokens: 30, cost: 0.0005 },
    startedAt: 1000,
    endedAt: 3000,
  },
  o: {
    status: 'done',
    output: '# Rayleigh scattering\n\nShort waves scatter more.',
    startedAt: 3000,
    endedAt: 3010,
  },
}

describe('buildRunReport', () => {
  const report = buildRunReport({
    nodes,
    runs,
    order: ['i', 'l', 'o'],
    variables: { colour: 'blue' },
    now,
  })

  it('opens with the date, status, totals and the variables used', () => {
    expect(report).toContain('# PromptFlow run report')
    expect(report).toContain('**Date:** 2026-11-07 14:05 UTC')
    expect(report).toMatch(
      /\*\*Status:\*\* Completed · 3 steps · 50 tokens \(20 in \/ 30 out\) · \$0\.0005/,
    )
    expect(report).toContain('  - `colour`: blue')
  })

  it('puts the Output node text under Result, before the steps', () => {
    expect(report.indexOf('## Result')).toBeGreaterThan(-1)
    expect(report.indexOf('## Result')).toBeLessThan(report.indexOf('## Steps'))
  })

  it('numbers the steps and shows the model and cost for each', () => {
    expect(report).toContain('### 1. Question')
    expect(report).toContain('### 2. Answerer')
    expect(report).toContain(
      '*Agent · openai/gpt-4o-mini · 50 tokens · $0.0005 · 2.0s*',
    )
    expect(report).not.toContain('### 3.') // the Output node is the Result
  })

  it('nests model headings so the document keeps one top-level title', () => {
    expect(report.match(/^# /gm)).toHaveLength(1)
    expect(report).toMatch(/^### Rayleigh scattering$/m) // under ## Result
    expect(report).toMatch(/^#### Rayleigh scattering$/m) // under a step
  })

  it('is clean Markdown: LF, no blank-line runs, one final newline', () => {
    expect(report).not.toContain('\r')
    expect(report).not.toMatch(/\n{3,}/)
    expect(report.endsWith('\n')).toBe(true)
    expect(report.endsWith('\n\n')).toBe(false)
  })

  it('reports a failed run honestly, with the error on the failing step', () => {
    const failed = buildRunReport({
      nodes,
      runs: {
        i: runs.i,
        l: { status: 'error', error: 'Rate limited', startedAt: 1, endedAt: 2 },
      },
      order: ['i', 'l'],
      variables: {},
      now,
    })
    expect(failed).toContain('**Status:** Failed')
    expect(failed).toContain('> **Failed:** Rate limited')
    expect(failed).not.toContain('## Result')
  })

  it('says cost is unknown when a model call had no price', () => {
    const unpriced = buildRunReport({
      nodes,
      runs: {
        ...runs,
        l: { ...runs.l, usage: { promptTokens: 5, completionTokens: 5 } },
      },
      order: ['i', 'l', 'o'],
      variables: {},
      now,
    })
    expect(unpriced).toContain('cost unknown')
  })

  it('skips nodes that were deleted after the run', () => {
    const partial = buildRunReport({
      nodes: [nodes[0]],
      runs,
      order: ['i', 'l', 'o'],
      variables: {},
      now,
    })
    expect(partial).not.toContain('Answerer')
  })
})

describe('hasReport / reportFilename', () => {
  it('needs at least one completed step', () => {
    expect(hasReport({})).toBe(false)
    expect(hasReport({ a: { status: 'error' } })).toBe(false)
    expect(hasReport({ a: { status: 'done' } })).toBe(true)
  })

  it('names the file by date and time', () => {
    expect(reportFilename(now)).toBe('promptflow-report-2026-11-07-1405.md')
  })
})
