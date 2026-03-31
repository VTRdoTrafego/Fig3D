import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { EditorConfig } from '../../types/domain'
import { cn } from '../../lib/utils'
import { Circle3DLogoBadge } from './models/Circle3DLogoBadge'
import { SceneLights } from './viewer/SceneLights'
import { EditorCamera } from './viewer/EditorCamera'
import { useLogoGeometry } from './pipeline/useLogoGeometry'
import { useLogoTexture } from './materials/useLogoTexture'

interface SceneBackgroundSyncProps {
  backgroundColor: string
  transparentPreview: boolean
}

function SceneBackgroundSync({ backgroundColor, transparentPreview }: SceneBackgroundSyncProps) {
  const { gl } = useThree()

  useEffect(() => {
    gl.setClearColor(transparentPreview ? '#000000' : backgroundColor, transparentPreview ? 0 : 1)
  }, [backgroundColor, gl, transparentPreview])

  if (transparentPreview) return null
  return <color attach="background" args={[backgroundColor]} />
}

export interface ViewerHandle {
  getCanvas: () => HTMLCanvasElement | null
  resetCamera: () => void
}

interface Props {
  config: EditorConfig
  forcedRotationOffsetY?: number | null
  suppressPreviewEffects?: boolean
}

export const ButtonViewer = forwardRef<ViewerHandle, Props>(function ButtonViewer(
  { config, forcedRotationOffsetY = null, suppressPreviewEffects = false },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const { geometry: logoGeometry } = useLogoGeometry(config)
  const { texture: logoTexture } = useLogoTexture(config.logo)
  const badgeSection = config.model.badgeCrossSection ?? 'circle'
  const circlePreviewChrome = badgeSection === 'circle'

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    resetCamera: () => controlsRef.current?.reset(),
  }))

  return (
    <div
      className={cn(
        'relative h-[48svh] min-h-[280px] max-h-[420px] overflow-hidden sm:h-[52svh] sm:max-h-[500px] lg:h-[560px] lg:max-h-[560px]',
        circlePreviewChrome
          ? 'rounded-[var(--radius-2xl)] border border-[var(--border-soft)]'
          : 'rounded-lg border-0',
      )}
    >
      <Canvas
        camera={{ position: [0, 0.1, 5], fov: 36, near: 0.1, far: 100 }}
        gl={{ alpha: true, preserveDrawingBuffer: true }}
        shadows
        onCreated={(state) => {
          canvasRef.current = state.gl.domElement
          state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
          state.gl.outputColorSpace = THREE.SRGBColorSpace
          state.gl.toneMapping = THREE.NoToneMapping
          state.gl.toneMappingExposure = 1
        }}
      >
        <SceneBackgroundSync
          backgroundColor={config.scene.backgroundColor}
          transparentPreview={config.scene.transparentPreview}
        />
        <SceneLights config={config} suppressPreviewEffects={suppressPreviewEffects} />
        <Circle3DLogoBadge
          config={config}
          logoGeometry={logoGeometry}
          logoTexture={logoTexture}
          forcedRotationOffsetY={forcedRotationOffsetY}
          suppressPreviewEffects={suppressPreviewEffects}
        />
        <EditorCamera ref={controlsRef} />
      </Canvas>
    </div>
  )
})
