export type AccessPlan = 'free' | 'premium'
export type AccessRole = 'user' | 'admin'
export type CheckoutPlan = 'monthly' | 'annual'

export const ADMIN_EMAIL = 'vtrvideo@gmail.com'
export const ADMIN_OTP_EXPIRES_MS = 10 * 60 * 1000
export const ADMIN_OTP_MAX_ATTEMPTS = 5
export const ADMIN_OTP_LOCK_MS = 15 * 60 * 1000

export interface AccessGateState {
  email: string
  plan: AccessPlan
  role: AccessRole
  trialSessionsUsed: number
  creationsInCurrentSession: number
  totalFreeCreations: number
  deviceId: string
  adminVerifiedAt: string | null
  adminOtpRequestedAt: string | null
  adminOtpAttempts: number
  adminOtpLockUntil: string | null
  createdAt: string
  updatedAt: string
}

export interface TrialUsageStats {
  premium: boolean
  testsUsed: number
  testsLimit: number
  testsRemaining: number
  isLastTest: boolean
  countdownLabel: string
  sessionsUsed: number
  sessionsLimit: number
  sessionsRemaining: number
  creationsInCurrentSession: number
  creationsPerSessionLimit: number
  totalFreeCreations: number
  totalFreeCreationsLimit: number
  totalFreeCreationsRemaining: number
  limitReached: boolean
}

export interface AdminSecurityState {
  isAdmin: boolean
  verified: boolean
  otpRequestedAt: string | null
  otpExpiresAt: string | null
  otpExpired: boolean
  attempts: number
  attemptsRemaining: number
  locked: boolean
  lockedUntil: string | null
  lockRemainingMs: number
}

export interface DeviceBindingInfo {
  deviceId: string
  email: string
  boundAt: string
}

export interface AccessRegistrationResult {
  ok: boolean
  state: AccessGateState | null
  reason?: 'device_locked_other_email'
  boundEmail?: string
}

interface CreationAllowance {
  allowed: boolean
  reason: 'ok' | 'missing_access' | 'trial_limit_reached' | 'admin_verification_required'
}

const ACCESS_GATE_KEY = 'button-studio-access-gate-v1'
const DEVICE_ID_KEY = 'button-studio-device-id-v1'
const DEVICE_BIND_KEY = 'button-studio-device-bind-v1'
const MAX_TRIAL_SESSIONS = 3
const MAX_CREATIONS_PER_SESSION = 1
const MAX_FREE_CREATIONS = 3

const MONTHLY_CHECKOUT_URL =
  (import.meta.env.VITE_CHECKOUT_MONTHLY_URL as string | undefined)?.trim() || null
const ANNUAL_CHECKOUT_URL =
  (import.meta.env.VITE_CHECKOUT_ANNUAL_URL as string | undefined)?.trim() || null

function nowIso() {
  return new Date().toISOString()
}

function parseDateMs(value: string | null | undefined) {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function createRandomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing
  const next = createRandomId()
  localStorage.setItem(DEVICE_ID_KEY, next)
  return next
}

function readDeviceBinding() {
  const raw = localStorage.getItem(DEVICE_BIND_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DeviceBindingInfo
  } catch {
    return null
  }
}

function writeDeviceBinding(binding: DeviceBindingInfo) {
  localStorage.setItem(DEVICE_BIND_KEY, JSON.stringify(binding))
}

function ensureDeviceBinding(email: string) {
  const normalized = normalizeEmail(email)
  if (isAdminEmail(normalized)) {
    return { allowed: true as const, binding: null as DeviceBindingInfo | null }
  }
  const existing = readDeviceBinding()
  if (!existing) {
    const created: DeviceBindingInfo = {
      deviceId: getOrCreateDeviceId(),
      email: normalized,
      boundAt: nowIso(),
    }
    writeDeviceBinding(created)
    return { allowed: true as const, binding: created }
  }
  if (normalizeEmail(existing.email) !== normalized) {
    return { allowed: false as const, binding: existing }
  }
  return { allowed: true as const, binding: existing }
}

