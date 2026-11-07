import { afterEach, describe, expect, it, vi } from 'vitest'
import type { FlowEdge, FlowNode, NodeData, NodeType } from '../types/flow'
import { parseModels } from '../lib/openrouter'
import {
  executeFlow,
  getDownstreamIds,
  type LlmRunner,
  type NodeStatusUpdate,
} from './executeFlow'

const node = (
  id: string,
  type: NodeType,
  data: Record<string, unknown> = {},
): FlowNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { type, ...data } as NodeData,
})
const edge = (source: string, target: string): FlowEdge => ({
  id: `${source}-${target}`,
  source,
  target,
})

function recorder() {
  const updates: NodeStatusUpdate[] = []
  const last = (id: string) =>
    [...updates].reverse().find((u) => u.nodeId === id)
  return { updates, last, onStatus: (u: NodeStatusUpdate) => updates.push(u) }
}

/** A runner whose calls stay pending until released. */
function gated() {
  const calls: {
    prompt: string
    release: (text: string) => void
    fail: (e: unknown) => void
  }[] = []
  let inFlight = 0
  let peak = 0
  const generate: LlmRunner = (options, ctx) => {
    inFlight++
    peak = Math.max(peak, inFlight)
    return new Promise((resolve, reject) => {
      const done = () => {
        inFlight--
      }
      ctx.signal.addEventListener('abort', () => {
        done()
        reject(ctx.signal.reason ?? new Error('aborted'))
      })
      calls.push({
        prompt: options.prompt,
        release: (text) => {
          done()
          resolve(text)
        },
        fail: (e) => {
          done()
          reject(e)
        },
      })
    })
  }
  return { generate, calls, peak: () => peak }
}

const tick = () => new Promise((r) => setTimeout(r, 0))
const fast = { retry: { retries: 0, baseMs: 0 } }

afterEach(() => vi.useRealTimers())

describe('parallel execution', () => {
  const fan = () => ({
    nodes: [
      node('in', 'input', { text: 'x' }),
      node('l1', 'llm'),
      node('l2', 'llm'),
      node('l3', 'llm'),
      node('l4', 'llm'),
      node('out', 'output'),
    ],
    edges: [
      edge('in', 'l1'),
      edge('in', 'l2'),
      edge('in', 'l3'),
      edge('in', 'l4'),
      edge('l1', 'out'),
      edge('l2', 'out'),
      edge('l3', 'out'),
      edge('l4', 'out'),
    ],
  })

  it('runs independent branches concurrently up to the cap', async () => {
    const g = gated()
    const { onStatus } = recorder()
    const { nodes, edges } = fan()
    const run = executeFlow({
      nodes,
      edges,
      client: null,
      generate: g.generate,
      concurrency: 3,
      onStatus,
      ...fast,
    })
    await tick()
    expect(g.calls).toHaveLength(3)
    g.calls[0].release('a')
    await tick()
    expect(g.calls).toHaveLength(4)
    g.calls.slice(1).forEach((c, i) => c.release(`r${i}`))
    const result = await run
    expect(result.succeeded).toBe(true)
    expect(g.peak()).toBe(3)
  })

  it('waits for every upstream branch before running a join node', async () => {
    const g = gated()
    const rec = recorder()
    const { nodes, edges } = fan()
    const run = executeFlow({
      nodes,
      edges,
      client: null,
      generate: g.generate,
      concurrency: 4,
      onStatus: rec.onStatus,
      ...fast,
    })
    await tick()
    g.calls.slice(0, 3).forEach((c) => c.release('ok'))
    await tick()
    expect(rec.last('out')?.status).not.toBe('done')
    g.calls[3].release('ok')
    await run
    expect(rec.last('out')).toMatchObject({ status: 'done' })
  })

  it('respects concurrency 1 (fully serial)', async () => {
    const g = gated()
    const { nodes, edges } = fan()
    const run = executeFlow({
      nodes,
      edges,
      client: null,
      generate: g.generate,
      concurrency: 1,
      onStatus: () => {},
      ...fast,
    })
    for (let i = 0; i < 4; i++) {
      await tick()
      expect(g.calls).toHaveLength(i + 1)
      g.calls[i].release('ok')
    }
    await run
    expect(g.peak()).toBe(1)
  })
})

