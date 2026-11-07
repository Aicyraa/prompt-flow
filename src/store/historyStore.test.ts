import { beforeEach, describe, expect, it } from 'vitest'
import {
  entryResult,
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_ENTRIES,
  MAX_OUTPUT_CHARS,
  truncateOutput,
  useHistoryStore,
  type HistoryEntry,
} from './historyStore'

const entry = (over: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: Math.random().toString(36).slice(2),
  startedAt: Date.now(),
  durationMs: 10,
  outcome: 'completed',
  nodes: [],
  ...over,
})

beforeEach(() => {
  localStorage.clear()
  useHistoryStore.setState({ entries: [] })
})

describe('historyStore', () => {
  it('adds newest first and caps the number of runs', () => {
    const { add } = useHistoryStore.getState()
    for (let i = 0; i < MAX_HISTORY_ENTRIES + 5; i++)
      add(entry({ id: `r${i}` }))
    const { entries } = useHistoryStore.getState()
    expect(entries).toHaveLength(MAX_HISTORY_ENTRIES)
    expect(entries[0].id).toBe(`r${MAX_HISTORY_ENTRIES + 4}`)
  })

  it('removes one run and clears all', () => {
    const { add } = useHistoryStore.getState()
    add(entry({ id: 'a' }))
    add(entry({ id: 'b' }))
    useHistoryStore.getState().remove('a')
    expect(useHistoryStore.getState().entries.map((e) => e.id)).toEqual(['b'])
    useHistoryStore.getState().clear()
    expect(useHistoryStore.getState().entries).toEqual([])
  })

  it('persists runs to localStorage', () => {
    useHistoryStore.getState().add(entry({ id: 'saved' }))
    expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toContain('saved')
  })

  it('survives a full or blocked localStorage without throwing', () => {
    const original = localStorage.setItem
    localStorage.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }
    try {
      expect(() =>
        useHistoryStore.getState().add(entry({ id: 'mem' })),
      ).not.toThrow()
      expect(useHistoryStore.getState().entries[0].id).toBe('mem')
    } finally {
      localStorage.setItem = original
    }
  })
})

describe('truncateOutput', () => {
  it('keeps short output and cuts long output with a flag', () => {
    expect(truncateOutput('hi')).toEqual({ output: 'hi' })
    expect(truncateOutput(undefined)).toEqual({})
    const long = truncateOutput('x'.repeat(MAX_OUTPUT_CHARS + 5))
    expect(long.output).toHaveLength(MAX_OUTPUT_CHARS)
    expect(long.truncated).toBe(true)
  })
})

describe('entryResult', () => {
  const n = (type: 'input' | 'llm' | 'output', output?: string) => ({
    id: `${type}${output}`,
    label: type,
    type,
    status: 'done',
    output,
  })

  it('joins Output node results', () => {
    const e = entry({
      nodes: [n('llm', 'mid'), n('output', 'one'), n('output', 'two')],
    })
    expect(entryResult(e)).toBe('one\n\n---\n\ntwo')
  })

  it('falls back to the last node with output, or empty', () => {
    expect(
      entryResult(entry({ nodes: [n('input', 'a'), n('llm', 'b')] })),
    ).toBe('b')
    expect(entryResult(entry())).toBe('')
  })
})
