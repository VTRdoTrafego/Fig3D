import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'highlight'

const variantStyles: Record<BadgeVariant, string> = {
  neutral:
    'border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(32,33,36,0.75),rgba(17,18,21,0.8))] text-[var(--text-secondary)]',
  success: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300',
  warning: 'border-[rgba(245,158,11,0.45)] bg-[rgba(245,158,11,0.16)] text-[var(--accent-warning)]',
  highlight:
    'border-[rgba(249,115,22,0.45)] bg-[rgba(249,115,22,0.15)] text-[var(--accent-primary-2)] shadow-[0_0_10px_rgba(251,146,60,0.2)]',
}

export function Badge({
  className,
  children,
  variant = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function Pill({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.14)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-indigo-200',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
