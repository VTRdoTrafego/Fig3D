import { useState, type HTMLAttributes, type PropsWithChildren } from 'react'
import { Card } from './Card'
import { cn } from '../../lib/utils'

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean
}

export function PremiumCard({
  className,
  children,
  spotlight = true,
  onMouseMove,
  onMouseLeave,
  ...props
}: PropsWithChildren<PremiumCardProps>) {
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false })

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(27,28,33,0.88),rgba(16,17,20,0.9))] shadow-[var(--shadow-panel)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-[1px] hover:border-[rgba(251,146,60,0.34)] hover:shadow-[0_14px_38px_rgba(0,0,0,0.5),0_0_12px_rgba(251,146,60,0.16)]',
        className,
      )}
      onMouseMove={(event) => {
        if (!spotlight) return
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        setSpot({ x, y, active: true })
        onMouseMove?.(event)
      }}
      onMouseLeave={(event) => {
        setSpot((current) => ({ ...current, active: false }))
        onMouseLeave?.(event)
      }}
      {...props}
    >
      {spotlight ? (
        <span
          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: spot.active ? 1 : 0,
            background: `radial-gradient(240px circle at ${spot.x}% ${spot.y}%, rgba(251,146,60,0.14), transparent 56%)`,
          }}
        />
      ) : null}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/[0.03]" />
      <div className="relative z-[1]">{children}</div>
    </Card>
  )
}
