import { describe, expect, it } from 'vitest'
import { createNode } from '../lib/nodes'
import { preflight } from './preflight'

const llm = (model?: string) => {
  const n = createNode('llm', { x: 0, y: 0 })
  if (model && n.data.type === 'llm') n.data.model = model
  return n
}
const catalog = [{ id: 'openai/gpt-4o-mini' }] as never

describe('preflight', () => {
  it('passes flows without LLM nodes even with no key', () => {
    const nodes = [createNode('input', { x: 0, y: 0 })]
    expect(preflight({ nodes, hasKey: false, catalog: null })).toEqual([])
  })

  it('flags a missing key', () => {
    const issues = preflight({ nodes: [llm()], hasKey: false, catalog: null })
    expect(issues).toEqual([expect.objectContaining({ kind: 'no_key' })])
  })

  it('flags models missing from a loaded catalog, per node', () => {
    const bad = llm('gone/model')
    const issues = preflight({
      nodes: [llm(), bad],
      hasKey: true,
      catalog,
    })
    expect(issues).toEqual([
      expect.objectContaining({ kind: 'model_unavailable', nodeId: bad.id }),
    ])
  })

  it('skips model checks when no catalog has loaded', () => {
    expect(
      preflight({ nodes: [llm('gone/model')], hasKey: true, catalog: null }),
    ).toEqual([])
  })
})

describe('preflight fallback models', () => {
  it('flags each missing fallback model on its node', () => {
    const n = llm('openai/gpt-4o-mini')
    if (n.data.type === 'llm')
      n.data.fallbackModels = ['openai/gpt-4o-mini', 'gone/x']
    const issues = preflight({ nodes: [n], hasKey: true, catalog })
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ nodeId: n.id, kind: 'model_unavailable' })
    expect(issues[0].message).toContain('gone/x')
  })
})

describe('preflight variables', () => {
  const withText = () => {
    const input = createNode('input', { x: 0, y: 0 })
    input.data = { ...input.data, text: 'About {{topic}}' } as never
    const prompt = createNode('prompt', { x: 0, y: 0 })
    prompt.data = { ...prompt.data, template: '{{topic}} in {{tone}}' } as never
    return [input, prompt]
  }

  it('blocks a run with an empty variable, naming each node that uses it', () => {
    const nodes = withText()
    const issues = preflight({
      nodes,
      hasKey: true,
      catalog: null,
      variables: { topic: 'cats' },
    })
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      kind: 'missing_variable',
      nodeId: nodes[1].id,
    })
    expect(issues[0].message).toContain('{{tone}}')
  })

  it('applies even when the flow has no agent node', () => {
    const issues = preflight({
      nodes: withText(),
      hasKey: false,
      catalog: null,
      variables: {},
    })
    expect(issues.every((i) => i.kind === 'missing_variable')).toBe(true)
    expect(issues.length).toBeGreaterThan(0)
  })

  it('passes once every variable has a value, and is skipped when not asked', () => {
    expect(
      preflight({
        nodes: withText(),
        hasKey: true,
        catalog: null,
        variables: { topic: 'a', tone: 'b' },
      }),
    ).toEqual([])
    expect(
      preflight({ nodes: withText(), hasKey: true, catalog: null }),
    ).toEqual([])
  })
})
