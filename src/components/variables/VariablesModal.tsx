import { useMemo } from 'react'
import { NODE_LABELS } from '../../lib/nodes'
import { findFlowVariables, variableUsers } from '../../lib/variables'
import { useGraphStore } from '../../store/graphStore'
import { useRunStore } from '../../store/runStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useRunAction } from '../run/useRunAction'
import Modal from '../ui/Modal'
import { Field, inputClass } from '../ui/fields'

/** Edit the values behind `{{name}}` placeholders, then run. */
export default function VariablesModal() {
  const open = useSettingsStore((s) => s.variablesOpen)
  if (!open) return null
  return <VariablesDialog />
}

function VariablesDialog() {
  const close = useSettingsStore((s) => s.closeVariables)
  const nodes = useGraphStore((s) => s.nodes)
  const values = useGraphStore((s) => s.variables)
  const setVariable = useGraphStore((s) => s.setVariable)
  const isRunning = useRunStore((s) => s.isRunning)
  const runFlow = useRunAction()

  const names = useMemo(() => findFlowVariables(nodes), [nodes])
  const missing = names.filter((n) => !values[n]?.trim())

  return (
    <Modal
      title="Variables"
      subtitle="Values for {{name}} placeholders in your flow"
      onClose={close}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-lg border border-charcoal-700 px-3 py-1.5 text-xs font-medium text-charcoal-200 transition-colors hover:bg-charcoal-800"
          >
            Done
          </button>
          {names.length > 0 && (
            <button
              type="button"
              disabled={missing.length > 0 || isRunning}
              onClick={() => {
                close()
                void runFlow()
              }}
              title={
                missing.length > 0
                  ? `Fill in ${missing.map((m) => `{{${m}}}`).join(', ')} first`
                  : 'Run the flow with these values'
              }
              className="flex-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Run flow
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4 px-5 py-4">
        {names.length === 0 ? (
          <div className="space-y-2 text-xs leading-relaxed text-charcoal-300">
            <p>No variables yet.</p>
            <p>
              Write{' '}
              <code className="rounded bg-charcoal-950 px-1 text-amber-400/90">
                {'{{topic}}'}
              </code>{' '}
              in an Input, a Prompt template or an Agent&rsquo;s system prompt,
              and it will appear here as a field. Change the value and run again
              to reuse the same flow for different content.
            </p>
            <p className="text-charcoal-400">
              <code className="rounded bg-charcoal-950 px-1">
                {'{{input}}'}
              </code>{' '}
              is reserved for the text coming from the previous node.
            </p>
          </div>
        ) : (
          names.map((name) => {
            const users = variableUsers(nodes, name)
            return (
              <Field
                key={name}
                label={`{{${name}}}`}
                hint={`Used in ${users
                  .map((u) => u.data.label?.trim() || NODE_LABELS[u.data.type])
                  .join(', ')}`}
              >
                {(id) => (
                  <textarea
                    id={id}
                    value={values[name] ?? ''}
                    onChange={(e) => setVariable(name, e.target.value)}
                    rows={2}
                    placeholder="Enter a value"
                    className={`${inputClass} resize-y focus:border-violet-400/60`}
                  />
                )}
              </Field>
            )
          })
        )}
      </div>
    </Modal>
  )
}
