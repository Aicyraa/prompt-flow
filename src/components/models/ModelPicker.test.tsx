// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach } from 'vitest'
import { parseModels } from '../../lib/openrouter'
import { useModelStore } from '../../store/modelStore'
import { useSettingsStore } from '../../store/settingsStore'
import ModelPicker from './ModelPicker'

const models = parseModels({
  data: [
    {
      id: 'a/alpha',
      name: 'Alpha',
      created: 3,
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
    },
    { id: 'a/beta', name: 'Beta', created: 2 },
    { id: 'b/gamma', name: 'Gamma', created: 1 },
  ],
})

beforeEach(() => {
  localStorage.clear()
  useModelStore.setState({
    models,
    usable: models,
    status: 'ready',
    hasCatalog: true,
    fetchedAt: Date.now(),
    load: vi.fn(async () => {}),
  })
  useSettingsStore.setState({ favouriteModels: [], recentModels: [] })
})
afterEach(cleanup)

describe('ModelPicker', () => {
  it('shows the selected model name on the trigger', () => {
    render(<ModelPicker value="a/beta" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /Beta/ })).toBeTruthy()
  })

  it('filters by search and selects with the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ModelPicker value="a/alpha" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /Alpha/ }))
    const search = screen.getByRole('combobox', { name: 'Search models' })
    await user.type(search, 'gam')

    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(within(options[0]).getByText('Gamma')).toBeTruthy()

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('b/gamma')
    expect(useSettingsStore.getState().recentModels[0]).toBe('b/gamma')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('closes on Escape without changing the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ModelPicker value="a/alpha" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /Alpha/ }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('warns when the stored model is not in the loaded catalog', () => {
    render(<ModelPicker value="gone/model" onChange={() => {}} />)
    expect(screen.getByText(/Not available for your API key/)).toBeTruthy()
  })

  it('toggles a favourite without selecting the model', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ModelPicker value="a/alpha" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /Alpha/ }))
    await user.click(
      screen.getByRole('button', { name: 'Add Beta to favourites' }),
    )
    expect(useSettingsStore.getState().favouriteModels).toEqual(['a/beta'])
    expect(onChange).not.toHaveBeenCalled()
  })
})
