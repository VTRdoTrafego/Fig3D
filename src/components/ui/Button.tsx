import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const classesByVariant: Record<Variant, string> = {
  primary:
    'border border-[rgba(249,115,22,0.58)] bg-gradient-to-b from-[var(--accent-primary-2)] to-[var(--accent-primary)] text-zinc-950 shadow-[var(--glow-primary)] hover:brightness-105',
  premium:
    'border border-[rgba(245,158,11,0.54)] bg-gradient-to-b from-[var(--accent-live)] to-[var(--accent-warning)] text-zinc-950 shadow-[0_10px_26px_rgba(245,158,11,0.3)] hover:brightness-105',
  secondary:
    'border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(34,35,40,0.94),rgba(20,21,24,0.94))] text-[var(--text-primary)] shadow-[var(--shadow-panel)] hover:border-[var(--border-strong)] hover:bg-[linear-gradient(180deg,rgba(40,42,48,0.96),rgba(24,25,29,0.96))]',
  ghost:
    'border border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[rgba(255,255,255,0.045)] hover:text-[var(--text-primary)]',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white',
}

const classesBySize: Record<Size, string> = {
  sm: 'h-10 px-3 text-xs rounded-[var(--radius-xl)]',
  md: 'h-11 px-4 text-sm rounded-[var(--radius-2xl)]',
  lg: 'h-12 px-5 text-sm rounded-[var(--radius-2xl)]',
  icon: 'h-11 w-11 rounded-[var(--radius-2xl)]',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'touch-target inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-[transform,background-color,box-shadow,color,border-color] duration-200 ease-out active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(251,146,60,0.75)] disabled:cursor-not-allowed disabled:opacity-55',
        classesByVariant[variant],
        classesBySize[size],
        className,
      )}
      {...props}
    />
  )
})
