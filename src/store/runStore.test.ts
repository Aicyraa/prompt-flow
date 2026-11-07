import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGraphStore } from './graphStore'
import { useHistoryStore } from './historyStore'
import { useModelStore } from './modelStore'
import { totalUsage, useRunStore } from './runStore'
import { generateText } from '../lib/openrouter'
import { useSettingsStore } from './settingsStore'

vi.mock('../lib/openrouter', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/openrouter')>()),
  createOpenRouterClient: vi.fn(() => ({})),
  generateText: vi.fn(async () => 'mocked response'),
}))

const realGetModel = useModelStore.getState().getModel

beforeEach(() => {
  useGraphStore.setState({ nodes: [], edges: [] })
  useRunStore.setState({ nodes: {}, order: [], isRunning: false })
  useSettingsStore.setState({ byokEnabled: true, apiKey: 'sk-or-test' })
  useModelStore.setState({ hasCatalog: false, getModel: realGetModel })
  useRunStore.setState({ pendingConfirm: null })
  useSettingsStore.setState({ costThresholdUsd: 0 })
})

describe('runStore', () => {
  it('run executes a chain and records status and output per node', async () => {
    const { addNode, connectNodes, updateNodeData } = useGraphStore.getState()
    addNode('input', { x: 0, y: 0 })
    addNode('llm', { x: 100, y: 0 })
    const [a, b] = useGraphStore.getState().nodes
    updateNodeData(a.id, { text: 'hi' })
    connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })

    const summary = await useRunStore.getState().run()

    const { nodes, isRunning } = useRunStore.getState()
    expect(summary).toEqual({
      succeeded: true,
      failedNodeId: undefined,
      error: undefined,
    })
    expect(isRunning).toBe(false)
    expect(nodes[a.id].status).toBe('done')
    expect(nodes[b.id]).toMatchObject({
      status: 'done',
      output: 'mocked response',
    })
  })

  it('run clears previous results and never touches the graph data', async () => {
    useGraphStore.getState().addNode('input', { x: 0, y: 0 })
    const id = useGraphStore.getState().nodes[0].id
    useGraphStore.getState().updateNodeData(id, { text: 'hello' })
    useRunStore.setState({ nodes: { stale: { status: 'done', output: 'x' } } })

    await useRunStore.getState().run()

    const { nodes } = useRunStore.getState()
    expect(nodes.stale).toBeUndefined()
    expect(nodes[id]).toMatchObject({ status: 'done', output: 'hello' })
    expect(useGraphStore.getState().nodes[0].data).toEqual({
      type: 'input',
      label: 'Input',
      text: 'hello',
    })
  })

  it('reports the failing node and its error', async () => {
    useGraphStore.getState().addNode('prompt', { x: 0, y: 0 })
    useGraphStore.getState().addNode('llm', { x: 100, y: 0 })
    const [a, b] = useGraphStore.getState().nodes
    useGraphStore.getState().connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    const summary = await useRunStore.getState().run()
    expect(summary?.succeeded).toBe(false)
    expect(summary?.failedNodeId).toBe(b.id)
    expect(summary?.error).toMatch(/no incoming prompt/)
  })

  it('ignores a second run while one is in flight', async () => {
    useRunStore.setState({ isRunning: true })
    expect(await useRunStore.getState().run()).toBeNull()
  })

  it('blocks a run with LLM nodes when there is no API key', async () => {
    useSettingsStore.setState({ byokEnabled: false, apiKey: '' })
    useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    const summary = await useRunStore.getState().run()
    expect(summary).toMatchObject({ succeeded: false, blocked: 'no_key' })
    expect(useRunStore.getState().isRunning).toBe(false)
  })

  it('lets flows without LLM nodes run without a key', async () => {
    useSettingsStore.setState({ byokEnabled: false, apiKey: '' })
    useGraphStore.getState().addNode('input', { x: 0, y: 0 })
    const summary = await useRunStore.getState().run()
    expect(summary?.succeeded).toBe(true)
  })

  it('blocks and marks LLM nodes whose model is not in the catalog', async () => {
    useModelStore.setState({
      hasCatalog: true,
      models: [{ id: 'other/model' } as never],
    })
    useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    const id = useGraphStore.getState().nodes[0].id
    const summary = await useRunStore.getState().run()
    expect(summary).toMatchObject({
      succeeded: false,
      blocked: 'model_unavailable',
      failedNodeId: id,
    })
    expect(useRunStore.getState().nodes[id]).toMatchObject({
      status: 'error',
    })
  })
})

