// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSettingsStore } from '../../store/settingsStore'
import { useModelStore } from '../../store/modelStore'
import SettingsModal from './SettingsModal'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useSettingsStore.setState({
    byokEnabled: false,
    apiKey: '',
    keyPersistence: 'session',
    keyStatus: 'unknown',
    keyInfo: null,
    keyError: null,
    settingsOpen: true,
  })
  useModelStore.setState({ load: vi.fn(async () => {}) })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('SettingsModal', () => {
  it('renders nothing while closed', () => {
    useSettingsStore.setState({ settingsOpen: false })
    render(<SettingsModal />)
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
  })

  it('shows the key field straight away and stores the key per tab', async () => {
    const user = userEvent.setup()
    render(<SettingsModal />)

    const field = screen.getByLabelText('API key') as HTMLInputElement
    expect(field.type).toBe('password')
    expect(field.autocomplete).toBe('off')

    await user.type(field, 'sk-or-v1-abc123')
    expect(useSettingsStore.getState().apiKey).toBe('sk-or-v1-abc123')
    expect(useSettingsStore.getState().provider).toBe('openrouter')
    expect(useSettingsStore.getState().byokEnabled).toBe(true)
    expect(sessionStorage.getItem('promptflow:apikey')).toBe('sk-or-v1-abc123')

    await user.click(screen.getByRole('button', { name: 'Show' }))
    expect(field.type).toBe('text')
  })

  it('detects the provider, lists its models and shows the result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          data: [{ id: 'claude-a' }, { id: 'claude-b' }],
        }),
      ),
    )
    useSettingsStore.getState().setApiKey('sk-ant-abc')
    const user = userEvent.setup()
    render(<SettingsModal />)

    await user.click(
      screen.getByRole('button', { name: 'Connect & list models' }),
    )
    expect(await screen.findByRole('status')).toHaveProperty(
      'textContent',
      '✔ Key verified · Anthropic · 2 models',
    )
  })

  it('removes the key', async () => {
    useSettingsStore.setState({ byokEnabled: true })
    useSettingsStore.getState().setApiKey('sk-or-v1-abc')
    const user = userEvent.setup()
    render(<SettingsModal />)
    await user.click(screen.getByRole('button', { name: 'Remove key' }))
    expect(useSettingsStore.getState().apiKey).toBe('')
    expect(sessionStorage.getItem('promptflow:apikey')).toBeNull()
  })
})
