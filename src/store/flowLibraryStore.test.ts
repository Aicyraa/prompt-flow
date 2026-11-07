import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPendingWrites } from '../lib/debouncedStorage'
import { useGraphStore } from './graphStore'
import {
  FLOW_LIBRARY_STORAGE_KEY,
  startFlowAutosave,
  useFlowLibrary,
} from './flowLibraryStore'

const graph = () => useGraphStore.getState()
const lib = () => useFlowLibrary.getState()

function resetAll() {
  localStorage.clear()
  useGraphStore.setState({
    nodes: [],
    edges: [],
    variables: {},
    past: [],
    future: [],
    clipboard: null,
  })
  useFlowLibrary.setState({ flows: [], activeId: null })
}

beforeEach(resetAll)
afterEach(() => {
  vi.useRealTimers()
})

describe('flow library', () => {
  it('saves the canvas as a named flow and starts autosaving into it', () => {
    graph().addNode('input', { x: 0, y: 0 })
    graph().addNode('llm', { x: 300, y: 0 })
    const id = lib().saveAs('  Summariser  ')
    expect(lib().activeId).toBe(id)
    expect(lib().flows[0]).toMatchObject({
      id,
      name: 'Summariser',
      nodeCount: 2,
    })
  })

  it('names unnamed flows "Untitled flow", "Untitled flow 2", …', () => {
    lib().saveAs('')
    lib().saveAs('   ')
    expect(
      lib()
        .flows.map((f) => f.name)
        .sort(),
    ).toEqual(['Untitled flow', 'Untitled flow 2'])
  })

  it('opens a saved flow onto the canvas, with its variables', () => {
    graph().addNode('prompt', { x: 0, y: 0 })
    graph().setVariable('topic', 'cats')
    const first = lib().saveAs('A')
    lib().newFlow('B')
    expect(graph().nodes).toHaveLength(0)
    expect(graph().variables).toEqual({})

    expect(lib().open(first)).toBe(true)
    expect(graph().nodes).toHaveLength(1)
    expect(graph().variables).toEqual({ topic: 'cats' })
    expect(lib().activeId).toBe(first)
  })

  it('opening a flow is undoable', () => {
    graph().addNode('input', { x: 0, y: 0 })
    const a = lib().saveAs('A')
    lib().newFlow('B')
    graph().addNode('llm', { x: 0, y: 0 })
    graph().addNode('llm', { x: 10, y: 0 })
    lib().open(a)
    expect(graph().nodes).toHaveLength(1)
    graph().undo()
    expect(graph().nodes).toHaveLength(2)
  })

  it('saves edits to the flow you are leaving before opening another', () => {
    const a = lib().newFlow('A')
    graph().addNode('input', { x: 0, y: 0 })
    graph().addNode('output', { x: 300, y: 0 })
    const b = lib().newFlow('B')
    expect(lib().flows.find((f) => f.id === a)!.nodeCount).toBe(2)
    lib().open(a)
    expect(graph().nodes).toHaveLength(2)
    expect(lib().activeId).toBe(a)
    expect(b).not.toBe(a)
  })

  it('refuses to open a flow that is gone or corrupt', () => {
    expect(lib().open('nope')).toBe(false)
    useFlowLibrary.setState({
      flows: [
        { id: 'bad', name: 'Bad', updatedAt: 1, nodeCount: 0, json: '{oops' },
      ],
    })
    graph().addNode('input', { x: 0, y: 0 })
    expect(lib().open('bad')).toBe(false)
    expect(graph().nodes).toHaveLength(1) // canvas untouched
  })

  it('renames (ignoring blanks), duplicates and deletes', () => {
    graph().addNode('input', { x: 0, y: 0 })
    const id = lib().saveAs('Original')
    lib().rename(id, 'Renamed')
    lib().rename(id, '   ')
    expect(lib().flows[0].name).toBe('Renamed')

    const copyId = lib().duplicate(id)!
    expect(copyId).not.toBe(id)
    expect(lib().flows.find((f) => f.id === copyId)).toMatchObject({
      name: 'Renamed copy',
      nodeCount: 1,
    })
    expect(lib().activeId).toBe(id) // duplicating does not switch flows

    lib().remove(id)
    expect(lib().flows.map((f) => f.id)).toEqual([copyId])
    expect(lib().activeId).toBeNull()
    expect(graph().nodes).toHaveLength(1) // the canvas is left as it was
  })

  it('persists the library but not the canvas history', () => {
    graph().addNode('input', { x: 0, y: 0 })
    lib().saveAs('Kept')
    flushPendingWrites()
    const stored = JSON.parse(localStorage.getItem(FLOW_LIBRARY_STORAGE_KEY)!)
    expect(stored.state.flows).toHaveLength(1)
    expect(stored.state.activeId).toBe(lib().activeId)
  })
})

describe('autosave', () => {
  it('writes canvas edits into the open flow after a quiet moment, and only then', () => {
    vi.useFakeTimers()
    const stop = startFlowAutosave()
    const id = lib().saveAs('Live')
    const before = lib().flows[0].json

    graph().addNode('llm', { x: 0, y: 0 })
    expect(lib().flows[0].json).toBe(before) // debounced
    vi.advanceTimersByTime(700)
    expect(lib().flows.find((f) => f.id === id)!.nodeCount).toBe(1)
    stop()
  })

  it('does nothing without an open flow, and stops when told to', () => {
    vi.useFakeTimers()
    const stop = startFlowAutosave()
    graph().addNode('llm', { x: 0, y: 0 })
    vi.advanceTimersByTime(700)
    expect(lib().flows).toHaveLength(0)

    const id = lib().saveAs('X')
    stop()
    graph().addNode('input', { x: 5, y: 5 })
    vi.advanceTimersByTime(700)
    expect(lib().flows.find((f) => f.id === id)!.nodeCount).toBe(1)
  })

  it('does not bump the saved time when nothing changed', () => {
    vi.useFakeTimers()
    graph().addNode('input', { x: 0, y: 0 })
    lib().saveAs('Same')
    const stamp = lib().flows[0].updatedAt
    vi.advanceTimersByTime(5000)
    lib().syncActive()
    expect(lib().flows[0].updatedAt).toBe(stamp)
  })
})
