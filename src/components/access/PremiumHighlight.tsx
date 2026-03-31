import { Gem } from 'lucide-react'
import { PremiumCard } from '../ui/PremiumCard'
import { StatusBadge } from '../ui/StatusBadge'

export function PremiumHighlight() {
  return (
    <PremiumCard className="rounded-2xl border-[rgba(139,92,255,0.4)] bg-[rgba(109,75,255,0.16)] p-4">
      <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-100">
        <Gem size={12} />
        FIG3D Premium
      </p>
      <div className="mt-2">
        <StatusBadge tone="live">Acesso ilimitado</StatusBadge>
      </div>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
        Quer animar logo online sem limite? Ative o Premium e crie GIF 3D sempre que precisar.
      </p>
      <p className="mt-1 text-xs text-violet-100/85">
        Perfeito para quem precisa de logo animada para anuncios, redes sociais e vendas todos os dias.
      </p>
    </PremiumCard>
  )
}
