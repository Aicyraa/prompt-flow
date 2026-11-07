import { describe, expect, it } from 'vitest'
import { createNode } from './nodes'
import {
  findFlowVariables,
  missingVariables,
  substituteVariables,
  variableNames,
  variableUsers,
} from './variables'
import type { FlowNode, NodeData } from '../types/flow'

const at = { x: 0, y: 0 }
function node(
  type: 'input' | 'prompt' | 'llm' | 'output',
  data: Partial<NodeData>,
): FlowNode {
  const n = createNode(type, at)
  n.data = { ...n.data, ...data } as NodeData
  return n
}

describe('variableNames', () => {
  it('lists names once, in order, ignoring {{input}}', () => {
    expect(
      variableNames(
        '{{topic}} and {{ language }} and {{topic}} then {{input}} {{INPUT}}',
      ),
    ).toEqual(['topic', 'language'])
  })

  it('ignores things that are not names', () => {
    expect(variableNames('{{}} {{ 1abc }} {{a b}} {single}')).toEqual([])
  })

  it('allows dashes and underscores', () => {
    expect(variableNames('{{target-lang}} {{max_words}}')).toEqual([
      'target-lang',
      'max_words',
    ])
  })
})

describe('findFlowVariables', () => {
  it('finds variables in inputs, templates and system prompts', () => {
    const nodes = [
      node('input', { text: 'About {{topic}}' }),
      node('prompt', { template: 'Write in {{language}}: {{input}}' }),
      node('llm', { system: 'Keep it under {{words}} words.' }),
      node('output', {}),
    ]
    expect(findFlowVariables(nodes)).toEqual(['topic', 'language', 'words'])
  })

  it('treats a {{Label}} that names another node as a node reference', () => {
    const nodes = [
      node('input', { label: 'Article', text: 'x' }),
      node('prompt', { template: 'Summarise {{Article}} for {{audience}}' }),
    ]
    expect(findFlowVariables(nodes)).toEqual(['audience'])
  })
})

describe('substituteVariables', () => {
  it('fills known names and leaves everything else alone', () => {
    expect(
      substituteVariables('Hi {{name}}, {{input}} {{unknown}}', {
        name: 'Ada',
      }),
    ).toBe('Hi Ada, {{input}} {{unknown}}')
  })

  it('inserts values literally, without re-scanning them', () => {
    expect(substituteVariables('{{a}}', { a: '{{b}}', b: 'oops' })).toBe(
      '{{b}}',
    )
  })

  it('keeps special replacement characters in values intact', () => {
    expect(substituteVariables('{{a}}', { a: '$& $1 \\n' })).toBe('$& $1 \\n')
  })
})

describe('missingVariables / variableUsers', () => {
  const nodes = [
    node('input', { text: '{{topic}}' }),
    node('prompt', { template: '{{topic}} {{tone}}' }),
  ]

  it('reports variables with no or blank values', () => {
    expect(missingVariables(nodes, { topic: 'cats', tone: '   ' })).toEqual([
      'tone',
    ])
    expect(missingVariables(nodes, { topic: 'x', tone: 'y' })).toEqual([])
  })

  it('finds the nodes that use a variable', () => {
    expect(variableUsers(nodes, 'topic')).toHaveLength(2)
    expect(variableUsers(nodes, 'tone')).toEqual([nodes[1]])
  })
})