describe('failure and cancellation', () => {
  it('a failure cancels in-flight siblings and keeps finished results', async () => {
    const g = gated()
    const rec = recorder()
    const run = executeFlow({
      nodes: [
        node('in', 'input', { text: 'x' }),
        node('l1', 'llm'),
        node('l2', 'llm'),
        node('out', 'output'),
      ],
      edges: [
        edge('in', 'l1'),
        edge('in', 'l2'),
        edge('l1', 'out'),
        edge('l2', 'out'),
      ],
      client: null,
      generate: g.generate,
      onStatus: rec.onStatus,
      ...fast,
    })
    await tick()
    g.calls[0].fail(Object.assign(new Error('bad'), { status: 401 }))
    const result = await run
    expect(result).toMatchObject({ succeeded: false, failedNodeId: 'l1' })
    expect(rec.last('l1')).toMatchObject({
      status: 'error',
      errorKind: 'invalid_key',
    })
    expect(rec.last('l2')?.status).toBe('cancelled')
    expect(rec.last('in')?.status).toBe('done')
    expect(rec.last('out')?.status).toBeUndefined()
  })

  it('Stop cancels running nodes, keeps partial text, and reports cancelled', async () => {
    const controller = new AbortController()
    const rec = recorder()
    const generate: LlmRunner = (_o, ctx) =>
      new Promise((_, reject) => {
        ctx.onToken?.('partial answer')
        ctx.signal.addEventListener('abort', () => reject(new Error('aborted')))
      })
    const run = executeFlow({
      nodes: [
        node('in', 'input', { text: 'x' }),
        node('l', 'llm'),
        node('out', 'output'),
      ],
      edges: [edge('in', 'l'), edge('l', 'out')],
      client: null,
      generate,
      signal: controller.signal,
      onStatus: rec.onStatus,
      ...fast,
    })
    await tick()
    controller.abort()
    const result = await run
    expect(result).toMatchObject({ succeeded: false, cancelled: true })
    expect(result.failedNodeId).toBeUndefined()
    expect(rec.last('l')).toMatchObject({
      status: 'cancelled',
      output: 'partial answer',
    })
    expect(rec.last('out')?.status).toBeUndefined()
  })

  it('does not start anything when already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    const generate = vi.fn()
    const result = await executeFlow({
      nodes: [node('in', 'input', { text: 'x' })],
      edges: [],
      client: null,
      generate,
      signal: controller.signal,
      onStatus: () => {},
    })
    expect(result.cancelled).toBe(true)
    expect(generate).not.toHaveBeenCalled()
  })
})

