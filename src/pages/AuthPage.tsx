import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlowButton } from '../components/ui/GlowButton'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { hasSupabaseEnv, isPublicApp, supabase } from '../lib/supabase'
import { useAuth } from '../context/useAuth'
import { SegmentedControl } from '../components/ui/Tabs'
import { GlassCard } from '../components/ui/Card'
import { AccessHero } from '../components/access/AccessHero'
import { EmailGateCard } from '../components/access/EmailGateCard'
import { BenefitsGrid } from '../components/access/BenefitsGrid'
import { TrialProgress } from '../components/access/TrialProgress'
import { PremiumHighlight } from '../components/access/PremiumHighlight'
import { PricingCards } from '../components/access/PricingCards'
import { LimitReachedCard } from '../components/access/LimitReachedCard'
import { AdminOtpCard } from '../components/access/AdminOtpCard'
import { LandingHeroDemoCarousel } from '../components/access/LandingHeroDemoCarousel'
import { Modal } from '../components/ui/Modal'
import { AmbientBackground } from '../components/ui/AmbientBackground'
import { SectionReveal } from '../components/ui/SectionReveal'
import { PremiumCard } from '../components/ui/PremiumCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import {
  clearAccessGateState,
  getAccessGateState,
  getAdminSecurityState,
  getCheckoutUrl,
  getDeviceBindingInfo,
  getTrialUsageStats,
  isAdminEmail,
  markAdminOtpRequested,
  registerAccessEmail,
  type AccessGateState,
  type CheckoutPlan,
} from '../services/accessGateService'
import { verifyAdminOtpCode } from '../services/adminOtpService'
import { Fig3DBrandMark } from '../components/brand/Fig3DBrandMark'
import { resolveBrandingLogoUrl, useBrandingStore } from '../store/brandingStore'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LANDING_DEMO_CIRCLE_COUNT = 4

