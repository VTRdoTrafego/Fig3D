import { forwardRef, type ComponentProps } from 'react'
import { Button } from './Button'
import { cn } from '../../lib/utils'

type ButtonProps = ComponentProps<typeof Button>

export const GlowButton = forwardRef<HTMLButtonElement, ButtonProps>(function GlowButton(
  { className, children, ...props },
  ref,
) {
  return (
    <Button ref={ref} className={cn('group relative overflow-hidden', className)} {...props}>
      <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="absolute inset-y-0 -left-[34%] w-[42%] rotate-[16deg] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-[280%]" />
      </span>
    </Button>
  )
})
