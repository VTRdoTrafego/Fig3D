import { Download } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props {
  onExport: () => Promise<void>
  exporting: boolean
  progress: number
  compact?: boolean
}

export function ExportPanel({
  onExport,
  exporting,
  progress,
  compact = false,
}: Props) {
  return (
    <div className={`rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] ${compact ? 'space-y-3 p-3' : 'space-y-4 p-4'}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Exportação Fig3D</h3>
      <p className="text-xs text-[var(--text-muted)]">
        Exportação sempre sem fundo (transparente), pronta para uso.
      </p>
      <Button
        className="w-full"
        size="sm"
        onClick={() => void onExport()}
        disabled={exporting}
      >
        <Download size={13} />
        {exporting ? 'Exportando...' : 'Exportar agora'}
      </Button>
      {exporting ? (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
            <div
              className="h-full bg-[var(--accent-purple)] transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{Math.round(progress * 100)}%</p>
        </div>
      ) : null}
    </div>
  )
}
