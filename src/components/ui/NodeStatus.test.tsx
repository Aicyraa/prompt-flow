// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import NodeStatus from './NodeStatus'

afterEach(cleanup)

describe('NodeStatus', () => {
  it('shows nothing for a node that has not run', () => {
    const { container } = render(<NodeStatus status="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it.each([
    ['running', 'Running'],
    ['done', 'Done'],
    ['error', 'Failed'],
    ['cancelled', 'Stopped'],
  ] as const)(
    '%s is a glyph, with the word kept for assistive tech',
    (status, word) => {
      const { container } = render(<NodeStatus status={status} />)
      expect(screen.getByRole('status').textContent).toBe(word)
      expect(screen.getByRole('status').getAttribute('title')).toBe(word)
      // a shape (svg or box), never a bare coloured dot
      expect(container.querySelector('svg, [class*="border-2"]')).toBeTruthy()
      expect(container.querySelector('.rounded-full.h-2')).toBeNull()
    },
  )

  it('draws the tick in when a node is done', () => {
    const { container } = render(<NodeStatus status="done" />)
    expect(container.querySelector('path.animate-draw-in')).toBeTruthy()
  })
})