describe('retries and timeouts', () => {
  const flow = () => ({
    nodes: [node('in', 'input', { text: 'x' }), node('l', 'llm')],
    edges: [edge('in', 'l')],
  })

  it('retries a transient failure then succeeds', async () => {
    const generate = vi
      .fn<LlmRunner>()
      .mockRejectedValueOnce(Object.assign(new Error('busy'), { status: 503 }))
      .mockResolvedValue('fine')
    const rec = recorder()
    const result = await executeFlow({
      ...flow(),
      client: null,
      generate,
      onStatus: rec.onStatus,
      retry: { retries: 2, baseMs: 0 },
    })
    expect(result.succeeded).toBe(true)
    expect(generate).toHaveBeenCalledTimes(2)
    expect(rec.last('l')).toMatchObject({ status: 'done', output: 'fine' })
  })

  it('does not retry a bad key', async () => {
    const generate = vi
      .fn<LlmRunner>()
      .mockRejectedValue(Object.assign(new Error('no'), { status: 401 }))
    await executeFlow({
      ...flow(),
      client: null,
      generate,
      onStatus: () => {},
      retry: { retries: 3, baseMs: 0 },
    })
    expect(generate).toHaveBeenCalledTimes(1)
  })

  it('does not retry after tokens streamed (no duplicated output)', async () => {
    const generate = vi.fn<LlmRunner>(async (_o, ctx) => {
      ctx.onToken?.('half')
      throw Object.assign(new Error('dropped'), { status: 503 })
    })
    const rec = recorder()
    const result = await executeFlow({
      ...flow(),
      client: null,
      generate,
      onStatus: rec.onStatus,
      retry: { retries: 3, baseMs: 0 },
    })
    expect(result.succeeded).toBe(false)
    expect(generate).toHaveBeenCalledTimes(1)
    expect(rec.last('l')).toMatchObject({ status: 'error', output: 'half' })
  })

  it('fails with a friendly timeout error when the model is too slow', async () => {
    vi.useFakeTimers()
    const generate: LlmRunner = (_o, ctx) =>
      new Promise((_, reject) => {
        ctx.signal.addEventListener('abort', () => reject(new Error('aborted')))
      })
    const rec = recorder()
    const run = executeFlow({
      ...flow(),
      client: null,
      generate,
      timeoutMs: 5000,
      onStatus: rec.onStatus,
      retry: { retries: 0, baseMs: 0 },
    })
    await vi.advanceTimersByTimeAsync(5001)
    const result = await run
    expect(result.succeeded).toBe(false)
    expect(rec.last('l')).toMatchObject({
      status: 'error',
      errorKind: 'timeout',
      error: 'The model took longer than 5s to respond.',
    })
  })
})

describe('streaming and usage', () => {
  it('emits partial output while running and the final text when done', async () => {
    const rec = recorder()
    const generate: LlmRunner = async (_o, ctx) => {
      ctx.onToken?.('Hel')
      return 'Hello'
    }
    await executeFlow({
      nodes: [node('in', 'input', { text: 'x' }), node('l', 'llm')],
      edges: [edge('in', 'l')],
      client: null,
      generate,
      onStatus: rec.onStatus,
      ...fast,
    })
    expect(rec.updates).toContainEqual({
      nodeId: 'l',
      status: 'running',
      output: 'Hel',
    })
    expect(rec.last('l')).toMatchObject({ status: 'done', output: 'Hello' })
  })

  it('computes cost from catalog prices when the provider reports none', async () => {
    const [model] = parseModels({
      data: [
        {
          id: 'a/m',
          pricing: { prompt: '0.000001', completion: '0.000002' },
          supported_parameters: ['temperature'],
        },
      ],
    })
    const rec = recorder()
    await executeFlow({
      nodes: [
        node('in', 'input', { text: 'x' }),
        node('l', 'llm', { model: 'a/m' }),
      ],
      edges: [edge('in', 'l')],
      client: null,
      generate: async () => ({
        text: 'ok',
        usage: { promptTokens: 1000, completionTokens: 500 },
      }),
      getModel: (id) => (id === 'a/m' ? model : undefined),
      onStatus: rec.onStatus,
      ...fast,
    })
    const usage = rec.last('l')?.usage
    expect(usage?.cost).toBeCloseTo(0.001 + 0.001, 8)
  })

  it('prefers the provider-reported cost', async () => {
    const rec = recorder()
    await executeFlow({
      nodes: [node('in', 'input', { text: 'x' }), node('l', 'llm')],
      edges: [edge('in', 'l')],
      client: null,
      generate: async () => ({
        text: 'ok',
        usage: { promptTokens: 1, completionTokens: 1, cost: 0.5 },
      }),
      onStatus: rec.onStatus,
      ...fast,
    })
    expect(rec.last('l')?.usage?.cost).toBe(0.5)
  })
})

