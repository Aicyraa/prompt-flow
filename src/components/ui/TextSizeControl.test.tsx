// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TextSizeControl from './TextSizeControl'

afterEach(cleanup)

describe('TextSizeControl', () => {
  it('offers the four sizes and marks the current one', () => {
    render(<TextSizeControl label="Size" value="lg" onChange={() => {}} />)
    const radios = screen.getAllByRole('radio')
    expect(radios.map((r) => r.getAttribute('aria-label'))).toEqual([
      'Small',
      'Medium',
      'Large',
      'Extra large',
    ])
    expect(
      screen.getByRole('radio', { name: 'Large' }).getAttribute('aria-checked'),
    ).toBe('true')
    expect(
      screen.getByRole('radio', { name: 'Small' }).getAttribute('aria-checked'),
    ).toBe('false')
  })

  it('reports the chosen size', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextSizeControl label="Size" value="md" onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: 'Extra large' }))
    expect(onChange).toHaveBeenCalledWith('xl')
  })

  it('without a default option, shows Medium for an unset value', () => {
    render(
      <TextSizeControl label="Size" value={undefined} onChange={() => {}} />,
    )
    expect(
      screen
        .getByRole('radio', { name: 'Medium' })
        .getAttribute('aria-checked'),
    ).toBe('true')
    expect(
      screen.queryByRole('radio', { name: 'Use the default size' }),
    ).toBeNull()
  })

  it('with a default option, lets you clear an override', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TextSizeControl
        label="Size"
        allowDefault
        value="lg"
        onChange={onChange}
      />,
    )
    await user.click(
      screen.getByRole('radio', { name: 'Use the default size' }),
    )
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('shows "Default" as selected when there is no override', () => {
    render(
      <TextSizeControl
        label="Size"
        allowDefault
        value={undefined}
        onChange={() => {}}
      />,
    )
    expect(
      screen
        .getByRole('radio', { name: 'Use the default size' })
        .getAttribute('aria-checked'),
    ).toBe('true')
  })
})
