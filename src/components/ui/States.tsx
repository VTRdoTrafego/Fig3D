import { Loader2, Sparkles } from 'lucide-react'

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(29,30,33,0.86),rgba(16,17,20,0.9))] p-6 text-center shadow-[var(--shadow-panel)]">
      <Sparkles size={18} className="mx-auto text-[var(--accent-primary-2)]" />
      <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      <Loader2 size={16} className="animate-spin text-[var(--accent-primary)]" />
      {label}
    </div>
  )
}

export function UpgradeBanner({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-[rgba(249,115,22,0.34)] bg-gradient-to-r from-[rgba(249,115,22,0.2)] via-[rgba(249,115,22,0.13)] to-[rgba(99,102,241,0.14)] p-4 shadow-[0_0_10px_rgba(251,146,60,0.18)]">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}