describe('runStore log data', () => {
  it('records start order, timing, and error kind per node', () => {
    const { apply } = useRunStore.getState()
    apply({ nodeId: 'a', status: 'running' })
    apply({ nodeId: 'a', status: 'done', output: 'x' })
    apply({ nodeId: 'b', status: 'running' })
    apply({
      nodeId: 'b',
      status: 'error',
      error: 'nope',
      errorKind: 'invalid_key',
    })

    const { order, nodes } = useRunStore.getState()
    expect(order).toEqual(['a', 'b'])
    expect(nodes.a.startedAt).toBeDefined()
    expect(nodes.a.endedAt).toBeGreaterThanOrEqual(nodes.a.startedAt!)
    expect(nodes.b).toMatchObject({ status: 'error', errorKind: 'invalid_key' })
  })

  it('a running update clears endedAt and reset clears the order', () => {
    const { apply, reset } = useRunStore.getState()
    apply({ nodeId: 'a', status: 'done' })
    apply({ nodeId: 'a', status: 'running' })
    expect(useRunStore.getState().nodes.a.endedAt).toBeUndefined()
    reset()
    expect(useRunStore.getState().order).toEqual([])
  })
})

function llmChain() {
  const { addNode, connectNodes, updateNodeData } = useGraphStore.getState()
  const input = addNode('input', { x: 0, y: 0 })
  const llm = addNode('llm', { x: 1, y: 0 })
  const out = addNode('output', { x: 2, y: 0 })
  updateNodeData(input.id, { text: 'hi' })
  const link = (a: string, b: string) =>
    connectNodes({
      source: a,
      target: b,
      sourceHandle: null,
      targetHandle: null,
    })
  link(input.id, llm.id)
  link(llm.id, out.id)
  return { input, llm, out }
}

describe('runStore stop', () => {
  it('stop aborts the run in flight and marks the node stopped', async () => {
    vi.mocked(generateText).mockImplementationOnce(
      (_c, _o, ctx) =>
        new Promise((_, reject) => {
          ctx?.onToken?.('partial')
          ctx?.signal?.addEventListener('abort', () => reject(new Error('x')))
        }),
    )
    const { llm } = llmChain()

    const pending = useRunStore.getState().run()
    await new Promise((r) => setTimeout(r, 0))
    expect(useRunStore.getState().isRunning).toBe(true)
    useRunStore.getState().stop()
    const summary = await pending

    expect(summary).toMatchObject({ succeeded: false, cancelled: true })
    expect(useRunStore.getState().isRunning).toBe(false)
    expect(useRunStore.getState().nodes[llm.id]).toMatchObject({
      status: 'cancelled',
      output: 'partial',
    })
  })
})

describe('runStore cost confirmation', () => {
  const pricey = {
    id: 'openai/gpt-4o-mini',
    promptPrice: 0.001,
    completionPrice: 0.01,
    supportedParameters: ['temperature'],
    reasoning: null,
    maxCompletionTokens: null,
  }
  beforeEach(() => {
    useModelStore.setState({
      hasCatalog: true,
      models: [pricey as never],
      getModel: (id: string) =>
        id === pricey.id ? (pricey as never) : undefined,
    })
    useSettingsStore.setState({ costThresholdUsd: 0.25 })
  })

  it('asks first when the estimate is above the threshold, then runs once confirmed', async () => {
    llmChain()
    const summary = await useRunStore.getState().run()
    expect(summary).toMatchObject({ succeeded: false, blocked: 'cost' })
    const pending = useRunStore.getState().pendingConfirm
    expect(pending?.estimate.expected).toBeGreaterThan(0.25)
    expect(Object.keys(useRunStore.getState().nodes)).toHaveLength(0)

    const run = await useRunStore.getState().run({ skipCostCheck: true })
    expect(run?.succeeded).toBe(true)
    expect(useRunStore.getState().pendingConfirm).toBeNull()
  })

  it('never asks when the threshold is 0', async () => {
    useSettingsStore.setState({ costThresholdUsd: 0 })
    llmChain()
    const summary = await useRunStore.getState().run()
    expect(summary?.succeeded).toBe(true)
  })

  it('dismissConfirm clears the pending prompt', async () => {
    llmChain()
    await useRunStore.getState().run()
    useRunStore.getState().dismissConfirm()
    expect(useRunStore.getState().pendingConfirm).toBeNull()
  })
})

