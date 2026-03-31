import { Lock } from 'lucide-react'
import type { CheckoutPlan } from '../../services/accessGateService'
import { PremiumCard } from '../ui/PremiumCard'
import { PricingCards } from './PricingCards'
import { StatusBadge } from '../ui/StatusBadge'

interface LimitReachedCardProps {
  onSelectPlan: (plan: CheckoutPlan) => void
}

export function LimitReachedCard({ onSelectPlan }: LimitReachedCardProps) {
  return (
    <section className="space-y-3">
      <PremiumCard className="rounded-2xl border-[rgba(245,196,0,0.38)] bg-[linear-gradient(180deg,rgba(245,196,0,0.1),rgba(255,255,255,0.03))] p-4">
        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-yellow)]">
          <Lock size={12} />
          Limite atingido
        </p>
        <div className="mt-2">
          <StatusBadge tone="warning">Necessário upgrade</StatusBadge>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Seus 3 testes gratuitos terminaram.</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Escolha um plano para continuar criando logo em GIF 3D sem limites no Fig3D.
        </p>
      </PremiumCard>
      <PricingCards compact onSelectPlan={onSelectPlan} />
    </section>
  )
}
