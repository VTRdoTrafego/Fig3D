import { lazy, Suspense } from 'react'
import { LoadingState } from '../ui/States'

const EditorPage = lazy(() => import('../../pages/EditorPage'))

export function EditorPageBoundary() {
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
