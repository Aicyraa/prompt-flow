// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import type { ComponentProps } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import MergeNode from './MergeNode'

function setup(data: Record<string, unknown> = {}) {
  const props = {
    id: 'm1',
    data: { type: 'merge', ...data },
    selected: false,
  }
  render(
    <ReactFlowProvider>
      <MergeNode {...(props as unknown as ComponentProps<typeof MergeNode>)} />
    </ReactFlowProvider>,
  )
}

beforeEach(() => {
  useGraphStore.setState({
    nodes: [],
    edges: [],
    past: [],
    future: [],
    variables: {},
  })
  useRunStore.setState({ nodes: {}, order: [], isRunning: false })
})
afterEach(cleanup)

describe('MergeNode', () => {
  it('prompts you to connect branches when nothing feeds it', () => {
    setup()
    expect(screen.getByText(/Connect two or more branches/)).toBeTruthy()
  })

  it('lists its inputs in canvas order', () => {
    const g = useGraphStore.getState()
    const low = g.addNode('prompt', { x: 0, y: 300 })
    const high = g.addNode('llm', { x: 0, y: 0 })
    g.updateNodeData(low.id, { label: 'Second' })
    g.updateNodeData(high.id, { label: 'First' })
    useGraphStore.setState((s) => ({
      edges: [
        { id: 'e1', source: low.id, target: 'm1' },
        { id: 'e2', source: high.id, target: 'm1' },
      ].concat(s.edges as never) as never,
    }))
    setup()
    const items = within(
      screen.getByRole('list', { name: 'Joined in this order' }),
    ).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual(['1First', '2Second'])
  })

  it('summarises the separator and labels', () => {
    setup({ separator: 'rule', labelled: true })
    expect(screen.getByText(/Horizontal rule · with names/)).toBeTruthy()
  })
})
