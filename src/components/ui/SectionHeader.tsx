import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: PropsWithChildren<SectionHeaderProps>) {
  return (
    <header className={cn('flex items-start justify-between gap-3', className)}>
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-2)]">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)] md:text-2xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
