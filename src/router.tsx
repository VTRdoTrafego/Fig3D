import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { EditorPage } from './pages/EditorPage'

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
      { index: true, element: <EditorPage /> },
      { path: ':projectId', element: <EditorPage /> },
    ],
  },
])