export function isAdminEmail(email: string) {
  return normalizeEmail(email) === ADMIN_EMAIL
}

function readRawState() {
  const raw = localStorage.getItem(ACCESS_GATE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Partial<AccessGateState>
  } catch {
    return null
  }
}

function sanitizeState(input: Partial<AccessGateState> | null): AccessGateState | null {
  if (!input || typeof input.email !== 'string' || !input.email.trim()) {
    return null
  }
  const email = normalizeEmail(input.email)
  const role: AccessRole = input.role === 'admin' || isAdminEmail(email) ? 'admin' : 'user'
  const plan: AccessPlan = role === 'admin' ? 'premium' : input.plan === 'premium' ? 'premium' : 'free'

  return {
    email,
    role,
    plan,
    trialSessionsUsed: Math.max(0, Math.min(MAX_TRIAL_SESSIONS, input.trialSessionsUsed || 0)),
    creationsInCurrentSession: Math.max(
      0,
      Math.min(MAX_CREATIONS_PER_SESSION, input.creationsInCurrentSession || 0),
    ),
    totalFreeCreations: Math.max(0, Math.min(MAX_FREE_CREATIONS, input.totalFreeCreations || 0)),
    deviceId: input.deviceId || getOrCreateDeviceId(),
    adminVerifiedAt: role === 'admin' ? input.adminVerifiedAt || null : null,
    adminOtpRequestedAt: role === 'admin' ? input.adminOtpRequestedAt || null : null,
    adminOtpAttempts: role === 'admin' ? Math.max(0, input.adminOtpAttempts || 0) : 0,
    adminOtpLockUntil: role === 'admin' ? input.adminOtpLockUntil || null : null,
    createdAt: input.createdAt || nowIso(),
    updatedAt: input.updatedAt || nowIso(),
  }
}

function writeState(state: AccessGateState) {
  localStorage.setItem(ACCESS_GATE_KEY, JSON.stringify(state))
}

function isFreeLimitReached(state: AccessGateState) {
  if (state.plan === 'premium' || state.role === 'admin') return false
  return state.totalFreeCreations >= MAX_FREE_CREATIONS
}

function currentSessionCreationsFromTotal(totalFreeCreations: number) {
  return Math.min(MAX_CREATIONS_PER_SESSION, Math.max(0, totalFreeCreations))
}

function sessionCountFromTotal(totalFreeCreations: number) {
  const safeTotal = Math.max(0, Math.min(MAX_FREE_CREATIONS, totalFreeCreations))
  return Math.min(MAX_TRIAL_SESSIONS, safeTotal)
}

