import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Tone = 'live' | 'neutral' | 'warning'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const toneClasses: Record<Tone, string> = {
  live: 'border-[rgba(245,196,0,0.45)] bg-[rgba(245,196,0,0.12)] text-[var(--accent-yellow)]',
  neutral: 'border-[var(--border-soft)] bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]',
  warning: 'border-[rgba(249,115,22,0.45)] bg-[rgba(249,115,22,0.14)] text-[var(--accent-primary-2)]',
}

export function StatusBadge({ tone = 'live', className, children, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'live'
            ? 'animate-pulse bg-[var(--accent-live)] shadow-[0_0_8px_rgba(250,204,21,0.7)]'
            : tone === 'warning'
              ? 'bg-[var(--accent-primary)] shadow-[0_0_6px_rgba(249,115,22,0.55)]'
              : 'bg-white/30',
        )}
      />
      {children}
    </span>
  )
}
