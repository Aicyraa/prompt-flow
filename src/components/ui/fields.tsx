import { useId, type ReactNode } from 'react'

export const inputClass =
  'w-full rounded-md border border-charcoal-700 bg-charcoal-800/70 px-2 py-1.5 text-sm text-charcoal-50 outline-none'

export const labelClass = 'mb-1 block text-xs font-medium text-charcoal-200'

/** A titled group of related controls inside a settings panel. */
export function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3 px-4 py-4">
      <div>
        <h3 className="text-[11px] font-semibold tracking-wider text-charcoal-300 uppercase">
          {title}
        </h3>
        {hint && <p className="mt-0.5 text-[11px] text-charcoal-500">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

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
