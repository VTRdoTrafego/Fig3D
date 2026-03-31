import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { EditorPage } from './pages/EditorPage'

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/editor" replace /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'editor/:projectId', element: <EditorPage /> },
    ],
  },
])
