import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface Item {
  label: string
  href: string
  icon: ComponentType<{ size?: number }>
  active: boolean
}

export function BottomNav({ items }: { items: Item[] }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(24,25,28,0.96),rgba(11,12,15,0.98))] px-2 pb-2 pt-2 shadow-[0_-14px_36px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden">
      <div
        className="mx-auto grid max-w-xl gap-1.5"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'touch-target relative inline-flex h-12 flex-col items-center justify-center rounded-2xl text-[10px] font-semibold transition-[background-color,color,transform] duration-200 ease-out',
                item.active
                  ? 'bg-[rgba(249,115,22,0.16)] text-[var(--accent-primary-2)]'
                  : 'text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]',
              )}
            >
              <span
                className={cn(
                  'absolute left-1/2 top-1 h-1 w-7 -translate-x-1/2 rounded-full transition-opacity',
                  item.active ? 'bg-[var(--accent-primary)] opacity-100' : 'opacity-0',
                )}
              />
              <Icon size={14} />
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
