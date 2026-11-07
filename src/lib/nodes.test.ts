import { describe, expect, it } from 'vitest'
import {
  createNode,
  LLM_NODE_WIDTH,
  OUTPUT_NODE_SIZE,
  withFixedWidth,
} from './nodes'

describe('createNode', () => {
  it('creates an input node with empty text', () => {
    const node = createNode('input', { x: 0, y: 0 })
    expect(node.type).toBe('input')
    expect(node.data.type).toBe('input')
    expect(node.data).toMatchObject({ text: '' })
    expect(node.id).toBeTruthy()
  })

  it('creates an llm node with default model and temperature', () => {
    const node = createNode('llm', { x: 10, y: 10 })
    expect(node.type).toBe('llm')
    expect(node.data).toMatchObject({
      model: 'openai/gpt-4o-mini',
      temperature: 0.7,
    })
    expect(node.position).toEqual({ x: 10, y: 10 })
  })

  it('creates a prompt node with an empty template', () => {
    const node = createNode('prompt', { x: 0, y: 0 })
    expect(node.data.type).toBe('prompt')
    expect(node.data).toMatchObject({ template: '' })
  })

  it('creates an output node', () => {
    const node = createNode('output', { x: 0, y: 0 })
    expect(node.data.type).toBe('output')
  })
})

describe('node sizing', () => {
  it('gives agent nodes a fixed width and output nodes a default size', () => {
    const at = { x: 0, y: 0 }
    expect(createNode('llm', at).width).toBe(LLM_NODE_WIDTH)
    const out = createNode('output', at)
    expect(out.width).toBe(OUTPUT_NODE_SIZE.width)
    expect(out.height).toBe(OUTPUT_NODE_SIZE.height)
  })

  it('keeps a size the user already chose', () => {
    const node = withFixedWidth({
      ...createNode('output', { x: 0, y: 0 }),
      width: 700,
      height: 500,
    })
    expect([node.width, node.height]).toEqual([700, 500])
  })

  it('upgrades older saved output nodes that have no height', () => {
    const old = { ...createNode('output', { x: 0, y: 0 }), height: undefined }
    expect(withFixedWidth(old).height).toBe(OUTPUT_NODE_SIZE.height)
  })
})
