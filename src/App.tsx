import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './context/AuthContext'
import { BrandingRuntime } from './components/brand/BrandingRuntime'

function App() {
  return (
    <AuthProvider>
      <BrandingRuntime />
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
