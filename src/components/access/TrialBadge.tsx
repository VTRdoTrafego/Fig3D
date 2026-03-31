import { Gift } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TrialBadgeProps {
  label?: string
  className?: string
}

export function TrialBadge({ label = 'Teste gratis 3 usos', className }: TrialBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-[rgba(139,92,255,0.45)] bg-[rgba(109,75,255,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-100',
        className,
      )}
    >
      <Gift size={12} />
      {label}
    </span>
  )
}
