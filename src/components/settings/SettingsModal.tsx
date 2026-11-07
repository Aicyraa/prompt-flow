import { useState } from 'react'
import { maskKey } from '../../lib/openrouter'
import { PROVIDERS } from '../../lib/providers/types'
import { THEME_PREFS } from '../../lib/theme'
import { connectKey, syncModels } from '../../store/connection'
import { useModelStore } from '../../store/modelStore'
import { useHistoryStore } from '../../store/historyStore'
import { useSettingsStore } from '../../store/settingsStore'
import Modal from '../ui/Modal'
import { Field, inputClass } from '../ui/fields'

const btn =
  'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

function KeyStatus() {
  const status = useSettingsStore((s) => s.keyStatus)
  const info = useSettingsStore((s) => s.keyInfo)
  const provider = useSettingsStore((s) => s.provider)
  const modelCount = useModelStore((s) => s.usable.length)
  const error = useSettingsStore((s) => s.keyError)

  if (status === 'checking') {
    return <p className="text-xs text-charcoal-300">Checking…</p>
  }
  if (status === 'valid') {
    const parts = [
      PROVIDERS[provider].name,
      `${modelCount} models`,
      info?.label,
      info?.limitRemaining != null
        ? `$${info.limitRemaining.toFixed(2)} left`
        : info?.usage != null
          ? `$${info.usage.toFixed(2)} used`
          : undefined,
    ].filter(Boolean)
    return (
      <p role="status" className="text-xs text-emerald-300">
        ✔ Key verified{parts.length ? ` · ${parts.join(' · ')}` : ''}
      </p>
    )
  }
  if (status === 'rejected') {
    return (
      <p role="alert" className="text-xs text-rose-300">
        No supported provider accepted this key.
      </p>
    )
  }
  if (status === 'error') {
    return (
      <p role="alert" className="text-xs text-amber-300">
        {error}
      </p>
    )
  }
  return null
}

export default function SettingsModal() {
  const open = useSettingsStore((s) => s.settingsOpen)
  if (!open) return null
  return <SettingsDialog />
}

