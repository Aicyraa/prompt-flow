import { useId, type ReactNode } from 'react'

export const inputClass =
  'w-full rounded-md border border-charcoal-700 bg-charcoal-800/70 px-2 py-1.5 text-sm text-charcoal-50 outline-none'

export const labelClass =
  'mb-1 block text-[11px] font-medium tracking-wide text-charcoal-400 uppercase'

interface FieldProps {
  label: string
  hint?: ReactNode
  /** Receives a generated id to put on the control so the label is linked. */
  children: (id: string) => ReactNode
}

export function Field({ label, hint, children }: FieldProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-[11px] text-charcoal-400">{hint}</p>}
    </div>
  )
}
