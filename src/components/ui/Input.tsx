import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    const isColorInput = props.type === 'color'
    return (
      <input
        ref={ref}
        className={cn(
          isColorInput
            ? 'touch-target h-11 w-full cursor-pointer rounded-[var(--radius-2xl)] border border-[var(--border-soft)] bg-[linear-gradient(180deg,#101114,#0c0d10)] p-1.5 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.76),inset_-1px_-1px_2px_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/70'
            : 'touch-target h-11 rounded-[var(--radius-2xl)] border border-[var(--border-soft)] bg-[linear-gradient(180deg,#111218,#0c0d11)] px-3 text-sm text-[var(--text-primary)] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8),inset_-1px_-1px_1px_rgba(255,255,255,0.04)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/70',
          className,
        )}
        {...props}
      />
    )
  },
)
