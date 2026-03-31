import type { PropsWithChildren, ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: ReactNode
}

export function Field({ label, hint, children }: PropsWithChildren<FieldProps>) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</span>
        {hint ? <span className="metric-mono text-xs text-[var(--text-muted)]">{hint}</span> : null}
      </div>
      {children}
    </label>
  )
}
