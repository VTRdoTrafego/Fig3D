import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('relative block', className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        className="h-11 w-full rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,#111218,#0c0d11)] pl-10 pr-3 text-sm text-[var(--text-primary)] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.82),inset_-1px_-1px_1px_rgba(255,255,255,0.04)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/70"
        {...props}
      />
    </label>
  )
}