describe('run from a node', () => {
  const nodes = [
    node('in', 'input', { text: 'x' }),
    node('l1', 'llm'),
    node('l2', 'llm'),
    node('out', 'output'),
  ]
  const edges = [edge('in', 'l1'), edge('l1', 'l2'), edge('l2', 'out')]

  it('getDownstreamIds includes the node and everything after it', () => {
    expect([...getDownstreamIds(edges, 'l1')].sort()).toEqual([
      'l1',
      'l2',
      'out',
    ])
  })

  it('reruns only the node and downstream, feeding cached upstream output', async () => {
    const generate = vi.fn<LlmRunner>(async (o) => `re:${o.prompt}`)
    const rec = recorder()
    const result = await executeFlow({
      nodes,
      edges,
      client: null,
      generate,
      from: 'l2',
      cached: { in: 'x', l1: 'cached answer' },
      onStatus: rec.onStatus,
      ...fast,
    })
    expect(result.succeeded).toBe(true)
    expect(generate).toHaveBeenCalledTimes(1)
    expect(generate.mock.calls[0][0].prompt).toBe('cached answer')
    expect(rec.last('in')).toBeUndefined()
    expect(rec.last('l1')).toBeUndefined()
    expect(rec.last('out')).toMatchObject({
      status: 'done',
      output: 're:cached answer',
    })
  })

  it('fails clearly when upstream results are not cached', async () => {
    const rec = recorder()
    const result = await executeFlow({
      nodes,
      edges,
      client: null,
      generate: async () => 'x',
      from: 'l2',
      cached: {},
      onStatus: rec.onStatus,
      ...fast,
    })
    expect(result).toMatchObject({ succeeded: false, failedNodeId: 'l2' })
    expect(rec.last('l2')?.error).toMatch(/Run the whole flow first/)
  })
})

