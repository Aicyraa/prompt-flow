import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { KeyRejectedError, verifyKey, type KeyInfo } from '../lib/openrouter'

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

  setByokEnabled: (enabled: boolean) => void
  setApiKey: (key: string) => void
  setKeyPersistence: (persistence: KeyPersistence) => void
  removeKey: () => void
  verify: () => Promise<void>
  openSettings: () => void
  closeSettings: () => void
  markGuideSeen: () => void
  setCostThreshold: (usd: number) => void
  setSaveHistory: (enabled: boolean) => void
  openHistory: () => void
  closeHistory: () => void
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

      setByokEnabled: (byokEnabled) => set({ byokEnabled }),

      setApiKey: (key) => {
        const apiKey = key.trim()
        writeKey(apiKey, get().keyPersistence)
        set({ apiKey, keyStatus: 'unknown', keyInfo: null, keyError: null })
      },

      setKeyPersistence: (keyPersistence) => {
        writeKey(get().apiKey, keyPersistence)
        set({ keyPersistence })
      },

      removeKey: () => {
        writeKey('', get().keyPersistence)
        set({
          apiKey: '',
          keyStatus: 'unknown',
          keyInfo: null,
          keyError: null,
        })
      },

      verify: async () => {
        const key = get().apiKey
        if (!key) return
        set({ keyStatus: 'checking', keyError: null })
        try {
          const keyInfo = await verifyKey(key)
          if (get().apiKey !== key) return
          set({ keyStatus: 'valid', keyInfo })
        } catch (err) {
          if (get().apiKey !== key) return
          if (err instanceof KeyRejectedError) {
            set({ keyStatus: 'rejected', keyInfo: null })
          } else {
            set({
              keyStatus: 'error',
              keyError: 'Could not check the key. Try again.',
            })
          }
        }
      },

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      markGuideSeen: () => set({ hasSeenGuide: true }),
      setSaveHistory: (saveHistory) => set({ saveHistory }),
      openHistory: () => set({ historyOpen: true }),
      closeHistory: () => set({ historyOpen: false }),
      setCostThreshold: (usd) =>
        set({ costThresholdUsd: Number.isFinite(usd) && usd > 0 ? usd : 0 }),

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
        hasSeenGuide: s.hasSeenGuide,
        costThresholdUsd: s.costThresholdUsd,
        saveHistory: s.saveHistory,
        favouriteModels: s.favouriteModels,
        recentModels: s.recentModels,
      }),
    },
  ),
)
