import type { LucideIcon } from 'lucide-react'
import { Zap, ShieldCheck, Smartphone, Wand2 } from 'lucide-react'
import { PremiumCard } from '../ui/PremiumCard'
import { SectionReveal } from '../ui/SectionReveal'
import { useBrandingStore } from '../../store/brandingStore'

interface BenefitItem {
  title: string
  description: string
  icon: LucideIcon
}

const BENEFITS: BenefitItem[] = [
  {
    title: 'Transforme sua logo em GIF 3D em segundos',
    description: 'Use o gerador de logo 3D para criar resultado profissional sem complicacao.',
    icon: Zap,
  },
  {
    title: 'Animar logo online com poucos cliques',
    description: 'Ajuste cor, profundidade e iluminacao de forma rapida no proprio editor.',
    icon: ShieldCheck,
  },
  {
    title: 'Logo 3D para Instagram e anuncios',
    description: 'Aumente impacto visual da marca em conteudo, campanhas e apresentacoes.',
    icon: Smartphone,
  },
  {
    title: 'Crie sozinho o que antes voce terceirizava',
    description: 'Economize tempo e dinheiro sem depender de terceiros para animar sua logo.',
    icon: Wand2,
  },
]

export function BenefitsGrid() {
  const brandName = useBrandingStore((state) => state.config.appName || 'FIG3D')

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">Por que escolher o {brandName}</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {BENEFITS.map((item, index) => {
          const Icon = item.icon
          return (
            <SectionReveal key={item.title} delayMs={index * 70}>
              <PremiumCard className="rounded-2xl p-3.5">
                <p className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(139,92,255,0.35)] bg-[rgba(109,75,255,0.14)] text-violet-100 shadow-[0_0_8px_rgba(109,75,255,0.25)]">
                  <Icon size={15} />
                </p>
                <h3 className="mt-3 text-sm font-semibold tracking-tight text-[var(--text-primary)]">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{item.description}</p>
              </PremiumCard>
            </SectionReveal>
          )
        })}
      </div>
    </section>
  )
}
