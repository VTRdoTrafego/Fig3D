import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { EditorPageBoundary } from './components/layout/EditorPageBoundary'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { RootErrorFallback } from './components/layout/RootErrorFallback'
import { AuthPage } from './pages/AuthPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthPage />,
    errorElement: <RootErrorFallback />,
  },
  {
    path: '/auth',
    element: <Navigate to="/" replace />,
    errorElement: <RootErrorFallback />,
  },
  {
    path: '/editor',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RootErrorFallback />,
    children: [
      { index: true, element: <EditorPageBoundary /> },
      { path: ':projectId', element: <EditorPageBoundary /> },
    ],
  },
])
