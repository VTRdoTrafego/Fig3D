import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface TabItem<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  items: Array<TabItem<T>>
  className?: string
}

export function Tabs<T extends string>({ value, onChange, items, className }: TabsProps<T>) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-xs font-semibold uppercase tracking-[0.12em] transition',
              active
                ? 'border-[rgba(249,115,22,0.45)] bg-[rgba(249,115,22,0.16)] text-[var(--accent-primary-2)] shadow-[0_0_10px_rgba(251,146,60,0.2)]'
                : 'border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(31,32,35,0.84),rgba(18,19,22,0.86))] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.06)]',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  items: Array<{ value: T; label: string }>
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  items,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'grid rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(28,29,32,0.88),rgba(16,17,20,0.88))] p-1 shadow-[var(--shadow-panel)]',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'h-10 rounded-xl text-xs font-semibold uppercase tracking-[0.12em] transition',
              active
                ? 'bg-[linear-gradient(180deg,var(--accent-primary-2),var(--accent-primary))] text-zinc-950 shadow-[var(--glow-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.06)]',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
