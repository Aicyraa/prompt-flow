import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KeyInfo } from '../lib/openrouter'
import { detectByPrefix, type ProviderId } from '../lib/providers/types'
import type { ThemePref } from '../lib/theme'

export const SETTINGS_STORAGE_KEY = 'promptflow:settings'
/** The API key lives under its own key, never inside the flow or settings. */
export const API_KEY_STORAGE_KEY = 'promptflow:apikey'

export type KeyPersistence = 'session' | 'local'
export type KeyStatus = 'unknown' | 'checking' | 'valid' | 'rejected' | 'error'

const MAX_RECENTS = 8
export const DEFAULT_COST_THRESHOLD_USD = 0.25

function storage(kind: KeyPersistence): Storage | null {
  try {
    return kind === 'session' ? sessionStorage : localStorage
  } catch {
    return null
  }
}

function readStoredKey(): { key: string; persistence: KeyPersistence } {
  for (const persistence of ['session', 'local'] as const) {
    try {
      const key = storage(persistence)?.getItem(API_KEY_STORAGE_KEY)
      if (key) return { key, persistence }
    } catch {
      // storage blocked: treat as no key
    }
  }
  return { key: '', persistence: 'session' }
}

function writeKey(key: string, persistence: KeyPersistence) {
  for (const kind of ['session', 'local'] as const) {
    try {
      const target = storage(kind)
      if (!target) continue
      if (kind === persistence && key) target.setItem(API_KEY_STORAGE_KEY, key)
      else target.removeItem(API_KEY_STORAGE_KEY)
    } catch {
      // ignore quota / blocked storage; the key still works for this session
    }
  }
}

interface SettingsStore {
  byokEnabled: boolean
  apiKey: string
  keyPersistence: KeyPersistence
  /** Provider the saved key belongs to (detected when the key is connected). */
  provider: ProviderId
  keyStatus: KeyStatus
  keyInfo: KeyInfo | null
  keyError: string | null
  settingsOpen: boolean
  hasSeenGuide: boolean
  /** Ask before runs estimated above this many USD. 0 disables. */
  costThresholdUsd: number
  /** Keep the last runs (inputs and outputs) in this browser. */
  saveHistory: boolean
  historyOpen: boolean
  favouriteModels: string[]
  recentModels: string[]
  /** Show the minimap in the corner of the canvas. */
  showMinimap: boolean
  theme: ThemePref
  paletteOpen: boolean
  guideOpen: boolean
  variablesOpen: boolean
  flowsOpen: boolean
  setByokEnabled: (enabled: boolean) => void
  setApiKey: (key: string) => void
  setKeyPersistence: (persistence: KeyPersistence) => void
  removeKey: () => void
  setProvider: (provider: ProviderId) => void
  openSettings: () => void
  closeSettings: () => void
  markGuideSeen: () => void
  setCostThreshold: (usd: number) => void
  setSaveHistory: (enabled: boolean) => void
  openHistory: () => void
  closeHistory: () => void
  toggleMinimap: () => void
  setTheme: (theme: ThemePref) => void
  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
  openGuide: () => void
  closeGuide: () => void
  openVariables: () => void
  closeVariables: () => void
  openFlows: () => void
  closeFlows: () => void
  toggleFavourite: (id: string) => void
  pushRecent: (id: string) => void
}

const initialKey = readStoredKey()

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      byokEnabled: false,
      apiKey: initialKey.key,
      keyPersistence: initialKey.persistence,
      provider: 'openrouter',
      keyStatus: 'unknown',
      keyInfo: null,
      keyError: null,
      settingsOpen: false,
      hasSeenGuide: false,
      costThresholdUsd: DEFAULT_COST_THRESHOLD_USD,
      saveHistory: true,
      historyOpen: false,
      favouriteModels: [],
      recentModels: [],
      showMinimap: true,
      theme: 'system',
      paletteOpen: false,
      guideOpen: false,
      variablesOpen: false,
      flowsOpen: false,
      setByokEnabled: (byokEnabled) => set({ byokEnabled }),

      setApiKey: (key) => {
        const apiKey = key.trim()
        writeKey(apiKey, get().keyPersistence)
        set({
          apiKey,
          // Importing a key means using it.
          byokEnabled: apiKey !== '',
          // A recognisable prefix tells us the provider before any request.
          provider: detectByPrefix(apiKey) ?? get().provider,
          keyStatus: 'unknown',
          keyInfo: null,
          keyError: null,
        })
      },

      setKeyPersistence: (keyPersistence) => {
        writeKey(get().apiKey, keyPersistence)
        set({ keyPersistence })
      },

      removeKey: () => {
        writeKey('', get().keyPersistence)
        set({
          apiKey: '',
          byokEnabled: false,
          keyStatus: 'unknown',
          keyInfo: null,
          keyError: null,
        })
      },

      setProvider: (provider) => set({ provider }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      markGuideSeen: () => set({ hasSeenGuide: true }),
      setSaveHistory: (saveHistory) => set({ saveHistory }),
      openHistory: () => set({ historyOpen: true }),
      closeHistory: () => set({ historyOpen: false }),
      setCostThreshold: (usd) =>
        set({ costThresholdUsd: Number.isFinite(usd) && usd > 0 ? usd : 0 }),

      setTheme: (theme) => set({ theme }),
      toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
      openPalette: () => set({ paletteOpen: true }),
      closePalette: () => set({ paletteOpen: false }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
      openGuide: () => set({ guideOpen: true }),
      closeGuide: () => set({ guideOpen: false }),
      openVariables: () => set({ variablesOpen: true }),
      closeVariables: () => set({ variablesOpen: false }),
      openFlows: () => set({ flowsOpen: true }),
      closeFlows: () => set({ flowsOpen: false }),

      toggleFavourite: (id) =>
        set((s) => ({
          favouriteModels: s.favouriteModels.includes(id)
            ? s.favouriteModels.filter((m) => m !== id)
            : [...s.favouriteModels, id],
        })),

      pushRecent: (id) =>
        set((s) => ({
          recentModels: [id, ...s.recentModels.filter((m) => m !== id)].slice(
            0,
            MAX_RECENTS,
          ),
        })),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 1,
      // The API key is deliberately excluded: it is stored separately above.
      partialize: (s) => ({
        byokEnabled: s.byokEnabled,
        keyPersistence: s.keyPersistence,
        provider: s.provider,
        hasSeenGuide: s.hasSeenGuide,
        costThresholdUsd: s.costThresholdUsd,
        saveHistory: s.saveHistory,
        favouriteModels: s.favouriteModels,
        recentModels: s.recentModels,
        showMinimap: s.showMinimap,
        theme: s.theme,
      }),
    },
  ),
)