function LegacyAuthCard() {
  const { user } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/editor" replace />
  }

  const submit = async () => {
    if (!supabase || !hasSupabaseEnv) {
      toast.error('Configure o .env com as chaves do Supabase.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Login realizado.')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Conta criada. Verifique seu e-mail.')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro de autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="safe-top safe-bottom flex min-h-screen items-center justify-center p-4 lg:p-6">
      <GlassCard className="w-full max-w-md p-5 lg:p-6">
        <Fig3DBrandMark compact subtitle="Sua logo em 3D em segundos" />
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Acesse sua conta</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Sua logo em 3D em segundos, direto no app.</p>
        <SegmentedControl
          className="mt-5"
          value={mode}
          onChange={(value) => setMode(value)}
          items={[
            { value: 'login', label: 'Entrar' },
            { value: 'signup', label: 'Criar conta' },
          ]}
        />
        <div className="mt-5 space-y-4">
          <Field label="E-mail">
            <Input value={email} type="email" onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Senha">
            <Input
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <GlowButton className="w-full" variant="premium" size="lg" onClick={submit} disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </GlowButton>
        </div>
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Crie, ajuste e exporte com autonomia em qualquer tela.
        </p>
        <button
          type="button"
          className="mt-4 text-sm text-violet-300 hover:text-violet-200"
          onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
        >
          {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
        </button>
      </GlassCard>
    </div>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const brandingConfig = useBrandingStore((state) => state.config)
  const [state, setState] = useState<AccessGateState | null>(() => getAccessGateState())
  const [email, setEmail] = useState(() => getAccessGateState()?.email ?? '')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [confirmingAdminCode, setConfirmingAdminCode] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [deviceLock, setDeviceLock] = useState<{ active: boolean; boundEmail: string | null }>({
    active: false,
    boundEmail: null,
  })

  if (!isPublicApp) {
    return <LegacyAuthCard />
  }

  const stats = useMemo(() => getTrialUsageStats(state), [state])
  const adminSecurity = useMemo(() => getAdminSecurityState(state), [state])
  const adminPending = Boolean(state && state.role === 'admin' && !state.adminVerifiedAt)
  const adminVerified = Boolean(state && state.role === 'admin' && state.adminVerifiedAt)
  const limitReached = Boolean(stats?.limitReached)
  const hasUnlockedAccess = Boolean(state && (adminVerified || (!adminPending && !limitReached && !deviceLock.active)))
  const premium = state?.plan === 'premium'
  const shouldForcePaywall = !adminPending && (limitReached || deviceLock.active)
  const [forcePaywallVisible, setForcePaywallVisible] = useState(false)
  const splashLogoUrl = resolveBrandingLogoUrl(brandingConfig, 'splash')
  const circleDemoSources = useMemo(() => {
    const perSlot = [
      brandingConfig.demoModel1Url,
      brandingConfig.demoModel2Url,
      brandingConfig.demoModel3Url,
      brandingConfig.demoModel4Url,
    ]
    const baseSlots = Array.from({ length: LANDING_DEMO_CIRCLE_COUNT }, (_, index) => perSlot[index] || splashLogoUrl)

    const featured = brandingConfig.marketingDemoAssets.find(
      (asset) => asset.featured && asset.published && typeof asset.url === 'string' && asset.url.trim().length > 0,
    )
    if (!featured?.url) return baseSlots

    const ordered: string[] = []
    const seen = new Set<string>()
    const push = (url: string) => {
      if (!url || seen.has(url)) return
      seen.add(url)
      ordered.push(url)
    }
    push(featured.url)
    for (const url of baseSlots) push(url)
    while (ordered.length < LANDING_DEMO_CIRCLE_COUNT) push(splashLogoUrl)
    return ordered.slice(0, LANDING_DEMO_CIRCLE_COUNT)
  }, [
    brandingConfig.demoModel1Url,
    brandingConfig.demoModel2Url,
    brandingConfig.demoModel3Url,
    brandingConfig.demoModel4Url,
    brandingConfig.marketingDemoAssets,
    splashLogoUrl,
  ])

  useEffect(() => {
    if (shouldForcePaywall) {
      setForcePaywallVisible(true)
      return
    }
    setForcePaywallVisible(false)
  }, [shouldForcePaywall])

  const submitEmail = async () => {
    const normalized = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalized)) {
      toast.error('Digite um e-mail válido para liberar o teste grátis.')
      return
    }
    setLoadingEmail(true)
    try {
      const result = registerAccessEmail(normalized)
      if (!result.ok && result.reason === 'device_locked_other_email') {
        setDeviceLock({
          active: true,
          boundEmail: result.boundEmail ?? getDeviceBindingInfo()?.email ?? null,
        })
        setState(result.state ?? getAccessGateState())
        toast.error('Este dispositivo já está vinculado a outro email para uso do teste grátis.')
        return
      }
      const next = result.state
      setDeviceLock({ active: false, boundEmail: null })
      if (!next) {
        toast.error('Não foi possível liberar o acesso agora.')
        return
      }
      if (isAdminEmail(normalized)) {
        markAdminOtpRequested()
        setState(getAccessGateState())
        toast.info('Confirmação necessária para acesso administrativo. Use o código 845293.')
        return
      }
      setState(next)
      toast.success('Acesso liberado. Seu teste grátis já está ativo.')
      navigate('/editor')
    } finally {
      setLoadingEmail(false)
    }
  }

  const confirmAdminCode = async () => {
    if (!state || state.role !== 'admin') return
    if (adminCode.trim().length < 4) {
      toast.error('Digite o código de autenticação recebido por email.')
      return
    }
    setConfirmingAdminCode(true)
    try {
      await verifyAdminOtpCode(state.email, adminCode)
      const next = getAccessGateState()
      setState(next)
      setAdminCode('')
      toast.success('Código validado com sucesso. Acesso administrativo liberado.')
      navigate('/editor')
    } catch (error) {
      setState(getAccessGateState())
      toast.error(error instanceof Error ? error.message : 'Falha ao validar código.')
    } finally {
      setConfirmingAdminCode(false)
    }
  }

  const goToCheckout = (plan: CheckoutPlan) => {
    const checkoutUrl = getCheckoutUrl(plan)
    if (!checkoutUrl) {
      toast.info(
        `Checkout ${plan === 'annual' ? 'anual' : 'mensal'} ainda não configurado. Defina VITE_CHECKOUT_${plan === 'annual' ? 'ANNUAL' : 'MONTHLY'}_URL.`,
      )
      return
    }
    window.location.href = checkoutUrl
  }

  const startFresh = () => {
    clearAccessGateState()
    setState(null)
    setEmail('')
    setAdminCode('')
    setDeviceLock({ active: false, boundEmail: null })
    setForcePaywallVisible(false)
  }

  const howItWorks = [
    'Digite seu e-mail e libere o teste gratis do gerador de logo 3D.',
    'Envie sua logo e ajuste o visual 3D em poucos cliques.',
    'Exporte sua logo em GIF 3D pronta para Instagram, anuncios e vendas.',
    'Precisa criar todo dia? Ative o Premium ilimitado.',
  ]

  return (
    <div className="safe-top safe-bottom relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#0a0b10_0%,#090a0f_100%)]">
      <AmbientBackground className="opacity-80" />
      <div className="relative z-[1] mx-auto w-full max-w-5xl space-y-5 px-3 pb-7 pt-4 sm:px-4 sm:pt-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionReveal>
            <PremiumCard
              className="space-y-5 border-[rgba(255,255,255,0.18)] bg-[radial-gradient(1000px_420px_at_14%_-16%,rgba(109,75,255,0.25),rgba(12,14,22,0.86)_44%,rgba(10,11,16,0.92)_100%)] p-4 sm:p-6"
            >
            <AccessHero
              title={brandingConfig.shortDescription || 'Transforme sua logo em GIF 3D em segundos.'}
              subtitle={brandingConfig.marketingDescription}
            />

            {brandingConfig.useLogoInSplash ? (
              <div className="rounded-2xl border border-[rgba(139,92,255,0.35)] bg-[radial-gradient(220px_120px_at_30%_10%,rgba(109,75,255,0.22),rgba(10,12,16,0.88))] p-3 shadow-[var(--shadow-display)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100">Abertura / Splash Preview</p>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-2">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[rgba(245,196,0,0.25)] bg-[radial-gradient(48px_34px_at_50%_14%,rgba(245,196,0,0.22),rgba(9,10,14,0.9))] shadow-[0_0_14px_rgba(109,75,255,0.25)]">
                    <img src={splashLogoUrl} alt="Logo de abertura Fig3D" className="h-full w-full object-contain p-1" loading="eager" decoding="async" />
                    <span className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.2),transparent_65%)]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{brandingConfig.appName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{brandingConfig.appTagline}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                'Gerador de logo 3D rapido e facil de usar',
                'Crie GIF 3D da logo sem complicacao tecnica',
                'Mais impacto para sua marca em redes sociais e anuncios',
                'Crie sozinho o que antes voce pagava para fazer',
              ].map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-[var(--text-secondary)]"
                >
                  <CheckCircle2 size={13} className="text-[var(--accent-yellow)]" />
                  {item}
                </div>
              ))}
            </div>
            </PremiumCard>
          </SectionReveal>

          <div className="space-y-3">
            {!adminPending ? <LandingHeroDemoCarousel sources={circleDemoSources} /> : null}
            <SectionReveal delayMs={80}>
            <div className="space-y-3">
            {adminPending ? (
              <AdminOtpCard
                email={state?.email ?? ''}
                code={adminCode}
                onCodeChange={setAdminCode}
                onConfirmCode={confirmAdminCode}
                confirming={confirmingAdminCode}
                lockedMessage={
                  adminSecurity?.locked
                    ? `Acesso temporariamente bloqueado. Tente novamente em ${Math.ceil((adminSecurity.lockRemainingMs || 0) / 60000)} min.`
                    : null
                }
                attemptsRemaining={adminSecurity?.attemptsRemaining ?? null}
              />
            ) : (
              <EmailGateCard
                email={email}
                onEmailChange={setEmail}
                onSubmit={submitEmail}
                loading={loadingEmail}
                disabled={false}
                helperText={
                  deviceLock.active
                    ? `Este dispositivo já está vinculado ao email ${deviceLock.boundEmail ?? 'anterior'} para teste grátis.`
                    : limitReached
                    ? 'Seu limite de testes gratuitos terminou. Escolha um plano para continuar.'
                    : stats?.countdownLabel ?? 'Transformar logo em 3D no Fig3D e rapido, simples e profissional.'
                }
              />
            )}

            {!adminPending ? <TrialProgress stats={stats} premium={premium} /> : null}

            {adminPending ? (
              <Button variant="ghost" className="w-full" onClick={startFresh}>
                Usar outro e-mail
              </Button>
            ) : null}

            {hasUnlockedAccess ? (
              <div className="grid grid-cols-1 gap-2">
                <GlowButton variant="premium" className="w-full" onClick={() => navigate('/editor')}>
                  Entrar no editor e criar GIF 3D
                  <ArrowRight size={14} />
                </GlowButton>
              </div>
            ) : null}
            </div>
            </SectionReveal>
          </div>
        </div>

        {!adminPending ? (
          <SectionReveal delayMs={120}>
            <BenefitsGrid />
          </SectionReveal>
        ) : null}

        {!adminPending && !forcePaywallVisible ? (
          <SectionReveal delayMs={170}>
            <PremiumCard className="space-y-3 rounded-2xl p-4">
              <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg">
                Como funciona o Fig3D
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {howItWorks.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.02)] p-3 text-xs text-[var(--text-secondary)]"
                  >
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(139,92,255,0.45)] bg-[rgba(109,75,255,0.16)] text-[10px] font-semibold text-violet-100">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </SectionReveal>
        ) : null}

        {!adminPending && !forcePaywallVisible ? (
          <SectionReveal delayMs={220}>
            <PremiumCard className="space-y-3 rounded-2xl border-[rgba(139,92,255,0.35)] bg-[rgba(109,75,255,0.12)] p-4">
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-100">
                <Sparkles size={12} />
                Valor FIG3D
              </p>
              <StatusBadge tone="live">Conversão ativa</StatusBadge>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Pare de depender de terceiros para criar logo animada da sua marca.
              </p>
              <p className="text-xs text-violet-100/85">
                Com o Fig3D, voce transforma logo em GIF, ganha mais impacto visual e acelera sua producao em segundos.
              </p>
            </PremiumCard>
          </SectionReveal>
        ) : null}
        {adminPending ? (
          <SectionReveal delayMs={120}>
            <PremiumCard className="space-y-2 rounded-2xl border-[rgba(245,196,0,0.3)] bg-[rgba(245,196,0,0.08)] p-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Confirmação necessária para acesso administrativo</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Digite o código de autenticação para liberar o gerenciamento admin.
              </p>
            </PremiumCard>
          </SectionReveal>
        ) : null}

        {!adminPending && !forcePaywallVisible ? (
          limitReached ? (
            <SectionReveal delayMs={260}>
              <LimitReachedCard onSelectPlan={goToCheckout} />
            </SectionReveal>
          ) : (
            <SectionReveal delayMs={260}>
              <PremiumHighlight />
              <PricingCards onSelectPlan={goToCheckout} />
            </SectionReveal>
          )
        ) : null}
      </div>

      <Modal
        open={forcePaywallVisible}
        onClose={() => setForcePaywallVisible(false)}
        title={deviceLock.active ? 'Dispositivo já vinculado' : 'Seus 3 testes gratuitos acabaram'}
      >
        <div className="space-y-4">
          <Fig3DBrandMark compact logoContext="public" />
          <p className="text-sm text-[var(--text-secondary)]">
            {deviceLock.active
              ? `Este dispositivo já está vinculado ao email ${deviceLock.boundEmail ?? 'anterior'} para uso do teste grátis.`
              : 'Seus 3 testes gratuitos terminaram. Assine para continuar criando logo em GIF 3D sem limites.'}
          </p>
          {deviceLock.active && deviceLock.boundEmail ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setEmail(deviceLock.boundEmail ?? '')
                setDeviceLock({ active: false, boundEmail: null })
              }}
            >
              Usar e-mail vinculado ({deviceLock.boundEmail})
            </Button>
          ) : null}
          <PricingCards compact onSelectPlan={goToCheckout} />
        </div>
      </Modal>
    </div>
  )
}
