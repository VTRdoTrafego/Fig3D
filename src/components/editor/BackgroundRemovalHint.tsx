import { ExternalLink, Sparkles, X } from 'lucide-react'
import { Button } from '../ui/Button'

const BACKGROUND_REMOVAL_URL = 'https://www.photoroom.com/pt-br/ferramentas/remover-fundo-de-imagem'

interface BackgroundRemovalHintProps {
  fileName?: string | null
  onDismiss: () => void
}

export function BackgroundRemovalHint({ fileName, onDismiss }: BackgroundRemovalHintProps) {
  return (
    <section className="rounded-2xl border border-[rgba(245,196,0,0.34)] bg-[rgba(245,196,0,0.1)] p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-yellow)]">
            <Sparkles size={13} />
            Sugestão inteligente
          </p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">
            Percebemos que sua arte pode ter fundo. Para um resultado melhor, recomendamos remover o fundo antes de
            continuar.
          </p>
          {fileName ? <p className="mt-1 truncate text-xs text-[var(--text-muted)]">Arquivo: {fileName}</p> : null}
        </div>
        <button
          type="button"
          aria-label="Dispensar sugestão"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-secondary)] transition hover:bg-[rgba(255,255,255,0.08)]"
          onClick={onDismiss}
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="premium"
          onClick={() => window.open(BACKGROUND_REMOVAL_URL, '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink size={13} />
          Remover fundo gratuitamente
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Continuar sem remover
        </Button>
      </div>
    </section>
  )
}