describe('agent features', () => {
  const agent = (data: Record<string, unknown>) => ({
    nodes: [node('in', 'input', { text: 'hello' }), node('l', 'llm', data)],
    edges: [edge('in', 'l')],
  })
  const err = (status: number) =>
    Object.assign(new Error(`HTTP ${status}`), { status })

  it('sends the system prompt separately from the user text', async () => {
    const generate = vi.fn<LlmRunner>(async () => 'ok')
    await executeFlow({
      ...agent({ system: '  You are terse.  ' }),
      client: null,
      generate,
      onStatus: () => {},
      ...fast,
    })
    expect(generate.mock.calls[0][0]).toMatchObject({
      system: 'You are terse.',
      prompt: 'hello',
    })
  })

  it('omits the system field when empty', async () => {
    const generate = vi.fn<LlmRunner>(async () => 'ok')
    await executeFlow({
      ...agent({ system: '   ' }),
      client: null,
      generate,
      onStatus: () => {},
      ...fast,
    })
    expect(generate.mock.calls[0][0]).not.toHaveProperty('system')
  })

  describe('JSON output mode', () => {
    it('adds a JSON instruction and returns clean, pretty-printed JSON', async () => {
      const generate = vi.fn<LlmRunner>(async () => '```json\n{"a":1}\n```')
      const rec = recorder()
      const result = await executeFlow({
        ...agent({ system: 'Be brief.', outputMode: 'json' }),
        client: null,
        generate,
        onStatus: rec.onStatus,
        ...fast,
      })
      expect(result.succeeded).toBe(true)
      expect(generate.mock.calls[0][0].system).toMatch(
        /^Be brief\.\n\nRespond with only a single valid JSON/,
      )
      expect(rec.last('l')?.output).toBe('{\n  "a": 1\n}')
    })

    it('fails the node with a bad_output error when the reply is not JSON', async () => {
      const rec = recorder()
      const result = await executeFlow({
        ...agent({ outputMode: 'json' }),
        client: null,
        generate: async () => 'Sorry, I cannot.',
        onStatus: rec.onStatus,
        ...fast,
      })
      expect(result.succeeded).toBe(false)
      expect(rec.last('l')).toMatchObject({
        status: 'error',
        errorKind: 'bad_output',
      })
      expect(rec.last('l')?.error).toMatch(/did not return valid JSON/)
    })

    it('only requests native JSON mode when the catalog says it is supported', async () => {
      const [withJson, without] = parseModels({
        data: [
          {
            id: 'a/json',
            supported_parameters: ['response_format', 'temperature'],
          },
          { id: 'a/plain', supported_parameters: ['temperature'] },
        ],
      })
      const models = new Map([withJson, without].map((m) => [m.id, m]))
      const calls: boolean[] = []
      for (const id of ['a/json', 'a/plain']) {
        await executeFlow({
          ...agent({ model: id, outputMode: 'json' }),
          client: null,
          generate: async (o) => {
            calls.push(Boolean(o.jsonResponse))
            return '{}'
          },
          getModel: (m) => models.get(m),
          onStatus: () => {},
          ...fast,
        })
      }
      expect(calls).toEqual([true, false])
    })
  })

  describe('fallback models', () => {
    it('uses the next model when the primary fails, and reports which answered', async () => {
      const used: string[] = []
      const rec = recorder()
      const result = await executeFlow({
        ...agent({
          model: 'a/primary',
          fallbackModels: ['b/backup', 'c/last'],
        }),
        client: null,
        generate: async (o) => {
          used.push(o.model)
          if (o.model === 'a/primary') throw err(503)
          return `from ${o.model}`
        },
        onStatus: rec.onStatus,
        retry: { retries: 0, baseMs: 0 },
      })
      expect(result.succeeded).toBe(true)
      expect(used).toEqual(['a/primary', 'b/backup'])
      expect(rec.last('l')).toMatchObject({
        status: 'done',
        output: 'from b/backup',
        model: 'b/backup',
      })
    })

    it('falls back on a model-not-found (404) error', async () => {
      const used: string[] = []
      await executeFlow({
        ...agent({ model: 'gone/model', fallbackModels: ['b/backup'] }),
        client: null,
        generate: async (o) => {
          used.push(o.model)
          if (o.model === 'gone/model') throw err(404)
          return 'ok'
        },
        onStatus: () => {},
        ...fast,
      })
      expect(used).toEqual(['gone/model', 'b/backup'])
    })

    it('does NOT fall back on auth or credit errors', async () => {
      for (const status of [401, 402]) {
        const generate = vi.fn<LlmRunner>().mockRejectedValue(err(status))
        const rec = recorder()
        const result = await executeFlow({
          ...agent({ fallbackModels: ['b/backup'] }),
          client: null,
          generate,
          onStatus: rec.onStatus,
          ...fast,
        })
        expect(result.succeeded).toBe(false)
        expect(generate).toHaveBeenCalledTimes(1)
      }
    })

    it('reports the last error when every model fails', async () => {
      const generate = vi.fn<LlmRunner>().mockRejectedValue(err(503))
      const rec = recorder()
      const result = await executeFlow({
        ...agent({ fallbackModels: ['b/backup'] }),
        client: null,
        generate,
        onStatus: rec.onStatus,
        ...fast,
      })
      expect(result.succeeded).toBe(false)
      expect(generate).toHaveBeenCalledTimes(2)
      expect(rec.last('l')?.status).toBe('error')
    })

    it('does not switch models once text has started streaming', async () => {
      const generate = vi.fn<LlmRunner>(async (_o, ctx) => {
        ctx.onToken?.('half')
        throw err(503)
      })
      const result = await executeFlow({
        ...agent({ fallbackModels: ['b/backup'] }),
        client: null,
        generate,
        onStatus: () => {},
        ...fast,
      })
      expect(result.succeeded).toBe(false)
      expect(generate).toHaveBeenCalledTimes(1)
    })

    it('ignores duplicate models in the chain and retries the primary only once before falling back', async () => {
      const generate = vi.fn<LlmRunner>(async (o) => {
        if (o.model === 'a/primary') throw err(503)
        return 'ok'
      })
      await executeFlow({
        ...agent({
          model: 'a/primary',
          fallbackModels: ['a/primary', 'b/backup'],
        }),
        client: null,
        generate,
        onStatus: () => {},
        retry: { retries: 3, baseMs: 0 },
      })
      const models = generate.mock.calls.map((c) => c[0].model)
      // primary: 1 attempt + 1 retry (capped while a fallback exists), then backup
      expect(models).toEqual(['a/primary', 'a/primary', 'b/backup'])
    })
  })
})
