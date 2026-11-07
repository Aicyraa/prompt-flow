// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGraphStore } from '../store/graphStore'
import { useEditShortcuts } from './useEditShortcuts'

function Host() {
  useEditShortcuts()
  return <textarea aria-label="notes" />
}

const s = () => useGraphStore.getState()

beforeEach(() => {
  useGraphStore.setState({
    nodes: [],
    edges: [],
    past: [],
    future: [],
    clipboard: null,
  })
})
afterEach(cleanup)

describe('useEditShortcuts', () => {
  it('Ctrl+Z undoes and Ctrl+Shift+Z / Ctrl+Y redo', async () => {
    const user = userEvent.setup()
    render(<Host />)
    s().addNode('input', { x: 0, y: 0 })
    await user.keyboard('{Control>}z{/Control}')
    expect(s().nodes).toHaveLength(0)
    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
    expect(s().nodes).toHaveLength(1)
    await user.keyboard('{Control>}z{/Control}')
    await user.keyboard('{Control>}y{/Control}')
    expect(s().nodes).toHaveLength(1)
  })

  it('Ctrl+C then Ctrl+V pastes, and Ctrl+D duplicates the selection', async () => {
    const user = userEvent.setup()
    render(<Host />)
    s().addNode('input', { x: 0, y: 0 })
    await user.keyboard('{Control>}c{/Control}{Control>}v{/Control}')
    expect(s().nodes).toHaveLength(2)
    await user.keyboard('{Control>}d{/Control}')
    expect(s().nodes).toHaveLength(3)
  })

  it('leaves undo to the browser while typing in a field', async () => {
    const user = userEvent.setup()
    const { getByLabelText } = render(<Host />)
    s().addNode('input', { x: 0, y: 0 })
    await user.click(getByLabelText('notes'))
    await user.keyboard('{Control>}z{/Control}')
    expect(s().nodes).toHaveLength(1)
  })
})
