import {
  ADMIN_EMAIL,
  getAdminSecurityState,
  isAdminEmail,
  markAdminOtpRequested,
  markAdminVerified,
  recordAdminOtpFailure,
} from './accessGateService'

const STATIC_ADMIN_OTP_CODE = '845293'

function lockMessage(lockRemainingMs: number) {
  const minutes = Math.ceil(lockRemainingMs / 60000)
  return `Muitas tentativas inválidas. Tente novamente em ${minutes} min.`
}

function ensureAdminEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!isAdminEmail(normalized)) {
    throw new Error('Fluxo administrativo disponível apenas para o email autorizado.')
  }
  return normalized
}

export async function sendAdminOtpCode(email: string) {
  ensureAdminEmail(email)
  const security = getAdminSecurityState()
  if (security?.locked) {
    throw new Error(lockMessage(security.lockRemainingMs))
  }

  markAdminOtpRequested()
}

export async function verifyAdminOtpCode(email: string, code: string) {
  ensureAdminEmail(email)
  const token = code.trim()
  if (!token) {
    throw new Error('Digite o código de autenticação.')
  }

  const security = getAdminSecurityState()
  if (security?.locked) {
    throw new Error(lockMessage(security.lockRemainingMs))
  }
  if (token !== STATIC_ADMIN_OTP_CODE) {
    const next = recordAdminOtpFailure()
    const nextSecurity = getAdminSecurityState(next)
    if (nextSecurity?.locked) {
      throw new Error(lockMessage(nextSecurity.lockRemainingMs))
    }
    if (nextSecurity && nextSecurity.attemptsRemaining > 0) {
      throw new Error(
        `Código inválido. Você ainda tem ${nextSecurity.attemptsRemaining} tentativa(s).`,
      )
    }
    throw new Error('Código inválido.')
  }

  markAdminVerified()
}

export function getAdminIdentifier() {
  return ADMIN_EMAIL
}
