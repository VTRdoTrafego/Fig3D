import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'touch-target inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-2xl)] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(36,37,41,0.9),rgba(19,20,24,0.92))] text-[var(--text-primary)] shadow-[var(--shadow-panel)] transition-[background-color,border-color,transform] duration-200 ease-out hover:border-[var(--border-strong)] hover:bg-[rgba(255,255,255,0.06)] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/70',
        className,
      )}
      {...props}
    />
  )
})
