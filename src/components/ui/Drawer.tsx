import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface DrawerProps {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  title?: string
  className?: string
  footer?: ReactNode
}

export function Drawer({
  open,
  onClose,
  side = 'left',
  title,
  className,
  footer,
  children,
}: PropsWithChildren<DrawerProps>) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/62 backdrop-blur-[3px] transition-opacity duration-200 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed bottom-0 top-0 z-50 w-[84vw] max-w-sm border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(30,30,33,0.96),rgba(16,17,20,0.98))] p-4 shadow-[var(--shadow-elevated)] transition-transform duration-300 ease-out',
          side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
          open
            ? 'translate-x-0'
            : side === 'left'
              ? '-translate-x-full'
              : 'translate-x-full',
          className,
        )}
      >
        {title ? (
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="touch-target inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="h-full overflow-y-auto pb-5">{children}</div>
        {footer ? <div className="pt-3">{footer}</div> : null}
      </aside>
    </>
  )
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  className?: string
}

export function BottomSheet({
  open,
  onClose,
  title,
  className,
  children,
}: PropsWithChildren<BottomSheetProps>) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/62 backdrop-blur-[3px] transition-opacity duration-200 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <section
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[78vh] overflow-hidden rounded-t-[30px] border border-b-0 border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(31,32,37,0.97),rgba(16,17,22,0.98))] p-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgba(0,0,0,0.62)] backdrop-blur-xl transition-transform duration-300 ease-out sm:max-h-[84vh] sm:p-4 sm:pb-[calc(1.1rem+env(safe-area-inset-bottom))]',
          open ? 'translate-y-0' : 'translate-y-full',
          className,
        )}
      >
        <div className="mx-auto mb-2.5 h-1.5 w-12 rounded-full bg-[rgba(249,115,22,0.42)]" />
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(30,31,35,0.92),rgba(18,19,23,0.92))] px-3 py-2 shadow-[var(--shadow-panel)]">
          {title ? <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">{title}</h3> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="touch-target inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(78vh-5.7rem)] overflow-y-auto pb-1 sm:max-h-[calc(84vh-6rem)]">{children}</div>
      </section>
    </>
  )
}
