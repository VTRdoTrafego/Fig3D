import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

interface ToolChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function ToolChip({ active, className, children, ...props }: PropsWithChildren<ToolChipProps>) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold uppercase tracking-[0.12em] transition',
        active
          ? 'border-[rgba(249,115,22,0.45)] bg-[rgba(249,115,22,0.18)] text-[var(--accent-primary-2)] shadow-[0_0_8px_rgba(251,146,60,0.2)]'
          : 'border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(31,32,35,0.82),rgba(18,19,22,0.84))] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ActionPanel({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <section className="rounded-3xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(30,30,32,0.92),rgba(18,19,22,0.94))] p-4 shadow-[var(--shadow-panel)]">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">{title}</h3>
      {description ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}