describe('runStore run from a node', () => {
  it('re-runs from the node, keeping upstream results', async () => {
    const { input, llm, out } = llmChain()
    await useRunStore.getState().run()
    vi.mocked(generateText).mockClear()
    vi.mocked(generateText).mockResolvedValueOnce({ text: 'second answer' })

    const summary = await useRunStore.getState().run({ from: llm.id })

    expect(summary?.succeeded).toBe(true)
    expect(generateText).toHaveBeenCalledTimes(1)
    const { nodes } = useRunStore.getState()
    expect(nodes[input.id]).toMatchObject({ status: 'done', output: 'hi' })
    expect(nodes[llm.id].output).toBe('second answer')
    expect(nodes[out.id].output).toBe('second answer')
  })
})

describe('totalUsage', () => {
  it('sums tokens and cost, flagging unpriced nodes', () => {
    const t = totalUsage({
      a: {
        status: 'done',
        usage: { promptTokens: 10, completionTokens: 5, cost: 0.1 },
      },
      b: { status: 'done', usage: { promptTokens: 1, completionTokens: 1 } },
      c: { status: 'done' },
    })
    expect(t).toMatchObject({
      promptTokens: 11,
      completionTokens: 6,
      cost: 0.1,
      priced: false,
    })
  })
})

describe('runStore history recording', () => {
  beforeEach(() => {
    useHistoryStore.setState({ entries: [] })
    useSettingsStore.setState({ saveHistory: true })
  })

  it('records a completed run with per-node details', async () => {
    const { llm, out } = llmChain()
    await useRunStore.getState().run()
    const [entry] = useHistoryStore.getState().entries
    expect(entry.outcome).toBe('completed')
    expect(entry.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([llm.id, out.id]),
    )
    expect(entry.nodes.find((n) => n.id === out.id)?.output).toBe(
      'mocked response',
    )
    expect(entry.nodes.find((n) => n.id === llm.id)?.label).toBe('Agent')
  })

  it('records failed runs', async () => {
    useSettingsStore.setState({ saveHistory: true })
    useGraphStore.getState().addNode('prompt', { x: 0, y: 0 })
    useGraphStore.getState().addNode('llm', { x: 1, y: 0 })
    const [a, b] = useGraphStore.getState().nodes
    useGraphStore.getState().connectNodes({
      source: a.id,
      target: b.id,
      sourceHandle: null,
      targetHandle: null,
    })
    await useRunStore.getState().run()
    expect(useHistoryStore.getState().entries[0].outcome).toBe('failed')
  })

  it('records nothing when saving is off', async () => {
    useSettingsStore.setState({ saveHistory: false })
    llmChain()
    await useRunStore.getState().run()
    expect(useHistoryStore.getState().entries).toEqual([])
  })

  it('does not record runs blocked before starting', async () => {
    useSettingsStore.setState({ byokEnabled: false, apiKey: '' })
    useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
    await useRunStore.getState().run()
    expect(useHistoryStore.getState().entries).toEqual([])
  })

  it('marks a partial run with the node it started from', async () => {
    const { llm } = llmChain()
    await useRunStore.getState().run()
    await useRunStore.getState().run({ from: llm.id })
    const [latest] = useHistoryStore.getState().entries
    expect(latest.from).toBe('Agent')
    expect(latest.nodes.map((n) => n.id)).not.toContain(
      useGraphStore.getState().nodes[0].id,
    )
  })
})
