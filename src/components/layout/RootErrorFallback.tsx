import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { Button } from '../ui/Button'

export function RootErrorFallback() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? error.statusText || `${error.status}`
    : error instanceof Error
      ? error.message
      : 'Erro inesperado'

  return (
    <div className="safe-top safe-bottom flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0b10] p-6 text-center">
      <p className="text-lg font-semibold text-white">Não foi possível carregar esta página</p>
      <p className="max-w-md text-sm text-white/70">{message}</p>
      <Button variant="premium" onClick={() => window.location.assign('/')}>
        Voltar ao início
      </Button>
    </div>
  )
}
