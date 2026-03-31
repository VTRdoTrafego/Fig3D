import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface AppPageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function AppPageHeader({ eyebrow, title, subtitle, actions, className }: AppPageHeaderProps) {
  return (
    <header
      className={cn(
        'surface-glass rounded-[var(--radius-3xl)] p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <img
            src="/fig3d-logo.png"
            alt="FIG3D"
            className="mb-2 h-9 w-9 rounded-xl object-cover"
            loading="lazy"
            decoding="async"
          />
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-2)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
