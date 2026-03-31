import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  className?: string
}

export function Modal({ open, onClose, title, className, children }: PropsWithChildren<ModalProps>) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/68 backdrop-blur-[2px] transition-opacity duration-200 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <section
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-3xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(32,33,37,0.98),rgba(18,19,23,0.98))] p-5 shadow-[var(--shadow-elevated)] transition-all duration-300 ease-out',
          open ? '-translate-y-1/2 opacity-100' : 'pointer-events-none -translate-y-[45%] opacity-0',
          className,
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          {title ? <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="touch-target inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </>
  )
}
