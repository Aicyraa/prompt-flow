// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import MarkdownView from './MarkdownView'

afterEach(cleanup)

describe('MarkdownView', () => {
  it('renders headings, tables and a labelled code block with a copy button', async () => {
    render(
      <MarkdownView
        markdown={
          '# Title\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```ts\nconst x = 1\n```\n\nUse `inline` here.\n'
        }
      />,
    )
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Title' })).toBeTruthy(),
    )
    expect(screen.getByRole('table')).toBeTruthy()
    expect(screen.getByText('ts')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy()
    // Inline code is a pill; the block's code is not double-styled.
    expect(screen.getByText('inline').className).toContain('rounded')
    expect(screen.getByText('const x = 1').className).not.toContain('rounded')
  })

  it('is left-aligned, because canvas nodes centre their text by default', () => {
    const { container } = render(<MarkdownView markdown="hello" />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'text-left',
    )
  })

  it('never renders images', () => {
    const { container } = render(
      <MarkdownView markdown="![x](https://evil.test/a.png?d=secret)" />,
    )
    expect(container.querySelector('img')).toBeNull()
  })
})
