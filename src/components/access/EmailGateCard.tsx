import { Mail, LockKeyhole, ArrowRight } from 'lucide-react'
import { PremiumCard } from '../ui/PremiumCard'
import { Input } from '../ui/Input'
import { GlowButton } from '../ui/GlowButton'
import { StatusBadge } from '../ui/StatusBadge'

interface EmailGateCardProps {
  email: string
  onEmailChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  disabled?: boolean
  helperText?: string
}

export function EmailGateCard({
  email,
  onEmailChange,
  onSubmit,
  loading = false,
  disabled = false,
  helperText = 'Teste gratis para transformar sua logo em GIF 3D sem complicacao.',
}: EmailGateCardProps) {
  return (
    <PremiumCard
      className="space-y-4 border-[rgba(139,92,255,0.35)] bg-[linear-gradient(180deg,rgba(26,29,42,0.94),rgba(17,19,30,0.94))] p-4 sm:p-5"
    >
      <div className="space-y-1.5">
        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-yellow)]">
          <LockKeyhole size={12} />
          Acesso Fig3D
        </p>
        <StatusBadge tone="live">Sessão protegida</StatusBadge>
        <p className="text-sm text-[var(--text-secondary)]">
          Transforme sua logo em GIF 3D com poucos cliques e visual profissional.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
          <Mail size={12} />
          E-mail para liberar seu teste
        </span>
        <Input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Digite seu melhor e-mail"
          autoComplete="email"
          disabled={disabled || loading}
          className="h-12 w-full"
        />
      </label>

      <GlowButton
        variant="premium"
        size="lg"
        className="w-full"
        disabled={disabled || loading}
        onClick={onSubmit}
      >
        {loading ? 'Liberando acesso...' : 'Quero criar minha logo em GIF 3D'}
        {!loading ? <ArrowRight size={15} /> : null}
      </GlowButton>

      <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
    </PremiumCard>
  )
}
