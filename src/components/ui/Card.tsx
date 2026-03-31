import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

type CardVariant = 'default' | 'elevated' | 'glass'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantMap: Record<CardVariant, string> = {
  default:
    'border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(32,32,34,0.9),rgba(19,19,21,0.9))] shadow-[var(--shadow-panel)]',
  elevated:
    'border-[rgba(249,115,22,0.3)] bg-[linear-gradient(180deg,rgba(35,36,40,0.95),rgba(20,21,25,0.95))] shadow-[var(--shadow-elevated)]',
  glass:
    'border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(36,36,40,0.72),rgba(18,18,22,0.74))] shadow-[var(--shadow-soft)] backdrop-blur-xl',
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return <div className={cn('rounded-[var(--radius-2xl)] border p-4', variantMap[variant], className)} {...props} />
}

export function CardInteractive({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        'transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(249,115,22,0.45)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.45),0_0_10px_rgba(251,146,60,0.18)] active:translate-y-0',
        className,
      )}
      {...props}
    />
  )
}

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Card variant="glass" className={cn('rounded-[28px]', className)} {...props} />
}

export function CardHeader({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>{children}</div>
}

export function CardTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h3 className={cn('text-base font-semibold tracking-tight text-[var(--text-primary)]', className)}>{children}</h3>
}
