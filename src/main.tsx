import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { applyThemeTokens } from './theme/tokens'
import { bootstrapPublicBranding } from './store/brandingStore'

applyThemeTokens(document.documentElement)

const rootEl = document.getElementById('root')

function renderApp() {
  if (!rootEl) return
  createRoot(rootEl).render(
    <StrictMode>
      <App />
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          className:
            '!rounded-2xl !border !border-[var(--border-soft)] !bg-[var(--surface-elevated)] !text-[var(--text-primary)]',
        }}
      />
    </StrictMode>,
  )
}

void Promise.race([
  bootstrapPublicBranding(),
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 3500)
  }),
]).finally(renderApp)
