import { lazy, Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { LoadingState } from './components/ui/States'

const EditorPage = lazy(() => import('./pages/EditorPage'))

function EditorPageBoundary() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <LoadingState label="Carregando editor 3D..." />
        </div>
      }
    >
      <EditorPage />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthPage />,
  },
  {
    path: '/auth',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/editor',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <EditorPageBoundary /> },
      { path: ':projectId', element: <EditorPageBoundary /> },
    ],
  },
])