function createDefaultState(email: string): AccessGateState {
  const normalizedEmail = normalizeEmail(email)
  const admin = isAdminEmail(normalizedEmail)
  return {
    email: normalizedEmail,
    role: admin ? 'admin' : 'user',
    plan: admin ? 'premium' : 'free',
    trialSessionsUsed: admin ? MAX_TRIAL_SESSIONS : 0,
    creationsInCurrentSession: 0,
    totalFreeCreations: 0,
    deviceId: getOrCreateDeviceId(),
    adminVerifiedAt: null,
    adminOtpRequestedAt: null,
    adminOtpAttempts: 0,
    adminOtpLockUntil: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

export function getAccessGateState() {
  return sanitizeState(readRawState())
}

export function clearAccessGateState() {
  localStorage.removeItem(ACCESS_GATE_KEY)
}

export function registerAccessEmail(email: string) {
  const normalized = normalizeEmail(email)
  const bindingStatus = ensureDeviceBinding(normalized)
  if (!bindingStatus.allowed && bindingStatus.binding) {
    return {
      ok: false,
      state: getAccessGateState(),
      reason: 'device_locked_other_email' as const,
      boundEmail: bindingStatus.binding.email,
    } as AccessRegistrationResult
  }

  const current = getAccessGateState()
  if (current && current.email === normalized) {
    return { ok: true, state: current } as AccessRegistrationResult
  }
  const next = createDefaultState(normalized)
  writeState(next)
  return { ok: true, state: next } as AccessRegistrationResult
}

export function upgradeToPremium() {
  const current = getAccessGateState()
  if (!current) return null
  const next: AccessGateState = {
    ...current,
    plan: 'premium',
    updatedAt: nowIso(),
  }
  writeState(next)
  return next
}

export function getAdminSecurityState(stateInput?: AccessGateState | null): AdminSecurityState | null {
  const state = stateInput ?? getAccessGateState()
  if (!state || state.role !== 'admin') return null

  const now = Date.now()
  const lockUntilMs = parseDateMs(state.adminOtpLockUntil)
  const requestedAtMs = parseDateMs(state.adminOtpRequestedAt)
  const otpExpiresAtMs = requestedAtMs ? requestedAtMs + ADMIN_OTP_EXPIRES_MS : null
  const locked = Boolean(lockUntilMs && lockUntilMs > now)

  return {
    isAdmin: true,
    verified: Boolean(state.adminVerifiedAt),
    otpRequestedAt: state.adminOtpRequestedAt,
    otpExpiresAt: otpExpiresAtMs ? new Date(otpExpiresAtMs).toISOString() : null,
    otpExpired: Boolean(otpExpiresAtMs && otpExpiresAtMs <= now),
    attempts: state.adminOtpAttempts,
    attemptsRemaining: Math.max(0, ADMIN_OTP_MAX_ATTEMPTS - state.adminOtpAttempts),
    locked,
    lockedUntil: state.adminOtpLockUntil,
    lockRemainingMs: locked && lockUntilMs ? Math.max(0, lockUntilMs - now) : 0,
  }
}

export function markAdminOtpRequested() {
  const current = getAccessGateState()
  if (!current || current.role !== 'admin') return null

  const next: AccessGateState = {
    ...current,
    adminOtpRequestedAt: nowIso(),
    adminOtpAttempts: 0,
    adminOtpLockUntil: null,
    updatedAt: nowIso(),
  }
  writeState(next)
  return next
}

export function recordAdminOtpFailure() {
  const current = getAccessGateState()
  if (!current || current.role !== 'admin') return null

  const attempts = current.adminOtpAttempts + 1
  const shouldLock = attempts >= ADMIN_OTP_MAX_ATTEMPTS
  const next: AccessGateState = {
    ...current,
    adminOtpAttempts: attempts,
    adminOtpLockUntil: shouldLock ? new Date(Date.now() + ADMIN_OTP_LOCK_MS).toISOString() : null,
    updatedAt: nowIso(),
  }
  writeState(next)
  return next
}

export function markAdminVerified() {
  const current = getAccessGateState()
  if (!current || current.role !== 'admin') return null

  const next: AccessGateState = {
    ...current,
    plan: 'premium',
    adminVerifiedAt: nowIso(),
    adminOtpRequestedAt: null,
    adminOtpAttempts: 0,
    adminOtpLockUntil: null,
    updatedAt: nowIso(),
  }
  writeState(next)
  return next
}

export function hasAdminAccess() {
  const state = getAccessGateState()
  return Boolean(state && state.role === 'admin' && state.adminVerifiedAt)
}

export function hasActiveAccess() {
  const state = getAccessGateState()
  if (!state) return false
  if (state.role === 'admin') return Boolean(state.adminVerifiedAt)
  if (state.plan === 'premium') return true
  return !isFreeLimitReached(state)
}

export function isTrialLimitReached() {
  const state = getAccessGateState()
  if (!state) return false
  return isFreeLimitReached(state)
}

export function getTrialUsageStats(stateInput?: AccessGateState | null): TrialUsageStats | null {
  const state = stateInput ?? getAccessGateState()
  if (!state) return null

  const totalFreeCreations = Math.max(0, Math.min(MAX_FREE_CREATIONS, state.totalFreeCreations))
  const testsUsed = state.plan === 'premium' ? MAX_FREE_CREATIONS : totalFreeCreations
  const testsRemaining = state.plan === 'premium' ? 0 : Math.max(0, MAX_FREE_CREATIONS - testsUsed)
  const sessionsUsed = testsUsed
  const limitReached = state.plan !== 'premium' && state.role !== 'admin' && isFreeLimitReached(state)
  const countdownLabel =
    state.plan === 'premium'
      ? 'Acesso premium ilimitado'
      : limitReached
        ? 'Seu teste grátis terminou'
        : testsRemaining === 1
          ? 'Último teste grátis disponível'
          : `Você ainda tem ${testsRemaining} testes grátis`

  return {
    premium: state.plan === 'premium',
    testsUsed,
    testsLimit: MAX_FREE_CREATIONS,
    testsRemaining,
    isLastTest: state.plan !== 'premium' && !limitReached && testsRemaining === 1,
    countdownLabel,
    sessionsUsed,
    sessionsLimit: MAX_TRIAL_SESSIONS,
    sessionsRemaining: testsRemaining,
    creationsInCurrentSession:
      state.plan === 'premium'
        ? 1
        : Math.max(0, Math.min(MAX_CREATIONS_PER_SESSION, state.creationsInCurrentSession || currentSessionCreationsFromTotal(totalFreeCreations))),
    creationsPerSessionLimit: MAX_CREATIONS_PER_SESSION,
    totalFreeCreations,
    totalFreeCreationsLimit: MAX_FREE_CREATIONS,
    totalFreeCreationsRemaining:
      state.plan === 'premium' ? 0 : Math.max(0, MAX_FREE_CREATIONS - totalFreeCreations),
    limitReached,
  }
}

export function getCreationAllowance(stateInput?: AccessGateState | null): CreationAllowance {
  const state = stateInput ?? getAccessGateState()
  if (!state) {
    return { allowed: false, reason: 'missing_access' }
  }
  if (state.role === 'admin' && !state.adminVerifiedAt) {
    return { allowed: false, reason: 'admin_verification_required' }
  }
  if (state.plan === 'premium') {
    return { allowed: true, reason: 'ok' }
  }
  if (isFreeLimitReached(state)) {
    return { allowed: false, reason: 'trial_limit_reached' }
  }
  return { allowed: true, reason: 'ok' }
}

export function consumeCreationSlot() {
  const current = getAccessGateState()
  if (!current) {
    return { allowed: false as const, reason: 'missing_access' as const, state: null }
  }
  if (current.role === 'admin' && !current.adminVerifiedAt) {
    return {
      allowed: false as const,
      reason: 'admin_verification_required' as const,
      state: current,
    }
  }
  if (current.plan === 'premium') {
    return { allowed: true as const, reason: 'ok' as const, state: current }
  }
  if (isFreeLimitReached(current)) {
    return { allowed: false as const, reason: 'trial_limit_reached' as const, state: current }
  }

  const nextTotal = Math.min(MAX_FREE_CREATIONS, current.totalFreeCreations + 1)
  const next: AccessGateState = {
    ...current,
    trialSessionsUsed: sessionCountFromTotal(nextTotal),
    creationsInCurrentSession: MAX_CREATIONS_PER_SESSION,
    totalFreeCreations: nextTotal,
    updatedAt: nowIso(),
  }

  writeState(next)
  return { allowed: true as const, reason: 'ok' as const, state: next }
}

export function getCheckoutUrl(plan: CheckoutPlan) {
  return plan === 'monthly' ? MONTHLY_CHECKOUT_URL : ANNUAL_CHECKOUT_URL
}

export function getDeviceBindingInfo() {
  return readDeviceBinding()
}
