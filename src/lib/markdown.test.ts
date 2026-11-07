import { describe, expect, it } from 'vitest'
import {
  firstHeading,
  normalizeMarkdown,
  outputFile,
  slugify,
} from './markdown'

describe('normalizeMarkdown', () => {
  it('uses LF, trims, collapses blank runs and ends with one newline', () => {
    expect(normalizeMarkdown('\r\n# T  \r\n\r\n\r\n\r\ntext   \r\n\r\n')).toBe(
      '# T\n\ntext\n',
    )
  })

  it('keeps deliberate hard line breaks', () => {
    expect(normalizeMarkdown('a  \nb')).toBe('a  \nb\n')
  })

  it('unwraps a reply that is one markdown fence', () => {
    expect(normalizeMarkdown('```markdown\n# Hi\n\n- a\n```')).toBe(
      '# Hi\n\n- a\n',
    )
  })

  it('does not unwrap a real code block', () => {
    const code = '```ts\nconst a = 1\n```'
    expect(normalizeMarkdown(code)).toBe(code + '\n')
  })

  it('leaves whitespace inside fenced code alone', () => {
    const md = 'intro\n\n```py\nx = 1   \n\n\n\ny = 2\n```\n\nend'
    expect(normalizeMarkdown(md)).toContain('x = 1   \n\n\n\ny = 2')
  })
})

describe('outputFile', () => {
  it('names the file after the first heading', () => {
    const f = outputFile('Preface\n\n## Q3 Report: Résumé & Plans!\n\ntext')
    expect(f.filename).toBe('q3-report-resume-plans.md')
    expect(f.type).toBe('text/markdown')
    expect(f.content.endsWith('\n')).toBe(true)
  })

  it('falls back to a generic name without a heading', () => {
    expect(outputFile('just text', 'agent').filename).toBe('agent.md')
  })

  it('saves JSON replies as .json', () => {
    const f = outputFile('{"a":1}')
    expect(f.filename).toBe('output.json')
    expect(f.type).toBe('application/json')
  })
})

describe('helpers', () => {
  it('finds headings and slugifies', () => {
    expect(firstHeading('x\n# **Bold** `title` #')).toBe('Bold title')
    expect(slugify('  Hello,   World! ')).toBe('hello-world')
  })
})
