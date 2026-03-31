import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

export function FloatingActionButton({
  className,
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn(
        'fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-[var(--radius-2xl)] border border-[rgba(249,115,22,0.45)] bg-gradient-to-b from-[var(--accent-primary-2)] to-[var(--accent-primary)] px-4 font-semibold text-zinc-950 shadow-[var(--glow-primary)] transition hover:brightness-105 lg:hidden',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
