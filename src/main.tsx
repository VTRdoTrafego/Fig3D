import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { applyThemeTokens } from './theme/tokens'

applyThemeTokens(document.documentElement)

createRoot(document.getElementById('root')!).render(
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
