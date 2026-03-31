import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { isPublicApp } from '../../lib/supabase'
import { hasActiveAccess } from '../../services/accessGateService'
import { LoadingState } from '../ui/States'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (isPublicApp) {
    if (!hasActiveAccess()) {
      return <Navigate to="/auth" replace />
    }
    return <>{children}</>
  }
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState label="Carregando sessão..." />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  return <>{children}</>
}
