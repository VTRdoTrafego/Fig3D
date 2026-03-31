import { Crown, Star } from 'lucide-react'
import { GlowButton } from '../ui/GlowButton'
import type { CheckoutPlan } from '../../services/accessGateService'
import { cn } from '../../lib/utils'
import { PremiumCard } from '../ui/PremiumCard'
import { SectionReveal } from '../ui/SectionReveal'
import { StatusBadge } from '../ui/StatusBadge'

interface PricingCardsProps {
  compact?: boolean
  onSelectPlan: (plan: CheckoutPlan) => void
}

interface PlanCard {
  id: CheckoutPlan
  title: string
  description: string
  price: string
  period: string
  highlight?: boolean
  cta: string
}

const PLANS: PlanCard[] = [
  {
    id: 'monthly',
    title: 'Premium mensal',
    description: 'Ideal para comecar e validar seu visual 3D',
    price: 'R$29,90',
    period: '/mês',
    cta: 'Comecar no mensal R$29,90',
  },
  {
    id: 'annual',
    title: 'Premium anual',
    description: 'Melhor custo-beneficio para criar sem parar',
    price: 'R$197',
    period: '/ano',
    highlight: true,
    cta: 'Garantir anual R$197',
  },
]

export function PricingCards({ compact = false, onSelectPlan }: PricingCardsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">Fig3D Premium para criar sem limites</h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(245,196,0,0.45)] bg-[rgba(245,196,0,0.12)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-yellow)]">
          <Crown size={12} />
          Ilimitado
        </span>
      </div>
      <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
        {PLANS.map((plan, index) => (
          <SectionReveal key={plan.id} delayMs={index * 90}>
            <PremiumCard
              className={cn(
                'rounded-2xl p-4',
                plan.highlight
                  ? 'border-[rgba(245,196,0,0.42)] bg-[linear-gradient(180deg,rgba(245,196,0,0.12),rgba(255,255,255,0.03))] shadow-[var(--shadow-glow-yellow)]'
                  : 'border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">{plan.title}</h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{plan.description}</p>
                </div>
                {plan.highlight ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(245,196,0,0.5)] bg-[rgba(245,196,0,0.16)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent-yellow)]">
                    <Star size={10} />
                    Melhor oferta
                  </span>
                ) : (
                  <StatusBadge tone="neutral">Flexível</StatusBadge>
                )}
              </div>

              <p className="mt-4 text-3xl font-semibold leading-none text-[var(--text-primary)]">
                {plan.price}
                <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">{plan.period}</span>
              </p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Acesso ilimitado para transformar logo em GIF e publicar com visual profissional.
              </p>

              <GlowButton
                variant={plan.highlight ? 'premium' : 'secondary'}
                className="mt-4 w-full"
                onClick={() => onSelectPlan(plan.id)}
              >
                {plan.cta}
              </GlowButton>
            </PremiumCard>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
