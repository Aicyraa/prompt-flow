import { describe, expect, it } from 'vitest'
import { byCanvasPosition, mergeTexts, separatorText } from './merge'

const parts = [
  { label: 'Optimist', text: 'It will work.' },
  { label: 'Sceptic', text: 'It will not.' },
]

describe('mergeTexts', () => {
  it('joins with a blank line by default', () => {
    expect(mergeTexts(parts, {})).toBe('It will work.\n\nIt will not.')
  })

  it('supports each built-in separator', () => {
    expect(mergeTexts(parts, { separator: 'line' })).toBe(
      'It will work.\nIt will not.',
    )
    expect(mergeTexts(parts, { separator: 'rule' })).toBe(
      'It will work.\n\n---\n\nIt will not.',
    )
  })

  it('uses a custom separator, turning a typed \\n into a newline', () => {
    expect(
      mergeTexts(parts, { separator: 'custom', customSeparator: ' | ' }),
    ).toBe('It will work. | It will not.')
    expect(
      mergeTexts(parts, {
        separator: 'custom',
        customSeparator: '\\n=====\\n',
      }),
    ).toBe('It will work.\n=====\nIt will not.')
  })

  it('puts the branch name above each text when labelled', () => {
    expect(mergeTexts(parts, { labelled: true })).toBe(
      '**Optimist**\n\nIt will work.\n\n**Sceptic**\n\nIt will not.',
    )
  })

  it('skips empty branches instead of leaving gaps', () => {
    expect(
      mergeTexts([{ label: 'a', text: '  ' }, ...parts], { labelled: true }),
    ).not.toContain('**a**')
    expect(mergeTexts([{ label: 'a', text: '' }], {})).toBe('')
  })
})

describe('separatorText / byCanvasPosition', () => {
  it('treats a missing custom separator as nothing', () => {
    expect(separatorText({ separator: 'custom' })).toBe('')
  })

  it('orders branches top to bottom, then left to right', () => {
    const nodes = [
      { id: 'c', position: { x: 0, y: 200 } },
      { id: 'b', position: { x: 300, y: 0 } },
      { id: 'a', position: { x: 0, y: 0 } },
    ]
    expect(byCanvasPosition(nodes).map((n) => n.id)).toEqual(['a', 'b', 'c'])
  })
})
