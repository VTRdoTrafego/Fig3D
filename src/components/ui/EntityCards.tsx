import { Link } from 'react-router-dom'
import { ArrowRight, Folder, Layers, Sparkles } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { Badge } from './Badge'
import { CardInteractive } from './Card'

export function ProjectCard({
  id,
  name,
  updatedAt,
  subtitle,
}: {
  id: string
  name: string
  updatedAt: string
  subtitle?: string
}) {
  return (
    <Link to={`/editor/${id}`} className="group block">
      <CardInteractive className="rounded-3xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle ?? 'Projeto 3D pronto para edição'}</p>
          </div>
          <Folder size={16} className="text-[var(--accent-yellow)]" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="neutral">Atualizado {formatDate(updatedAt)}</Badge>
          <ArrowRight size={16} className="text-[var(--text-muted)] transition group-hover:text-white" />
        </div>
      </CardInteractive>
    </Link>
  )
}

export function AssetCard({
  title,
  detail,
}: {
  title: string
  detail: string
}) {
  return (
    <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2">
        <Layers size={16} className="text-[var(--accent-purple-glow)]" />
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      </div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{detail}</p>
    </article>
  )
}

export function PresetCard({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-left transition hover:border-[rgba(245,196,0,0.45)] hover:bg-[var(--surface-elevated)]"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-[var(--accent-yellow)]" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
      </div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
    </button>
  )
}
