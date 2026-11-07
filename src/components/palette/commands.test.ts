import { describe, expect, it } from 'vitest'
import { filterCommands, type Command } from './commands'

const cmd = (
  id: string,
  title: string,
  group: Command['group'],
  extra: Partial<Command> = {},
): Command => ({ id, title, group, run: () => {}, ...extra })

const all = [
  cmd('settings', 'Open settings', 'App', { keywords: 'api key provider' }),
  cmd('add-agent', 'Add Agent node', 'Add', { keywords: 'llm model' }),
  cmd('run', 'Run flow', 'Flow'),
  cmd('tidy', 'Tidy layout', 'View', { keywords: 'arrange align' }),
  cmd('goto', 'Go to: Summariser', 'Go to'),
  cmd('stop', 'Stop run', 'Flow', { enabled: false }),
]

describe('filterCommands', () => {
  it('lists everything enabled, grouped in a fixed order, with no query', () => {
    const ids = filterCommands(all, '').map((c) => c.id)
    expect(ids).toEqual(['add-agent', 'run', 'tidy', 'goto', 'settings'])
  })

  it('hides disabled commands even when they match', () => {
    expect(filterCommands(all, 'stop')).toEqual([])
  })

  it('matches on title, case-insensitively', () => {
    expect(filterCommands(all, 'RUN').map((c) => c.id)).toEqual(['run'])
  })

  it('matches on keywords', () => {
    expect(filterCommands(all, 'llm').map((c) => c.id)).toEqual(['add-agent'])
    expect(filterCommands(all, 'arrange').map((c) => c.id)).toEqual(['tidy'])
  })

  it('needs every word to match', () => {
    expect(filterCommands(all, 'add agent').map((c) => c.id)).toEqual([
      'add-agent',
    ])
    expect(filterCommands(all, 'add banana')).toEqual([])
  })

  it('ranks a title-prefix match above a keyword match', () => {
    const list = [
      cmd('a', 'Open settings', 'App', { keywords: 'key' }),
      cmd('b', 'Key status', 'App'),
    ]
    expect(filterCommands(list, 'key').map((c) => c.id)).toEqual(['b', 'a'])
  })

  it('finds a node by name through the "Go to" entries', () => {
    expect(filterCommands(all, 'summar').map((c) => c.id)).toEqual(['goto'])
  })
})