function SettingsDialog() {
  const apiKey = useSettingsStore((s) => s.apiKey)
  const persistence = useSettingsStore((s) => s.keyPersistence)
  const keyStatus = useSettingsStore((s) => s.keyStatus)
  const setApiKey = useSettingsStore((s) => s.setApiKey)
  const setKeyPersistence = useSettingsStore((s) => s.setKeyPersistence)
  const removeKey = useSettingsStore((s) => s.removeKey)
  const provider = useSettingsStore((s) => s.provider)
  const costThreshold = useSettingsStore((s) => s.costThresholdUsd)
  const setCostThreshold = useSettingsStore((s) => s.setCostThreshold)
  const saveHistory = useSettingsStore((s) => s.saveHistory)
  const setSaveHistory = useSettingsStore((s) => s.setSaveHistory)
  const historyCount = useHistoryStore((s) => s.entries.length)
  const clearHistory = useHistoryStore((s) => s.clear)
  const close = useSettingsStore((s) => s.closeSettings)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  const catalogCount = useModelStore((s) => s.usable.length)
  const hasCatalog = useModelStore((s) => s.hasCatalog)
  const catalogStatus = useModelStore((s) => s.status)
  const fetchedAt = useModelStore((s) => s.fetchedAt)

  const [reveal, setReveal] = useState(false)

  return (
    <Modal
      title="Settings"
      subtitle="Bring your own API key"
      onClose={close}
      footer={
        <button
          type="button"
          onClick={close}
          className="w-full rounded-lg border border-violet-400/40 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/10"
        >
          Done
        </button>
      }
    >
      <div className="space-y-5 px-5 py-4">
        <p className="text-[11px] text-charcoal-400">
          Paste a key from OpenRouter, OpenAI, Anthropic, Google, Groq or
          Mistral. PromptFlow detects the provider and lists the models your key
          can use. Requests go straight from your browser to the provider;
          PromptFlow has no server and never sees your key.
        </p>

        {
          <div className="space-y-3">
            <Field label="API key">
              {(id) => (
                <div className="flex gap-2">
                  <input
                    id={id}
                    type={reveal ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste any API key"
                    autoComplete="off"
                    spellCheck={false}
                    className={`${inputClass} font-mono focus:border-violet-400/60`}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    aria-pressed={reveal}
                    className={`${btn} border-charcoal-700 text-charcoal-200 hover:bg-charcoal-800`}
                  >
                    {reveal ? 'Hide' : 'Show'}
                  </button>
                </div>
              )}
            </Field>
            {apiKey && !reveal && (
              <p className="font-mono text-[11px] text-charcoal-400">
                {maskKey(apiKey)}
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void connectKey()}
                disabled={!apiKey || keyStatus === 'checking'}
                className={`${btn} border-violet-400/40 text-violet-300 hover:bg-violet-500/10`}
              >
                Connect & list models
              </button>
              <button
                type="button"
                onClick={removeKey}
                disabled={!apiKey}
                className={`${btn} border-rose-900/60 text-rose-300 hover:bg-rose-900/30`}
              >
                Remove key
              </button>
            </div>
            <KeyStatus />

            <fieldset className="space-y-1.5">
              <legend className="mb-1 text-[11px] font-medium tracking-wide text-charcoal-400 uppercase">
                Storage
              </legend>
              {(
                [
                  [
                    'session',
                    'This tab only',
                    'Cleared when you close the tab.',
                  ],
                  [
                    'local',
                    'Remember on this device',
                    'Stays in this browser. Anything running on this site, including a compromised script, could read it.',
                  ],
                ] as const
              ).map(([value, title, hint]) => (
                <label key={value} className="flex cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="key-persistence"
                    checked={persistence === value}
                    onChange={() => setKeyPersistence(value)}
                    className="mt-0.5 accent-violet-400"
                  />
                  <span>
                    <span className="block text-xs text-charcoal-100">
                      {title}
                    </span>
                    <span className="block text-[11px] text-charcoal-400">
                      {hint}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          </div>
        }

        <fieldset className="space-y-1.5 border-t border-charcoal-800 pt-4">
          <legend className="mb-1 text-xs font-semibold text-charcoal-100">
            Appearance
          </legend>
          {THEME_PREFS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="theme"
                checked={theme === value}
                onChange={() => setTheme(value)}
                className="accent-violet-400"
              />
              <span className="text-xs text-charcoal-100">{label}</span>
            </label>
          ))}
        </fieldset>

        <section className="space-y-2 border-t border-charcoal-800 pt-4">
          <h3 className="text-xs font-semibold text-charcoal-100">Running</h3>
          <Field
            label="Ask before runs costing more than (USD)"
            hint="Based on an estimate. Set 0 to never ask."
          >
            {(id) => (
              <input
                id={id}
                type="number"
                min={0}
                step={0.05}
                value={costThreshold}
                onChange={(e) => setCostThreshold(Number(e.target.value))}
                className={`${inputClass} w-28 focus:border-violet-400/60`}
              />
            )}
          </Field>
          <label className="flex cursor-pointer items-start gap-2 pt-1">
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) => setSaveHistory(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-violet-400"
            />
            <span>
              <span className="block text-xs text-charcoal-100">
                Save run history in this browser
              </span>
              <span className="block text-[11px] text-charcoal-400">
                Keeps the inputs and outputs of your last 20 runs locally. They
                are never exported or sent anywhere.
              </span>
            </span>
          </label>
          <button
            type="button"
            onClick={clearHistory}
            disabled={historyCount === 0}
            className={`${btn} border-charcoal-700 text-charcoal-200 hover:bg-charcoal-800`}
          >
            Clear history ({historyCount})
          </button>
        </section>

        <section className="space-y-2 border-t border-charcoal-800 pt-4">
          <h3 className="text-xs font-semibold text-charcoal-100">Models</h3>
          <p className="text-[11px] text-charcoal-400">
            {hasCatalog
              ? `${catalogCount} models from ${PROVIDERS[provider].name}${
                  fetchedAt
                    ? ` · updated ${new Date(fetchedAt).toLocaleString()}`
                    : ''
                }`
              : catalogStatus === 'error'
                ? 'Could not load the catalog.'
                : 'Catalog not loaded yet.'}
          </p>
          <button
            type="button"
            onClick={() => void syncModels({ force: true })}
            disabled={catalogStatus === 'loading'}
            className={`${btn} border-charcoal-700 text-charcoal-200 hover:bg-charcoal-800`}
          >
            {catalogStatus === 'loading' ? 'Refreshing…' : 'Refresh models'}
          </button>
        </section>
      </div>
    </Modal>
  )
}
