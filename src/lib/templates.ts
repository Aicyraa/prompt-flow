import { nanoid } from 'nanoid'
import type { FlowEdge, FlowNode, NodeData, NodeType } from '../types/flow'
import { createNode } from './nodes'

export interface FlowTemplate {
  id: string
  title: string
  description: string
  build: () => {
    nodes: FlowNode[]
    edges: FlowEdge[]
    /** Starting values for the template's `{{name}}` variables. */
    variables?: Record<string, string>
  }
}

const COLUMN = 400

interface Step {
  type: NodeType
  data?: Partial<NodeData>
  /** Row offset so parallel branches don't overlap. */
  row?: number
}

function chain(
  steps: Step[],
  variables?: Record<string, string>,
): {
  nodes: FlowNode[]
  edges: FlowEdge[]
  variables?: Record<string, string>
} {
  const nodes = steps.map((step, i) => {
    const node = createNode(step.type, {
      x: i * COLUMN,
      y: (step.row ?? 0) * 220,
    })
    node.data = { ...node.data, ...step.data } as NodeData
    return node
  })
  const edges: FlowEdge[] = nodes.slice(1).map((node, i) => ({
    id: nanoid(),
    source: nodes[i].id,
    target: node.id,
    type: 'curved',
    data: { bend: 0 },
  }))
  return { nodes, edges, ...(variables ? { variables } : {}) }
}

export const TEMPLATES: FlowTemplate[] = [
  {
    id: 'translate-variables',
    title: 'Translate with variables',
    description: 'Reusable flow: change the language and tone, then run',
    build: () =>
      chain(
        [
          {
            type: 'input',
            data: { text: 'Good morning! Thanks for waiting.' },
          },
          {
            type: 'prompt',
            data: {
              template:
                'Translate into {{language}} in a {{tone}} tone:\n\n{{input}}',
            },
          },
          { type: 'llm' },
          { type: 'output' },
        ],
        { language: 'French', tone: 'friendly' },
      ),
  },
  {
    id: 'summarise',
    title: 'Summarise text',
    description: 'Input → Prompt → Agent → Output',
    build: () =>
      chain([
        {
          type: 'input',
          data: {
            text: 'Paste an article, email or notes here. The model will boil it down to three bullet points.',
          },
        },
        {
          type: 'prompt',
          data: {
            template:
              'Summarise the following in exactly three short bullet points:\n\n{{input}}',
          },
        },
        { type: 'llm' },
        { type: 'output' },
      ]),
  },
  {
    id: 'translate-critique',
    title: 'Translate, critique, rewrite',
    description: 'Two agent passes that refine each other',
    build: () =>
      chain([
        { type: 'input', data: { text: 'Good morning! Thanks for waiting.' } },
        {
          type: 'prompt',
          data: { template: 'Translate to French:\n\n{{input}}' },
        },
        { type: 'llm' },
        {
          type: 'prompt',
          data: {
            template:
              'Critique this translation for tone and accuracy, then give an improved version:\n\n{{input}}',
          },
        },
        { type: 'llm' },
        { type: 'output' },
      ]),
  },
  {
    id: 'brainstorm-rank',
    title: 'Brainstorm and rank',
    description: 'Generate ideas, then pick the best',
    build: () =>
      chain([
        { type: 'input', data: { text: 'Names for a small coffee shop' } },
        {
          type: 'prompt',
          data: { template: 'Brainstorm 8 creative ideas for: {{input}}' },
        },
        { type: 'llm', data: { temperature: 1.1 } },
        {
          type: 'prompt',
          data: {
            template:
              'Rank these ideas from best to worst and explain the top pick in one sentence:\n\n{{input}}',
          },
        },
        { type: 'llm', data: { temperature: 0.3 } },
        { type: 'output' },
      ]),
  },
]
