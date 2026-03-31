import { Gauge, TimerReset } from 'lucide-react'
import { Card } from '../ui/Card'
import type { TrialUsageStats } from '../../services/accessGateService'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { StatusBadge } from '../ui/StatusBadge'

interface TrialProgressProps {
  stats: TrialUsageStats | null
  premium: boolean
}

export function TrialProgress({ stats, premium }: TrialProgressProps) {
  if (!stats) return null

  const progressPercent = Math.min(100, (stats.testsUsed / stats.testsLimit) * 100)
  const remaining = stats.testsRemaining

  return (
    <Card className="space-y-3 rounded-2xl border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Progresso do acesso</p>
        <StatusBadge tone={premium ? 'live' : 'neutral'}>{premium ? 'Premium ilimitado' : 'Fig3D Free'}</StatusBadge>
      </div>

      {!premium ? (
        <div className="rounded-xl border border-[rgba(139,92,255,0.4)] bg-[rgba(109,75,255,0.14)] px-3 py-2">
          <p className="text-xs font-medium text-violet-100">{stats.countdownLabel}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1">
            <TimerReset size={12} />
            Testes restantes
          </span>
          <span className="metric-mono">{premium ? 'Ilimitado' : `${remaining}/${stats.testsLimit}`}</span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
          <div
            className={premium ? 'h-2 rounded-full bg-[var(--accent-yellow)]' : 'h-2 rounded-full bg-[var(--accent-purple)]'}
            style={{ width: `${premium ? 100 : Math.max(0, 100 - progressPercent)}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1">
            <Gauge size={12} />
            Uso total grátis
          </span>
          <span>{premium ? 'Acesso sem limite' : <AnimatedCounter value={stats.testsUsed} suffix={`/${stats.testsLimit}`} />}</span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
          <div className="h-2 rounded-full bg-[var(--accent-yellow)]" style={{ width: `${premium ? 100 : progressPercent}%` }} />
        </div>
      </div>

      {!premium ? (
        <p className="text-xs text-[var(--text-muted)]">
          {remaining > 1
            ? `Restam ${remaining} testes gratuitos.`
            : remaining === 1
              ? 'Ultimo teste gratis disponivel.'
              : 'Seus testes gratuitos acabaram.'}
        </p>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">Premium ativo com criação e exportação ilimitadas.</p>
      )}
    </Card>
  )
}
