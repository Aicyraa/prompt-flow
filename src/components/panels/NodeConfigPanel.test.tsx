// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { parseModels } from '../../lib/openrouter'
import { useGraphStore } from '../../store/graphStore'
import { useModelStore } from '../../store/modelStore'
import NodeConfigPanel from './NodeConfigPanel'

const models = parseModels({
  data: [
    { id: 'a/one', name: 'One', supported_parameters: ['temperature'] },
    { id: 'b/two', name: 'Two' },
    { id: 'c/three', name: 'Three' },
  ],
})

beforeEach(() => {
  localStorage.clear()
  useModelStore.setState({
    models,
    usable: models,
    hasCatalog: true,
    status: 'ready',
    load: vi.fn(async () => {}),
  })
  useGraphStore.setState({ nodes: [], edges: [] })
})
afterEach(cleanup)

const agentData = () => {
  const n = useGraphStore.getState().nodes[0]
  return n.data as Extract<typeof n.data, { type: 'llm' }>
}

function setup(patch: Record<string, unknown> = {}) {
  const node = useGraphStore.getState().addNode('llm', { x: 0, y: 0 })
  useGraphStore.getState().updateNodeData(node.id, { model: 'a/one', ...patch })
  return render(<NodeConfigPanel />)
}

describe('Agent settings', () => {
  it('edits the system prompt and clears it when emptied', async () => {
    const user = userEvent.setup()
    setup()
    const box = screen.getByLabelText('System prompt')
    await user.type(box, 'Be terse')
    expect(agentData().system).toBe('Be terse')
    await user.clear(box)
    expect(agentData().system).toBeUndefined()
  })

  it('switches output format to JSON and back', async () => {
    const user = userEvent.setup()
    setup()
    await user.selectOptions(screen.getByLabelText('Output format'), 'json')
    expect(agentData().outputMode).toBe('json')
    expect(screen.getByText(/validated and pretty-printed/)).toBeTruthy()
    await user.selectOptions(screen.getByLabelText('Output format'), 'text')
    expect(agentData().outputMode).toBeUndefined()
  })

  it('adds fallback models, ignoring the primary and duplicates', async () => {
    const user = userEvent.setup()
    setup()
    const add = async (name: string) => {
      await user.click(screen.getByRole('button', { name: 'Fallback models' }))
      const list = within(screen.getByRole('listbox'))
      await user.click(list.getByText(name))
    }
    await add('Two')
    await add('One') // primary: ignored
    await add('Two') // duplicate: ignored
    await add('Three')
    expect(agentData().fallbackModels).toEqual(['b/two', 'c/three'])
  })

  it('reorders and removes fallback models', async () => {
    const user = userEvent.setup()
    setup({ fallbackModels: ['b/two', 'c/three'] })
    await user.click(screen.getByRole('button', { name: 'Move Three up' }))
    expect(agentData().fallbackModels).toEqual(['c/three', 'b/two'])
    await user.click(screen.getByRole('button', { name: 'Remove Three' }))
    expect(agentData().fallbackModels).toEqual(['b/two'])
    await user.click(screen.getByRole('button', { name: 'Remove Two' }))
    expect(agentData().fallbackModels).toBeUndefined()
  })

  it('hides temperature for models that do not support it', () => {
    setup({ model: 'b/two' })
    expect(screen.queryByLabelText('Temperature')).toBeNull()
  })
})
