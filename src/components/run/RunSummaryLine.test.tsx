// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { downloadFile } from '../../lib/browserFile'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import RunSummaryLine from './RunSummaryLine'

vi.mock('../../lib/browserFile', () => ({
  downloadFile: vi.fn(),
  copyText: vi.fn(),
}))
vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}))

beforeEach(() => {
  vi.mocked(downloadFile).mockClear()
  useGraphStore.setState({
    nodes: [],
    edges: [],
    variables: {},
    past: [],
    future: [],
    clipboard: null,
  })
  useRunStore.setState({ nodes: {}, order: [], isRunning: false })
})
afterEach(cleanup)

describe('RunSummaryLine report download', () => {
  it('shows nothing until a step has finished', () => {
    const { container } = render(<RunSummaryLine />)
    expect(container.firstChild).toBeNull()
  })

  it('downloads the whole run as one named Markdown file', async () => {
    const user = userEvent.setup()
    const g = useGraphStore.getState()
    const input = g.addNode('input', { x: 0, y: 0 })
    const out = g.addNode('output', { x: 10, y: 0 })
    useRunStore.setState({
      order: [input.id, out.id],
      nodes: {
        [input.id]: {
          status: 'done',
          output: 'hello',
          startedAt: 1,
          endedAt: 2,
        },
        [out.id]: {
          status: 'done',
          output: '# Final answer\n\nBody',
          startedAt: 2,
          endedAt: 3,
        },
      },
    })
    render(<RunSummaryLine />)
    await user.click(screen.getByRole('button', { name: 'Report .md' }))

    expect(downloadFile).toHaveBeenCalledTimes(1)
    const [filename, content, type] = vi.mocked(downloadFile).mock.calls[0]
    expect(filename).toMatch(/^promptflow-report-\d{4}-\d{2}-\d{2}-\d{4}\.md$/)
    expect(type).toBe('text/markdown')
    expect(content).toContain('# PromptFlow run report')
    expect(content).toContain('## Result')
    expect(content).toContain('Final answer')
  })

  it('hides the button while a run is still in flight', () => {
    const g = useGraphStore.getState()
    const input = g.addNode('input', { x: 0, y: 0 })
    useRunStore.setState({
      isRunning: true,
      order: [input.id],
      nodes: { [input.id]: { status: 'done', output: 'x' } },
    })
    render(<RunSummaryLine />)
    expect(screen.queryByRole('button', { name: 'Report .md' })).toBeNull()
  })
})
