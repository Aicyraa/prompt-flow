import { beforeEach, describe, expect, it } from 'vitest'
import {
  API_KEY_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  useSettingsStore,
} from './settingsStore'
import { FLOW_STORAGE_KEY, useGraphStore } from './graphStore'
import { serializeFlow } from '../lib/serialization'
import { flushPendingWrites } from '../lib/debouncedStorage'

const KEY = 'sk-or-v1-SUPERSECRET'

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
  })
})

describe('settingsStore API key', () => {
  it('stores the key in sessionStorage by default', () => {
    useSettingsStore.getState().setApiKey(`  ${KEY} `)
    expect(useSettingsStore.getState().apiKey).toBe(KEY)
    expect(sessionStorage.getItem(API_KEY_STORAGE_KEY)).toBe(KEY)
    expect(localStorage.getItem(API_KEY_STORAGE_KEY)).toBeNull()
  })

  it('moves the key to localStorage when "remember" is chosen, and back', () => {
    const s = useSettingsStore.getState()
    s.setApiKey(KEY)
    s.setKeyPersistence('local')
    expect(localStorage.getItem(API_KEY_STORAGE_KEY)).toBe(KEY)
    expect(sessionStorage.getItem(API_KEY_STORAGE_KEY)).toBeNull()
    s.setKeyPersistence('session')
    expect(sessionStorage.getItem(API_KEY_STORAGE_KEY)).toBe(KEY)
    expect(localStorage.getItem(API_KEY_STORAGE_KEY)).toBeNull()
  })

  it('removeKey clears memory and both storages', () => {
    const s = useSettingsStore.getState()
    s.setApiKey(KEY)
    s.setKeyPersistence('local')
    s.removeKey()
    expect(useSettingsStore.getState().apiKey).toBe('')
    expect(localStorage.getItem(API_KEY_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(API_KEY_STORAGE_KEY)).toBeNull()
  })

  it('never writes the key into persisted settings, flow state, or exports', () => {
    useSettingsStore.getState().setByokEnabled(true)
    useSettingsStore.getState().setApiKey(KEY)
    useSettingsStore.getState().setKeyPersistence('local')
    useGraphStore.getState().addNode('llm', { x: 0, y: 0 })

    const settingsBlob = localStorage.getItem(SETTINGS_STORAGE_KEY) ?? ''
    flushPendingWrites()
    const flowBlob = localStorage.getItem(FLOW_STORAGE_KEY) ?? ''
    // guard against a vacuous pass: the flow really was written
    expect(flowBlob).toContain('"llm"')
    const { nodes, edges } = useGraphStore.getState()
    const exported = serializeFlow(nodes, edges, 'curved')

    expect(settingsBlob).not.toContain(KEY)
    expect(flowBlob).not.toContain(KEY)
    expect(exported).not.toContain(KEY)
  })
})

describe('settingsStore models', () => {
  it('toggles favourites and keeps a capped, deduped recents list', () => {
    const s = useSettingsStore.getState()
    s.toggleFavourite('a/b')
    expect(useSettingsStore.getState().favouriteModels).toEqual(['a/b'])
    s.toggleFavourite('a/b')
    expect(useSettingsStore.getState().favouriteModels).toEqual([])

    for (let i = 0; i < 12; i++) s.pushRecent(`m/${i}`)
    s.pushRecent('m/5')
    const { recentModels } = useSettingsStore.getState()
    expect(recentModels).toHaveLength(8)
    expect(recentModels[0]).toBe('m/5')
    expect(new Set(recentModels).size).toBe(8)
  })
})
