import { Sparkles } from 'lucide-react'
import { TrialBadge } from './TrialBadge'
import { Fig3DBrandMark } from '../brand/Fig3DBrandMark'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { StatusBadge } from '../ui/StatusBadge'
import { useBrandingStore } from '../../store/brandingStore'

interface AccessHeroProps {
  title: string
  subtitle: string
}

export function AccessHero({ title, subtitle }: AccessHeroProps) {
  const brandingConfig = useBrandingStore((state) => state.config)
  const brandName = brandingConfig.appName || 'FIG3D'

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Fig3DBrandMark compact logoContext="public" />
        <div className="flex items-center gap-2">
          <StatusBadge tone="live">Live</StatusBadge>
          <TrialBadge />
        </div>
      </div>
      <div className="space-y-3">
        <h1 className="max-w-[20ch] text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-[56ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          {subtitle}
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(245,196,0,0.28)] bg-[rgba(245,196,0,0.1)] px-3 py-2 text-xs text-[var(--accent-yellow)]">
        <Sparkles size={14} />
        {brandName}: criar visual 3D com poucos cliques.
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(25,26,30,0.85),rgba(14,15,19,0.88))] p-2 shadow-[var(--shadow-panel)]">
        <div className="rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] px-2 py-2 text-center">
          <AnimatedCounter value={3} className="text-sm font-semibold text-[var(--text-primary)]" />
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Testes gratis</p>
        </div>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] px-2 py-2 text-center">
          <AnimatedCounter value={360} suffix="°" className="text-sm font-semibold text-[var(--text-primary)]" />
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Visual</p>
        </div>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] px-2 py-2 text-center">
          <AnimatedCounter value={1} suffix="-clique" className="text-sm font-semibold text-[var(--text-primary)]" />
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">GIF 3D</p>
        </div>
      </div>
    </section>
  )
}

