import { ShieldCheck, KeyRound } from 'lucide-react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface AdminOtpCardProps {
  email: string
  code: string
  onCodeChange: (value: string) => void
  onConfirmCode: () => void
  confirming: boolean
  lockedMessage?: string | null
  attemptsRemaining?: number | null
}

export function AdminOtpCard({
  email,
  code,
  onCodeChange,
  onConfirmCode,
  confirming,
  lockedMessage,
  attemptsRemaining,
}: AdminOtpCardProps) {
  return (
    <Card
      variant="elevated"
      className="space-y-4 border-[rgba(245,196,0,0.35)] bg-[linear-gradient(180deg,rgba(30,24,12,0.86),rgba(18,17,26,0.92))] p-4 sm:p-5"
    >
      <div className="space-y-1.5">
        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-yellow)]">
          <ShieldCheck size={12} />
          Confirmação administrativa
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Detectamos um acesso administrativo. Confirme seu código para continuar.
        </p>
        <p className="text-xs text-[var(--text-muted)]">{email}</p>
      </div>

      <label className="block">
        <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
          <KeyRound size={12} />
          Digite o código de autenticação
        </span>
        <Input
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="000000"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="h-12 w-full tracking-[0.2em]"
          disabled={confirming || Boolean(lockedMessage)}
        />
      </label>

      <Button
        variant="premium"
        size="lg"
        className="w-full"
        disabled={confirming || Boolean(lockedMessage)}
        onClick={onConfirmCode}
      >
        {confirming ? 'Validando código...' : 'Confirmar código'}
      </Button>

      {lockedMessage ? (
        <p className="text-xs text-amber-300">{lockedMessage}</p>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">
          {typeof attemptsRemaining === 'number'
            ? `Tentativas restantes: ${attemptsRemaining} • Código temporário: 845293`
            : 'Código temporário: 845293'}
        </p>
      )}
    </Card>
  )
}
