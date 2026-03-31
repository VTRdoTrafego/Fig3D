import { useMemo } from 'react'
import { cn } from '../../lib/utils'

interface AmbientBackgroundProps {
  className?: string
  dotCount?: number
}

export function AmbientBackground({ className, dotCount = 14 }: AmbientBackgroundProps) {
  const dots = useMemo(
    () =>
      Array.from({ length: dotCount }, (_, index) => ({
        id: index,
        left: `${8 + ((index * 19) % 84)}%`,
        top: `${6 + ((index * 27) % 86)}%`,
        size: 2 + (index % 3),
        delay: `${(index % 7) * 0.6}s`,
        duration: `${7 + (index % 5)}s`,
      })),
    [dotCount],
  )

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(1000px_520px_at_10%_-12%,rgba(109,75,255,0.16),transparent_58%),radial-gradient(900px_500px_at_88%_-18%,rgba(245,196,0,0.12),transparent_62%)]" />
      <div className="ambient-tech-grid absolute inset-0 opacity-45" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,12,16,0)_0%,rgba(11,12,16,0.48)_64%,rgba(11,12,16,0.74)_100%)]" />
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="ambient-floating-dot absolute rounded-full bg-[var(--accent-primary-2)]/60 blur-[0.5px]"
          style={{
            left: dot.left,
            top: dot.top,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animationDelay: dot.delay,
            animationDuration: dot.duration,
          }}
        />
      ))}
    </div>
  )
}
