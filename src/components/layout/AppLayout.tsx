import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Box, Home, Sparkles, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { BottomNav } from './BottomNav'
import { MobileTopBar } from './MobileTopBar'
import { Drawer } from '../ui/Drawer'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/useAuth'
import { Badge } from '../ui/Badge'
import { getAccessGateState, getTrialUsageStats, hasAdminAccess } from '../../services/accessGateService'
import { Fig3DBrandMark } from '../brand/Fig3DBrandMark'
import { useBrandingStore } from '../../store/brandingStore'
import { isPublicApp } from '../../lib/supabase'

const editorNavItem = { label: 'Editor', href: '/editor', icon: Box }
const homeNavItem = { label: 'Início', href: '/', icon: Home }

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const brandingConfig = useBrandingStore((state) => state.config)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isAdmin = hasAdminAccess()
  const accessState = getAccessGateState()
  const trialStats = getTrialUsageStats(accessState)
  const planLabel = accessState?.plan === 'premium' || isAdmin ? 'Premium' : 'Free'

  const bottomNavItems = useMemo(
    () => (isPublicApp ? [editorNavItem, homeNavItem] : [editorNavItem]),
    [],
  )

  const pageInfo = useMemo(() => {
    if (location.pathname.startsWith('/editor')) {
      return {
        title: `Editor ${brandingConfig.appName || 'FIG3D'}`,
        subtitle: brandingConfig.appTagline || 'Sua logo em 3D em segundos',
      }
    }
    return {
      title: brandingConfig.appName || 'FIG3D',
      subtitle: brandingConfig.appTagline || 'Sua logo em 3D em segundos',
    }
  }, [brandingConfig.appName, brandingConfig.appTagline, location.pathname])

  const renderNav = (isMobile = false) => (
    <nav className={cn('mt-4 flex flex-col gap-2', isMobile && 'mt-1')}>
      {bottomNavItems.map((item) => {
        const active = isActivePath(location.pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setDrawerOpen(false)}
            className={cn(
              'flex h-11 items-center gap-2.5 rounded-2xl border px-3 text-sm font-medium transition',
              active
                ? 'border-[rgba(249,115,22,0.45)] bg-[rgba(249,115,22,0.16)] text-[var(--accent-primary-2)] shadow-[0_0_10px_rgba(251,146,60,0.2)]'
                : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]',
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen">
      <MobileTopBar title={pageInfo.title} subtitle={pageInfo.subtitle} onMenu={() => setDrawerOpen(true)} />

      <div className="app-page mx-auto flex w-full max-w-[1480px] gap-4 pb-24 pt-3 lg:gap-6 lg:pb-6 lg:pt-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[280px] shrink-0 rounded-[30px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(29,30,33,0.9),rgba(16,17,21,0.95))] p-4 shadow-[var(--shadow-elevated)] backdrop-blur-xl lg:flex lg:flex-col">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(33,34,37,0.85),rgba(19,20,23,0.9))] p-3 shadow-[var(--shadow-panel)]">
            <Fig3DBrandMark subtitle="Sua logo em 3D em segundos, sem precisar pagar pros outros." />
          </div>
          {renderNav()}
          <div className="mt-auto rounded-2xl border border-[rgba(249,115,22,0.34)] bg-[rgba(249,115,22,0.11)] p-3 shadow-[0_0_10px_rgba(251,146,60,0.16)]">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--accent-primary-2)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-100">
                {isAdmin ? 'Acesso administrativo' : `Plano ${planLabel}`}
              </p>
            </div>
            <p className="mt-1 text-xs text-orange-100/75">
              {isAdmin
                ? 'Gerenciamento protegido por confirmação de segurança.'
                : trialStats && accessState?.plan !== 'premium'
                  ? `Testes restantes: ${trialStats.testsRemaining}`
                  : 'Acesso ilimitado para criar sem limites.'}
            </p>
            <Badge className="mt-2" variant="highlight">
              {isAdmin ? 'Administrador verificado' : user?.email ?? 'Modo público'}
            </Badge>
            {isPublicApp ? (
              <Link
                to="/"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[rgba(249,115,22,0.35)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--text-primary)]"
              >
                <Home size={14} />
                Voltar à página inicial
              </Link>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[28px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(29,30,34,0.84),rgba(16,17,22,0.9))] p-3 shadow-[var(--shadow-panel)] backdrop-blur-xl lg:p-5">
            <Outlet />
          </div>
        </main>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Navegação">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(32,33,37,0.86),rgba(18,19,23,0.9))] p-3 shadow-[var(--shadow-panel)]">
          <Fig3DBrandMark compact subtitle="Crie sozinho com resultado profissional." />
          <Link to="/editor" onClick={() => setDrawerOpen(false)} className="mt-3 inline-block">
            <Button size="sm" variant="premium">
              <Plus size={14} />
              Criar agora
            </Button>
          </Link>
        </div>
        {renderNav(true)}
        {isPublicApp ? (
          <div className="mt-3 border-t border-[var(--border-soft)] pt-3">
            <Link
              to="/"
              onClick={() => setDrawerOpen(false)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
            >
              <Home size={16} />
              Página inicial
            </Link>
          </div>
        ) : null}
      </Drawer>

      <BottomNav
        items={bottomNavItems.map((item) => ({
          ...item,
          active: isActivePath(location.pathname, item.href),
        }))}
      />
    </div>
  )
}
